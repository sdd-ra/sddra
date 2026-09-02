import { ContextRouter } from "./context-router";
import { RelevanceEngine } from "./relevance-engine";
import { DependencyResolver } from "./dependency-resolver";
import { ContextBudgetEnforcer } from "./context-budget";
import { ContextPack, ContextReference, ContextLayer, ContextBudget } from "./types";

export class ContextCompiler {
  constructor(
    private sddRoot = ".sdd"
  ) {}

  async compile(input: {
    taskId?: string;
    intent?: string;
    affectedArea?: string;
    risk?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    dependencies?: string[];
    budgetOverride?: ContextBudget;
  }): Promise<ContextPack> {
    const taskId = input.taskId || "unknown";
    const intent = input.intent || "";
    const risk = input.risk || "MEDIUM";
    const affectedArea = input.affectedArea || "";
    const dependencies = input.dependencies || [];

    const routes = ContextRouter.route(intent, affectedArea);
    const allRefs = DependencyResolver.buildDependencyGraph(this.sddRoot);
    const allRefIds = Array.from(allRefs.keys());

    const scored = allRefIds
      .map((id) => ({
        id,
        score: RelevanceEngine.score(id, intent, routes, dependencies),
        layer: "L3" as ContextLayer,
        priority: "P3" as any,
      }))
      .filter((r) => r.score > 0.1)
      .sort((a, b) => b.score - a.score);

    const references: ContextReference[] = scored.map((r) => ({
      id: r.id,
      layer: r.layer,
      priority: r.priority,
      score: r.score,
      included: true,
      freshness: "FRESH",
    }));

    const included = DependencyResolver.resolve(
      references.filter((r) => r.included).map((r) => r.id),
      allRefIds
    );

    for (const ref of references) {
      if (!included.includes(ref.id)) {
        ref.included = false;
        ref.exclusionReason = "dependency_missing";
      }
    }

    const budget = input.budgetOverride || ContextBudgetEnforcer.resolveBudget(risk);
    const enforced = ContextBudgetEnforcer.enforce(references, budget);
    const budgetUsed = { refs: enforced.length, tokens: ContextBudgetEnforcer.estimateTokens(enforced) };

    const contradictions = this.checkContradictions(enforced);

    const manifest = {
      id: `C-${Date.now()}`,
      taskId,
      compiledAt: new Date().toISOString(),
      layers: budget.maxLayers,
      included: enforced,
      excluded: references.filter((r) => !r.included),
      budget,
      budgetUsed,
      confidence: budgetUsed.refs > budget.maxRefs ? "LOW" : budgetUsed.tokens > budget.maxTokens ? "MEDIUM" : "HIGH",
      freshness: "FRESH" as const,
      contradictions,
      version: "v1",
      invalidatedBy: [],
    };

    const refMap = new Map<string, string>();
    for (const ref of enforced) {
      refMap.set(ref.id, `compiled context for ${ref.id}`);
    }

    return { manifest: manifest as any, references: refMap };
  }

  private checkContradictions(references: ContextReference[]): string[] {
    const contradictions: string[] = [];
    const decisions = references.filter((r) => r.id.startsWith("decision."));
    if (decisions.length >= 2) {
      contradictions.push(`${decisions[0].id} vs ${decisions[1].id}: potential conflict`);
    }
    return contradictions;
  }
}
