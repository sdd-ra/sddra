import { DriftRecord, SyncPlan, SyncOperation, DriftClassification } from "./types";

export class SyncEngine {
  private plans: Map<string, SyncPlan> = new Map();

  proposeSync(drifts: DriftRecord[]): SyncPlan[] {
    const plans: SyncPlan[] = [];

    for (const drift of drifts) {
      if (drift.status === "FIXED" || drift.status === "VERIFIED") continue;
      if (drift.syncOp === "NO_CHANGE") continue;

      const plan: SyncPlan = {
        id: `S${100 + plans.length}`,
        driftId: drift.id,
        operation: drift.syncOp,
        targetFiles: this.determineTargetFiles(drift),
        rationale: this.generateRationale(drift),
        requiresApproval: this.requiresApproval(drift),
      };

      plans.push(plan);
      this.plans.set(plan.id, plan);
    }

    return plans;
  }

  validatePlan(plan: SyncPlan): boolean {
    if (!plan.id || !plan.driftId) return false;
    if (!plan.operation) return false;
    if (plan.operation === "NO_CHANGE" && plan.requiresApproval) return false;
    return true;
  }

  generateDecision(plan: SyncPlan): string {
    return `# @decision.D${plan.id.replace("S", "")}

**Type:** Sync Decision
**Status:** PROPOSED
**Operation:** ${plan.operation}
**Drift:** ${plan.driftId}
**Rationale:** ${plan.rationale}
**Target Files:** ${plan.targetFiles.join(", ")}
**Requires Approval:** ${plan.requiresApproval}

## Context
  Sync operation proposed to resolve drift.

## Evidence
  Referenced by drift detection.

## Decision
  APPROVE sync operation: ${plan.operation}
`;
  }

  generateTask(plan: SyncPlan): string {
    return `# @task.T${plan.id.replace("S", "")}

**Spec:** SyncOperation
**Purpose:** Execute sync operation ${plan.operation} for drift ${plan.driftId}

## Scope
  Propose sync: ${plan.operation}
  Rationale: ${plan.rationale}

## Tasks
  1. Apply ${plan.operation} changes to: ${plan.targetFiles.join(", ")}

## Done When
  1. Sync operation applied
  2. Drift re-verified as resolved
  3. Tests pass
`;
  }

  private determineTargetFiles(drift: DriftRecord): string[] {
    switch (drift.type) {
      case "structural":
        return [".sdd/architecture/", "src/"];
      case "behavioral":
        return ["src/", "tests/"];
      case "contract":
        return [".sdd/references/", "src/api/"];
      case "database":
        return ["migrations/", ".sdd/architecture/data.sdd"];
      case "security":
        return [".sdd/security/", "src/"];
      case "configuration":
        return ["config/", ".sdd/runtime/"];
      case "documentation":
        return [".sdd/docs/", "docs/"];
      case "terminology":
        return [".sdd/concepts/", "src/"];
      default:
        return [];
    }
  }

  private generateRationale(drift: DriftRecord): string {
    const classification = drift.classification;
    const type = drift.type;

    if (classification === "DECLARATION_WRONG") {
      return `.sdd declaration is outdated for ${type} drift. Code follows newer requirement. Update .sdd to match observed reality.`;
    }
    if (classification === "CODE_WRONG") {
      return `.sdd declaration is correct. Code violates declared ${type} policy. Fix code to match .sdd.`;
    }
    if (classification === "BOTH_OUTDATED") {
      return `Neither .sdd nor code reflects current ${type} requirement. Redesign needed for both.`;
    }
    return `Insufficient evidence to determine sync direction for ${type} drift. Requires human review.`;
  }

  private requiresApproval(drift: DriftRecord): boolean {
    if (drift.severity === "HIGH" || drift.severity === "MEDIUM" || drift.severity === "LOW") return true;
    if (drift.classification === "BOTH_OUTDATED") return true;
    if (drift.confidence === "LOW") return true;
    return false;
  }

  getPlan(id: string): SyncPlan | undefined {
    return this.plans.get(id);
  }

  listPlans(): SyncPlan[] {
    return Array.from(this.plans.values());
  }

  clearPlans(): void {
    this.plans.clear();
  }
}
