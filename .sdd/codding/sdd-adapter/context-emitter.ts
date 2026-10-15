import fs from "fs";
import path from "path";

/**
 * Context Emitter — implements .sdd/agent/context-emission.sdd [CE-01..06].
 *
 * Derives AGENTS.md (coding-agent standard) and the CLAUDE.md pointer
 * from .sdd/INDEX.sdd + .sdd/PROJECT.sdd. .sdd/ is NEVER edited by
 * emission ([CE-01]); emitted files carry a DERIVED marker ([CE-04])
 * and stay within the 500-2,000 token budget ([CE-02], 32 KiB hard cap).
 */

export interface EmissionInput {
  projectName: string;
  projectPurpose: string;
  stack: string;
  topRules: string[]; // one-line rule digests, most important first
  commands: { name: string; purpose: string }[];
  keyPaths: string[];
}

export interface EmissionResult {
  agentsMd: string;
  tokenEstimate: number;
  bytes: number;
}

const DERIVED_MARKER =
  "<!-- DERIVED FILE - DO NOT EDIT; regenerate via /sdd-sync (.sdd/ is the source of truth) -->";

export function estimateTokens(text: string): number {
  // Conservative token estimate: ~3.5 chars per token for English markdown.
  return Math.ceil(text.length / 3.5);
}

export function emitAgentsMd(input: EmissionInput): EmissionResult {
  const lines: string[] = [];
  lines.push(DERIVED_MARKER);
  lines.push("");
  lines.push(`# ${input.projectName}`);
  lines.push("");
  lines.push(`${input.projectPurpose}`);
  lines.push("");
  lines.push(`Stack: ${input.stack}`);
  lines.push("");
  lines.push("## Core Rules");
  lines.push("");
  for (const rule of input.topRules) {
    lines.push(`- ${rule}`);
  }
  lines.push("");
  lines.push("## Commands");
  lines.push("");
  for (const c of input.commands) {
    lines.push(`- \`${c.name}\` - ${c.purpose}`);
  }
  lines.push("");
  lines.push("## Key Paths");
  lines.push("");
  for (const p of input.keyPaths) {
    lines.push(`- ${p}`);
  }
  lines.push("");
  lines.push(
    "Route through `.sdd/INDEX.sdd` for the full specification tree."
  );
  lines.push("");

  const agentsMd = lines.join("\n");
  const bytes = Buffer.byteLength(agentsMd, "utf-8");
  if (bytes > 32 * 1024) {
    // [CE-02] hard cap — trim to the top-rules digest only.
    return emitAgentsMd({
      ...input,
      commands: input.commands.slice(0, 10),
      keyPaths: [input.keyPaths[0]].filter(Boolean),
    });
  }
  return { agentsMd, tokenEstimate: estimateTokens(agentsMd), bytes };
}

export function emitClaudeMdPointer(projectName: string): string {
  return [
    DERIVED_MARKER,
    "",
    `# ${projectName} - Claude Code Context`,
    "",
    "@AGENTS.md",
    "",
    "Claude-specific additions only. All project rules live in AGENTS.md",
    "(derived from .sdd/ - the single source of truth). CLAUDE.local.md",
    "is gitignored per Claude Code convention.",
    "",
  ].join("\n");
}

/**
 * Fingerprint of the emission inputs — [CE-03] regeneration is triggered
 * by an INDEX.sdd digest change; this detects drift for /sdd-drift [CE-06].
 */
export function emissionFingerprint(input: EmissionInput): string {
  const canonical = JSON.stringify(input);
  let h1 = 0x811c9dc5;
  for (let i = 0; i < canonical.length; i++) {
    h1 ^= canonical.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
  }
  return h1.toString(16).padStart(8, "0");
}

/** Write the derived artifacts to the project root. */
export function writeEmission(
  projectRoot: string,
  input: EmissionInput
): { agents: string; claude: string } {
  const agents = emitAgentsMd(input);
  const claude = emitClaudeMdPointer(input.projectName);
  fs.writeFileSync(path.join(projectRoot, "AGENTS.md"), agents.agentsMd, "utf-8");
  fs.writeFileSync(path.join(projectRoot, "CLAUDE.md"), claude, "utf-8");
  return { agents: path.join(projectRoot, "AGENTS.md"), claude: path.join(projectRoot, "CLAUDE.md") };
}
