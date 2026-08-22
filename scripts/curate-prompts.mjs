#!/usr/bin/env node
// Curates the numbered chunks produced by split-chat-history.mjs:
//   - moves ALL original prompt/{1..N}.md files into prompt/old/ (untouched, original numbering)
//   - copies only the "real" chunks (i.e. not just the literal text "next")
//     into prompt/new/, renumbered sequentially in original order
//
// Usage: node scripts/curate-prompts.mjs [prompt-dir]

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, renameSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const promptDir = resolve(projectRoot, process.argv[2] || "prompt");
const oldDir = join(promptDir, "old");
const newDir = join(promptDir, "new");

function main() {
  const files = readdirSync(promptDir, { withFileTypes: true })
    .filter((e) => e.isFile() && /^\d+\.md$/.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  if (files.length === 0) {
    console.log(`No {N}.md files found in ${promptDir}. Nothing to curate.`);
    return;
  }

  mkdirSync(oldDir, { recursive: true });
  mkdirSync(newDir, { recursive: true });

  let realIdx = 0;
  let junkCount = 0;

  for (const name of files) {
    const srcPath = join(promptDir, name);
    const content = readFileSync(srcPath, "utf8");
    const isJunk = content.trim() === "next";

    if (!isJunk) {
      realIdx++;
      writeFileSync(join(newDir, `${realIdx}.md`), content, "utf8");
    } else {
      junkCount++;
    }

    // Move original file into old/ (preserves original numbering as the archive).
    renameSync(srcPath, join(oldDir, name));
  }

  console.log(`Archived: ${files.length} files -> ${oldDir}`);
  console.log(`Curated:  ${realIdx} real files -> ${newDir}\\1.md .. ${realIdx}.md`);
  console.log(`Skipped:  ${junkCount} "next"-only junk chunks`);
}

main();
