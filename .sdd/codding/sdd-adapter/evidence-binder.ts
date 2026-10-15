import { EvidenceSource, ConfidenceLevel } from "./types";

export class EvidenceBinder {
  private evidence: Map<string, EvidenceSource[]> = new Map();

  bindEvidence(
    driftId: string,
    sources: EvidenceSource[]
  ): string[] {
    this.evidence.set(driftId, sources);
    return sources.map(s => s.id);
  }

  validateProof(proofId: string): boolean {
    const proofContent = this.readEvidence(proofId);
    if (!proofContent) return false;

    const hasType = proofContent.includes("type:") || proofContent.includes("Type:");
    const hasResult = proofContent.includes("result: PASS") ||
                      proofContent.includes("result: FAIL") ||
                      proofContent.includes("result: PARTIAL");
    const hasConfidence = proofContent.includes("confidence:");

    return hasType && hasResult && hasConfidence;
  }

  static collectStaticEvidence(filePath: string): string[] {
    const evidence: string[] = [];
    try {
      const fs = require("fs");
      const content = fs.readFileSync(filePath, "utf-8");

      const lines = content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes("import ") && line.includes("from ")) {
          evidence.push(`Line ${i + 1}: ${line.trim()}`);
        }
        if (line.includes("function ") || line.includes("class ")) {
          evidence.push(`Line ${i + 1}: ${line.trim()}`);
        }
        if (line.includes("interface ") || line.includes("type ")) {
          evidence.push(`Line ${i + 1}: ${line.trim()}`);
        }
      }
    } catch {
      return [];
    }
    return evidence;
  }

  static collectTestEvidence(testPath: string): string[] {
    const evidence: string[] = [];
    try {
      const fs = require("fs");
      const content = fs.readFileSync(testPath, "utf-8");

      const lines = content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes("test(") || line.includes("it(")) {
          evidence.push(`Line ${i + 1}: ${line.trim()}`);
        }
        if (line.includes("assert(") || line.includes("expect(") || line.includes("should.")) {
          evidence.push(`Line ${i + 1}: ${line.trim()}`);
        }
      }
    } catch {
      return [];
    }
    return evidence;
  }

  static collectRuntimeEvidence(logPath: string): string[] {
    const evidence: string[] = [];
    try {
      const fs = require("fs");
      const content = fs.readFileSync(logPath, "utf-8");
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        if (line.includes("ERROR") || line.includes("WARN") || line.includes("INFO")) {
          evidence.push(line.trim());
        }
      }
    } catch {
      return [];
    }
    return evidence;
  }

  getEvidence(driftId: string): EvidenceSource[] {
    return this.evidence.get(driftId) || [];
  }

  getConfidence(evidence: EvidenceSource[]): ConfidenceLevel {
    if (evidence.length === 0) return "LOW";
    if (evidence.length === 1) return "MEDIUM";
    return "HIGH";
  }

  private readEvidence(evidenceId: string): string | null {
    const match = evidenceId.match(/(\w+):(.*)/);
    if (!match) return null;

    const [, type, path] = match;
    try {
      const fs = require("fs");
      if (fs.existsSync(path)) {
        return fs.readFileSync(path, "utf-8");
      }
    } catch {
      return null;
    }
    return null;
  }
}
