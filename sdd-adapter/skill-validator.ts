import fs from "fs";
import path from "path";

export interface ValidationFinding {
  gate: string;
  severity: "BLOCK" | "WARN" | "INFO";
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  decision: "SHIP" | "FIX" | "BLOCK";
  findings: ValidationFinding[];
  score: number;
}

export interface SkillCandidate {
  name: string;
  sourceUrl: string;
  license: string;
  content: string;
  hasCode: boolean;
  runtime?: string;
}

const VALID_LICENSES = ["MIT", "Apache-2.0", "Apache 2.0", "CC0-1.0", "ISC"];
const SOURCE_AVAILABLE_MARKER = "source-available";

/**
 * Skill Validator — Phase 146 §3.2.
 * Validates skill structure (SKILL.md), metadata completeness (frontmatter),
 * and policy gates (license, security, provenance) before import.
 * Verdict semantics follow SDDRA gates: SHIP / FIX / BLOCK.
 */
export class SkillValidator {
  /**
   * Structural gate: SKILL.md frontmatter must exist with name + description.
   */
  validateStructure(candidate: SkillCandidate): ValidationFinding[] {
    const findings: ValidationFinding[] = [];
    const content = candidate.content;

    if (!content || content.trim().length === 0) {
      findings.push({ gate: "structure", severity: "BLOCK", message: "SKILL.md content is empty" });
      return findings;
    }

    const fm = this.parseFrontmatter(content);
    if (!fm) {
      findings.push({ gate: "structure", severity: "BLOCK", message: "Missing YAML frontmatter (--- ... ---) in SKILL.md" });
    } else {
      if (!fm.name) {
        findings.push({ gate: "structure", severity: "BLOCK", message: "Frontmatter missing required field: name" });
      } else if (fm.name !== candidate.name) {
        findings.push({ gate: "structure", severity: "WARN", message: `Frontmatter name "${fm.name}" differs from candidate name "${candidate.name}"` });
      }
      if (!fm.description) {
        findings.push({ gate: "structure", severity: "BLOCK", message: "Frontmatter missing required field: description" });
      } else if (fm.description.length < 20) {
        findings.push({ gate: "structure", severity: "WARN", message: "Description is too short (<20 chars) — weak trigger matching" });
      }
    }

    const body = this.stripFrontmatter(content).trim();
    if (body.length < 50) {
      findings.push({ gate: "structure", severity: "WARN", message: "SKILL.md body is very thin (<50 chars)" });
    }

    return findings;
  }

  /**
   * Metadata gate: license + provenance fields per CLAUDE.md import rules.
   */
  validateMetadata(candidate: SkillCandidate): ValidationFinding[] {
    const findings: ValidationFinding[] = [];
    const fm = this.parseFrontmatter(candidate.content) || {};

    const license = (fm.license || candidate.license || "").trim();
    if (!license) {
      findings.push({ gate: "license", severity: "BLOCK", message: "No license declared (frontmatter, registry, or candidate)" });
    } else if (license.includes(SOURCE_AVAILABLE_MARKER)) {
      findings.push({ gate: "license", severity: "BLOCK", message: "source-available is NOT open source — non-importable [IMP6]" });
    } else if (!this.isPermissiveLicense(license)) {
      findings.push({ gate: "license", severity: "BLOCK", message: `License "${license}" is not in the permissive allowlist (${VALID_LICENSES.join(", ")}) [IMP6]` });
    }

    if (!candidate.sourceUrl || !/^https:\/\/github\.com\//.test(candidate.sourceUrl)) {
      findings.push({ gate: "license", severity: "WARN", message: "Source URL missing or not a GitHub repository — provenance citation incomplete" });
    }

    return findings;
  }

  /**
   * Security gate: lexical scan for secrets, dangerous shell, injection hooks.
   * (Lightweight pass — the full hook-bridge scan runs on imported files.)
   */
  validateSecurity(candidate: SkillCandidate): ValidationFinding[] {
    const findings: ValidationFinding[] = [];
    const content = candidate.content;

    const secretPatterns: Array<[RegExp, string]> = [
      [/sk-[a-zA-Z0-9]{20,}/, "Possible API key (sk-...) in SKILL.md"],
      [/AKIA[0-9A-Z]{16}/, "Possible AWS access key in SKILL.md"],
      [/-----BEGIN (RSA |EC )?PRIVATE KEY-----/, "Private key material in SKILL.md"],
      [/(ghp|github_pat)_[a-zA-Z0-9]{30,}/, "Possible GitHub token in SKILL.md"],
    ];
    for (const [pattern, message] of secretPatterns) {
      if (pattern.test(content)) {
        findings.push({ gate: "security", severity: "BLOCK", message });
      }
    }

    const shellPatterns: Array<[RegExp, string]> = [
      [/curl\s+[^\n]*\|\s*(sudo\s+)?(ba)?sh/, "curl | sh pattern — remote code execution risk"],
      [/rm\s+-rf\s+\/(?!\w)/, "Destructive rm -rf targeting root paths"],
      [/eval\s*\(\s*atob/, "eval(atob(...)) — obfuscated execution"],
    ];
    for (const [pattern, message] of shellPatterns) {
      if (pattern.test(content)) {
        findings.push({ gate: "security", severity: "BLOCK", message });
      }
    }

    if (candidate.hasCode && !candidate.runtime) {
      findings.push({
        gate: "security",
        severity: "WARN",
        message: "Skill carries code but declares no runtime — Docker gating cannot be planned [IMP2]",
      });
    }

    return findings;
  }

  /**
   * Full validation: all gates + SHIP/FIX/BLOCK decision + 0-100 score.
   */
  validate(candidate: SkillCandidate): ValidationResult {
    const findings = [
      ...this.validateStructure(candidate),
      ...this.validateMetadata(candidate),
      ...this.validateSecurity(candidate),
    ];

    const blockers = findings.filter(f => f.severity === "BLOCK").length;
    const warns = findings.filter(f => f.severity === "WARN").length;

    let score = 100;
    score -= blockers * 40;
    score -= warns * 10;
    score = Math.max(0, Math.min(100, score));

    const decision: ValidationResult["decision"] =
      blockers > 0 ? "BLOCK" : warns > 0 ? "FIX" : "SHIP";

    return {
      valid: blockers === 0,
      decision,
      findings,
      score,
    };
  }

  /**
   * Validate a file on disk. Accepts both SKILL.md (YAML frontmatter)
   * and .sdd provenance wrappers (Key: Value lines). Wrappers (.sdd)
   * skip the frontmatter structure gate — they use Key: Value format.
   */
  validateFile(filePath: string): ValidationResult {
    const content = fs.readFileSync(filePath, "utf-8");
    const isWrapper = filePath.endsWith(".sdd");
    const fm = this.parseFrontmatter(content) || {};
    const name = path.basename(path.dirname(filePath)) || fm.name || "unknown";
    const candidate: SkillCandidate = {
      name: fm.name || name,
      sourceUrl: this.extractSourceUrl(content),
      license: fm.license || this.extractKeyLine(content, "License"),
      content,
      hasCode: false,
    };
    if (!isWrapper) {
      return this.validate(candidate);
    }
    // Wrapper path: license + security gates only; structure is .sdd-native.
    const findings = [
      ...this.validateMetadata(candidate),
      ...this.validateSecurity(candidate),
    ];
    const blockers = findings.filter(f => f.severity === "BLOCK").length;
    const warns = findings.filter(f => f.severity === "WARN").length;
    let score = 100 - blockers * 40 - warns * 10;
    score = Math.max(0, Math.min(100, score));
    return {
      valid: blockers === 0,
      decision: blockers > 0 ? "BLOCK" : warns > 0 ? "FIX" : "SHIP",
      findings,
      score,
    };
  }

  private extractKeyLine(content: string, key: string): string {
    const match = content.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return match ? match[1].trim() : "";
  }

  private extractSourceUrl(content: string): string {
    const match = content.match(/Source:\s*(https:\/\/\S+)/);
    return match ? match[1] : "";
  }

  private isPermissiveLicense(license: string): boolean {
    const normalized = license.toLowerCase();
    if (normalized.includes(SOURCE_AVAILABLE_MARKER)) return false;
    return VALID_LICENSES.some(l => normalized.includes(l.toLowerCase()));
  }

  private parseFrontmatter(content: string): Record<string, string> | null {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return null;
    const result: Record<string, string> = {};
    for (const line of match[1].split(/\r?\n/)) {
      const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
      if (kv) {
        result[kv[1]] = kv[2].replace(/^["']|["']$/g, "").trim();
      }
    }
    return result;
  }

  private stripFrontmatter(content: string): string {
    return content.replace(/^---\r?\n[\s\S]*?\r?\n---/, "");
  }
}
