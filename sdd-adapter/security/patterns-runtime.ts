import { SddPattern, PatternMatch, GateResult } from "../types";
import { loadSecuritySpecs } from "../spec-loader";

export class PatternsRuntime {
  private patterns: SddPattern[] = [];
  private compiledPatterns: Map<string, RegExp> = new Map();

  constructor() {
    this.loadPatterns();
  }

  loadPatterns(): void {
    const { patterns } = loadSecuritySpecs();
    this.patterns = patterns;
    this.compiledPatterns.clear();

    for (const pattern of patterns) {
      try {
        const regex = new RegExp(pattern.regex, "gi");
        this.compiledPatterns.set(pattern.id, regex);
      } catch (err) {
        console.error(`[patterns-runtime] Failed to compile regex for ${pattern.id}: ${pattern.regex}`, err);
      }
    }
  }

  scan(content: string, filePath: string = ""): PatternMatch[] {
    const findings: PatternMatch[] = [];
    const lines = content.split(/\r?\n/);

    for (const pattern of this.patterns) {
      const regex = this.compiledPatterns.get(pattern.id);
      if (!regex) continue;

      regex.lastIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const matches = line.match(regex);
        if (matches && matches.length > 0) {
          for (const match of matches) {
            findings.push({
              patternId: pattern.id,
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
