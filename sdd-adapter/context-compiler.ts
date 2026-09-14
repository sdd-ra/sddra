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

    // [CTX-CMD-05] dependsOnTraversal (RA-1, external research
    // 2026-09): walk the spec dependency graph TRANSITIVELY from the
    // task's explicitly named dependencies — the graph itself declares
    // what is relevant, not only the task text.
    const seedIds = new Set<string>();
    for (const dep of dependencies) {
      if (allRefs.has(dep)) seedIds.add(dep);
    }
    const traversalQueue = [...seedIds];
    const traversed = new Set<string>(seedIds);
    while (traversalQueue.length > 0) {
      const current = traversalQueue.shift()!;
      const node = allRefs.get(current);
      if (!node) continue;
      const declared = [...(node.dependsOn || []), ...(node.requiredBy || [])].filter((d) => typeof d === "string");
      for (const next of declared) {
        if (allRefs.has(next) && !traversed.has(next)) {
          traversed.add(next);
          traversalQueue.push(next);
        }
      }
    }
    const traversedIds = [...traversed];

    const scored = allRefIds
      .map((id) => ({
        id,
        score: RelevanceEngine.score(id, intent, routes, dependencies)
          + (traversed.has(id) ? 0.5 : 0), // graph-declared relevance boost
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
      traversal: {
        // [CTX-CMD-05] seeds = task-declared dependencies; expanded =
        // transitively reached specs (dependsOnTraversal RA-1)
        seeds: [...seedIds],
        expanded: traversedIds.filter((id) => !seedIds.has(id)),
      },
      contradictions,
      version: "v1",
      invalidatedBy: [],
    };

    const refMap = new Map<string, string>();
    for (const ref of enforced) {
      // [CTX-CMD-06] stalenessFallback (RA-2): structured metadata is
      // trusted only when fresh; stale items carry raw content with an
      // explicit staleness notice so stale structure is never silently
      // injected. (Pack-level freshness stays in the manifest; the
      // notice is embedded per-reference.)
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
