export class RelevanceEngine {
  static keywordMatch(intent: string, reference: { keywords?: string; description?: string }): number {
    const words = intent.toLowerCase().split(/\s+/);
    const text = ((reference.keywords || "") + " " + (reference.description || "")).toLowerCase();
    let matches = 0;
    for (const word of words) {
      if (text.includes(word)) matches++;
    }
    return words.length > 0 ? Math.min(1, matches / words.length) : 0;
  }

  static domainBoost(referenceDomain: string, routes: string[]): number {
    const lower = referenceDomain.toLowerCase();
    for (const route of routes) {
      if (lower.includes(route.toLowerCase())) return 1.5;
    }
    return 1.0;
  }

  static score(
    referenceId: string,
    intent: string,
    routes: string[],
    dependencies: string[]
  ): number {
    const parts = referenceId.split(".");
    const domain = parts[parts.length - 2] || parts[0];
    const ref: { keywords?: string; description?: string } = { keywords: referenceId };
    const base = this.keywordMatch(intent, ref);
    const boost = this.domainBoost(domain, routes);
    let depBoost = 0;
    for (const dep of dependencies) {
      if (referenceId.includes(dep)) depBoost += 0.1;
    }
    return Math.min(1, base * boost + depBoost);
  }

  static rank(
    references: string[],
    intent: string,
    routes: string[],
    dependencies: string[]
  ): Array<{ id: string; score: number }> {
    return references
      .map((id) => ({ id, score: this.score(id, intent, routes, dependencies) }))
      .sort((a, b) => b.score - a.score);
  }
}
