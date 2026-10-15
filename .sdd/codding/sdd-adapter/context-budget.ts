import { ContextBudget, ContextReference, ContextLayer } from "./types";
import { DependencyResolver } from "./dependency-resolver";

export class ContextBudgetEnforcer {
  static resolveBudget(risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): ContextBudget {
    const budgets: Record<string, ContextBudget> = {
      LOW: { maxRefs: 20, maxTokens: 8000, maxLayers: ["L0", "L1", "L2", "L3", "L4"] },
      MEDIUM: { maxRefs: 40, maxTokens: 16000, maxLayers: ["L0", "L1", "L2", "L3", "L4", "L5", "L6"] },
      HIGH: { maxRefs: 80, maxTokens: 30000, maxLayers: ["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8"] },
      CRITICAL: { maxRefs: 120, maxTokens: 50000, maxLayers: ["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10"] },
    };
    return budgets[risk];
  }

  static estimateTokens(references: ContextReference[]): number {
    return references.length * 200;
  }

  static enforce(references: ContextReference[], budget: ContextBudget): ContextReference[] {
    const allowed = new Set<string>();
    const layerSet = new Set(budget.maxLayers);

    for (const ref of references) {
      if (ref.included && layerSet.has(ref.layer)) {
        allowed.add(ref.id);
      }
    }

    const selected = references.filter((r) => allowed.has(r.id));

    if (selected.length > budget.maxRefs) {
      const sorted = [...selected].sort((a, b) => b.score - a.score);
      const kept = sorted.slice(0, budget.maxRefs);
      const keptIds = new Set(kept.map((r) => r.id));
      const deps = DependencyResolver.resolve(Array.from(keptIds), references.map((r) => r.id));
      for (const dep of deps) {
        if (!keptIds.has(dep)) {
          const ref = references.find((r) => r.id === dep);
          if (ref && layerSet.has(ref.layer)) kept.push(ref);
        }
      }
      return kept;
    }

    return selected;
  }
}
