import fs from "fs";
import path from "path";

export interface ALRule {
  id: string;
  scope: string;
  mustNotImport: string[];
  mustImport: string[];
  rationale: string;
  severity: "ERROR" | "WARN";
}

export interface ALFinding {
  ruleId: string;
  scope: string;
  violatingImport: string;
  severity: "ERROR" | "WARN";
  rationale: string;
}

export interface ALResult {
  totalRules: number;
  passed: number;
  failed: number;
  findings: ALFinding[];
  blocked: boolean;
}

export class ArchitectureLinter {
  private sddRoot: string;
  private projectRoot: string;

  constructor(sddRoot = ".sdd", projectRoot = ".") {
    this.sddRoot = sddRoot;
    this.projectRoot = projectRoot;
  }

  loadRules(fitnessPath?: string): ALRule[] {
    const resolved = fitnessPath
      || path.resolve(this.projectRoot, this.sddRoot, "projects", "sddra", "architecture", "fitness.sdd");
    if (!fs.existsSync(resolved)) {
      return [];
    }
    return this.parseRules(fs.readFileSync(resolved, "utf-8"));
  }

  scan(imports: Record<string, string[]>, rules?: ALRule[]): ALResult {
    const ruleList = rules || this.loadRules();
    const findings: ALFinding[] = [];

    for (const rule of ruleList) {
      const scopeImports = imports[rule.scope];
      if (!scopeImports) {
        continue;
      }
      for (const imp of scopeImports) {
        for (const banned of rule.mustNotImport) {
          if (this.matchesPattern(imp, banned)) {
            findings.push({
              ruleId: rule.id,
              scope: rule.scope,
              violatingImport: imp,
              severity: rule.severity,
              rationale: rule.rationale,
            });
          }
        }
        if (rule.mustImport.length > 0) {
          const hasRequired = rule.mustImport.some((req) => this.matchesPattern(imp, req));
          if (!hasRequired && rule.scope === rule.scope) {
            findings.push({
              ruleId: rule.id,
              scope: rule.scope,
              violatingImport: `MISSING: ${rule.mustImport.join(", ")}`,
              severity: rule.severity,
              rationale: rule.rationale,
            });
          }
        }
      }
    }

    const blocked = findings.some((f) => f.severity === "ERROR");
    return {
      totalRules: ruleList.length,
      passed: ruleList.length - new Set(findings.map((f) => f.ruleId)).size,
      failed: new Set(findings.map((f) => f.ruleId)).size,
      findings,
      blocked,
    };
  }

  scanProject(imports: Record<string, string[]>): ALResult {
    const rules = this.loadRules();
    return this.scan(imports, rules);
  }

  private matchesPattern(importPath: string, pattern: string): boolean {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return regex.test(importPath);
  }

  private parseRules(content: string): ALRule[] {
    const rules: ALRule[] = [];
    const ruleRegex = /RULE\s+(AL-\d+)\s*\n\s*Scope:\s*(.+?)\n\s*MUST NOT import:\s*(.+?)\n(?:\s*MUST import:\s*(.+?)\n)?\s*Rationale:\s*(.+?)\n\s*Severity:\s*(\w+)/g;
    let match;
    while ((match = ruleRegex.exec(content)) !== null) {
      rules.push({
        id: match[1],
        scope: match[2].trim(),
        mustNotImport: match[3].trim().split(",").map((s) => s.trim()),
        mustImport: match[4] ? match[4].trim().split(",").map((s) => s.trim()) : [],
        rationale: match[5].trim(),
        severity: match[6].trim() as "ERROR" | "WARN",
      });
    }
    return rules;
  }
}
