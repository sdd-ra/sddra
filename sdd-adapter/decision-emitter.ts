import fs from "fs";
import path from "path";
import { DecisionPoint, DecisionType, DecisionStep } from "./types";
import { emitObsEvent } from "./spec-loader";

export class DecisionEmitter {
  private decisionsDir: string;

  constructor(decisionsDir?: string) {
    this.decisionsDir = decisionsDir || ".sdd/runtime/decisions";
  }

  emit(result: {
    command: string;
    decision: string;
    exitCode: number;
    stage?: string;
    taskId?: string;
    decisionId?: string;
  }, nextSteps?: DecisionStep[]): DecisionPoint {    const id = `DP-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const timestamp = new Date().toISOString();
    const sessionId = process.env.SDD_SESSION_ID || `session-${Date.now()}`;

    const type = this.determineType(result);
    const steps = nextSteps || this.defaultNextSteps(result);
    const stage = (result as { stage?: string }).stage || "unknown";

    const point: DecisionPoint = {
      id,
      type,
      triggeredBy: result.command,
      stage,
      result: result.decision,
      recommendedNextSteps: steps,
      reviewOptions: {
        approveAndProceed: `/sdd-next --approve --id ${id}`,
        reviewAndModify: `/sdd-next --review --id ${id}`,
      },
      metadata: {
        timestamp,
        sessionId,
        taskId: result.taskId,
        decisionId: result.decisionId,
      },
    };

    this.persist(point);
    this.emitOBS(point);

    return point;
  }

  private determineType(result: { decision: string; exitCode: number }): DecisionType {
    if (result.exitCode !== 0 && result.decision !== "BLOCK") {
      return DecisionType.ERROR;
    }
    if (result.decision === "BLOCK") {
      return DecisionType.ERROR;
    }
    if (result.decision === "WARN") {
      return DecisionType.REVIEW;
    }
    return DecisionType.CONTINUE;
  }

  private defaultNextSteps(result: { command: string; decision: string; exitCode: number }): DecisionStep[] {
    if (result.decision === "BLOCK" || result.exitCode === 2) {
      return [
        {
          id: "dp-1",
          label: "Review error output",
          command: `/sdd-trace --reverse`,
          description: "Trace back to the source of the failure",
          risk: "HIGH",
        },
        {
          id: "dp-2",
          label: "Create fix task",
          command: `/sdd "fix the blocking issue"`,
          description: "Open a task to resolve the blocker",
          risk: "HIGH",
        },
      ];
    }
    if (result.decision === "WARN") {
      return [
        {
          id: "dp-1",
          label: "Review warnings",
          command: `/sdd-drift --severity WARN`,
          description: "Review all warnings in detail",
          risk: "MEDIUM",
        },
        {
          id: "dp-2",
          label: "Proceed with caution",
          command: `/sdd-next --approve`,
          description: "Acknowledge warnings and proceed",
          risk: "LOW",
        },
      ];
    }
    const stageMap: Record<string, DecisionStep[]> = {
      BE: [
        { id: "dp-1", label: "Run BE tests", command: "/sdd-scan --file src/", description: "Verify backend implementation", risk: "MEDIUM" },
        { id: "dp-2", label: "Deploy backend", command: "docker compose up be-builder", description: "Start BE service", risk: "HIGH" },
      ],
      FE: [
        { id: "dp-1", label: "Run FE tests", command: "/sdd-scan --directory public/", description: "Verify frontend implementation", risk: "MEDIUM" },
        { id: "dp-2", label: "Deploy frontend", command: "docker compose up fe-builder", description: "Start FE service", risk: "HIGH" },
      ],
      MD: [
        { id: "dp-1", label: "Verify mobile build", command: "/sdd-mobile --verify", description: "Check mobile build artifacts", risk: "MEDIUM" },
        { id: "dp-2", label: "Deploy mobile", command: "docker compose up mobile-builder", description: "Build mobile artifacts", risk: "HIGH" },
      ],
      VR: [
        { id: "dp-1", label: "Approve deployment", command: "/sdd-next --approve", description: "Human gate: approve production release", risk: "CRITICAL" },
        { id: "dp-2", label: "Request changes", command: "/sdd-next --review", description: "Reject and return to implementation", risk: "HIGH" },
      ],
    };
    return stageMap[(result as { stage?: string }).stage || ""] || [
      { id: "dp-1", label: "Continue", command: "/sdd-next --approve", description: "Proceed to next step", risk: "LOW" },
      { id: "dp-2", label: "Review", command: "/sdd-next --review", description: "Review current stage", risk: "LOW" },
    ];
  }

  private persist(point: DecisionPoint): void {
    try {
      const dir = path.join(process.cwd(), this.decisionsDir);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const file = path.join(dir, `${point.id}.json`);
      fs.writeFileSync(file, JSON.stringify(point, null, 2), "utf-8");

      const indexFile = path.join(dir, "INDEX.sdd");
      if (fs.existsSync(indexFile)) {
        const existing = fs.readFileSync(indexFile, "utf-8");
        fs.writeFileSync(indexFile, existing + `\n- ${point.id}: ${point.type} @ ${point.result}`, "utf-8");
      }
    } catch {
      // Persistence failure is non-blocking
    }
  }

  private emitOBS(point: DecisionPoint): void {
    const eventType = this.eventForType(point.type);
    emitObsEvent("DECISION", {
      event: eventType,
      decisionPointId: point.id,
      type: point.type,
      stage: point.stage,
      result: point.result,
      triggeredBy: point.triggeredBy,
    });
  }

  private eventForType(type: DecisionType): string {
    switch (type) {
      case DecisionType.CONTINUE: return "OBS17 decision_point_emitted";
      case DecisionType.GATE: return "OBS18 decision_point_gate";
      case DecisionType.REVIEW: return "OBS19 decision_point_review";
      case DecisionType.ERROR: return "OBS20 decision_point_error";
      case DecisionType.DECISION: return "OBS18 decision_point_gate";
      default: return "OBS17 decision_point_emitted";
    }
  }
}
