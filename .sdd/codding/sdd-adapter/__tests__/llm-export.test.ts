import fs from "fs";
import os from "os";
import path from "path";
import { runExport } from "../llm-export";

let passCount = 0;
let failCount = 0;

function assert(cond: boolean, msg: string): void {
  if (cond) { passCount++; console.log(`  PASS: ${msg}`); }
  else { failCount++; console.error(`  FAIL: ${msg}`); }
}

function mkWorkspace(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "llm-export-"));
  fs.mkdirSync(path.join(root, ".sdd", "commands"), { recursive: true });
  fs.mkdirSync(path.join(root, ".sdd", "chains"), { recursive: true });
  fs.writeFileSync(path.join(root, ".sdd", "INDEX.sdd"), "Index: SDD\n", "utf-8");
  fs.writeFileSync(path.join(root, ".sdd", "PROJECT.sdd"), "SDD: demo\nPurpose:\n  Demo project\n", "utf-8");
  fs.writeFileSync(path.join(root, ".sdd", "commands", "sdd-demo.sdd"), "# /sdd-demo\n\nPurpose:\n  Demo command\n\nRules:\n  [DEMO-01] must run\n", "utf-8");
  fs.writeFileSync(path.join(root, ".sdd", "chains", "graph.sdd"), "Chains: Graph\nPurpose:\n  chain graph\n", "utf-8");
  return root;
}

function cleanup(root: string): void {
  try { fs.rmSync(root, { recursive: true, force: true }); } catch (e) { /* ignore */ }
}

async function main(): Promise<void> {
  console.log("=== /llm-export Tests ===\n");

  console.log("Export produces valid artifacts:");
  const root = mkWorkspace();
  const r = runExport(path.join(root, ".sdd"), root);
  assert(r.filesProcessed >= 3, `processed >= 3 files: ${r.filesProcessed}`);
  assert(r.chunks > 0, `chunks emitted: ${r.chunks}`);
  assert(fs.existsSync(path.join(root, ".sdd", "llm", "llms.txt")), "llms.txt exists");
  assert(fs.existsSync(path.join(root, ".sdd", "llm", "README.md")), "README.md exists");
  const llms = fs.readFileSync(path.join(root, ".sdd", "llm", "llms.txt"), "utf-8");
  assert(llms.startsWith("#"), "llms.txt starts with H1");

  console.log("\nJSON/JSONL validity:");
  const graphPath = path.join(root, ".sdd", "llm", "graph.json");
  const graphRaw = fs.readFileSync(graphPath, "utf-8");
  let graph: any = null;
  try { graph = JSON.parse(graphRaw); assert(true, "graph.json valid JSON"); }
  catch (e) { assert(false, "graph.json invalid JSON"); }
  if (graph) {
    assert(Array.isArray(graph.nodes), "graph.nodes is array");
    assert(Array.isArray(graph.edges), "graph.edges is array");
  }

  const entitiesPath = path.join(root, ".sdd", "llm", "entities.jsonl");
  const entLines = fs.readFileSync(entitiesPath, "utf-8").trim().split(/\r?\n/).filter(Boolean);
  let allValid = entLines.length > 0;
  for (const ln of entLines) {
    try { JSON.parse(ln); } catch (e) { allValid = false; }
  }
  assert(allValid, `entities.jsonl all lines valid JSON (${entLines.length} lines)`);
  assert(entLines.length >= 3, `entities.jsonl has >=3 entries: ${entLines.length}`);

  const rulesRaw = fs.readFileSync(path.join(root, ".sdd", "llm", "rules.json"), "utf-8");
  let rules: any = null;
  try { rules = JSON.parse(rulesRaw); assert(true, "rules.json valid JSON"); }
  catch (e) { assert(false, "rules.json invalid JSON"); }
  if (Array.isArray(rules)) {
    assert(rules.some((x: any) => x.id === "DEMO-01"), "rules include DEMO-01");
  }

  const commandMapRaw = fs.readFileSync(path.join(root, ".sdd", "llm", "command-map.json"), "utf-8");
  let cmap: any = null;
  try { cmap = JSON.parse(commandMapRaw); assert(true, "command-map.json valid JSON"); }
  catch (e) { assert(false, "command-map.json invalid JSON"); }
  if (cmap && Array.isArray(cmap.commands)) {
    assert(cmap.commands.some((c: any) => c.name === "/sdd-demo"), "command map includes /sdd-demo");
  }

  console.log("\nChunks dir:");
  const chunksDir = path.join(root, ".sdd", "llm", "chunks");
  assert(fs.existsSync(chunksDir), "chunks dir exists");
  const chunkFiles = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".json"));
  assert(chunkFiles.length > 0, `chunk .json files emitted: ${chunkFiles.length}`);

  cleanup(root);

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
