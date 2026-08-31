import fs from "fs";
import { HookPayload, GateResult, ObsEvent } from "./types";
import { PatternsRuntime } from "./security/patterns-runtime";
import { emitObsEvent } from "./spec-loader";

export class HookBridge {
  private patternsRuntime: PatternsRuntime;

  constructor() {
    this.patternsRuntime = new PatternsRuntime();
  }

  processHook(input: HookPayload): GateResult {
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

    const findings = this.patternsRuntime.scan(content, input.tool_input.file_path as string);
    const result = this.patternsRuntime.evaluate(findings);

    const obsType = result.exitCode === 2 ? "GATE" : "POLICY";
    const obsEventType = result.decision === "BLOCK" ? "OBS13 security_gate_blocked"
      : result.decision === "WARN" ? "OBS12 security_gate_warned"
      : "OBS11 security_gate_passed";

    emitObsEvent(obsType, {
      correlationId,
      causationId: input.tool_use_id,
      tool: toolName,
      file: input.tool_input.file_path,
      decision: result.decision,
      exitCode: result.exitCode,
      findings: result.findings.map(f => ({
        patternId: f.patternId,
        severity: f.severity,
        LLevel: f.LLevel,
        line: f.lineNumber,
      })),
      event: obsEventType,
    });

    return result;
  }

  static runFromStdin(): number {
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
      const result = bridge.processHook(payload);

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
