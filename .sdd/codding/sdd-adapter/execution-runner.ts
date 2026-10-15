import { CommandRunner } from "./commands";
import { DecisionEmitter } from "./decision-emitter";
import { DecisionPoint } from "./types";

export class ExecutionRunner {
  private runner: CommandRunner;
  private emitter: DecisionEmitter;

  constructor(runner?: CommandRunner, emitter?: DecisionEmitter) {
    this.runner = runner || new CommandRunner();
    this.emitter = emitter || new DecisionEmitter();
  }

  async executeStage(stage: string, command: string, args: string[] = []): Promise<DecisionPoint> {
    const result = await this.runner.run(command, args);

    const nextSteps = this.stepsForStage(stage, result);

    const point = this.emitter.emit(result, nextSteps);

    return point;
  }

  async executeAndAdvance(
    stages: Array<{ stage: string; command: string; args?: string[] }>
  ): Promise<DecisionPoint[]> {
    const points: DecisionPoint[] = [];
    for (const { stage, command, args = [] } of stages) {
      const point = await this.executeStage(stage, command, args);
      points.push(point);

      if (point.type === "ERROR" || point.type === "GATE") {
        break;
      }
    }
    return points;
  }

  approve(pointId: string): DecisionPoint {
    return this.emitter.emit(
      { command: "/sdd-next --approve", decision: "CONTINUE", exitCode: 0 },
      [{ id: "approve", label: "Approved", command: "/sdd-next", description: "Approved decision", risk: "LOW" }]
    );
  }

  review(pointId: string): DecisionPoint {
    return this.emitter.emit(
      { command: "/sdd-next --review", decision: "REVIEW", exitCode: 0 },
      [{ id: "review", label: "Review", command: "/sdd-next --review", description: "Enter review mode", risk: "LOW" }]
    );
  }

  private stepsForStage(stage: string, result: { decision: string; exitCode: number }): Array<{
    id: string;
    label: string;
    command: string;
    description: string;
    risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }> {
    if (result.decision === "BLOCK" || result.exitCode === 2) {
      return [
        { id: "s1", label: "Trace failure", command: "/sdd-trace --reverse", description: "Find failure source", risk: "HIGH" },
        { id: "s2", label: "Create fix task", command: `/sdd "fix blocking issue"`, description: "Open fix task", risk: "HIGH" },
      ];
    }
    if (result.decision === "WARN") {
      return [
        { id: "s1", label: "Review warnings", command: "/sdd-drift --severity WARN", description: "Detail review", risk: "MEDIUM" },
        { id: "s2", label: "Acknowledge", command: "/sdd-next --approve", description: "Proceed with warnings", risk: "LOW" },
      ];
    }
    const stageSteps: Record<string, Array<{ id: string; label: string; command: string; description: string; risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }>> = {
      BE: [
        { id: "s1", label: "BE tests", command: "/sdd-scan --file src/", description: "Verify BE", risk: "MEDIUM" },
        { id: "s2", label: "Deploy BE", command: "docker compose up be-builder", description: "Start BE", risk: "HIGH" },
      ],
      FE: [
        { id: "s1", label: "FE tests", command: "/sdd-scan --directory public/", description: "Verify FE", risk: "MEDIUM" },
        { id: "s2", label: "Deploy FE", command: "docker compose up fe-builder", description: "Start FE", risk: "HIGH" },
      ],
      MD: [
        { id: "s1", label: "Mobile verify", command: "/sdd-mobile --verify", description: "Check mobile", risk: "MEDIUM" },
        { id: "s2", label: "Deploy mobile", command: "docker compose up mobile-builder", description: "Build mobile", risk: "HIGH" },
      ],
      VR: [
        { id: "s1", label: "Approve release", command: "/sdd-next --approve", description: "Human gate", risk: "CRITICAL" },
        { id: "s2", label: "Request changes", command: "/sdd-next --review", description: "Reject", risk: "HIGH" },
      ],
    };
    return stageSteps[stage] || [
      { id: "s1", label: "Next", command: "/sdd-next --approve", description: "Advance", risk: "LOW" },
      { id: "s2", label: "Review", command: "/sdd-next --review", description: "Review", risk: "LOW" },
    ];
  }
}
