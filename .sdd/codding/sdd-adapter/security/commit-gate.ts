import { execSync } from "child_process";
import fs from "fs";
import { PatternsRuntime } from "./patterns-runtime";
import { emitObsEvent } from "../spec-loader";

export class CommitGate {
  private patternsRuntime: PatternsRuntime;

  constructor() {
    this.patternsRuntime = new PatternsRuntime();
  }

  checkCommit(): { allowed: boolean; message: string } {
    try {
      const diff = this.getStagedDiff();
      if (!diff || diff.trim() === "") {
        return { allowed: true, message: "No staged changes" };
      }

      const findings = this.patternsRuntime.scan(diff);
      if (findings.length === 0) {
        emitObsEvent("GATE", {
          tool: "git-commit",
          decision: "PASS",
          findings: 0,
        });
        return { allowed: true, message: "Commit passes security scan" };
      }

      const critical = findings.filter(f => f.severity === "CRITICAL" || f.severity === "HIGH");
      if (critical.length > 0) {
        const message = `Blocked: ${critical.length} critical/high security findings in staged changes:\n${critical.map(f => `  - ${f.patternId} at line ${f.lineNumber}: ${f.description}`).join("\n")}`;
        emitObsEvent("GATE", {
          tool: "git-commit",
          decision: "BLOCK",
          findings: findings.length,
          critical: critical.length,
          message,
        });
        return { allowed: false, message };
      }

      const message = `Warning: ${findings.length} medium/low findings in staged changes`;
      emitObsEvent("GATE", {
        tool: "git-commit",
        decision: "WARN",
        findings: findings.length,
        message,
      });
      return { allowed: true, message };
    } catch (err) {
      return { allowed: true, message: `Commit gate check failed: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  private getStagedDiff(): string {
    try {
      return execSync("git diff --cached", { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 });
    } catch {
      return "";
    }
  }
}
