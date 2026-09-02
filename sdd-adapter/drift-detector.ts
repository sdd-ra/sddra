import fs from "fs";
import path from "path";
import {
  DriftRecord,
  DriftClassification,
  DriftType,
  DriftDetectionResult,
  EpistemicState,
  ConfidenceLevel,
} from "./types";

export class DriftDetector {
  private sddRoot: string;
  private projectRoot: string;

  constructor(sddRoot = ".sdd", projectRoot = ".") {
    this.sddRoot = sddRoot;
    this.projectRoot = projectRoot;
  }

  async detectAll(scope?: string): Promise<DriftDetectionResult> {
    const records: DriftRecord[] = [];
    const scopePath = scope ? path.resolve(this.projectRoot, scope) : this.projectRoot;

    const driftTypes: DriftType[] = [
      "structural", "behavioral", "contract", "database",
      "security", "configuration", "documentation", "terminology",
    ];

    for (const type of driftTypes) {
      const drifts = await this.detectByType(type, scopePath);
      records.push(...drifts);
    }

    const byType = this.countByType(records);
    const byClassification = this.countByClassification(records);

    return { totalDrifts: records.length, byType, byClassification, items: records };
  }

  async detectStructural(scopePath?: string): Promise<DriftRecord[]> {
    return this.detectByType("structural", scopePath || this.projectRoot);
  }

  async detectBehavioral(scopePath?: string): Promise<DriftRecord[]> {
    return this.detectByType("behavioral", scopePath || this.projectRoot);
  }

  async detectContract(scopePath?: string): Promise<DriftRecord[]> {
    return this.detectByType("contract", scopePath || this.projectRoot);
  }

  async detectDatabase(scopePath?: string): Promise<DriftRecord[]> {
    return this.detectByType("database", scopePath || this.projectRoot);
  }

  async detectSecurity(scopePath?: string): Promise<DriftRecord[]> {
    return this.detectByType("security", scopePath || this.projectRoot);
  }

  async detectConfiguration(scopePath?: string): Promise<DriftRecord[]> {
    return this.detectByType("configuration", scopePath || this.projectRoot);
  }

  async detectDocumentation(scopePath?: string): Promise<DriftRecord[]> {
    return this.detectByType("documentation", scopePath || this.projectRoot);
  }

  async detectTerminology(scopePath?: string): Promise<DriftRecord[]> {
    return this.detectByType("terminology", scopePath || this.projectRoot);
  }

  async detectByType(type: DriftType, scopePath?: string): Promise<DriftRecord[]> {
    const records: DriftRecord[] = [];
    const id = this.generateId(type, records.length);

    switch (type) {
      case "structural":
        return this.detectStructuralDrift(scopePath);
      case "behavioral":
        return this.detectBehavioralDrift(scopePath);
      case "contract":
        return this.detectContractDrift(scopePath);
      case "database":
        return this.detectDatabaseDrift(scopePath);
      case "security":
        return this.detectSecurityDrift(scopePath);
      case "configuration":
        return this.detectConfigurationDrift(scopePath);
      case "documentation":
        return this.detectDocumentationDrift(scopePath);
      case "terminology":
        return this.detectTerminologyDrift(scopePath);
      default:
        return records;
    }
  }

  private async detectStructuralDrift(scopePath?: string): Promise<DriftRecord[]> {
    const records: DriftRecord[] = [];
    const sddTree = this.buildSddTree();
    const codeTree = this.buildCodeTree(scopePath || this.projectRoot);

    const sddModules = new Set(sddTree.filter(f => f.includes(".sdd")).map(f => this.extractModule(f)));
    const codeModules = new Set(codeTree.map(f => this.extractModule(f)));

    for (const mod of sddModules) {
      if (!codeModules.has(mod)) {
        records.push({
          id: this.generateId("structural", records.length),
          type: "structural",
          classification: "UNKNOWN",
          confidence: "HIGH",
          declared: `.sdd declares module: ${mod}`,
          observed: `Code does not contain module: ${mod}`,
          evidence: [],
          syncOp: "REVIEW",
          severity: "MEDIUM",
          status: "DETECTED",
          sourceOfTruth: "@truth.architecture",
          epistemicState: "OBSERVED",
        });
      }
    }

    return records;
  }

  private async detectBehavioralDrift(scopePath?: string): Promise<DriftRecord[]> {
    const records: DriftRecord[] = [];
    const testDir = path.join(scopePath || this.projectRoot, "tests");
    const specDir = path.join(this.projectRoot, this.sddRoot, "tasks");

    if (!fs.existsSync(testDir)) return records;

    const testFiles = this.findFiles(testDir, ".test.ts", ".test.js");
    if (testFiles.length === 0) {
      records.push({
        id: this.generateId("behavioral", 0),
        type: "behavioral",
        classification: "UNKNOWN",
        confidence: "MEDIUM",
        declared: ".sdd implies test coverage for tasks",
        observed: "No test files found in tests/ directory",
        evidence: [],
        syncOp: "REVIEW",
        severity: "LOW",
        status: "DETECTED",
        sourceOfTruth: "@truth.architecture",
        epistemicState: "OBSERVED",
      });
    }

    return records;
  }

  private async detectContractDrift(scopePath?: string): Promise<DriftRecord[]> {
    const records: DriftRecord[] = [];
    const apiDir = path.join(scopePath || this.projectRoot, "src", "api");
    const openapiPath = path.join(this.projectRoot, this.sddRoot, "references", "sdd", "living-specs-best-practices.sdd");

    if (!fs.existsSync(apiDir) && !fs.existsSync(openapiPath)) return records;

    if (fs.existsSync(apiDir) && !fs.existsSync(openapiPath)) {
      records.push({
        id: this.generateId("contract", 0),
        type: "contract",
        classification: "UNKNOWN",
        confidence: "LOW",
        declared: "API contract declared in OpenAPI",
        observed: "API directory exists but no OpenAPI spec found",
        evidence: [],
        syncOp: "REVIEW",
        severity: "LOW",
        status: "DETECTED",
        sourceOfTruth: "@truth.api",
        epistemicState: "INFERRED",
      });
    }

    return records;
  }

  private async detectDatabaseDrift(scopePath?: string): Promise<DriftRecord[]> {
    return [];
  }

  private async detectSecurityDrift(scopePath?: string): Promise<DriftRecord[]> {
    const records: DriftRecord[] = [];
    const sddPath = path.join(this.projectRoot, this.sddRoot);

    if (fs.existsSync(sddPath)) {
      const securityFiles = this.findInDir(sddPath, "security");
      if (securityFiles.length === 0) {
        records.push({
          id: this.generateId("security", 0),
          type: "security",
          classification: "UNKNOWN",
          confidence: "MEDIUM",
          declared: "Project has security controls",
          observed: ".sdd/security/ directory missing or empty",
          evidence: [],
          syncOp: "REVIEW",
          severity: "HIGH",
          status: "DETECTED",
          sourceOfTruth: "@truth.architecture",
          epistemicState: "OBSERVED",
        });
      }
    }

    return records;
  }

  private async detectConfigurationDrift(scopePath?: string): Promise<DriftRecord[]> {
    return [];
  }

  private async detectDocumentationDrift(scopePath?: string): Promise<DriftRecord[]> {
    return [];
  }

  private async detectTerminologyDrift(scopePath?: string): Promise<DriftRecord[]> {
    return [];
  }

  classify(record: Partial<DriftRecord>): DriftClassification {
    const { declared, observed } = record;
    if (!declared && !observed) return "UNKNOWN";
    if (!observed) return "DECLARATION_WRONG";
    if (!declared) return "CODE_WRONG";
    return "UNKNOWN";
  }

  private countByType(records: DriftRecord[]): Record<DriftType, number> {
    const counts: Record<DriftType, number> = {
      structural: 0, behavioral: 0, contract: 0, database: 0,
      security: 0, configuration: 0, documentation: 0, terminology: 0,
    };
    for (const r of records) {
      counts[r.type] = (counts[r.type] || 0) + 1;
    }
    return counts;
  }

  private countByClassification(records: DriftRecord[]): Record<DriftClassification, number> {
    const counts: Record<DriftClassification, number> = {
      DECLARATION_WRONG: 0, CODE_WRONG: 0, BOTH_OUTDATED: 0, UNKNOWN: 0,
    };
    for (const r of records) {
      counts[r.classification] = (counts[r.classification] || 0) + 1;
    }
    return counts;
  }

  private generateId(type: DriftType, index: number): string {
    return `D${type.substring(0, 4).toUpperCase()}${100 + index}`;
  }

  private buildSddTree(): string[] {
    const sddPath = path.join(this.projectRoot, this.sddRoot);
    if (!fs.existsSync(sddPath)) return [];
    return this.findFiles(sddPath, ".sdd");
  }

  private buildCodeTree(scopePath: string): string[] {
    const files: string[] = [];
    if (!fs.existsSync(scopePath)) return files;

    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
          if (entry !== "node_modules" && entry !== ".git" && entry !== "dist") {
            walk(full);
          }
        } else {
          files.push(full);
        }
      }
    };
    walk(scopePath);
    return files;
  }

  private findFiles(dir: string, ...extensions: string[]): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const walk = (d: string): void => {
      for (const entry of fs.readdirSync(d)) {
        const full = path.join(d, entry);
        if (fs.statSync(full).isDirectory()) {
          walk(full);
        } else if (extensions.some(ext => entry.endsWith(ext))) {
          results.push(full);
        }
      }
    };
    walk(dir);
    return results;
  }

  private findInDir(dir: string, subdir: string): string[] {
    const target = path.join(dir, subdir);
    if (!fs.existsSync(target)) return [];
    const files: string[] = [];
    const entries = fs.readdirSync(target);
    for (const entry of entries) {
      const full = path.join(target, entry);
      if (fs.statSync(full).isFile()) {
        files.push(full);
      }
    }
    return files;
  }

  private extractModule(filePath: string): string {
    const normalized = filePath.replace(/\\/g, "/");
    const parts = normalized.split("/");
    return parts.filter(p => p !== this.sddRoot && p !== ".sdd" && !p.endsWith(".sdd"))
      .filter(p => p !== "src" && p !== "internal")
      .slice(0, 2)
      .join("/");
  }
}
