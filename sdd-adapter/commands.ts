import fs from "fs";
import path from "path";
import { HookBridge } from "./hook-bridge";
import { ProvenanceClient } from "./provenance-client";
import { DriftDetector } from "./drift-detector";
import { SyncEngine } from "./sync-engine";
import { TraceEngine } from "./trace-engine";
import { ContextCompiler } from "./context-compiler";
import { ContextManifestStore } from "./context-manifest";
import { DesignAnalyzer } from "./design-analyzer";
import { SkillAutoInvoker } from "./skill-auto-invoker";
import { SkillValidator } from "./skill-validator";
import { SkillImporter } from "./skill-importer";
import { DriftRecord, SyncPlan, TraceChain, BudgetRisk, DesignEvaluation, AutoInvokeResult } from "./types";

export interface CommandResult {
  command: string;
  decision: string;
  exitCode: number;
  output: string;
  findings?: Array<Record<string, unknown>>;
  /** TypedOutcomeCodes (Phase 149 r3) — machine-readable outcome before escalation. */
  outcome?:
    | "SUCCESS"
    | "PARTIAL"
    | "BLOCKED"
    | "NEEDS_CLARIFICATION"
    | "POLICY_VIOLATION"
    | "TOOL_ERROR"
    | "UNSAFE";
  /** Structural interrupt payload for irreversible actions (Phase 131 L4). */
  interrupt?: {
    proposedAction: string;
    riskScore: number;
    reasoning: string;
  };
}

export class CommandRunner {
  private sddRoot: string;
  private projectRoot: string;

  constructor(sddRoot = ".sdd", projectRoot = ".") {
    this.sddRoot = sddRoot;
    this.projectRoot = projectRoot;
  }

  async run(commandName: string, args: string[] = []): Promise<CommandResult> {
    const normalized = commandName.startsWith("/") ? commandName : `/${commandName}`;

    switch (normalized) {
      case "/sdd-skills":
        return this.runSkillsCommand(args);
      case "/sdd-scan":
        return this.runScanCommand(args);
      case "/sdd-dependencies":
        return this.runDependenciesCommand(args);
      case "/sdd-assumptions":
        return this.runAssumptionsCommand(args);
      case "/sdd-intents":
        return this.runIntentsCommand(args);
     case "/sdd-purge":
        return this.runPurgeCommand(args);
      case "/sdd-drift":
        return this.runDriftCommand(args);
      case "/sdd-sync":
        return this.runSyncCommand(args);
      case "/sdd-trace":
        return this.runTraceCommand(args);
      case "/sdd-context":
        return this.runContextCommand(args);
      case "/sdd-design":
        return this.runDesignCommand(args);
      case "/sdd-marketplace":
        return this.runMarketplaceCommand(args);
      default:
        return {
          command: normalized,
          decision: "PASS",
          exitCode: 0,
          output: `Command ${normalized} is not implemented in runtime.`,
        };
    }
  }

  private runSkillsCommand(_args: string[]): CommandResult {
    const skillsRoot = path.join(this.projectRoot, this.sddRoot, "skills");
    if (!fs.existsSync(skillsRoot)) {
      return {
        command: "/sdd-skills",
        decision: "PASS",
        exitCode: 0,
        output: "Skills directory not found.",
      };
    }

    const categories = fs.readdirSync(skillsRoot).filter(f => {
      const full = path.join(skillsRoot, f);
      return fs.statSync(full).isDirectory();
    });

    const lines: string[] = ["SKILL CATALOG", ""];
    let totalSkills = 0;

    for (const category of categories) {
      const categoryPath = path.join(skillsRoot, category);
      const items = fs.readdirSync(categoryPath).filter(f => {
        const full = path.join(categoryPath, f);
        return fs.statSync(full).isDirectory() || f.endsWith(".sdd");
      });

      lines.push(`[${category}]`);
      if (items.length === 0) {
        lines.push("  (no skills registered)");
      } else {
        for (const item of items) {
          const fullPath = path.join(categoryPath, item);
          const isDir = fs.statSync(fullPath).isDirectory();
          if (isDir) {
            const subItems = fs.readdirSync(fullPath).filter(f => f.endsWith(".sdd"));
            lines.push(`  ${item}/  (${subItems.length} skill files)`);
            totalSkills += subItems.length;
          } else if (item.endsWith(".sdd")) {
            lines.push(`  ${item}`);
            totalSkills++;
          }
        }
      }
      lines.push("");
    }

    lines.unshift(`Total Skills:       ${totalSkills}`);
    lines.splice(1, 0, `Categories:         ${categories.length}`);

    return {
      command: "/sdd-skills",
      decision: "PASS",
      exitCode: 0,
      output: lines.join("\n"),
    };
  }

  private async runScanCommand(args: string[]): Promise<CommandResult> {
    const bridge = new HookBridge();
    const targetPath = args[args.findIndex(a => a === "--file" || a === "--directory") + 1];
    const severityFilter = args.find(a => a.startsWith("--severity"))?.split("=")[1];
    const provenanceMode = args.find(a => a.startsWith("--provenance")) ? "inspect" :
                           args.find(a => a.startsWith("--purge")) ? "clean" : "none";

    if (!targetPath) {
      return {
        command: "/sdd-scan",
        decision: "PASS",
        exitCode: 0,
        output: "Usage: /sdd-scan --file <path> or /sdd-scan --directory <path>",
      };
    }

    const filesToScan: string[] = [];
    const resolved = path.resolve(this.projectRoot, targetPath);

    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir)) {
          const full = path.join(dir, entry);
          if (fs.statSync(full).isDirectory()) {
            walk(full);
          } else {
            filesToScan.push(full);
          }
        }
      };
      walk(resolved);
    } else if (fs.existsSync(resolved)) {
      filesToScan.push(resolved);
    }

    let totalCritical = 0;
    let totalHigh = 0;
    let totalMedium = 0;
    let totalLow = 0;
    const allFindings: Array<Record<string, unknown>> = [];

    for (const file of filesToScan) {
      const content = fs.readFileSync(file, "utf-8");
      const result = await bridge.processHook({
        session_id: `scan-${Date.now()}`,
        tool_name: "Read",
        tool_input: { file_path: file, content },
        tool_use_id: `tool-scan-${filesToScan.indexOf(file)}`,
      });

      for (const finding of result.findings) {
        if (severityFilter && finding.severity !== severityFilter) continue;
        allFindings.push({
          patternId: finding.patternId,
          severity: finding.severity,
          line: finding.lineNumber,
          file,
          message: finding.description,
        });
        if (finding.severity === "CRITICAL") totalCritical++;
        else if (finding.severity === "HIGH") totalHigh++;
        else if (finding.severity === "MEDIUM") totalMedium++;
        else if (finding.severity === "LOW") totalLow++;
      }

      if (provenanceMode !== "none") {
        const provenance = await this.runProvenanceOnFile(file, content, provenanceMode);
        for (const finding of provenance) {
          allFindings.push(finding);
          totalMedium++;
        }
      }
    }

    const decision = totalCritical > 0 || totalHigh > 0 ? "BLOCK" : "PASS";
    const exitCode = totalCritical > 0 || totalHigh > 0 ? 2 : 0;

    const outputLines = [
      "SECURITY SCAN",
      "",
      `Files Scanned:    ${filesToScan.length}`,
      `Findings:         ${allFindings.length}`,
      `  CRITICAL:       ${totalCritical}`,
      `  HIGH:           ${totalHigh}`,
      `  MEDIUM:         ${totalMedium}`,
      `  LOW:            ${totalLow}`,
      `Decision:         ${decision}`,
      "",
    ];

    if (allFindings.length > 0) {
      outputLines.push("Findings Detail:");
      for (const f of allFindings.slice(0, 50)) {
        outputLines.push(`  [${f.severity}] ${f.patternId} | ${f.file}:${f.line}`);
        if (typeof f.message === "string" && f.message) {
          outputLines.push(`    ${f.message}`);
        }
      }
    }

    return {
      command: "/sdd-scan",
      decision,
      exitCode,
      output: outputLines.join("\n"),
      findings: allFindings,
    };
  }

  private async runProvenanceOnFile(
    file: string,
    content: string,
    mode: "inspect" | "clean",
  ): Promise<Array<Record<string, unknown>>> {
    const findings: Array<Record<string, unknown>> = [];
    const serviceUrl = process.env.WATERMARKS_SERVICE_URL || "http://127.0.0.1:8765";
    const apiKey = process.env.WATERMARKS_SERVER_API_KEY;
    const client = new ProvenanceClient({ serviceUrl, apiKey, timeoutMs: 5000 });

    const fileName = file.split(/[\\/]/).pop() || file;
    const report = await (mode === "clean"
      ? client.clean(fileName, content)
      : client.inspect(fileName, content, false));

    if (!report.available || !report.suspicious) return findings;

    for (const finding of report.report) {
      findings.push({
        patternId: `PROV:${finding.kind}`,
        severity: "MEDIUM",
        line: 1,
        file,
        message: `[${finding.layer || "provenance"}] ${finding.report || finding.kind}`,
      });
    }

    return findings;
  }

  private runDependenciesCommand(_args: string[]): CommandResult {
    const graphPath = path.join(this.projectRoot, this.sddRoot, "dependencies", "graph.sdd");
    if (!fs.existsSync(graphPath)) {
      return {
        command: "/sdd-dependencies",
        decision: "PASS",
        exitCode: 0,
        output: "Dependency graph not found.",
      };
    }

    const content = fs.readFileSync(graphPath, "utf-8");
    const lines = content.split(/\r?\n/);

    const nodes: string[] = [];
    const edges: Array<{ from: string; to: string }> = [];
    let edgeSection = false;

    for (const raw of lines) {
      const trimmed = raw.trim();
      if (trimmed.startsWith("Edges:")) {
        edgeSection = true;
        continue;
      }
      if (trimmed.startsWith("Properties:") || trimmed.startsWith("Navigation:")) {
        edgeSection = false;
      }
      if (edgeSection && trimmed.includes("->")) {
        const parts = trimmed.split("->").map(s => s.trim());
        for (let i = 0; i < parts.length - 1; i++) {
          const from = parts[i].trim();
          const tos = parts[i + 1].split(",").map(s => s.trim());
          for (const to of tos) {
            if (from && to && !nodes.includes(from)) nodes.push(from);
            if (to && !nodes.includes(to)) nodes.push(to);
            if (from && to) edges.push({ from, to });
          }
        }
      }
    }

    const outputLines = [
      "DEPENDENCY GRAPH",
      "",
      `Total Tasks:         ${nodes.length}`,
      `Total Dependencies:  ${edges.length}`,
      `Cycles Detected:     ${this.detectCycles(nodes, edges)}`,
      "",
      "Graph:",
    ];

    for (const edge of edges) {
      outputLines.push(`  ${edge.from} -> ${edge.to}`);
    }

    return {
      command: "/sdd-dependencies",
      decision: "PASS",
      exitCode: 0,
      output: outputLines.join("\n"),
    };
  }

  private detectCycles(nodes: string[], edges: Array<{ from: string; to: string }>): number {
    const adj = new Map<string, string[]>();
    for (const node of nodes) adj.set(node, []);
    for (const edge of edges) {
      adj.get(edge.from)?.push(edge.to);
    }

    let cycles = 0;
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);
      for (const neighbor of adj.get(node) || []) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          cycles++;
        }
      }
      recursionStack.delete(node);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node)) dfs(node);
    }

    return cycles;
  }

  private runAssumptionsCommand(_args: string[]): CommandResult {
    const assumptionsPath = path.join(this.projectRoot, this.sddRoot, "assumptions", "INDEX.sdd");
    if (!fs.existsSync(assumptionsPath)) {
      return {
        command: "/sdd-assumptions",
        decision: "PASS",
        exitCode: 0,
        output: "Assumptions index not found.",
      };
    }

    const content = fs.readFileSync(assumptionsPath, "utf-8");
    const lines = content.split(/\r?\n/).filter(l => l.trim().startsWith("-"));

    const outputLines = [
      "ASSUMPTIONS",
      "",
      `Total:        ${lines.length}`,
      `Validated:    0`,
      `Stale:        0`,
      `Unmapped:     ${lines.length}`,
      `At Risk:      0`,
      "",
      "Assumption List:",
    ];

    for (const line of lines.slice(0, 20)) {
      const assumption = line.trim().replace(/^- /, "");
      outputLines.push(`  [ASM] ${assumption}`);
    }

    if (lines.length > 20) {
      outputLines.push(`  ... and ${lines.length - 20} more`);
    }

    return {
      command: "/sdd-assumptions",
      decision: "PASS",
      exitCode: 0,
      output: outputLines.join("\n"),
    };
  }

  private runIntentsCommand(_args: string[]): CommandResult {
    const inboxPath = path.join(this.projectRoot, "prompts", "inbox");
    const intentsIndexPath = path.join(this.projectRoot, this.sddRoot, "intents", "INDEX.sdd");

    let pending = 0;
    const intents: string[] = [];

    if (fs.existsSync(inboxPath)) {
      const files = fs.readdirSync(inboxPath).filter(f => f.endsWith(".md") || f.endsWith(".txt"));
      pending = files.length;
      for (const file of files.slice(0, 20)) {
        intents.push(`  [INT] ${file}`);
      }
    }

    const outputLines = [
      "INTENT PIPELINE",
      "",
      `Pending:       ${pending}`,
      `Classified:    0`,
      `Unclassified:  ${pending}`,
      `Blocked:       0`,
      `Completion:    0%`,
      "",
    ];

    if (intents.length > 0) {
      outputLines.push("Intent List:");
      outputLines.push(...intents);
    } else {
      outputLines.push("No pending intents found.");
    }

    return {
      command: "/sdd-intents",
      decision: "PASS",
      exitCode: 0,
      output: outputLines.join("\n"),
    };
  }

  private async runPurgeCommand(args: string[]): Promise<CommandResult> {
    const serviceUrl = process.env.WATERMARKS_SERVICE_URL || "http://127.0.0.1:8765";
    const apiKey = process.env.WATERMARKS_SERVER_API_KEY;
    const client = new ProvenanceClient({ serviceUrl, apiKey, timeoutMs: 5000 });
    const inspectOnly = args.includes("--inspect");
    const layerArg = args.find(a => a.startsWith("--layer"))?.split("=")[1] || "all";
    const targetPath = args[args.findIndex(a => a === "--file" || a === "--directory") + 1];

    if (!targetPath) {
      return {
        command: "/sdd-purge",
        decision: "PASS",
        exitCode: 0,
        output: "Usage: /sdd-purge --file <path> or /sdd-purge --directory <path>",
      };
    }

    const resolved = path.resolve(this.projectRoot, targetPath);
    if (!fs.existsSync(resolved)) {
      return {
        command: "/sdd-purge",
        decision: "PASS",
        exitCode: 0,
        output: `Target not found: ${resolved}`,
      };
    }

    const filesToScan: string[] = [];
    if (fs.statSync(resolved).isDirectory()) {
      const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir)) {
          const full = path.join(dir, entry);
          if (fs.statSync(full).isDirectory()) {
            walk(full);
          } else {
            filesToScan.push(full);
          }
        }
      };
      walk(resolved);
    } else {
      filesToScan.push(resolved);
    }

    let totalLayerA = 0;
    let totalLayerFiles = 0;
    const allFindings: Array<Record<string, unknown>> = [];

    for (const file of filesToScan) {
      const content = fs.readFileSync(file, "utf-8");
      const fileName = file.split(/[\\/]/).pop() || file;
      const report = await client.inspect(fileName, content, false);

      if (!report.available) {
        allFindings.push({
          patternId: "PROV:unavailable",
          severity: "LOW",
          line: 1,
          file,
          message: `Provenance service unavailable: ${report.error || "unknown"}`,
        });
        continue;
      }

      if (!report.suspicious) continue;

      for (const finding of report.report) {
        const layer = (finding.layer || "").toLowerCase();
        if (layerArg === "a" && layer !== "layer_a") continue;
        if (layerArg === "files" && layer !== "layer_files") continue;

        allFindings.push({
          patternId: `PROV:${finding.kind}`,
          severity: "MEDIUM",
          line: 1,
          file,
          message: `[${finding.layer || "provenance"}] ${finding.report || finding.kind}`,
        });

        if (layer === "layer_a") totalLayerA++;
        else if (layer === "layer_files") totalLayerFiles++;
      }
    }

    const decision = allFindings.length > 0 ? "WARN" : "PASS";
    const outputLines = [
      "PROVENANCE AUDIT",
      "",
      `Files Scanned:    ${filesToScan.length}`,
      `Findings:         ${allFindings.length}`,
      `  Layer A:        ${totalLayerA}`,
      `  Layer Files:    ${totalLayerFiles}`,
      `Decision:         ${decision}`,
      "",
    ];

    if (allFindings.length > 0) {
      outputLines.push("Findings Detail:");
      for (const f of allFindings.slice(0, 50)) {
        outputLines.push(`  [${f.severity}] ${f.patternId} | ${f.file}:${f.line}`);
        if (typeof f.message === "string" && f.message) {
          outputLines.push(`    ${f.message}`);
        }
      }
    }

    return {
      command: "/sdd-purge",
      decision,
      exitCode: inspectOnly ? 0 : 0,
      output: outputLines.join("\n"),
      findings: allFindings,
    };
  }

  private async runDriftCommand(args: string[]): Promise<CommandResult> {
    const detector = new DriftDetector(this.sddRoot, this.projectRoot);
    const typeFilter = args.find(a => a.startsWith("--type"))?.split("=")[1];
    const severityFilter = args.find(a => a.startsWith("--severity"))?.split("=")[1];
    const scopeArg = args.find(a => a.startsWith("--scope"))?.split("=")[1];

    let records: DriftRecord[];
    let byType: Record<string, number> = {};
    let byClassification: Record<string, number> = {};
    let totalDrifts = 0;

    if (typeFilter) {
      records = await detector.detectByType(typeFilter as any, scopeArg);
      totalDrifts = records.length;
      for (const r of records) {
        byType[r.type] = (byType[r.type] || 0) + 1;
        byClassification[r.classification] = (byClassification[r.classification] || 0) + 1;
      }
    } else {
      const result = await detector.detectAll(scopeArg);
      records = result.items;
      totalDrifts = result.totalDrifts;
      byType = result.byType;
      byClassification = result.byClassification;
    }
    const allFindings: Array<Record<string, unknown>> = [];

    for (const drift of records) {
      if (severityFilter && drift.severity !== severityFilter) continue;
      allFindings.push({
        id: drift.id,
        type: drift.type,
        classification: drift.classification,
        confidence: drift.confidence,
        declared: drift.declared,
        observed: drift.observed,
        evidence: drift.evidence,
        syncOp: drift.syncOp,
        severity: drift.severity,
      });
    }

    const decision = (byType["structural"] || 0) > 0 || (byType["security"] || 0) > 0 ? "WARN" : "PASS";
    const outputLines = [
      "DRIFT REPORT",
      "",
      `Total Drifts:       ${totalDrifts}`,
      "By Type:",
      `  Structural:       ${byType["structural"] || 0}`,
      `  Behavioral:       ${byType["behavioral"] || 0}`,
      `  Contract:         ${byType["contract"] || 0}`,
      `  Database:         ${byType["database"] || 0}`,
      `  Security:         ${byType["security"] || 0}`,
      `  Configuration:    ${byType["configuration"] || 0}`,
      `  Documentation:    ${byType["documentation"] || 0}`,
      `  Terminology:      ${byType["terminology"] || 0}`,
      "By Classification:",
      `  Declaration Wrong: ${byClassification["DECLARATION_WRONG"] || 0}`,
      `  Code Wrong:        ${byClassification["CODE_WRONG"] || 0}`,
      `  Both Outdated:     ${byClassification["BOTH_OUTDATED"] || 0}`,
      `  Unknown:           ${byClassification["UNKNOWN"] || 0}`,
      `Decision:           ${decision}`,
      "",
    ];

    if (allFindings.length > 0) {
      outputLines.push("Drift Items:");
      for (const f of allFindings.slice(0, 50)) {
        outputLines.push(`  [${f.severity}] ${f.id} | ${f.type} | ${f.classification}`);
        outputLines.push(`    Declared: ${f.declared}`);
        outputLines.push(`    Observed: ${f.observed}`);
        outputLines.push(`    Sync:     ${f.syncOp}`);
      }
    }

    return {
      command: "/sdd-drift",
      decision,
      exitCode: decision === "PASS" ? 0 : 1,
      output: outputLines.join("\n"),
      findings: allFindings,
    };
  }

  private async runSyncCommand(args: string[]): Promise<CommandResult> {
    const detector = new DriftDetector(this.sddRoot, this.projectRoot);
    const syncEngine = new SyncEngine();

    const driftResult = await detector.detectAll();
    const plans = syncEngine.proposeSync(driftResult.items);

    const outputLines = [
      "SYNC OPERATIONS",
      "",
      `Total Plans:      ${plans.length}`,
      `Requires Approval: ${plans.filter(p => p.requiresApproval).length}`,
      "",
    ];

    for (const plan of plans.slice(0, 20)) {
      outputLines.push(`[${plan.operation}] ${plan.id} → Drift: ${plan.driftId}`);
      outputLines.push(`  Targets: ${plan.targetFiles.join(", ")}`);
      outputLines.push(`  Rationale: ${plan.rationale}`);
      outputLines.push(`  Approval: ${plan.requiresApproval ? "REQUIRED" : "not required"}`);
      outputLines.push("");

      if (args.includes("--dry-run")) continue;
      if (plan.requiresApproval && !args.includes("--auto-approve")) continue;

      if (plan.operation === "SYNC_SDD") {
        outputLines.push(`  [PROPOSED DECISION] ${syncEngine.generateDecision(plan).split("\n")[0]}`);
      }
      if (plan.operation === "SYNC_CODE" || plan.operation === "SYNC_BOTH") {
        outputLines.push(`  [PROPOSED TASK] ${syncEngine.generateTask(plan).split("\n")[0]}`);
      }
    }

    if (args.includes("--dry-run")) {
      outputLines.unshift("DRY RUN — no changes will be made");
    }

    const decision = plans.some(p => p.requiresApproval) ? "WARN" : "PASS";
    return {
      command: "/sdd-sync",
      decision,
      exitCode: 0,
      output: outputLines.join("\n"),
    };
  }

  private async runTraceCommand(args: string[]): Promise<CommandResult> {
    const tracer = new TraceEngine(this.sddRoot, this.projectRoot);
    const forwardArg = args.find(a => a.startsWith("--forward"))?.split("=")[1];
    const reverseArg = args.find(a => a.startsWith("--reverse"))?.split("=")[1];
    const coverageArg = args.includes("--coverage");

    if (coverageArg) {
      const coverage = await tracer.computeCoverage();
      const coveragePct = coverage.requirements > 0
        ? Math.round((coverage.verified / coverage.requirements) * 100)
        : 0;

      const outputLines = [
        "TRACE COVERAGE",
        "",
        `Requirements:   ${coverage.requirements}`,
        `Implemented:    ${coverage.implemented}`,
        `Tested:         ${coverage.tested}`,
        `Verified:       ${coverage.verified}`,
        `Coverage:       ${coveragePct}%`,
      ];

      return {
        command: "/sdd-trace",
        decision: "PASS",
        exitCode: 0,
        output: outputLines.join("\n"),
      };
    }

    if (!forwardArg && !reverseArg) {
      return {
        command: "/sdd-trace",
        decision: "PASS",
        exitCode: 0,
        output: "Usage: /sdd-trace --forward <R<id>|D<id>|T<id>|C<id>|X<id>|P<id>> | --reverse <file-path> | --coverage",
      };
    }

    const chain: TraceChain = forwardArg
      ? await tracer.traceForward(forwardArg)
      : await tracer.traceReverse(reverseArg!);

    const outputLines = [
      "TRACE CHAIN",
      "",
      `Direction: ${chain.direction}`,
      `Start:     ${chain.start}`,
      "",
      "Chain:",
    ];

    let indent = "";
    for (const node of chain.nodes) {
      outputLines.push(`${indent}[${node.prefix}] ${node.type}: ${node.id} (${node.artifact})`);
      indent += "  ";
    }

    if (chain.nodes.length === 0) {
      outputLines.push("  (no trace links found — BREAK)");
    }

    return {
      command: "/sdd-trace",
      decision: "PASS",
      exitCode: 0,
      output: outputLines.join("\n"),
    };
  }

  private async runContextCommand(args: string[]): Promise<CommandResult> {
    const compiler = new ContextCompiler();
    const manifestStore = new ContextManifestStore();
    const taskId = args.find(a => a.startsWith("--task"))?.split("=")[1];
    const intent = args.find(a => a.startsWith("--intent"))?.split("=")[1]?.replace(/^"|"$/g, "");
    const manifestId = args.find(a => a.startsWith("--manifest"))?.split("=")[1];
    const validateId = args.find(a => a.startsWith("--validate"))?.split("=")[1];
    const budgetArg = args.find(a => a.startsWith("--budget"))?.split("=")[1];
    const explainId = args.find(a => a.startsWith("--explain"))?.split("=")[1];

    if (manifestId) {
      const manifest = manifestStore.load(manifestId);
      if (!manifest) {
        return {
          command: "/sdd-context",
          decision: "PASS",
          exitCode: 0,
          output: `Manifest not found: ${manifestId}`,
        };
      }
      const lines = [
        "CONTEXT MANIFEST",
        "",
        `Task:           ${manifest.taskId}`,
        `Compiled At:    ${manifest.compiledAt}`,
        `Layers:         ${manifest.layers.join(", ")}`,
        `References:     ${manifest.included.length}`,
        `Budget:         ${manifest.budget.maxRefs} refs / ${manifest.budget.maxTokens} tokens`,
        `Confidence:     ${manifest.confidence}`,
        `Freshness:      ${manifest.freshness}`,
        `Contradictions: ${manifest.contradictions.length}`,
        "",
        "Included:",
      ];
      for (const ref of manifest.included.slice(0, 20)) {
        lines.push(`  [${ref.layer}] ${ref.id} (score: ${ref.score.toFixed(2)})`);
      }
      lines.push("");
      lines.push("Excluded:");
      for (const ref of manifest.excluded.slice(0, 20)) {
        lines.push(`  ${ref.id}: ${ref.exclusionReason || "low_score"}`);
      }
      if (manifest.contradictions.length > 0) {
        lines.push("");
        lines.push("Contradictions:");
        for (const c of manifest.contradictions) {
          lines.push(`  ${c}`);
        }
      }
      return {
        command: "/sdd-context",
        decision: "PASS",
        exitCode: 0,
        output: lines.join("\n"),
      };
    }

    if (!intent && !taskId) {
      return {
        command: "/sdd-context",
        decision: "PASS",
        exitCode: 0,
        output: "Usage: /sdd-context --intent \"<text>\" or --task T<id>",
      };
    }

    const risk: BudgetRisk = budgetArg === "LOW" || budgetArg === "MEDIUM" || budgetArg === "HIGH" || budgetArg === "CRITICAL"
      ? budgetArg
      : "MEDIUM";

    const pack = await compiler.compile({
      taskId,
      intent: intent || "",
      risk,
      dependencies: [],
    });

    manifestStore.save(pack.manifest);

    const lines = [
      "CONTEXT PACK",
      "",
      `Task:           ${pack.manifest.taskId}`,
      `Layers:         ${pack.manifest.layers.join(", ")}`,
      `References:     ${pack.manifest.included.length}`,
      `Budget:         ${pack.manifest.budget.maxRefs} refs / ${pack.manifest.budget.maxTokens} tokens`,
      `Used:           ${pack.manifest.budgetUsed.refs} refs / ${pack.manifest.budgetUsed.tokens} tokens`,
      `Confidence:     ${pack.manifest.confidence}`,
      `Freshness:      ${pack.manifest.freshness}`,
      `Contradictions: ${pack.manifest.contradictions.length}`,
      "",
      "Included:",
    ];

    for (const ref of pack.manifest.included.slice(0, 20)) {
      lines.push(`  [${ref.layer}] ${ref.id} (score: ${ref.score.toFixed(2)})`);
    }

    if (pack.manifest.excluded.length > 0) {
      lines.push("");
      lines.push("Excluded:");
      for (const ref of pack.manifest.excluded.slice(0, 20)) {
        lines.push(`  ${ref.id}: ${ref.exclusionReason || "low_score"}`);
      }
    }

    if (pack.manifest.contradictions.length > 0) {
      lines.push("");
      lines.push("Contradictions:");
      for (const c of pack.manifest.contradictions) {
        lines.push(`  ${c}`);
      }
    }

    return {
      command: "/sdd-context",
      decision: "PASS",
      exitCode: 0,
      output: lines.join("\n"),
    };
  }

  private async runDesignCommand(args: string[]): Promise<CommandResult> {
    const analyzer = new DesignAnalyzer();
    const invoker = new SkillAutoInvoker();
    const evaluateArg = args.includes("--evaluate");
    const discoverArg = args.includes("--discover");
    const reviewArg = args.find(a => a.startsWith("--review"))?.split(" ")[1];
    const manualArg = args.includes("--manual");
    const autoArg = args.includes("--auto");

    if (discoverArg) {
      const discovery = await analyzer.discover();
      const outputLines = [
        "DESIGN SKILL DISCOVERY",
        "",
        `Missing Skills:     ${discovery.missing.length}`,
        `Recommendations:    ${discovery.recommendations.length}`,
        "",
      ];

      for (const rec of discovery.recommendations) {
        outputLines.push(`  [${(rec.relevance * 100).toFixed(0)}%] ${rec.skill}`);
      }

      return {
        command: "/sdd-design",
        decision: "PASS",
        exitCode: 0,
        output: outputLines.join("\n"),
      };
    }

    const targetPath = reviewArg || this.projectRoot;
    const evaluations = evaluateArg || reviewArg
      ? await analyzer.evaluate(targetPath)
      : await analyzer.evaluate(this.projectRoot);

    const categoryScores: Record<string, { total: number; count: number }> = {};
    const allIssues: Array<Record<string, unknown>> = [];

    for (const ev of evaluations) {
      if (!categoryScores[ev.category]) {
        categoryScores[ev.category] = { total: 0, count: 0 };
      }
      categoryScores[ev.category].total += ev.score;
      categoryScores[ev.category].count++;

      for (const issue of ev.issues) {
        allIssues.push({
          category: ev.category,
          severity: issue.severity,
          description: issue.description,
          recommendation: issue.recommendation,
        });
      }
    }

    const avgScore = (category: string) =>
      categoryScores[category]?.count ? Math.round(categoryScores[category].total / categoryScores[category].count) : 0;

    const overallScore = evaluations.length > 0
      ? Math.round(evaluations.reduce((sum, ev) => sum + ev.score, 0) / evaluations.length)
      : 0;

    const decision = overallScore >= 70 ? "PASS" : overallScore >= 50 ? "WARN" : "BLOCK";

    const outputLines = [
      "DESIGN EVALUATION",
      "",
      `Overall Score:      ${overallScore}`,
      `Category Scores:`,
      `  Taste:            ${avgScore("taste")}`,
      `  Heuristics:       ${avgScore("heuristics")}`,
      `  Visual:           ${avgScore("visual")}`,
      `  UX:               ${avgScore("ux")}`,
      `  Accessibility:    ${avgScore("accessibility")}`,
      `  Design System:    ${avgScore("design-system")}`,
      `Decision:           ${decision}`,
      "",
    ];

    if (allIssues.length > 0) {
      outputLines.push("Issues:");
      for (const issue of allIssues.slice(0, 30)) {
        outputLines.push(`  [${issue.severity}] ${issue.category}: ${issue.description}`);
        outputLines.push(`    Recommendation: ${issue.recommendation}`);
      }
    }

    if (autoArg || !manualArg) {
      const context = invoker.detectContext(args.join(" "));
      if (invoker.shouldInvokeDesign(args.join(" "))) {
        const suggested = invoker.getSuggestedSkills(context);
        outputLines.push("");
        outputLines.push("Auto-Invoked Skills:");
        for (const skill of suggested) {
          outputLines.push(`  ${skill}`);
        }
      }
    }

    return {
      command: "/sdd-design",
      decision,
      exitCode: decision === "BLOCK" ? 2 : 0,
      output: outputLines.join("\n"),
      findings: allIssues,
    };
  }

  private async runMarketplaceCommand(args: string[]): Promise<CommandResult> {
    const subcommand = args[0] || "list";
    const registryPath = path.join(this.projectRoot, this.sddRoot, "marketplace", "registry.json");

    if (!fs.existsSync(registryPath)) {
      return {
        command: "/sdd-marketplace",
        decision: "PASS",
        exitCode: 0,
        output: "Marketplace registry not found at .sdd/marketplace/registry.json",
      };
    }

    const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

    if (subcommand === "list") {
      const lines: string[] = [
        "MARKETPLACE REGISTRY",
        "",
        `Sources:    ${registry.sources.length}`,
        `Blocked:    ${registry.blocked.length}`,
        "",
      ];
      for (const source of registry.sources) {
        const importedCount = source.imported?.length || 0;
        lines.push(`[${source.status.toUpperCase()}] ${source.id}`);
        lines.push(`  URL:       ${source.url}`);
        lines.push(`  License:   ${source.license}`);
        lines.push(`  Format:    ${source.format}`);
        lines.push(`  Imported:  ${importedCount} skill(s)${importedCount > 0 ? ` (${source.imported.join(", ")})` : ""}`);
        lines.push(`  LastSync:  ${source.lastSync || "never"}`);
        if (source.notes) lines.push(`  Notes:     ${source.notes}`);
        lines.push("");
      }
      if (registry.blocked.length > 0) {
        lines.push("BLOCKED SOURCES (non-importable):");
        for (const b of registry.blocked) {
          lines.push(`  ${b.id} — ${b.reason}`);
        }
      }
      return { command: "/sdd-marketplace", decision: "PASS", exitCode: 0, output: lines.join("\n") };
    }

    if (subcommand === "sync") {
      const sourceId = args[1];
      if (!sourceId) {
        return {
          command: "/sdd-marketplace",
          decision: "PASS",
          exitCode: 0,
          output: "Usage: /sdd-marketplace sync <source-id> — updates lastSync timestamp for a registered source",
        };
      }
      const source = registry.sources.find((s: { id: string }) => s.id === sourceId);
      if (!source) {
        return {
          command: "/sdd-marketplace",
          decision: "BLOCK",
          exitCode: 2,
          output: `Unknown source: ${sourceId}. Run /sdd-marketplace list for registered sources.`,
        };
      }
      source.lastSync = new Date().toISOString().slice(0, 10);
      registry.updated_at = new Date().toISOString();
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n", "utf-8");
      return {
        command: "/sdd-marketplace",
        decision: "PASS",
        exitCode: 0,
        output: `Synced ${sourceId}: lastSync=${source.lastSync}. Imported skills: ${(source.imported || []).length}. License rule: ${registry.rules.license}`,
      };
    }

    if (subcommand === "import") {
      const sourceId = args[1];
      const skillName = args[2];
      const domain = args[3] || "meta";
      const group = args[4] || sourceId || "imported";
      if (!sourceId || !skillName) {
        return {
          command: "/sdd-marketplace",
          decision: "PASS",
          exitCode: 0,
          output: "Usage: /sdd-marketplace import <source-id> <skill-name> [domain] [group] — fetches SKILL.md, validates, imports with provenance",
        };
      }
      if (registry.blocked.some((b: { id: string }) => b.id === sourceId)) {
        return {
          command: "/sdd-marketplace",
          decision: "BLOCK",
          exitCode: 2,
          output: `Source ${sourceId} is in the blocked list — non-importable [IMP6].`,
        };
      }
      const source = registry.sources.find((s: { id: string }) => s.id === sourceId);
      if (!source) {
        return {
          command: "/sdd-marketplace",
          decision: "BLOCK",
          exitCode: 2,
          output: `Unknown source: ${sourceId}. Run /sdd-marketplace list.`,
        };
      }

      const importer = new SkillImporter({ sddRoot: this.sddRoot, projectRoot: this.projectRoot });
      try {
        const result = await importer.importSkill({
          name: skillName,
          repoUrl: source.url,
          skillPath: `skills/${skillName}/SKILL.md`,
          domain,
          group,
          license: source.license,
        });
        if (result.imported) {
          if (!source.imported) source.imported = [];
          if (!source.imported.includes(skillName)) source.imported.push(skillName);
          source.lastSync = new Date().toISOString().slice(0, 10);
          registry.updated_at = new Date().toISOString();
          fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n", "utf-8");
        }
        const lines = [
          "MARKETPLACE IMPORT",
          "",
          `Skill:        ${result.skill}`,
          `Source:       ${result.source}`,
          `Destination:  ${result.destination}`,
          `Score:        ${result.validation.score}/100`,
          `Decision:     ${result.validation.decision}`,
          `Status:       ${result.imported ? "IMPORTED (CANDIDATE)" : "REJECTED"}`,
          "",
          result.message,
        ];
        if (result.validation.findings.length > 0) {
          lines.push("", "Findings:");
          for (const f of result.validation.findings) {
            lines.push(`  [${f.severity}] ${f.gate}: ${f.message}`);
          }
        }
        return {
          command: "/sdd-marketplace",
          decision: result.imported ? "PASS" : "BLOCK",
          exitCode: result.imported ? 0 : 2,
          output: lines.join("\n"),
        };
      } catch (error) {
        return {
          command: "/sdd-marketplace",
          decision: "BLOCK",
          exitCode: 2,
          output: `Import failed: ${(error as Error).message}`,
        };
      }
    }

    if (subcommand === "audit") {
      const validator = new SkillValidator();
      const lines: string[] = ["MARKETPLACE AUDIT", ""];
      let audited = 0;
      let blockers = 0;
      let warns = 0;
      let passed = 0;

      const importedRoot = path.join(this.projectRoot, this.sddRoot, "skills");
      const categories = fs.existsSync(importedRoot)
        ? fs.readdirSync(importedRoot).filter(f => fs.statSync(path.join(importedRoot, f)).isDirectory())
        : [];

      // Collect every INDEX.sdd under {category}/imported/ (any depth) plus
      // writing/{skill}/INDEX.sdd (imported skills without an imported/ level).
      // Provenance marker: "Source: https://" — identifies imported wrappers.
      const wrapperPaths: Array<{ label: string; file: string }> = [];
      const collectWrappers = (dir: string, label: string, depth: number) => {
        if (depth > 4) return;
        for (const entry of fs.readdirSync(dir)) {
          const entryPath = path.join(dir, entry);
          if (fs.statSync(entryPath).isDirectory()) {
            collectWrappers(entryPath, `${label}/${entry}`, depth + 1);
          } else if (entry === "INDEX.sdd") {
            const content = fs.readFileSync(entryPath, "utf-8");
            if (/^Source:\s*https:\/\//m.test(content)) {
              wrapperPaths.push({ label, file: entryPath });
            }
          }
        }
      };

      for (const category of categories) {
        const importedDir = path.join(importedRoot, category, "imported");
        if (fs.existsSync(importedDir)) {
          collectWrappers(importedDir, `${category}/imported`, 0);
        }
        if (category === "writing") {
          collectWrappers(path.join(importedRoot, category), `writing`, 0);
        }
      }

      for (const { label, file } of wrapperPaths) {
        audited++;
        const result = validator.validateFile(file);
        if (result.decision === "BLOCK") {
          blockers++;
          lines.push(`  [BLOCK] ${label}: ${result.findings.filter(f => f.severity === "BLOCK").map(f => f.message).join("; ")}`);
        } else if (result.decision === "FIX") {
          warns++;
          lines.push(`  [FIX]   ${label}: ${result.findings.filter(f => f.severity === "WARN").map(f => f.message).join("; ")}`);
        } else {
          passed++;
        }
      }

      lines.unshift(
        `Skills Audited:  ${audited}`,
        `  SHIP (PASS):   ${passed}`,
        `  FIX (WARN):    ${warns}`,
        `  BLOCK:         ${blockers}`,
        `Decision:         ${blockers > 0 ? "BLOCK" : warns > 0 ? "FIX" : "SHIP"}`,
        ""
      );
      if (audited === passed + warns + blockers && lines[lines.length - 1] === "") lines.push("All imported skills carry valid provenance.");
      return {
        command: "/sdd-marketplace",
        decision: blockers > 0 ? "BLOCK" : warns > 0 ? "WARN" : "PASS",
        exitCode: blockers > 0 ? 2 : 0,
        output: lines.join("\n"),
      };
    }

    return {
      command: "/sdd-marketplace",
      decision: "PASS",
      exitCode: 0,
      output: `Unknown subcommand: ${subcommand}. Usage: /sdd-marketplace list|sync|import|audit`,
    };
  }
}
