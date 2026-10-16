import fs from "fs";
import path from "path";

interface SddNode {
  key: string;
  value: string | SddNode[] | string[];
}

function parseSdd(content: string): SddNode[] {
  const lines = content.split(/\r?\n/);
  const sentinel: SddNode = { key: "", value: [] };
  const stack: { node: SddNode; indent: number }[] = [{ node: sentinel, indent: -1 }];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const indent = line.search(/\S/);
    if (indent === -1) continue;
    if (trimmed.startsWith("- ")) {
      const arrayValue = trimmed.slice(2).trim();
      const parent = stack[stack.length - 1].node;
      if (!Array.isArray(parent.value)) parent.value = [];
      (parent.value as string[]).push(arrayValue);
      continue;
    }
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) {
      const parent = stack[stack.length - 1].node;
      if (!Array.isArray(parent.value)) parent.value = [];
      (parent.value as string[]).push(trimmed);
      continue;
    }
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    const newNode: SddNode = { key, value };
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].node;
    if (!Array.isArray(parent.value)) parent.value = [];
    (parent.value as SddNode[]).push(newNode);
    stack.push({ node: newNode, indent });
  }
  return sentinel.value as SddNode[];
}

function findNode(nodes: SddNode[], key: string): SddNode | undefined {
  for (const n of nodes) if (n.key === key) return n;
  return undefined;
}

function sectionText(nodes: SddNode[], key: string): string {
  const n = findNode(nodes, key);
  if (!n) return "";
  if (typeof n.value === "string") return n.value;
  if (Array.isArray(n.value)) {
    const strings: string[] = [];
    for (const v of n.value) {
      if (typeof v === "string") strings.push(v);
      else if (v && typeof v === "object" && "key" in v) strings.push(JSON.stringify(v));
    }
    return strings.join("\n").trim();
  }
  return "";
}

function summarize(text: string): string {
  if (!text) return "";
  const first = text.split(/[.;]\s/)[0];
  return (first || text).slice(0, 280);
}

function walkSddFiles(root: string): string[] {
  const out: string[] = [];
  function walk(dir: string, rel: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      const relp = path.join(rel, e.name);
      const norm = relp.replace(/\\/g, "/");
      if (e.isDirectory()) {
        if (e.name.startsWith(".") || e.name === "runtime" || e.name === "codding" || e.name === "llm" || e.name === ".runtime" || e.name === "build" || e.name === "dist") continue;
        walk(full, relp);
      } else if (e.isFile() && e.name.endsWith(".sdd")) {
        out.push(norm);
      }
    }
  }
  walk(root, "");
  return out.sort();
}

export interface LlmChunk {
  id: string;
  file: string;
  path: string;
  section: string;
  type: string;
  text: string;
  entities: string[];
  rels: string[];
  tags: string[];
}

export interface LlmEntity {
  id: string;
  type: string;
  status: string;
  summary: string;
  source: { file: string; path: string; range?: [number, number] };
}

export function runExport(sddRoot: string, projectRoot: string): { filesProcessed: number; chunks: number; entities: number; relations: number; } {
  const llmRoot = path.join(sddRoot, "llm");
  const chunksDir = path.join(llmRoot, "chunks");
  fs.mkdirSync(llmRoot, { recursive: true });
  fs.mkdirSync(chunksDir, { recursive: true });
  const llmsEntry = path.join(llmRoot, "llms.txt");
  if (!fs.existsSync(llmsEntry)) {
    fs.writeFileSync(llmsEntry, "# SDDRA generated entry\n", "utf-8");
  }
  const readmePath = path.join(llmRoot, "README.md");
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, "# LLM Layer (generated)\n", "utf-8");
  }
  for (const f of fs.readdirSync(chunksDir)) {
    try { fs.rmSync(path.join(chunksDir, f), { recursive: true, force: true }); } catch (e) { /* ignore */ }
  }
  const files = walkSddFiles(sddRoot);
  const entities: LlmEntity[] = [];
  const relations: Array<{ from: string; rel: string; to: string; meta: Record<string, unknown>; }> = [];
  const rules: Array<{ id: string; text: string; source: string; }> = [];
  const commands: Array<Record<string, unknown>> = [];
  const skills: Array<Record<string, unknown>> = [];
  const chains: Array<Record<string, unknown>> = [];
  const chunks: LlmChunk[] = [];
  let filesProcessed = 0;
  for (const rel of files) {
    const full = path.join(sddRoot, rel);
    let content = "";
    try { content = fs.readFileSync(full, "utf-8"); } catch (e) { continue; }
    filesProcessed++;
    const nodes = parseSdd(content);
    const purpose = sectionText(nodes, "Purpose");
    const owns = sectionText(nodes, "Owns");
    const rulesText = sectionText(nodes, "Rules");
    const navigation = sectionText(nodes, "Navigation");
    const flow = sectionText(nodes, "Behavior") || sectionText(nodes, "Flow") || sectionText(nodes, "FlowDescription");
    const description = sectionText(nodes, "Description") || sectionText(nodes, "purpose");

    let title = "";
    for (const ln of content.split(/\r?\n/)) {
      const t = ln.trim();
      if (!t || t.startsWith("#")) continue;
      if (/^[A-Za-z][A-Za-z _-]*:\s*/.test(t)) { title = t; break; }
    }

    const idBase = rel.replace(/\.sdd$/, "").replace(/[\/\\]/g, "-");
    const entity: LlmEntity = {
      id: idBase,
      type: flow ? "Chain" : "Document",
      status: "ACTIVE",
      summary: summarize(purpose || description || title),
      source: { file: path.join(".sdd", rel).replace(/\\/g, "/"), path: rel.replace(/\\/g, "/") },
    };
    entities.push(entity);

    const ruleMatches = rulesText.matchAll(/\[([A-Z0-9-]+)\]\s*(.+)/g);
    for (const rm of ruleMatches) {
      rules.push({ id: rm[1], text: rm[2].trim(), source: rel });
    }

    const refRe = /@(\.{1,2}\/[^\s]+)/g;
    let rr: RegExpExecArray | null;
    const navAll = navigation + "\n" + content;
    while ((rr = refRe.exec(navAll)) !== null) {
      const raw = rr[1];
      const clean = raw.replace(/^\.\.\//, "").replace(/^\.\//, "");
      if (clean && !relations.some(r => r.from === idBase && r.rel === "references" && r.to === clean)) {
        relations.push({ from: idBase, rel: "references", to: clean, meta: { source: rel } });
      }
    }

    const lines = content.split(/\r?\n/);
    const sections: { name: string; start: number; lines: string[] }[] = [];
    let cur: { name: string; start: number; lines: string[] } | null = null;
    let idx = 0;
    for (const ln of lines) {
      const ltrim = ln.trim();
      if (/^[A-Za-z][A-Za-z _-]*:\s*$/.test(ltrim) && !ltrim.startsWith("-") && ltrim.indexOf(":") === ltrim.length - 1) {
        if (cur) sections.push(cur);
        cur = { name: ltrim.replace(/:$/, "").trim(), start: idx, lines: [] };
      } else if (cur) {
        cur.lines.push(ln);
      }
      idx++;
    }
    if (cur) sections.push(cur);
    if (sections.length === 0) sections.push({ name: "Content", start: 0, lines: lines });

    for (let si = 0; si < sections.length; si++) {
      const sec = sections[si];
      const text = sec.lines.join("\n").trim();
      if (!text) continue;
      const chunkId = idBase + "-" + sec.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + si;
      const chunk: LlmChunk = {
        id: chunkId,
        file: path.join(".sdd", rel).replace(/\\/g, "/"),
        path: rel.replace(/\\/g, "/"),
        section: sec.name,
        type: rel.includes("commands/") ? "command" : rel.includes("chains/") ? "chain" : rel.includes("skills/") ? "skill" : "spec",
        text: text.slice(0, 4000),
        entities: [idBase],
        rels: [],
        tags: [sec.name.toLowerCase(), rel.includes("commands/") ? "command" : ""].filter(Boolean),
      };
      chunks.push(chunk);
      const chunkSlug = chunkId.replace(/[^a-z0-9-]/g, "_");
      try {
        fs.writeFileSync(path.join(chunksDir, chunkSlug + ".json"), JSON.stringify(chunk, null, 2), "utf-8");
        fs.writeFileSync(path.join(chunksDir, chunkSlug + ".md"), "# " + chunk.id + "\n\nFile: " + chunk.file + "  Section: " + chunk.section + "\n\n" + chunk.text + "\n", "utf-8");
      } catch (e) { /* ignore */ }
    }

    if (rel.startsWith("commands/") && rel.endsWith(".sdd")) {
      const secMap: Record<string, string> = {};
      for (const sec of sections) secMap[sec.name] = sec.lines.join("\n").trim().slice(0, 1500);
      commands.push({
        name: "/" + rel.replace(/^commands\//, "").replace(/\.sdd$/, ""),
        file: rel,
        purpose: secMap["Purpose"] || purpose,
        mode: (secMap["Mode"] || "").trim(),
        usage: secMap["Usage"] || "",
        rules: (secMap["Rules"] || "").slice(0, 1200),
        navigation: secMap["Navigation"] || navigation,
      });
    }

    if (rel.startsWith("skills/") && rel.endsWith(".sdd")) {
      skills.push({
        id: rel.replace(/\.sdd$/, "").replace(/[\/\\]/g, "-"),
        file: rel,
        purpose: (purpose || description).slice(0, 300),
        summary: summarize(purpose || description),
      });
    }

    if (rel.startsWith("chains/") && rel.endsWith(".sdd")) {
      chains.push({
        id: rel.replace(/\.sdd$/, "").replace(/[\/\\]/g, "-"),
        file: rel,
        purpose: (purpose || description).slice(0, 300),
      });
    }
  }

  fs.writeFileSync(path.join(llmRoot, "rules.json"), JSON.stringify(rules, null, 2), "utf-8");
  fs.writeFileSync(path.join(llmRoot, "entities.jsonl"), entities.map(e => JSON.stringify(e)).join("\n") + "\n", "utf-8");
  fs.writeFileSync(path.join(llmRoot, "relations.jsonl"), relations.map(r => JSON.stringify(r)).join("\n") + "\n", "utf-8");

  const graph = {
    nodes: entities.map(e => ({ id: e.id, type: e.type, status: e.status, summary: e.summary, src: e.source.path })),
    edges: relations.map(r => ({ from: r.from, rel: r.rel, to: r.to })),
    counts: { nodes: entities.length, edges: relations.length },
  };
  fs.writeFileSync(path.join(llmRoot, "graph.json"), JSON.stringify(graph, null, 2), "utf-8");
  fs.writeFileSync(path.join(llmRoot, "chain-map.json"), JSON.stringify({ chains }, null, 2), "utf-8");
  fs.writeFileSync(path.join(llmRoot, "command-map.json"), JSON.stringify({ commands }, null, 2), "utf-8");
  fs.writeFileSync(path.join(llmRoot, "skill-map.json"), JSON.stringify({ skills }, null, 2), "utf-8");

  const decLines: string[] = [];
  const decIndex = path.join(sddRoot, "decisions", "INDEX.sdd");
  if (fs.existsSync(decIndex)) {
    const c = fs.readFileSync(decIndex, "utf-8");
    const dm = c.matchAll(/DEC-[A-Z0-9-]+/g);
    for (const m of dm) {
      decLines.push(JSON.stringify({ id: m[0], source: "decisions/INDEX.sdd" }));
    }
  }
  fs.writeFileSync(path.join(llmRoot, "decisions.jsonl"), decLines.length ? decLines.join("\n") + "\n" : "", "utf-8");

  const taskLines: string[] = [];
  const projectsTaskIndex = path.join(sddRoot, "projects", "sddra", "tasks", "INDEX.sdd");
  if (fs.existsSync(projectsTaskIndex)) {
    const c = fs.readFileSync(projectsTaskIndex, "utf-8");
    const tm = c.matchAll(/TASK-[A-Z0-9-]+/g);
    for (const m of tm) {
      taskLines.push(JSON.stringify({ id: m[0], source: "projects/sddra/tasks/INDEX.sdd" }));
    }
  }
  fs.writeFileSync(path.join(llmRoot, "tasks.jsonl"), taskLines.length ? taskLines.join("\n") + "\n" : "", "utf-8");

  const contextPack = {
    generated: new Date().toISOString(),
    version: "1.0",
    llmEntry: ".sdd/llm/llms.txt",
    artifacts: {
      llms: ".sdd/llm/llms.txt",
      llmsFull: ".sdd/llm/llms-full.txt",
      graph: ".sdd/llm/graph.json",
      entities: ".sdd/llm/entities.jsonl",
      relations: ".sdd/llm/relations.jsonl",
      chainMap: ".sdd/llm/chain-map.json",
      commandMap: ".sdd/llm/command-map.json",
      skillMap: ".sdd/llm/skill-map.json",
      rules: ".sdd/llm/rules.json",
      chunksDir: ".sdd/llm/chunks/",
    },
    queries: {
      "sdd-plan-minimal-context": [".sdd/INDEX.sdd", ".sdd/PROJECT.sdd", ".sdd/protocol/ROOT.sdd", ".sdd/chains/graph.sdd", ".sdd/commands/INDEX.sdd"],
    },
    counts: {
      files: filesProcessed,
      entities: entities.length,
      relations: relations.length,
      chunks: chunks.length,
      commands: commands.length,
      skills: skills.length,
      rules: rules.length,
    },
  };
  fs.writeFileSync(path.join(llmRoot, "context-pack.json"), JSON.stringify(contextPack, null, 2), "utf-8");

  const coreFiles = [
    "INDEX.sdd",
    "PROJECT.sdd",
    "protocol/ROOT.sdd",
    "graph/model.sdd",
    "chains/graph.sdd",
    "chains/INDEX.sdd",
    "commands/INDEX.sdd",
  ];
  const fullParts: string[] = [];
  fullParts.push("# SDDRA - Full LLM Context");
  fullParts.push("");
  fullParts.push("> Auto-generated by /sdd-llm --export. Do not edit.");
  fullParts.push("");
  for (const cf of coreFiles) {
    const fp = path.join(sddRoot, cf);
    if (!fs.existsSync(fp)) continue;
    fullParts.push("---\n# FILE: .sdd/" + cf + "\n---");
    fullParts.push("");
    const c = fs.readFileSync(fp, "utf-8");
    fullParts.push(c);
    fullParts.push("");
  }
  fs.writeFileSync(path.join(llmRoot, "llms-full.txt"), fullParts.join("\n"), "utf-8");

  return { filesProcessed, chunks: chunks.length, entities: entities.length, relations: relations.length };
}
