import fs from "fs";
import os from "os";
import path from "path";
import { SkillImporter } from "../skill-importer";
import { SkillValidator } from "../skill-validator";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    passCount++;
    console.log(`  PASS: ${message}`);
  } else {
    failCount++;
    console.error(`  FAIL: ${message}`);
  }
}

const SKILL_CONTENT = `---
name: import-test-skill
description: A locally staged skill used to test the SkillImporter registration flow.
license: MIT
---

# Import Test Skill

Body content long enough to pass structure gates. This skill is
registered from local staged content, not fetched over the network.
`;

const BLOCKED_CONTENT = `---
name: gpl-import-test
description: A skill with a GPL license that must be blocked by the importer gates.
license: GPL-3.0
---

# GPL Import Test

Body content long enough to pass structure gates.
`;

async function main(): Promise<void> {
  console.log("=== Skill Importer Tests ===\n");

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-importer-"));
  const projectRoot = tmpRoot;
  const sddRoot = ".sdd";

  const importer = new SkillImporter({ sddRoot, projectRoot, importedDate: "2026-09-07" });

  console.log("registerLocalSkill (valid MIT):");
  const valid = importer.registerLocalSkill({
    name: "import-test-skill",
    repoUrl: "https://github.com/example/repo",
    content: SKILL_CONTENT,
    domain: "meta",
    group: "test-group",
    license: "MIT",
  });
  assert(valid.imported, `Imported: ${valid.message}`);
  assert(valid.validation.decision === "SHIP", `Decision SHIP: ${valid.validation.decision}`);

  const skillFile = path.join(tmpRoot, sddRoot, "skills", "meta", "imported", "test-group", "import-test-skill.md");
  assert(fs.existsSync(skillFile), `Skill file written: ${skillFile}`);
  assert(fs.readFileSync(skillFile, "utf-8") === SKILL_CONTENT, `Skill content preserved verbatim`);

  const wrapperFile = path.join(tmpRoot, sddRoot, "skills", "meta", "imported", "test-group", "INDEX.sdd");
  assert(fs.existsSync(wrapperFile), `Wrapper INDEX.sdd written`);
  const wrapper = fs.readFileSync(wrapperFile, "utf-8");
  assert(wrapper.includes("Source: https://github.com/example/repo"), `Wrapper has Source citation`);
  assert(wrapper.includes("Imported: 2026-09-07"), `Wrapper has Imported date`);
  assert(wrapper.includes("License: MIT"), `Wrapper has License`);
  assert(wrapper.includes("Format: anthropic-skill"), `Wrapper has Format`);

  console.log("\nregisterLocalSkill (second skill into same group):");
  const second = `---
name: second-test-skill
description: A second locally staged skill appended to the existing wrapper file.
license: MIT
---

# Second Test Skill

Body content long enough to pass structure gates for the second skill.
`;
  const valid2 = importer.registerLocalSkill({
    name: "second-test-skill",
    repoUrl: "https://github.com/example/repo",
    content: second,
    domain: "meta",
    group: "test-group",
    license: "MIT",
  });
  assert(valid2.imported, `Second skill imported: ${valid2.message}`);
  const wrapper2 = fs.readFileSync(wrapperFile, "utf-8");
  assert(wrapper2.includes("import-test-skill"), `Wrapper lists first skill`);
  assert(wrapper2.includes("second-test-skill"), `Wrapper lists second skill`);
  assert(wrapper2.includes("ReadOrder:"), `Wrapper structure intact after append`);

  console.log("\nregisterLocalSkill (GPL blocked):");
  const blocked = importer.registerLocalSkill({
    name: "gpl-import-test",
    repoUrl: "https://github.com/example/repo",
    content: BLOCKED_CONTENT,
    domain: "meta",
    group: "test-group",
    license: "GPL-3.0",
  });
  assert(!blocked.imported, `GPL import blocked: ${blocked.message}`);
  assert(blocked.validation.decision === "BLOCK", `Decision BLOCK: ${blocked.validation.decision}`);
  const blockedFile = path.join(tmpRoot, sddRoot, "skills", "meta", "imported", "test-group", "gpl-import-test.md");
  assert(!fs.existsSync(blockedFile), `Blocked skill NOT written to disk`);

  console.log("\nWrapper validated by SkillValidator:");
  const validator = new SkillValidator();
  const fileValidation = validator.validateFile(wrapperFile);
  assert(fileValidation.valid, `Wrapper passes validateFile: decision=${fileValidation.decision}`);
  assert(
    !fileValidation.findings.some(f => f.message.includes("not a GitHub")),
    `Source URL extracted from wrapper (no provenance warning)`
  );

  console.log("\ntoRawUrl via importSkill error path (non-GitHub):");
  try {
    await importer.importSkill({
      name: "fail-skill",
      repoUrl: "https://gitlab.com/example/repo",
      skillPath: "skills/fail-skill/SKILL.md",
      domain: "meta",
      group: "fail",
      license: "MIT",
    });
    assert(false, `Non-GitHub URL should throw`);
  } catch (error) {
    assert((error as Error).message.includes("Not a GitHub repository"), `Throws for non-GitHub URL: ${(error as Error).message}`);
  }

  fs.rmSync(tmpRoot, { recursive: true, force: true });

  console.log("\n=== Results ===");
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) {
    process.exit(1);
  }
}

main();
