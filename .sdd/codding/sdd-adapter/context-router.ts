export class ContextRouter {
  static route(intent: string, affectedArea?: string): string[] {
    const routes: string[] = [];
    const lower = intent.toLowerCase();

    if (/\b(refund|payment|order|customer|backend|api|service|domain)\b/.test(lower)) {
      routes.push("BACKEND", "DOMAIN");
    }
    if (/\b(database|schema|migration|sql|query|postgres|mysql)\b/.test(lower)) {
      routes.push("DATABASE");
    }
    if (/\b(api|endpoint|rest|graphql|contract|http|route)\b/.test(lower)) {
      routes.push("API");
    }
    if (/\b(test|qa|coverage|spec|assert|verify)\b/.test(lower)) {
      routes.push("QA");
    }
    if (/\b(security|auth|permission|secret|encrypt|policy)\b/.test(lower)) {
      routes.push("SECURITY");
    }
    if (/\b(deploy|docker|k8s|kubernetes|ci|cd|infra|devops)\b/.test(lower)) {
      routes.push("DEVOPS");
    }
    if (/\b(frontend|ui|react|vue|angular|page|component)\b/.test(lower)) {
      routes.push("FRONTEND");
    }

    if (routes.length === 0) {
      routes.push("BACKEND", "DOMAIN");
    }

    return [...new Set(routes)];
  }

  static getDomainRoutes(component: string): string[] {
    const map: Record<string, string[]> = {
      BACKEND: ["BACKEND", "DOMAIN"],
      DATABASE: ["DATABASE", "DOMAIN"],
      API: ["API", "BACKEND", "DOMAIN"],
      QA: ["QA", "BACKEND"],
      SECURITY: ["SECURITY", "GOVERNANCE"],
      DEVOPS: ["DEVOPS", "INFRASTRUCTURE"],
      FRONTEND: ["FRONTEND", "PRESENTATION"],
    };
    return map[component] || [component];
  }

  static isExcluded(referenceId: string, routes: string[]): boolean {
    const lower = referenceId.toLowerCase();
    if (/\bfrontend\b/.test(lower) && !routes.includes("FRONTEND")) return true;
    if (/\bdevops\b/.test(lower) && !routes.includes("DEVOPS")) return true;
    if (/\bsecurity\b/.test(lower) && !routes.includes("SECURITY")) return true;
    if (/\bqa\b|\btest\b/.test(lower) && !routes.includes("QA")) return true;
    if (/\bdatabase\b|\bmigration\b/.test(lower) && !routes.includes("DATABASE")) return true;
    return false;
  }
}
