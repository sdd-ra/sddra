import fs from "fs";
import path from "path";
import { SddPattern, SddRuntimePatternSet, SddSecurityLevel, SddGateDecision, SddSkillPatternSet } from "./types";

interface SddNode {
  key: string;
  value: string | SddNode[] | string[];
  raw?: string;
}

class SddParseError extends Error {
  constructor(message: string, public line: number) {
    super(`${message} at line ${line}`);
  }
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
      if (!Array.isArray(parent.value)) {
        parent.value = [];
      }
      (parent.value as string[]).push(arrayValue);
      continue;
    }

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) {
      const parent = stack[stack.length - 1].node;
      if (!Array.isArray(parent.value)) {
        parent.value = [];
      }
      (parent.value as string[]).push(trimmed);
      continue;
    }

    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    const newNode: SddNode = { key, value };

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    if (!Array.isArray(parent.value)) {
      parent.value = [];
    }
    (parent.value as SddNode[]).push(newNode);
    stack.push({ node: newNode, indent });
  }

  return sentinel.value as SddNode[];
}

function findNode(nodes: SddNode[], key: string): SddNode | undefined {
  for (const node of nodes) {
    if (node.key === key) return node;
  }
  return undefined;
}

function findNested(nodes: SddNode[], ...keys: string[]): SddNode | undefined {
  let current: SddNode[] = nodes;
  for (const key of keys) {
    const found = findNode(current, key);
    if (!found) return undefined;
    if (keys.indexOf(key) === keys.length - 1) return found;
    if (Array.isArray(found.value)) {
      current = found.value as SddNode[];
    } else {
      return undefined;
    }
  }
  return undefined;
}

function extractPatterns(nodes: SddNode[]): SddPattern[] {
  const runtimeSet = findNested(nodes, "RuntimePatternSet");
  if (!runtimeSet || !Array.isArray(runtimeSet.value)) return [];

  const patternsSection = findNode(runtimeSet.value as SddNode[], "patterns");
  if (!patternsSection || !Array.isArray(patternsSection.value)) return [];

  const patterns: SddPattern[] = [];
  for (const node of patternsSection.value as SddNode[]) {
    if (!node.key.startsWith("PAT")) continue;

    const regexNode = findNode(node.value as SddNode[], "regex");
    const descNode = findNode(node.value as SddNode[], "description");
    const severityNode = findNode(node.value as SddNode[], "severity");
    const lLevelNode = findNode(node.value as SddNode[], "L_level");
    const reachNode = findNode(node.value as SddNode[], "reachability");
    const sdltNode = findNode(node.value as SddNode[], "sdlt_stage");
    const fixNode = findNode(node.value as SddNode[], "fix");

    if (!regexNode || typeof regexNode.value !== "string") continue;

    const rawReach = typeof reachNode?.value === "string" ? reachNode.value : "";
    const sdltStages: string[] = [];
    if (Array.isArray(sdltNode?.value)) {
      for (const v of sdltNode.value) {
        if (typeof v === "string") sdltStages.push(v);
      }
    }

    patterns.push({
      id: node.key,
      name: node.key,
      description: descNode && typeof descNode.value === "string" ? descNode.value : "",
      severity: severityNode && typeof severityNode.value === "string" ? severityNode.value : "MEDIUM",
      LLevel: lLevelNode && typeof lLevelNode.value === "string" ? parseInt(lLevelNode.value, 10) || 1 : 1,
      reachability: rawReach,
      sdltStage: sdltStages,
      fix: fixNode && typeof fixNode.value === "string" ? fixNode.value : "",
      regex: (regexNode.value as string).trim(),
    });
  }

  return patterns;
}

function extractSecurityLevels(nodes: SddNode[]): Map<number, SddSecurityLevel> {
  const levels = new Map<number, SddSecurityLevel>();
  const levelsSection = findNested(nodes, "Levels");
  if (!levelsSection || !Array.isArray(levelsSection.value)) return levels;

  for (const node of levelsSection.value as SddNode[]) {
    if (!node.key.startsWith("L")) continue;
    const levelNum = parseInt(node.key.replace("L", ""), 10);
    if (isNaN(levelNum)) continue;

    const descNode = findNode(node.value as SddNode[], "description");
    const runtimeNode = findNode(node.value as SddNode[], "RuntimePatterns");

    const runtimePatterns: string[] = [];
    if (runtimeNode) {
      if (Array.isArray(runtimeNode.value)) {
        for (const v of runtimeNode.value) {
          if (typeof v === "string") runtimePatterns.push(v.replace(/^- /, "").trim());
        }
      } else if (typeof runtimeNode.value === "string") {
        runtimePatterns.push(runtimeNode.value.trim());
      }
    }

    levels.set(levelNum, {
      name: node.key,
      description: descNode && typeof descNode.value === "string" ? descNode.value : "",
      runtimePatterns,
    });
  }

  return levels;
}

function extractGateDecisions(nodes: SddNode[]): SddGateDecision[] {
  const gateActions = findNested(nodes, "RuntimePatternSet", "Enforcement", "gate_actions");
  if (!gateActions || !Array.isArray(gateActions.value)) return [];

  const decisions: SddGateDecision[] = [];
  for (const node of gateActions.value as SddNode[]) {
    const action = typeof node.value === "string" ? node.value.toLowerCase() : "";
    let exitCode = 0;
    let obsEvent = "";
    if (action.includes("block")) {
      exitCode = 2;
      obsEvent = "OBS13 security_gate_blocked";
    } else if (action.includes("warn")) {
      exitCode = 0;
      obsEvent = "OBS12 security_gate_warned";
    } else if (action.includes("log")) {
      exitCode = 0;
      obsEvent = "OBS11 security_gate_logged";
    }
    decisions.push({
      decision: node.key,
      exitCode,
      obsEvent,
    });
  }

  return decisions;
}

function extractSkillPatternSets(nodes: SddNode[]): SddSkillPatternSet[] {
  const skillSetsSection = findNode(nodes, "SkillPatternSets");
  if (!skillSetsSection || !Array.isArray(skillSetsSection.value)) return [];

  const sets: SddSkillPatternSet[] = [];
  for (const setNode of skillSetsSection.value as SddNode[]) {
    const skillIdNode = findNode(setNode.value as SddNode[], "skill_id");
    const extNode = findNode(setNode.value as SddNode[], "file_extensions");
    const patternsNode = findNode(setNode.value as SddNode[], "patterns");

    if (!skillIdNode || typeof skillIdNode.value !== "string") continue;
    if (!extNode) continue;
    if (!patternsNode || !Array.isArray(patternsNode.value)) continue;

    const fileExtensions: string[] = [];
    if (Array.isArray(extNode.value)) {
      for (const v of extNode.value) {
        if (typeof v === "string") fileExtensions.push(v.replace(/^- /, "").trim());
      }
    } else if (typeof extNode.value === "string") {
      const parsed = extNode.value.replace(/[\[\]"]/g, "").split(",").map(s => s.trim()).filter(Boolean);
      fileExtensions.push(...parsed);
    }

    if (fileExtensions.length === 0) continue;

    const patterns: SddPattern[] = [];
    for (const node of patternsNode.value as SddNode[]) {
      if (!node.key.startsWith("PAT")) continue;

      const regexNode = findNode(node.value as SddNode[], "regex");
      const descNode = findNode(node.value as SddNode[], "description");
      const severityNode = findNode(node.value as SddNode[], "severity");
      const lLevelNode = findNode(node.value as SddNode[], "L_level");
      const reachNode = findNode(node.value as SddNode[], "reachability");
      const sdltNode = findNode(node.value as SddNode[], "sdlt_stage");
      const fixNode = findNode(node.value as SddNode[], "fix");

      if (!regexNode || typeof regexNode.value !== "string") continue;

      const rawReach = typeof reachNode?.value === "string" ? reachNode.value : "";
      const sdltStages: string[] = [];
      if (Array.isArray(sdltNode?.value)) {
        for (const v of sdltNode.value) {
          if (typeof v === "string") sdltStages.push(v);
        }
      }

      patterns.push({
        id: node.key,
        name: node.key,
        description: descNode && typeof descNode.value === "string" ? descNode.value : "",
        severity: severityNode && typeof severityNode.value === "string" ? severityNode.value : "MEDIUM",
        LLevel: lLevelNode && typeof lLevelNode.value === "string" ? parseInt(lLevelNode.value, 10) || 1 : 1,
        reachability: rawReach,
        sdltStage: sdltStages,
        fix: fixNode && typeof fixNode.value === "string" ? fixNode.value : "",
        regex: (regexNode.value as string).trim(),
      });
    }

    sets.push({ skillId: skillIdNode.value, fileExtensions, patterns });
  }

  return sets;
}

let cachedPatterns: SddPattern[] | null = null;
let cachedLevels: Map<number, SddSecurityLevel> | null = null;
let cachedDecisions: SddGateDecision[] | null = null;
let cachedSkillPatternSets: SddSkillPatternSet[] | null = null;

export function loadSecuritySpecs(sddRoot?: string): {
  patterns: SddPattern[];
  levels: Map<number, SddSecurityLevel>;
  decisions: SddGateDecision[];
  skillPatternSets: SddSkillPatternSet[];
} {
  if (cachedPatterns !== null && cachedLevels !== null && cachedDecisions !== null && cachedSkillPatternSets !== null) {
    return { patterns: cachedPatterns, levels: cachedLevels, decisions: cachedDecisions, skillPatternSets: cachedSkillPatternSets };
  }

  const root = sddRoot || path.join(__dirname, "..", ".sdd");

  const controlsPath = path.join(root, "security", "controls.sdd");
  const levelsPath = path.join(root, "security", "levels.sdd");

  if (!fs.existsSync(controlsPath)) {
    throw new Error(`Security controls not found: ${controlsPath}`);
  }
  if (!fs.existsSync(levelsPath)) {
    throw new Error(`Security levels not found: ${levelsPath}`);
  }

  const controlsContent = fs.readFileSync(controlsPath, "utf-8");
  const levelsContent = fs.readFileSync(levelsPath, "utf-8");

  const controlsNodes = parseSdd(controlsContent);
  const levelsNodes = parseSdd(levelsContent);

  cachedPatterns = extractPatterns(controlsNodes);
  cachedLevels = extractSecurityLevels(levelsNodes);
  cachedDecisions = extractGateDecisions(controlsNodes);
  cachedSkillPatternSets = extractSkillPatternSets(controlsNodes);

  return { patterns: cachedPatterns, levels: cachedLevels, decisions: cachedDecisions, skillPatternSets: cachedSkillPatternSets };
}

export function resetCache(): void {
  cachedPatterns = null;
  cachedLevels = null;
  cachedDecisions = null;
  cachedSkillPatternSets = null;
}

export function emitObsEvent(eventType: string, payload: Record<string, unknown>): void {
  const eventsPath = path.join(process.cwd(), ".sdd", "runtime", "events.sdd");
  const eventId = `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const timestamp = new Date().toISOString();

  const obsEvent = {
    id: eventId,
    type: eventType,
    timestamp,
    correlationId: payload.correlationId || eventId,
    causationId: payload.causationId,
    actor: "sdd-adapter",
    source: "sdd-adapter",
    payload,
  };

  if (fs.existsSync(eventsPath)) {
    const existing = fs.readFileSync(eventsPath, "utf-8");
    fs.writeFileSync(eventsPath, existing + "\n" + JSON.stringify(obsEvent) + "\n");
  }
}
