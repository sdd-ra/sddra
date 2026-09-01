import fs from "fs";
import path from "path";
import { HookBridge } from "./hook-bridge";

export interface CommandResult {
  command: string;
  decision: string;
  exitCode: number;
  output: string;
  findings?: Array<Record<string, unknown>>;
}

export class CommandRunner {
  private sddRoot: string;
  private projectRoot: string;

  constructor(sddRoot = ".sdd", projectRoot = ".") {
    this.sddRoot = sddRoot;
    this.projectRoot = projectRoot;
  }

  run(commandName: string, args: string[] = []): CommandResult {
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

  private runScanCommand(args: string[]): CommandResult {
    const bridge = new HookBridge();
    const targetPath = args[args.findIndex(a => a === "--file" || a === "--directory") + 1];
    const severityFilter = args.find(a => a.startsWith("--severity"))?.split("=")[1];

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
      const result = bridge.processHook({
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
}
