import fs from "fs";
import path from "path";
import { TraceChain, TraceNode, ProofRecord } from "./types";

export class TraceEngine {
  private sddRoot: string;
  private projectRoot: string;

  constructor(sddRoot = ".sdd", projectRoot = ".") {
    this.sddRoot = sddRoot;
    this.projectRoot = projectRoot;
  }

  async traceForward(entityId: string): Promise<TraceChain> {
    const nodes: TraceNode[] = [];
    const id = entityId.trim();

    if (id.startsWith("R")) {
      nodes.push(this.createNode(id, "requirement", "@requirements"));
      const decisions = this.findLinked(id, "@decision");
      for (const d of decisions) {
        nodes.push(this.createNode(d, "decision", "@decisions"));
        const tasks = this.findLinked(d, "@task");
        for (const t of tasks) {
          nodes.push(this.createNode(t, "task", "@tasks"));
          const codeFiles = this.findCodeForTask(t);
          for (const c of codeFiles) {
            nodes.push(this.createNode(c, "code", "src/"));
            const tests = this.findTestsForCode(c);
            for (const test of tests) {
              nodes.push(this.createNode(test, "test", "tests/"));
              const proof = this.findProof(test);
              if (proof) nodes.push(this.createNode(proof, "proof", "@proof"));
            }
          }
        }
      }
    } else if (id.startsWith("D")) {
      nodes.push(this.createNode(id, "decision", "@decisions"));
      const tasks = this.findLinked(id, "@task");
      for (const t of tasks) {
        nodes.push(this.createNode(t, "task", "@tasks"));
        const codeFiles = this.findCodeForTask(t);
        for (const c of codeFiles) {
          nodes.push(this.createNode(c, "code", "src/"));
        }
      }
    } else if (id.startsWith("T")) {
      nodes.push(this.createNode(id, "task", "@tasks"));
      const codeFiles = this.findCodeForTask(id);
      for (const c of codeFiles) {
        nodes.push(this.createNode(c, "code", "src/"));
      }
    }

    if (nodes.length === 0) {
      nodes.push(this.createNode(id, "unknown", "@unknown"));
    }

    return {
      direction: "forward",
      start: id,
      nodes,
    };
  }

  async traceReverse(filePath: string): Promise<TraceChain> {
    const nodes: TraceNode[] = [];
    const resolved = path.resolve(this.projectRoot, filePath);

    const task = this.findTaskForFile(resolved);
    if (task) {
      nodes.push(this.createNode(task, "task", "@tasks"));
      const decisions = this.findLinkedReverse(task, "@decision");
      for (const d of decisions) {
        nodes.push(this.createNode(d, "decision", "@decisions"));
        const requirements = this.findLinkedReverse(d, "@requirement");
        for (const r of requirements) {
          nodes.push(this.createNode(r, "requirement", "@requirements"));
        }
      }
      const tests = this.findTestsForCode(resolved);
      for (const test of tests) {
        nodes.push(this.createNode(test, "test", "tests/"));
        const proof = this.findProof(test);
        if (proof) nodes.push(this.createNode(proof, "proof", "@proof"));
      }
    }

    nodes.unshift(this.createNode(resolved, "code", "src/"));

    return {
      direction: "reverse",
      start: resolved,
      nodes,
    };
  }

  async computeCoverage(): Promise<{
    requirements: number;
    implemented: number;
    tested: number;
    verified: number;
  }> {
    const reqCount = this.countSddFiles("requirements", "@requirement");
    const taskCount = this.countSddFiles("tasks", "@task");
    const testCount = this.countTestFiles();

    return {
      requirements: reqCount,
      implemented: taskCount,
      tested: testCount,
      verified: Math.min(reqCount, taskCount, testCount),
    };
  }

  private createNode(id: string, type: string, artifact: string): TraceNode {
    const prefix = this.extractPrefix(id, type);
    return {
      id,
      prefix,
      type,
      artifact,
      status: "active",
    };
  }

  private extractPrefix(id: string, type: string): TraceNode["prefix"] {
    if (id.startsWith("R")) return "R";
    if (id.startsWith("D")) return "D";
    if (id.startsWith("T")) return "T";
    if (id.startsWith("C")) return "C";
    if (id.startsWith("X")) return "X";
    if (id.startsWith("P")) return "P";
    return "C";
  }

  private findLinked(id: string, type: string): string[] {
    const sddPath = path.join(this.projectRoot, this.sddRoot);
    const results: string[] = [];

    if (!fs.existsSync(sddPath)) return results;

    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
          walk(full);
        } else if (entry.endsWith(".sdd")) {
          const content = fs.readFileSync(full, "utf-8");
          if (content.includes(id) && content.includes(type)) {
            const match = content.match(new RegExp(`${type.replace("@", "\\$")}\\.([A-Za-z0-9-]+)`, "g"));
            if (match) {
              for (const m of match) {
                const linked = m.replace(/\\$/g, "").trim();
                if (linked !== id && !results.includes(linked)) {
                  results.push(linked);
                }
              }
            }
          }
        }
      }
    };
    walk(sddPath);

    return results;
  }

  private findLinkedReverse(id: string, type: string): string[] {
    return this.findLinked(id, type);
  }

  private findCodeForTask(taskId: string): string[] {
    const sddPath = path.join(this.projectRoot, this.sddRoot, "tasks");
    if (!fs.existsSync(sddPath)) return [];

    const taskFiles = this.findFiles(sddPath, ".sdd");
    for (const file of taskFiles) {
      const content = fs.readFileSync(file, "utf-8");
      if (content.includes(taskId) && content.includes("target_files:")) {
        const match = content.match(/target_files:\s*([^\n]+)/);
        if (match && match[1]) {
          return match[1].split(",").map(s => s.trim()).filter(Boolean);
        }
      }
    }
    return [];
  }

  private findTaskForFile(filePath: string): string | null {
    const sddPath = path.join(this.projectRoot, this.sddRoot, "tasks");
    if (!fs.existsSync(sddPath)) return null;

    const taskFiles = this.findFiles(sddPath, ".sdd");
    for (const file of taskFiles) {
      const content = fs.readFileSync(file, "utf-8");
      if (content.includes(filePath)) {
        const taskMatch = content.match(/(?:@task\.|task:\s*)([A-Za-z0-9-]+)/);
        if (taskMatch) return `@task.${taskMatch[1]}`;
      }
    }
    return null;
  }

  private findTestsForCode(codeFile: string): string[] {
    const testDirs = ["tests", "__tests__", "test"];
    const results: string[] = [];

    for (const dir of testDirs) {
      const testPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(testPath)) continue;

      const baseName = path.basename(codeFile, path.extname(codeFile));
      const testFiles = this.findFiles(testPath, ".test.ts", ".test.js", ".spec.ts", ".spec.js");
      for (const test of testFiles) {
        if (test.includes(baseName)) {
          results.push(test);
        }
      }
    }

    return results;
  }

  private findProof(testFile: string): string | null {
    const basename = path.basename(testFile, path.extname(testFile));
    const proofId = `@proof.${basename.replace("test", "P")}`;
    return proofId;
  }

  private countSddFiles(dir: string, prefix: string): number {
    const p = path.join(this.projectRoot, this.sddRoot, dir);
    if (!fs.existsSync(p)) return 0;
    const files = this.findFiles(p, ".sdd");
    return files.filter(f => {
      const content = fs.readFileSync(f, "utf-8");
      return content.includes(prefix);
    }).length;
  }

  private countTestFiles(): number {
    const testDirs = ["tests", "__tests__", "test"];
    let count = 0;
    for (const dir of testDirs) {
      const testPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(testPath)) {
        count += this.findFiles(testPath, ".test.ts", ".test.js", ".spec.ts", ".spec.js").length;
      }
    }
    return count;
  }

  private findFiles(dir: string, ...extensions: string[]): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const walk = (d: string): void => {
      for (const entry of fs.readdirSync(d)) {
        const full = path.join(d, entry);
        if (fs.statSync(full).isDirectory()) {
          walk(full);
        } else if (extensions.some(ext => entry.endsWith(ext))) {
          results.push(full);
        }
      }
    };
    walk(dir);
    return results;
  }
}
