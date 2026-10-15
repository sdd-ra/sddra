import { SddPattern, PatternMatch, GateResult, SddSkillPatternSet } from "../types";
import { loadSecuritySpecs } from "../spec-loader";

export class PatternsRuntime {
  private patterns: SddPattern[] = [];
  private compiledPatterns: Map<string, RegExp> = new Map();
  private skillPatternSets: SddSkillPatternSet[] = [];

  constructor() {
    this.loadPatterns();
  }

  loadPatterns(): void {
    const { patterns, skillPatternSets } = loadSecuritySpecs();
    this.patterns = patterns;
    this.skillPatternSets = skillPatternSets;
    this.compiledPatterns.clear();

    for (const pattern of patterns) {
      try {
        const regex = new RegExp(pattern.regex, "gi");
        this.compiledPatterns.set(pattern.id, regex);
      } catch (err) {
        console.error(`[patterns-runtime] Failed to compile regex for ${pattern.id}: ${pattern.regex}`, err);
      }
    }

    for (const set of skillPatternSets) {
      for (const pattern of set.patterns) {
        try {
          const regex = new RegExp(pattern.regex, "gi");
          this.compiledPatterns.set(`${set.skillId}:${pattern.id}`, regex);
        } catch (err) {
          console.error(`[patterns-runtime] Failed to compile regex for ${set.skillId}:${pattern.id}: ${pattern.regex}`, err);
        }
      }
    }
  }

  getSkillPatterns(filePath: string): SddPattern[] {
    const ext = filePath.includes(".") ? `.${filePath.split(".").pop()}` : "";
    if (!ext) return [];

    for (const set of this.skillPatternSets) {
      if (set.fileExtensions.includes(ext)) {
        return set.patterns;
      }
    }
    return [];
  }

  scanWithPatterns(content: string, patterns: SddPattern[], prefix: string = ""): PatternMatch[] {
    const findings: PatternMatch[] = [];
    const lines = content.split(/\r?\n/);

    for (const pattern of patterns) {
      const key = prefix ? `${prefix}:${pattern.id}` : pattern.id;
      const regex = this.compiledPatterns.get(key);
      if (!regex) continue;

      regex.lastIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const matches = line.match(regex);
        if (matches && matches.length > 0) {
          for (const match of matches) {
            findings.push({
              patternId: key,
              patternName: pattern.name,
              description: pattern.description,
              severity: pattern.severity,
              LLevel: pattern.LLevel,
              reachability: pattern.reachability,
              fix: pattern.fix,
              lineNumber: i + 1,
              matchedText: match,
            });
          }
        }
      }
    }

    return findings;
  }

  scan(content: string, filePath: string = ""): PatternMatch[] {
    const findings = this.scanWithPatterns(content, this.patterns);

    const skillPatterns = this.getSkillPatterns(filePath);
    if (skillPatterns.length > 0) {
      const skillId = this.skillPatternSets.find(s => s.fileExtensions.some(ext => filePath.endsWith(ext)))?.skillId || "";
      findings.push(...this.scanWithPatterns(content, skillPatterns, skillId));
    }

    return findings;
  }

  evaluate(findings: PatternMatch[], projectLevel: number = 2): GateResult {
    if (findings.length === 0) {
      return {
        decision: "PASS",
        exitCode: 0,
        message: "No security patterns matched",
        findings: [],
      };
    }

    const criticalFindings = findings.filter(f => f.severity === "CRITICAL");
    const highFindings = findings.filter(f => f.severity === "HIGH");
    const mediumFindings = findings.filter(f => f.severity === "MEDIUM");
    const lowFindings = findings.filter(f => f.severity === "LOW");

    let decision: string;
    let exitCode: number;
    let message: string;

    if (criticalFindings.length > 0 || highFindings.length > 0) {
      decision = "BLOCK";
      exitCode = 2;
      message = `Blocked: ${criticalFindings.length + highFindings.length} critical/high findings`;
    } else if (mediumFindings.length > 0) {
      decision = "WARN";
      exitCode = 0;
      message = `Warning: ${mediumFindings.length} medium findings`;
    } else if (lowFindings.length > 0) {
      decision = "WARN";
      exitCode = 0;
      message = `Warning: ${lowFindings.length} low findings`;
    } else {
      decision = "PASS";
      exitCode = 0;
      message = "Pass: findings below threshold";
    }

    return {
      decision,
      exitCode,
      message,
      findings,
    };
  }

  getPatterns(): SddPattern[] {
    return [...this.patterns];
  }
}
