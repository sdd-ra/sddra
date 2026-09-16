import fs from "fs";
import path from "path";

export type DeploymentMode = "monolith" | "standalone";
export type CommunicationMode = "local" | "grpc" | "event";
export type DatabaseMode = "shared" | "owned";

export interface ModuleManifest {
  name: string;
  deploymentModes: Record<DeploymentMode, "supported" | "forbidden">;
  communication: Record<CommunicationMode, "supported" | "unsupported">;
  database: DatabaseMode;
  constraints: string[];
}

export type ReadinessBand = "READY" | "PREPARABLE" | "COUPLED" | "ROOT-BOUND";

export interface ModuleScore {
  name: string;
  score: number;
  band: ReadinessBand;
  coupling: number;
  cohesion: number;
  dbIsolation: number;
  apiIsolation: number;
  dependencyWeight: number;
}

export interface MigrationResult {
  modules: ModuleScore[];
  readyCount: number;
  preparableCount: number;
  coupledCount: number;
  rootBoundCount: number;
}

export class MigrationScorer {
  private sddRoot: string;
  private projectRoot: string;

  constructor(sddRoot = ".sdd", projectRoot = ".") {
    this.sddRoot = sddRoot;
    this.projectRoot = projectRoot;
  }

  loadManifest(manifestPath?: string): ModuleManifest | null {
    const resolved = manifestPath
      || path.resolve(this.projectRoot, this.sddRoot, "projects", "sddra", "architecture", "migration.sdd");
    if (!fs.existsSync(resolved)) {
      return null;
    }
    return this.parseManifest(fs.readFileSync(resolved, "utf-8"));
  }

  loadManifests(manifestPath?: string): ModuleManifest[] {
    const resolved = manifestPath
      || path.resolve(this.projectRoot, this.sddRoot, "projects", "sddra", "architecture", "migration.sdd");
    if (!fs.existsSync(resolved)) {
      return [];
    }
    return this.parseManifests(fs.readFileSync(resolved, "utf-8"));
  }

  score(
    moduleName: string,
    coupling: number,
    cohesion: number,
    dbIsolation: number,
    apiIsolation: number,
    dependencyWeight: number,
  ): ModuleScore {
    const score = Math.round(
      coupling * 0.3 + cohesion * 0.25 + dbIsolation * 0.2 + apiIsolation * 0.15 + dependencyWeight * 0.1,
    );
    const band = this.band(score);
    return {
      name: moduleName,
      score,
      band,
      coupling,
      cohesion,
      dbIsolation,
      apiIsolation,
      dependencyWeight,
    };
  }

  scoreAll(
    modules: Array<{ name: string; coupling: number; cohesion: number; dbIsolation: number; apiIsolation: number; dependencyWeight: number }>,
  ): MigrationResult {
    const scored = modules.map((m) => this.score(m.name, m.coupling, m.cohesion, m.dbIsolation, m.apiIsolation, m.dependencyWeight));
    return {
      modules: scored,
      readyCount: scored.filter((m) => m.band === "READY").length,
      preparableCount: scored.filter((m) => m.band === "PREPARABLE").length,
      coupledCount: scored.filter((m) => m.band === "COUPLED").length,
      rootBoundCount: scored.filter((m) => m.band === "ROOT-BOUND").length,
    };
  }

  scoreFromManifest(manifestPath?: string, graphDeps?: Record<string, string[]>): MigrationResult {
    const manifests = this.loadManifests(manifestPath);
    const modules = manifests.map((m) => {
      const deps = graphDeps ? graphDeps[m.name] || [] : [];
      const coupling = Math.min(100, deps.length * 10);
      const cohesion = this.computeCohesion(m);
      const dbIsolation = m.database === "owned" ? 100 : 0;
      const apiIsolation = this.computeApiIsolation(m);
      const dependencyWeight = Math.min(100, deps.length * 5);
      return { name: m.name, coupling, cohesion, dbIsolation, apiIsolation, dependencyWeight };
    });
    return this.scoreAll(modules);
  }

  private band(score: number): ReadinessBand {
    if (score >= 80) return "READY";
    if (score >= 60) return "PREPARABLE";
    if (score >= 40) return "COUPLED";
    return "ROOT-BOUND";
  }

  private computeCohesion(module: ModuleManifest): number {
    const totalCalls =
      (module.communication.local ? 1 : 0) +
      (module.communication.grpc === "supported" ? 1 : 0) +
      (module.communication.event === "supported" ? 1 : 0);
    return Math.round((totalCalls / 3) * 100);
  }

  private computeApiIsolation(module: ModuleManifest): number {
    if (module.communication.grpc === "supported") return 80;
    if (module.communication.event === "supported") return 70;
    return 30;
  }

  private parseManifest(content: string): ModuleManifest | null {
    const nameMatch = content.match(/MODULE\s+(\S+)/);
    if (!nameMatch) return null;
    const dbMatch = content.match(/database:\s*(\w+)/);
    return {
      name: nameMatch[1],
      deploymentModes: {
        monolith: this.parseMode(content, "deployment_modes", "monolith"),
        standalone: this.parseMode(content, "deployment_modes", "standalone"),
      },
      communication: {
        local: "supported",
        grpc: this.parseMode(content, "communication", "grpc"),
        event: this.parseMode(content, "communication", "event"),
      },
      database: (dbMatch ? dbMatch[1] as DatabaseMode : "shared") as DatabaseMode,
      constraints: [],
    };
  }

  private parseManifests(content: string): ModuleManifest[] {
    const blocks = content.split(/MODULE\s+/).filter(Boolean);
    return blocks.map((b) => this.parseManifest("MODULE " + b)).filter(Boolean) as ModuleManifest[];
  }

  private parseMode(content: string, section: string, key: string): "supported" | "forbidden" | "unsupported" {
    const re = new RegExp(`${key}:\\s*(\\w+)`, "i");
    const match = content.match(re);
    if (!match) return "unsupported";
    return match[1].toLowerCase() as "supported" | "forbidden" | "unsupported";
  }
}
