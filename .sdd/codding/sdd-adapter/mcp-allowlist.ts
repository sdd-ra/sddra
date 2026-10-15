import crypto from "crypto";

/**
 * MCP Allowlist runtime — implements .sdd/runtime/mcp-allowlist.sdd
 * ([MCP-01..10], mcp-integration.sdd [MCP-03]).
 *
 * Hash-pinned ActivationRecords with session-start re-verification
 * (rug-pull defense, CVE-2025-54136), exact version pinning, and
 * append-only record discipline.
 */

export interface ToolSchemaHash {
  tool_name: string;
  sha256: string;
}

export interface SecurityScan {
  mcp_scan: "PASS" | "FAIL" | "PENDING";
  dlp: "PASS" | "FAIL" | "PENDING";
  scanned_at?: string;
}

export type AllowlistTier =
  | "tier0_default"
  | "tier1_core_optin"
  | "tier2_readonly_data"
  | "tier3_team_optin"
  | "blocked";

export interface ActivationRecord {
  server_id: string; // reverse-DNS namespace
  publisher: string;
  publisher_verification: string; // registry | dns-challenge | unverified
  version: string; // EXACT pin; @latest forbidden [MAL-05]
  tool_schema_hashes: ToolSchemaHash[];
  security_scan: SecurityScan;
  l_level: number; // security context tag [MCP-08]
  sandbox: string; // docker profile id
  activated_at: string; // ISO-8601
  approved_by: string; // human approver id [MAL-02]
}

export type VerificationResult =
  | { status: "ALLOW"; record: ActivationRecord }
  | { status: "BLOCK"; reason: string; server_id: string }
  | { status: "REACTIVATE"; reason: string; server_id: string };

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input, "utf-8").digest("hex");
}

export class McpAllowlist {
  private records: Map<string, ActivationRecord> = new Map();

  /** Append-only registration; a server_id can only be registered once. [MAL-02] */
  register(record: ActivationRecord): ActivationRecord {
    if (this.records.has(record.server_id)) {
      throw new Error(
        `Registration blocked: ${record.server_id} already in the allowlist (append-only [MAL-02])`
      );
    }
    if (record.version === "latest" || record.version.startsWith("latest")) {
      throw new Error(
        `Registration blocked: @latest is forbidden — pin an exact version [MAL-05]`
      );
    }
    if (record.publisher_verification === "unverified") {
      throw new Error(
        `Registration blocked: publisher identity must be verified via official registry [MAL-02]`
      );
    }
    if (record.security_scan.mcp_scan === "FAIL") {
      throw new Error(
        `Registration blocked: mcp-scan static pass failed [MAL-06]`
      );
    }
    this.records.set(record.server_id, record);
    return record;
  }

  /** Only allowlisted servers may connect. [MAL-01] */
  isAllowed(server_id: string): boolean {
    return this.records.has(server_id);
  }

  tierOf(server_id: string): AllowlistTier | null {
    const rec = this.records.get(server_id);
    if (!rec) return null;
    // Tier is derived from record shape; blocked registry is not stored.
    if (rec.l_level === 0) return "tier0_default";
    if (rec.sandbox.startsWith("readonly")) return "tier2_readonly_data";
    return "tier1_core_optin";
  }

  /**
   * Session-start re-verification: compare live tools/list schema hashes
   * against the pinned ActivationRecord. A changed definition BLOCKS the
   * server until human re-approval (rug-pull alarm [MAL-03][MAL-04]).
   */
  verifySessionStart(
    server_id: string,
    liveTools: { name: string; schema: string }[]
  ): VerificationResult {
    const rec = this.records.get(server_id);
    if (!rec) {
      return {
        status: "BLOCK",
        reason: "server not in allowlist [MAL-01]",
        server_id,
      };
    }
    const pinned = new Map(
      rec.tool_schema_hashes.map((h) => [h.tool_name, h.sha256])
    );
    const live = new Set(liveTools.map((t) => t.name));

    // Removed tools: definition drift.
    for (const name of pinned.keys()) {
      if (!live.has(name)) {
        return {
          status: "REACTIVATE",
          reason: `tool "${name}" disappeared — definition drift [MAL-04]`,
          server_id,
        };
      }
    }
    // Added or changed tools: definition drift.
    for (const t of liveTools) {
      const pin = pinned.get(t.name);
      const liveHash = sha256Hex(t.schema);
      if (!pin) {
        return {
          status: "REACTIVATE",
          reason: `tool "${t.name}" added after activation — rug-pull alarm [MAL-04]`,
          server_id,
        };
      }
      if (pin !== liveHash) {
        return {
          status: "BLOCK",
          reason: `tool "${t.name}" schema hash changed — BLOCK until human re-approval [MAL-03]`,
          server_id,
        };
      }
    }
    return { status: "ALLOW", record: rec };
  }

  /** All records (audit view — records are append-only). */
  list(): ActivationRecord[] {
    return [...this.records.values()];
  }
}
