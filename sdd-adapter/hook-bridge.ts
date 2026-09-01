import fs from "fs";
import { HookPayload, GateResult, ObsEvent, ProvenanceReport } from "./types";
import { PatternsRuntime } from "./security/patterns-runtime";
import { emitObsEvent } from "./spec-loader";
import { ProvenanceClient } from "./provenance-client";

const PROVENANCE_EXTENSIONS = new Set([
  ".md", ".txt", ".json", ".yaml", ".yml", ".py", ".ts", ".js",
  ".svg", ".pdf", ".docx", ".html", ".png", ".jpg", ".jpeg", ".webp",
]);

export class HookBridge {
  private patternsRuntime: PatternsRuntime;
  private provenanceClient: ProvenanceClient | null;

  constructor(provenanceClient?: ProvenanceClient | null) {
    this.patternsRuntime = new PatternsRuntime();
    this.provenanceClient = provenanceClient ?? null;
  }

  async processHook(input: HookPayload): Promise<GateResult> {
    const toolName = input.tool_name || "";
    const correlationId = input.session_id || `session-${Date.now()}`;

    if (!input.tool_input?.content) {
      emitObsEvent("TOOL", {
        correlationId,
        tool: toolName,
        result: "skipped",
        reason: "no content to scan",
      });
      return {
        decision: "PASS",
        exitCode: 0,
        message: "No content to scan",
        findings: [],
      };
    }

    const content = typeof input.tool_input.content === "string"
      ? input.tool_input.content
      : JSON.stringify(input.tool_input.content);

    const securityFindings = this.patternsRuntime.scan(content, input.tool_input.file_path as string);
    const securityResult = this.patternsRuntime.evaluate(securityFindings);

    const provenanceFindings = await this.runProvenanceCheck(input, content);
    const allFindings = [...securityFindings, ...provenanceFindings];
    const mergedResult = this.mergeResults(securityResult, provenanceFindings);

    const obsType = mergedResult.exitCode === 2 ? "GATE" : "POLICY";
    const obsEventType = mergedResult.decision === "BLOCK" ? "OBS13 security_gate_blocked"
      : mergedResult.decision === "WARN" ? "OBS12 security_gate_warned"
      : "OBS11 security_gate_passed";

    emitObsEvent(obsType, {
      correlationId,
      causationId: input.tool_use_id,
      tool: toolName,
      file: input.tool_input.file_path,
      decision: mergedResult.decision,
      exitCode: mergedResult.exitCode,
      findings: mergedResult.findings.map(f => ({
        patternId: f.patternId,
        severity: f.severity,
        LLevel: f.LLevel,
        line: f.lineNumber,
      })),
      event: obsEventType,
      provenance: provenanceFindings.length > 0 ? {
        findings: provenanceFindings.map(f => ({
          patternId: f.patternId,
          description: f.description,
          severity: f.severity,
          line: f.lineNumber,
          fix: f.fix,
        })),
      } : undefined,
    });

    return mergedResult;
  }

  private async runProvenanceCheck(input: HookPayload, content: string): Promise<Array<{ patternId: string; patternName: string; description: string; severity: string; LLevel: number; reachability: string; fix: string; lineNumber: number; matchedText: string }>> {
    if (!this.provenanceClient) return [];
    const filePath = input.tool_input.file_path as string;
    if (!filePath || !this.shouldCheckProvenance(filePath)) return [];

    const fileName = filePath.split(/[\\/]/).pop() || filePath;
    const findings: Array<{ patternId: string; patternName: string; description: string; severity: string; LLevel: number; reachability: string; fix: string; lineNumber: number; matchedText: string }> = [];

    try {
      const report = await this.provenanceClient.inspect(fileName, content, false);
      if (!report.available || !report.suspicious) return findings;

      for (const finding of report.report) {
        findings.push({
          patternId: `PROV:${finding.kind}`,
          patternName: `provenance-${finding.kind}`,
          description: finding.report || `Provenance mark detected: ${finding.kind}`,
          severity: "MEDIUM",
          LLevel: 2,
          reachability: "runtime",
          fix: "Run /sdd-purge --file <path> to clean provenance marks",
          lineNumber: 1,
          matchedText: finding.kind,
        });
      }
    } catch {
      // fail-open: provenance service errors do not block execution
    }

    return findings;
  }

  private shouldCheckProvenance(filePath: string): boolean {
    const ext = filePath.includes(".") ? `.${filePath.split(".").pop()}` : "";
    return ext !== "" && PROVENANCE_EXTENSIONS.has(ext.toLowerCase());
  }

  private mergeResults(
    securityResult: GateResult,
    provenanceFindings: Array<{ patternId: string; patternName: string; description: string; severity: string; LLevel: number; reachability: string; fix: string; lineNumber: number; matchedText: string }>,
  ): GateResult {
    if (provenanceFindings.length === 0) {
      return securityResult;
    }

    const allFindings = [...securityResult.findings, ...provenanceFindings];
    const hasCritical = allFindings.some(f => f.severity === "CRITICAL");
    const hasHigh = allFindings.some(f => f.severity === "HIGH");

    if (hasCritical || hasHigh) {
      return {
        decision: "BLOCK",
        exitCode: 2,
        message: `Blocked: ${allFindings.filter(f => f.severity === "CRITICAL" || f.severity === "HIGH").length} critical/high findings`,
        findings: allFindings,
      };
    }

    return {
      decision: "WARN",
      exitCode: 0,
      message: `Warning: ${provenanceFindings.length} provenance findings`,
      findings: allFindings,
    };
  }

  static async runFromStdin(): Promise<number> {
    try {
      const stdin = fs.readFileSync(0, "utf-8");

      let payload: HookPayload;
      try {
        payload = JSON.parse(stdin);
      } catch {
        payload = {
          session_id: "unknown",
          tool_name: "unknown",
          tool_input: {},
        };
      }

      const bridge = new HookBridge();
      const result = await bridge.processHook(payload);

      const output = {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: result.exitCode === 2 ? "deny" : "allow",
          permissionDecisionReason: result.message,
          additionalContext: JSON.stringify({
            decision: result.decision,
            findings: result.findings.map(f => ({
              patternId: f.patternId,
              description: f.description,
              severity: f.severity,
              line: f.lineNumber,
              fix: f.fix,
            })),
          }),
        },
        continue: result.exitCode === 0,
      };

      console.log(JSON.stringify(output, null, 2));
      return result.exitCode;
    } catch (err) {
      console.error("[hook-bridge] Fatal error:", err);
      emitObsEvent("ERROR", {
        error: err instanceof Error ? err.message : String(err),
        source: "hook-bridge",
      });
      return 0;
    }
  }
}
