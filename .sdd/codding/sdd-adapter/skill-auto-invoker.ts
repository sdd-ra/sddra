import { DesignContext, AutoInvokeResult } from "./types";

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  FrontEnd: ["frontend", "react", "vue", "angular", "ui", "ux", "component", "style", "page", "screen", "layout"],
  Backend: ["api", "endpoint", "database", "server", "backend", "microservice", "service"],
  Database: ["migration", "schema", "query", "database", "sql", "table"],
  DevOps: ["deploy", "docker", "kubernetes", "ci", "cd", "infrastructure", "pipeline"],
  Design: ["design", "ui", "ux", "visual", "taste", "aesthetic", "accessibility", "figma"],
  Mobile: ["mobile", "ios", "android", "swift", "kotlin", "flutter", "react-native", "screen"],
  Testing: ["test", "e2e", "unit", "integration", "coverage", "spec"],
  Security: ["security", "auth", "vulnerability", "audit", "compliance", "secret"],
};

const DESIGN_SKILL_MAP: Record<string, string[]> = {
  FrontEnd: ["visual-design", "design-system", "accessibility"],
  Mobile: ["visual-design", "ux-patterns", "accessibility"],
  Design: ["taste-evaluation", "design-heuristics", "design-review"],
  Backend: [],
  Database: [],
  DevOps: [],
  Testing: [],
  Security: [],
};

export class SkillAutoInvoker {
  detectContext(taskDescription: string): DesignContext {
    const lower = taskDescription.toLowerCase();
    const domainScores: Record<string, number> = {};
    const matchedKeywords: string[] = [];

    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      let hits = 0;
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          hits++;
          matchedKeywords.push(kw);
        }
      }
      if (hits > 0) {
        domainScores[domain] = hits / keywords.length;
      }
    }

    const primaryDomain = Object.entries(domainScores).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";

    const suggestedSkills = DESIGN_SKILL_MAP[primaryDomain] || [];

    const confidence = Math.max(...Object.values(domainScores), 0);
    const autoInvoked = confidence >= 0.15 && suggestedSkills.length > 0;

    return {
      domain: primaryDomain,
      keywords: matchedKeywords,
      suggestedSkills,
      autoInvoked,
    };
  }

  shouldInvokeDesign(taskDescription: string): boolean {
    const context = this.detectContext(taskDescription);
    return context.autoInvoked && context.suggestedSkills.length > 0;
  }

  getSuggestedSkills(context: DesignContext): string[] {
    return context.suggestedSkills;
  }

  async invoke(skillId: string, context: DesignContext): Promise<AutoInvokeResult> {
    const skills = context.suggestedSkills.includes(skillId) ? [skillId] : [];
    return {
      invoked: true,
      skills,
      confidence: context.keywords.length > 0 ? 0.85 : 0.5,
      context: `Auto-invoked ${skillId} for ${context.domain} task: ${context.keywords.join(", ")}`,
    };
  }
}
