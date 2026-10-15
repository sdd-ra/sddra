export type MemoryScope = "module" | "task" | "subtask" | "global";
export type MemoryImportance = "critical" | "high" | "normal" | "low" | "temporary";

export interface MemoryObservation {
  id: string;
  content: string;
  trustLevel: "external-import" | "internal-verified" | "runtime-generated";
  provenance: string;
  timestamp: string;
  tags: string[];
  scope: MemoryScope;
  importance: MemoryImportance;
  criteria: string[];
  expiresAt?: string;
}

export interface MemoryBridgeConfig {
  enabled: boolean;
  sanitizationEnabled: boolean;
  tierRoutingEnabled: boolean;
  maxObservations: number;
  defaultTTL: string;
}

export interface CompactResult {
  before: number;
  after: number;
  removed: number;
  promoted: number;
  scope: MemoryScope;
}

export class MemoryBridge {
  private config: MemoryBridgeConfig;
  private observations: MemoryObservation[] = [];

  constructor(config: Partial<MemoryBridgeConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? false,
      sanitizationEnabled: config.sanitizationEnabled ?? true,
      tierRoutingEnabled: config.tierRoutingEnabled ?? false,
      maxObservations: config.maxObservations ?? 100,
      defaultTTL: config.defaultTTL ?? "task-lifetime",
    };
  }

  store(observation: Omit<MemoryObservation, "id" | "timestamp">): void {
    if (!this.config.enabled) return;

    const obs: MemoryObservation = {
      ...observation,
      id: `MEM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    };

    if (this.config.sanitizationEnabled) {
      this.sanitize(obs);
    }

    this.observations.push(obs);
    this.enforceLimits();
  }

  private enforceLimits(): void {
    if (this.observations.length <= this.config.maxObservations) return;
    this.observations.sort((a, b) => {
      const order = { critical: 0, high: 1, normal: 2, low: 3, temporary: 4 };
      return (order[a.importance] ?? 2) - (order[b.importance] ?? 2);
    });
    this.observations = this.observations.slice(0, this.config.maxObservations);
  }

  recall(query: string, limit: number = 5): MemoryObservation[] {
    if (!this.config.enabled) return [];
    return this.observations
      .filter(o => o.content.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
  }

  getStats(): { total: number; byTier: Record<string, number>; byScope: Record<string, number> } {
    const byTier: Record<string, number> = {};
    const byScope: Record<string, number> = {};
    for (const obs of this.observations) {
      byTier[obs.trustLevel] = (byTier[obs.trustLevel] || 0) + 1;
      byScope[obs.scope] = (byScope[obs.scope] || 0) + 1;
    }
    return { total: this.observations.length, byTier, byScope };
  }

  compact(scope: MemoryScope, criteria: string[]): CompactResult {
    const before = this.observations.length;
    const now = new Date().toISOString();

    const matched = this.observations.filter(o => {
      if (o.scope !== scope && o.scope !== "global") return false;
      if (criteria.length === 0) return true;
      return criteria.some(c => o.tags.includes(c) || o.criteria.includes(c));
    });

    const removed: MemoryObservation[] = [];
    const promoted: MemoryObservation[] = [];

    for (const obs of matched) {
      const expired = obs.expiresAt && obs.expiresAt < now;
      const lowImportance = obs.importance === "low" || obs.importance === "temporary";
      const criteriaMet = criteria.length > 0 && criteria.every(c => obs.criteria.includes(c));

      if (expired || lowImportance || criteriaMet) {
        if (obs.trustLevel === "internal-verified" && obs.importance === "high") {
          promoted.push(obs);
        } else {
          removed.push(obs);
        }
      }
    }

    const removeIds = new Set(removed.map(o => o.id));
    this.observations = this.observations.filter(o => !removeIds.has(o.id));

    const after = this.observations.length;
    return {
      before,
      after,
      removed: removed.length,
      promoted: promoted.length,
      scope,
    };
  }

  clearScope(scope: MemoryScope): void {
    this.observations = this.observations.filter(o => o.scope !== scope && o.scope !== "global");
  }

  private sanitize(observation: MemoryObservation): void {
    const secretPatterns = [
      /\b[A-Z0-9]{20,}\b/g,
      /\b(api[_-]?key|secret|password|token|passwd)\s*[:=]\s*['"][^'"]+['"]/gi,
    ];

    let content = observation.content;
    for (const pattern of secretPatterns) {
      content = content.replace(pattern, "[REDACTED]");
    }
    observation.content = content;
  }
}

export const memoryBridge = new MemoryBridge();
