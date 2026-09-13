const fs = require('fs');
const path = require('path');

const claudeRoot = path.resolve('.claude/docs');
const sddRoot = path.resolve('.sdd/docs');

function getAllFiles(dir, extList) {
  const results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...getAllFiles(full, extList));
    } else if (extList.some(ext => item.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function getIndexes(dir) {
  return getAllFiles(dir, ['.md']).filter(f => f.endsWith('INDEX.md'));
}

function extractLinks(content) {
  const matches = content.match(/\[.*?\]\((.*?)\)/g) || [];
  return matches.map(m => {
    const inner = m.match(/\]\((.*?)\)/);
    return inner ? inner[1] : null;
  }).filter(Boolean);
}

function checkMarkers(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const starts = (content.match(/<!-- \[APPEND:[^\]]+\] -->/g) || []).length;
  const ends = (content.match(/<!-- \[END:APPEND:[^\]]+\] -->/g) || []).length;
  return { starts, ends, balanced: starts === ends };
}

function validate(root, label) {
  console.log(`\n=== ${label} ===`);
  const indexes = getIndexes(root);
  const docs = getAllFiles(root, ['.md', '.tsv', '.sdd']);
  const mdFiles = getAllFiles(root, ['.md']);

  console.log(`INDEX files: ${indexes.length}`);
  console.log(`Total docs: ${docs.length}`);
  console.log(`MD files: ${mdFiles.length}`);

  // Check each doc is in at least one INDEX (excluding master INDEX cross-refs and README)
  const indexedByCategory = {};
  const masterIndexes = [];
  
  for (const idx of indexes) {
    const rel = path.relative(root, idx);
    if (rel.replace(/\\/g, '/') === 'INDEX.md') {
      masterIndexes.push(idx);
      continue;
    }
    const content = fs.readFileSync(idx, 'utf8');
    const links = extractLinks(content);
    for (const link of links) {
      const idxDir = path.dirname(idx);
      const fullPath = path.resolve(idxDir, link);
      if (!indexedByCategory[fullPath]) {
        indexedByCategory[fullPath] = [];
      }
      indexedByCategory[fullPath].push(idx);
    }
  }

  let orphanCount = 0;
  for (const doc of docs) {
    const rel = path.relative(root, doc);
    if (!indexedByCategory[doc] && !rel.endsWith('INDEX.md') && !rel.endsWith('README.md')) {
      console.log(`  ORPHAN: ${rel.replace(/\\/g, '/')}`);
      orphanCount++;
    }
  }

  // Check append markers
  let markerIssues = 0;
  for (const md of mdFiles) {
    const markers = checkMarkers(md);
    if (!markers.balanced) {
      console.log(`  MARKER MISMATCH: ${path.relative(root, md).replace(/\\/g, '/')} (${markers.starts} starts, ${markers.ends} ends)`);
      markerIssues++;
    }
  }

  console.log(`  Orphans: ${orphanCount}, Marker issues: ${markerIssues}`);
}

validate(claudeRoot, '.claude/docs');
validate(sddRoot, '.sdd/docs');

console.log('\n=== Validation Complete ===');
