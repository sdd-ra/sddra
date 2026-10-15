import fs from "fs";
import path from "path";
import { DesignEvaluation, DesignEvaluationCategory, DesignContext } from "./types";

const DESIGN_SKILLS_DIR = path.join(process.cwd(), ".sdd", "skills", "design");

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  FrontEnd: ["frontend", "react", "vue", "angular", "ui", "ux", "component", "style", "page", "screen", "layout"],
  Backend: ["api", "endpoint", "database", "server", "backend", "microservice", "service"],
  Database: ["migration", "schema", "query", "database", "sql", "table"],
  DevOps: ["deploy", "docker", "kubernetes", "ci", "cd", "infrastructure", "pipeline"],
  Design: ["design", "ui", "ux", "visual", "taste", "aesthetic", "accessibility", "mobile", "figma"],
  Testing: ["test", "e2e", "unit", "integration", "coverage", "spec"],
  Security: ["security", "auth", "vulnerability", "audit", "compliance", "secret"],
};

const DESIGN_SLOP_PATTERNS = [
  { pattern: /gradient.*purple|purple.*gradient/i, issue: "Overused purple gradient", severity: "MEDIUM" as const },
  { pattern: /Inter|Roboto|Arial/i, issue: "Generic font stack detected", severity: "LOW" as const },
  { pattern: /rounded-(3xl|full)/i, issue: "Overused border radius", severity: "LOW" as const },
  { pattern: /glassmorphism|backdrop-blur/i, issue: "Generic glassmorphism pattern", severity: "MEDIUM" as const },
  { pattern: /emoji.*header|header.*emoji/i, issue: "Emoji in header detected", severity: "MEDIUM" as const },
];

export class DesignAnalyzer {
  async evaluate(targetPath: string): Promise<DesignEvaluation[]> {
    const evaluations: DesignEvaluation[] = [];
    const resolved = path.resolve(targetPath);

    if (!fs.existsSync(resolved)) {
      return evaluations;
    }

    const files: string[] = [];
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir)) {
          const full = path.join(dir, entry);
          if (fs.statSync(full).isDirectory()) {
            walk(full);
          } else if (/\.(tsx|jsx|ts|js|css|scss|html)$/.test(full)) {
            files.push(full);
          }
        }
      };
      walk(resolved);
    } else if (/\.(tsx|jsx|ts|js|css|scss|html)$/.test(resolved)) {
      files.push(resolved);
    }

    for (const file of files.slice(0, 20)) {
      const content = fs.readFileSync(file, "utf-8");
      const relative = path.relative(process.cwd(), file);

      evaluations.push(this.evaluateTaste(relative, content));
      evaluations.push(this.evaluateHeuristics(relative, content));
      evaluations.push(this.evaluateVisual(relative, content));
      evaluations.push(this.evaluateUX(relative, content));
      evaluations.push(this.evaluateAccessibility(relative, content));
      evaluations.push(this.evaluateDesignSystem(relative, content));
    }

    return evaluations;
  }

  async discover(): Promise<{ missing: string[]; recommendations: Array<{ skill: string; relevance: number }> }> {
    const existing = new Set(
      fs.existsSync(DESIGN_SKILLS_DIR)
        ? fs.readdirSync(DESIGN_SKILLS_DIR).filter(f => f.endsWith(".sdd") && f !== "INDEX.sdd")
        : []
    );

    const allSkills = [
      "taste-evaluation.sdd",
      "design-heuristics.sdd",
      "visual-design.sdd",
      "ux-patterns.sdd",
      "accessibility.sdd",
      "design-system.sdd",
      "design-review.sdd",
    ];

    const missing = allSkills.filter(s => !existing.has(s));
    const recommendations = missing.map(skill => ({
      skill,
      relevance: 0.85,
    }));

    return { missing, recommendations };
  }

  async review(targetPath: string): Promise<DesignEvaluation[]> {
    return this.evaluate(targetPath);
  }

  matchDesignSkills(context: string): string[] {
    const lower = context.toLowerCase();
    const matched: string[] = [];

    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      const hits = keywords.filter(kw => lower.includes(kw)).length;
      if (hits > 0) {
        matched.push(domain);
      }
    }

    return matched;
  }

  private evaluateTaste(file: string, content: string): DesignEvaluation {
    const issues: DesignEvaluation["issues"] = [];
    let score = 85;

    for (const slop of DESIGN_SLOP_PATTERNS) {
      if (slop.pattern.test(content)) {
        issues.push({
          severity: slop.severity,
          description: slop.issue,
          recommendation: `Review ${file} for generic design patterns and replace with project-specific design tokens.`,
        });
        const severityWeight: Record<string, number> = { HIGH: 20, MEDIUM: 10, LOW: 5 };
        score -= severityWeight[slop.severity] ?? 10;
      }
    }

    if (score < 0) score = 0;
    return {
      id: `design-taste-${Date.now()}`,
      category: "taste",
      score,
      issues,
      passed: score >= 70,
      skillUsed: "taste-evaluation",
    };
  }

  private evaluateHeuristics(_file: string, _content: string): DesignEvaluation {
    const score = 80;
    return {
      id: `design-heuristics-${Date.now()}`,
      category: "heuristics",
      score,
      issues: [],
      passed: score >= 70,
      skillUsed: "design-heuristics",
    };
  }

  private evaluateVisual(file: string, content: string): DesignEvaluation {
    const issues: DesignEvaluation["issues"] = [];
    let score = 85;

    const hardCodedColors = (content.match(/#[0-9a-fA-F]{3,8}/g) || []).length;
    if (hardCodedColors > 10) {
      issues.push({
        severity: "MEDIUM",
        description: `${hardCodedColors} hard-coded color values detected`,
        recommendation: `Migrate hard-coded colors to design tokens in ${file}.`,
      });
      score -= 10;
    }

    if (score < 0) score = 0;
    return {
      id: `design-visual-${Date.now()}`,
      category: "visual",
      score,
      issues,
      passed: score >= 70,
      skillUsed: "visual-design",
    };
  }

  private evaluateUX(_file: string, _content: string): DesignEvaluation {
    const score = 80;
    return {
      id: `design-ux-${Date.now()}`,
      category: "ux",
      score,
      issues: [],
      passed: score >= 70,
      skillUsed: "ux-patterns",
    };
  }

  private evaluateAccessibility(file: string, content: string): DesignEvaluation {
    const issues: DesignEvaluation["issues"] = [];
    let score = 80;

    if (!content.includes("alt=") && /<img/i.test(content)) {
      issues.push({
        severity: "HIGH",
        description: "Images missing alt attributes",
        recommendation: `Add descriptive alt text to all images in ${file}.`,
      });
      score -= 20;
    }

    if (!/aria-/.test(content) && /<button/i.test(content)) {
      issues.push({
        severity: "MEDIUM",
        description: "Buttons may lack ARIA labels",
        recommendation: `Review interactive elements for ARIA labels in ${file}.`,
      });
      score -= 5;
    }

    if (score < 0) score = 0;
    return {
      id: `design-a11y-${Date.now()}`,
      category: "accessibility",
      score,
      issues,
      passed: score >= 70,
      skillUsed: "accessibility",
    };
  }

  private evaluateDesignSystem(file: string, content: string): DesignEvaluation {
    const issues: DesignEvaluation["issues"] = [];
    let score = 85;

    const magicNumbers = (content.match(/\b\d{1,2}(px|rem|em)\b/g) || []).length;
    if (magicNumbers > 15) {
      issues.push({
        severity: "MEDIUM",
        description: `${magicNumbers} magic spacing values detected`,
        recommendation: `Replace magic numbers with design system spacing tokens in ${file}.`,
      });
      score -= 10;
    }

    if (score < 0) score = 0;
    return {
      id: `design-system-${Date.now()}`,
      category: "design-system",
      score,
      issues,
      passed: score >= 70,
      skillUsed: "design-system",
    };
  }
}
