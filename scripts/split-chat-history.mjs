#!/usr/bin/env node
// Splits chat_history.md into numbered files under prompt/{1..N}.md,
// using a long line of underscores as the delimiter.
//
// Usage: node scripts/split-chat-history.mjs [source-file] [output-dir]
// Defaults: source-file = ../chat_history.md, output-dir = ../prompt

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const sourceFile = resolve(projectRoot, process.argv[2] || "chat_history.md");
const outDir = resolve(projectRoot, process.argv[3] || "prompt");

const SEPARATOR_RE = /^_{20,}\s*$/;

function main() {
  const raw = readFileSync(sourceFile, "utf8");
  const lines = raw.split(/\r\n|\r|\n/);

  const chunks = [];
  let current = [];
  for (const line of lines) {
    if (SEPARATOR_RE.test(line)) {
      chunks.push(current.join("\n").trim());
      current = [];
    } else {
      current.push(line);
    }
  }
  chunks.push(current.join("\n").trim());

  mkdirSync(outDir, { recursive: true });

  // Clear out any previously generated numbered files (keeps old/ and new/ subfolders untouched).
  for (const entry of readdirSync(outDir, { withFileTypes: true })) {
    if (entry.isFile() && /^\d+\.md$/.test(entry.name)) {
      unlinkSync(join(outDir, entry.name));
    }
  }

  let written = 0;
  chunks.forEach((chunk, idx) => {
    const n = idx + 1;
    writeFileSync(join(outDir, `${n}.md`), chunk + "\n", "utf8");
    written++;
  });

  console.log(`Source: ${sourceFile}`);
  console.log(`Separators found: ${chunks.length - 1}`);
  console.log(`Chunks written: ${written} -> ${outDir}\\1.md .. ${written}.md`);
}

main();
