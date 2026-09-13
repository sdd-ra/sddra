import fs from "fs";
import https from "https";
import path from "path";
import { SkillValidator, ValidationResult, SkillCandidate } from "./skill-validator";

export interface ImportOptions {
  sddRoot?: string;
  projectRoot?: string;
  importedDate?: string;
}

export interface ImportResult {
  skill: string;
  source: string;
  destination: string;
  validation: ValidationResult;
  imported: boolean;
  wrapperWritten: boolean;
  message: string;
}

const DEFAULT_DOMAIN = "meta";

/**
 * Skill Importer — Phase 146 §3.3.
 * Fetches external skills (raw GitHub SKILL.md), validates them via
 * SkillValidator, places them under .sdd/skills/{domain}/imported/{group}/,
 * and wraps them with a provenance INDEX.sdd per CLAUDE.md import rules
 * (Source / Origin / Imported / Format / License).
 */
export class SkillImporter {
  private sddRoot: string;
  private projectRoot: string;
  private validator: SkillValidator;
  private importedDate: string;

  constructor(options: ImportOptions = {}) {
    this.sddRoot = options.sddRoot || ".sdd";
    this.projectRoot = options.projectRoot || process.cwd();
    this.validator = new SkillValidator();
    this.importedDate = options.importedDate || new Date().toISOString().slice(0, 10);
  }

  /**
   * Import a single skill: fetch SKILL.md from a GitHub repo,
   * validate, write skill file + provenance wrapper.
   */
  async importSkill(params: {
    name: string;
    repoUrl: string;        // e.g. https://github.com/owner/repo
    skillPath: string;      // e.g. skills/{name}/SKILL.md
    domain: string;         // e.g. meta, design, writing
    group: string;          // subdirectory under imported/
    license: string;        // e.g. MIT
    hasCode?: boolean;
    runtime?: string;
    force?: boolean;        // skip BLOCK decision (never skips secrets gate)
  }): Promise<ImportResult> {
    const rawUrl = this.toRawUrl(params.repoUrl, params.skillPath);
    const destinationDir = path.join(
      this.projectRoot, this.sddRoot, "skills", params.domain, "imported", params.group
    );
    const skillFile = path.join(destinationDir, `${params.name}.md`);
    const wrapperFile = path.join(destinationDir, "INDEX.sdd");

    const content = await this.fetchRaw(rawUrl);
    const candidate: SkillCandidate = {
      name: params.name,
      sourceUrl: params.repoUrl,
      license: params.license,
      content,
      hasCode: params.hasCode || false,
      runtime: params.runtime,
    };

    const validation = this.validator.validate(candidate);

    if (validation.decision === "BLOCK" && !params.force) {
      return {
        skill: params.name,
        source: params.repoUrl,
        destination: skillFile,
        validation,
        imported: false,
        wrapperWritten: false,
        message: `Import blocked (${validation.findings.filter(f => f.severity === "BLOCK").length} blocker(s)): ${validation.findings.filter(f => f.severity === "BLOCK").map(f => f.message).join("; ")}`,
      };
    }

    fs.mkdirSync(destinationDir, { recursive: true });
    fs.writeFileSync(skillFile, content, "utf-8");

    const wrapper = this.buildWrapper(params, destinationDir);
    const wrapperExisted = fs.existsSync(wrapperFile);
    if (wrapperExisted) {
      this.appendSkillToWrapper(wrapperFile, params);
    } else {
      fs.writeFileSync(wrapperFile, wrapper, "utf-8");
    }

    return {
      skill: params.name,
      source: params.repoUrl,
      destination: skillFile,
      validation,
      imported: true,
      wrapperWritten: true,
      message: `${params.name} imported to ${path.relative(this.projectRoot, skillFile)} (score ${validation.score}, decision ${validation.decision === "BLOCK" ? "BLOCK-forced" : validation.decision})`,
    };
  }

  /**
   * Register a local (already-fetched) skill file — used when content
   * was staged in tmp/ and validated there.
   */
  registerLocalSkill(params: {
    name: string;
    repoUrl: string;
    content: string;
    domain: string;
    group: string;
    license: string;
    hasCode?: boolean;
    runtime?: string;
  }): ImportResult {
    const destinationDir = path.join(
      this.projectRoot, this.sddRoot, "skills", params.domain, "imported", params.group
    );
    const skillFile = path.join(destinationDir, `${params.name}.md`);
    const candidate: SkillCandidate = {
      name: params.name,
      sourceUrl: params.repoUrl,
      license: params.license,
      content: params.content,
      hasCode: params.hasCode || false,
      runtime: params.runtime,
    };

    const validation = this.validator.validate(candidate);
    if (validation.decision === "BLOCK") {
      return {
        skill: params.name,
        source: params.repoUrl,
        destination: skillFile,
        validation,
        imported: false,
        wrapperWritten: false,
        message: `Registration blocked: ${validation.findings.filter(f => f.severity === "BLOCK").map(f => f.message).join("; ")}`,
      };
    }

    fs.mkdirSync(destinationDir, { recursive: true });
    fs.writeFileSync(skillFile, params.content, "utf-8");

    const wrapperFile = path.join(destinationDir, "INDEX.sdd");
    if (fs.existsSync(wrapperFile)) {
      this.appendSkillToWrapper(wrapperFile, params);
    } else {
      fs.writeFileSync(wrapperFile, this.buildWrapper(params, destinationDir), "utf-8");
    }

    return {
      skill: params.name,
      source: params.repoUrl,
      destination: skillFile,
      validation,
      imported: true,
      wrapperWritten: true,
      message: `${params.name} registered (score ${validation.score}, ${validation.decision})`,
    };
  }

  private buildWrapper(params: {
    name: string;
    repoUrl: string;
    domain: string;
    group: string;
    license: string;
    hasCode?: boolean;
    runtime?: string;
  }, _destinationDir: string): string {
    const title = params.name.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
    const runtime = params.hasCode
      ? `${params.runtime || "unspecified"} — Docker-gated ([R59]-[R66])`
      : "none (docs-only)";
    return [
      `# ${title} (imported)`,
      "",
      "Purpose:",
      `  ${params.name} skill imported from external repository.`,
      "",
      "Owns: ./",
      "",
      `Source: ${params.repoUrl}`,
      `Origin: fetched from ${params.repoUrl} (${params.name}/SKILL.md)`,
      `Imported: ${this.importedDate}`,
      "Format: anthropic-skill (SKILL.md, adapted via INDEX.sdd wrapper)",
      `License: ${params.license}`,
      `Runtime: ${runtime}`,
      "",
      "ReadOrder:",
      "   1  @INDEX.sdd",
      `   2  @${params.name}.md`,
      "",
      "Skills:",
      `  ${params.name}:`,
      `    one_line: ${params.name} (see SKILL.md)`,
      `    source: ${params.repoUrl}`,
      "",
      "Rules:",
      `  [${params.name.toUpperCase().replace(/-/g, "").slice(0, 4)}1] External origin — apply import rules from CLAUDE.md.`,
      "  [WRAP2] Original SKILL.md content preserved verbatim.",
      "",
      "Entry:",
      "  Read:",
      "    INDEX.sdd",
      "",
      "Navigation:",
      `  ${title.replace(/\s/g, "")}: @INDEX.sdd`,
      `  Skill: @${params.name}.md`,
      "  ImportedRegistry: @../INDEX.sdd",
      "",
      "State: +",
      "",
    ].join("\n");
  }

  private appendSkillToWrapper(wrapperFile: string, params: {
    name: string;
    repoUrl: string;
    license: string;
  }): void {
    let content = fs.readFileSync(wrapperFile, "utf-8");
    const entry = [
      "",
      `  ${params.name}:`,
      `    one_line: ${params.name} (see SKILL.md)`,
      `    source: ${params.repoUrl}`,
      `    license: ${params.license}`,
      `    imported: ${this.importedDate}`,
    ].join("\n");
    const marker = "Rules:";
    if (content.includes(marker)) {
      content = content.replace(marker, `${entry}\n\n${marker}`);
    } else {
      content += `\n${entry}\n`;
    }
    fs.writeFileSync(wrapperFile, content, "utf-8");
  }

  private toRawUrl(repoUrl: string, skillPath: string): string {
    const repoMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/);
    if (!repoMatch) {
      throw new Error(`Not a GitHub repository URL: ${repoUrl}`);
    }
    const [, owner, repo] = repoMatch;
    return `https://raw.githubusercontent.com/${owner}/${repo}/main/${skillPath.replace(/^\/+/, "")}`;
  }

  private fetchRaw(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = https.get(url, { headers: { "User-Agent": "sddra-skill-importer" } }, (response) => {
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          this.fetchRaw(response.headers.location).then(resolve, reject);
          response.resume();
          return;
        }
        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`Fetch failed: HTTP ${response.statusCode} for ${url}`));
          return;
        }
        let data = "";
        response.setEncoding("utf-8");
        response.on("data", (chunk) => { data += chunk; });
        response.on("end", () => resolve(data));
        response.on("error", reject);
      });
      request.on("error", reject);
    });
  }
}
