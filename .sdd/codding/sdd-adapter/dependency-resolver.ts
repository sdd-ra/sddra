export class DependencyResolver {
  static buildDependencyGraph(sddRoot: string): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    const fs = require("fs");
    const path = require("path");

    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          walk(full);
        } else if (entry.endsWith(".sdd")) {
          const content = fs.readFileSync(full, "utf-8");
          const refs = content.match(/@[\w./<>-]+/g) || [];
          const source = entry.replace(/\.sdd$/, "");
          const deps: string[] = [];
          for (const ref of refs) {
            const clean = ref.replace(/^@/, "");
            if (clean !== source) deps.push(clean);
          }
          graph.set(source, deps);
        }
      }
    };

    walk(sddRoot);
    return graph;
  }

  static getDependencies(referenceId: string, graph: Map<string, string[]>): string[] {
    const visited = new Set<string>();
    const stack = [referenceId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const deps = graph.get(current) || [];
      for (const dep of deps) {
        if (!visited.has(dep)) stack.push(dep);
      }
    }
    visited.delete(referenceId);
    return Array.from(visited);
  }

  static resolve(selectedIds: string[], allReferences: string[]): string[] {
    const graph = this.buildDependencyGraph(process.cwd());
    const result = new Set(selectedIds);
    for (const id of selectedIds) {
      const deps = this.getDependencies(id, graph);
      for (const dep of deps) {
        if (allReferences.includes(dep)) result.add(dep);
      }
    }
    return Array.from(result);
  }
}
