import { SkillAutoInvoker } from "../skill-auto-invoker";

const invoker = new SkillAutoInvoker();

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  PASS: ${message}`);
  } else {
    console.error(`  FAIL: ${message}`);
    process.exitCode = 1;
  }
}

async function main() {
  console.log("=== Skill Auto-Invoker Tests ===\n");

  const frontendContext = invoker.detectContext("Build a React component for the frontend UI");
  assert(frontendContext.domain === "FrontEnd", "frontend task detected as FrontEnd domain");
  assert(frontendContext.autoInvoked === true, "frontend task triggers auto-invoke");
  assert(frontendContext.suggestedSkills.includes("visual-design"), "frontend suggests visual-design");
  assert(frontendContext.suggestedSkills.includes("design-system"), "frontend suggests design-system");
  assert(frontendContext.suggestedSkills.includes("accessibility"), "frontend suggests accessibility");

  const mobileContext = invoker.detectContext("Design mobile screen for iOS accessibility");
  assert(mobileContext.domain === "Mobile", "mobile task detected as Mobile domain");
  assert(mobileContext.autoInvoked === true, "mobile task triggers auto-invoke");
  assert(mobileContext.suggestedSkills.includes("ux-patterns"), "mobile suggests ux-patterns");

  const designContext = invoker.detectContext("Run design taste evaluation and heuristics review");
  assert(designContext.domain === "Design", "design task detected as Design domain");
  assert(designContext.suggestedSkills.includes("taste-evaluation"), "design suggests taste-evaluation");
  assert(designContext.suggestedSkills.includes("design-heuristics"), "design suggests design-heuristics");
  assert(designContext.suggestedSkills.includes("design-review"), "design suggests design-review");

  const backendContext = invoker.detectContext("Implement backend API endpoint");
  assert(backendContext.domain === "Backend", "backend task detected as Backend domain");
  assert(backendContext.autoInvoked === false, "backend task does not trigger auto-invoke");

  const shouldInvoke = invoker.shouldInvokeDesign("Build a React component for the frontend UI with accessibility");
  assert(shouldInvoke === true, "shouldInvokeDesign returns true for frontend task");

  const shouldNotInvoke = invoker.shouldInvokeDesign("Run database migration");
  assert(shouldNotInvoke === false, "shouldInvokeDesign returns false for database task");

  const suggested = invoker.getSuggestedSkills(frontendContext);
  assert(Array.isArray(suggested), "getSuggestedSkills returns array");
  assert(suggested.length > 0, "getSuggestedSkills returns non-empty for frontend");

  const invokeResult = await invoker.invoke("visual-design", frontendContext);
  assert(invokeResult.invoked === true, "invoke returns invoked=true for matching skill");
  assert(invokeResult.skills.includes("visual-design"), "invoke includes requested skill");
  assert(typeof invokeResult.confidence === "number", "invoke returns confidence number");
  assert(invokeResult.confidence > 0, "invoke returns positive confidence");

  console.log("\n=== Skill Auto-Invoker Tests Complete ===");
}

main();
