import { PromptFinding, PromptInjectionDecision } from "../types";

interface PatternEntry {
  id: string;
  name: string;
  regex: RegExp;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  LLevel: number;
  response: "BLOCK" | "WARN" | "LOG";
}

interface WhitelistEntry {
  hash: string;
  expires: string;
  owner: string;
  reason: string;
}

export class PromptGuard {
  private patterns: PatternEntry[] = [];
  private whitelist: WhitelistEntry[] = [];

  constructor(patternsDir?: string) {
    this.loadPatterns();
    this.loadWhitelist();
  }

  loadPatterns(): void {
    this.patterns = [
      {
        id: "PI-001",
        name: "Instruction Override",
        regex: /(ignore\s+(?:previous|all|the|your)\s+(?:instructions|rules|orders)|discard\s+(?:all|your)\s+(?:instructions|rules)|forget\s+(?:everything|all)\s+(?:you|your)\s+(?:knowledge|instructions)|reset\s+(?:your|all)\s+(?:instructions|rules|context))/gi,
        severity: "CRITICAL",
        LLevel: 5,
        response: "BLOCK",
      },
      {
        id: "PI-002",
        name: "Role Reassignment",
        regex: /(act\s+as\s+(?:a\s+)?(?:admin|superuser|root|operator|manager)|pretend\s+to\s+be|you\s+are\s+playing\s+a\s+role|impersonate|ignore\s+your\s+(?:system|original|core)\s+identity)/gi,
        severity: "CRITICAL",
        LLevel: 5,
        response: "BLOCK",
      },
      {
        id: "PI-003",
        name: "Permission Escalation",
        regex: /(you\s+have\s+(?:full|complete)\s+access|bypass\s+(?:(?:all\s+)?(?:restrictions|limitations|safeguards|security))|remove\s+(?:(?:all\s+)?(?:restrictions|limitations|safeguards))|disable\s+(?:(?:all\s+)?(?:safety|security|guardrails))|you\s+are\s+unrestricted)/gi,
        severity: "HIGH",
        LLevel: 4,
        response: "BLOCK",
      },
      {
        id: "PI-004",
        name: "Output Forcing",
        regex: /(output\s+(?:only|just)\s+(?:JSON|XML|YAML|code|text)|repeat\s+(?:the\s+)?(?:prompt|message|instructions)|echo\s+(?:this|it|yourself)|give\s+me\s+(?:raw|bare|plain)\s+(?:output|data|text)|respond\s+with\s+(?:only|just)\s+(?:the|nothing\s+but))/gi,
        severity: "HIGH",
        LLevel: 4,
        response: "WARN",
      },
      {
        id: "PI-005",
        name: "Chain Injection",
        regex: /(run\s+\/sdd|execute\s+(?:the\s+)?command|use\s+(?:the\s+)?next\s+step|continue\s+with\s+(?:the\s+)?next|proceed\s+to\s+(?:the\s+)?next|now\s+do\s+(?:the\s+)?next|skip\s+(?:to\s+)?the\s+next)/gi,
        severity: "CRITICAL",
        LLevel: 5,
        response: "BLOCK",
      },
      {
        id: "PI-008",
        name: "Tool Permission Grant",
        regex: /(grant\s+(?:all\s+)?(?:permissions|access|tools)|enable\s+(?:all\s+)?(?:tools|features|capabilities)|remove\s+(?:your\s+)?(?:sandbox|restrictions|limitations)|i\s+grant\s+you\s+(?:full|complete)\s+(?:access|permission))/gi,
        severity: "HIGH",
        LLevel: 4,
        response: "BLOCK",
      },
      {
        id: "PI-007",
        name: "Semantic Context Hijacking",
        regex: /(change\s+(?:the\s+)?(?:rules|config|system|specification)|modify\s+(?:your\s+)?(?:instructions|behavior|persona)|update\s+(?:the\s+)?(?:system|configuration|settings)|you\s+must\s+(?:now|always)\s+(?:be|follow|adopt)|new\s+rules?\s+are)/gi,
        severity: "HIGH",
        LLevel: 4,
        response: "WARN",
      },
    ];
  }

  loadWhitelist(): void {
    this.whitelist = [];
  }

  guard(prompt: string): PromptInjectionDecision {
    if (!prompt || typeof prompt !== "string") {
      return {
        decision: "PASS",
        matchedPatterns: [],
        severity: "NONE",
        exitCode: 0,
        message: "No prompt to scan",
      };
    }

    const findings: PromptFinding[] = [];

    for (const pattern of this.patterns) {
      const regex = new RegExp(pattern.regex.source, "gi");
      regex.lastIndex = 0;
      if (regex.test(prompt)) {
        findings.push({
          patternId: pattern.id,
          patternName: pattern.name,
          severity: pattern.severity,
          LLevel: pattern.LLevel,
          response: pattern.response,
          matchedText: prompt.slice(0, 200),
        });
      }
    }

    if (findings.length === 0) {
      return {
        decision: "PASS",
        matchedPatterns: [],
        severity: "NONE",
        exitCode: 0,
        message: "No injection patterns matched",
      };
    }

    const criticalCount = findings.filter(f => f.severity === "CRITICAL").length;
    const highCount = findings.filter(f => f.severity === "HIGH").length;

    if (criticalCount > 0) {
      return {
        decision: "BLOCK",
        matchedPatterns: findings,
        severity: "CRITICAL",
        exitCode: 2,
        message: `Prompt injection blocked: ${findings.map(f => f.patternId).join(", ")}`,
      };
    }

    if (highCount >= 2) {
      return {
        decision: "BLOCK",
        matchedPatterns: findings,
        severity: "HIGH",
        exitCode: 2,
        message: `Prompt injection blocked: ${findings.map(f => f.patternId).join(", ")}`,
      };
    }

    if (highCount >= 1) {
      return {
        decision: "WARN",
        matchedPatterns: findings,
        severity: "HIGH",
        exitCode: 0,
        message: `Prompt injection warning: ${findings.map(f => f.patternId).join(", ")}`,
      };
    }

    return {
      decision: "LOG",
      matchedPatterns: findings,
      severity: "MEDIUM",
      exitCode: 0,
      message: `Prompt injection logged: ${findings.map(f => f.patternId).join(", ")}`,
    };
  }

  guardNFKC(prompt: string): PromptInjectionDecision {
    if (!prompt) {
      return {
        decision: "PASS",
        matchedPatterns: [],
        severity: "NONE",
        exitCode: 0,
        message: "No prompt to scan",
      };
    }
    try {
      const normalized = (prompt as unknown as string).normalize("NFKC");
      if (normalized !== prompt) {
        return this.guard(normalized);
      }
    } catch {
      // NFKC normalization may fail on some strings; fall through
    }
    return this.guard(prompt);
  }

  getPatterns(): PatternEntry[] {
    return [...this.patterns];
  }
}
