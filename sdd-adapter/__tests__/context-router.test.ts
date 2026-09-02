import { ContextRouter } from "../context-router";

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

function run() {
  console.log("\n=== ContextRouter Tests ===");

  const routes = ContextRouter.route("implement refund endpoint");
  assert(routes.includes("BACKEND"), "routes backend intent to BACKEND");
  assert(routes.includes("DOMAIN"), "routes backend intent to DOMAIN");

  const dbRoutes = ContextRouter.route("design database schema for users");
  assert(dbRoutes.includes("DATABASE"), "routes database intent to DATABASE");

  const apiRoutes = ContextRouter.route("create REST API contract");
  assert(apiRoutes.includes("API"), "routes api intent to API");

  const secRoutes = ContextRouter.route("audit authentication policy");
  assert(secRoutes.includes("SECURITY"), "routes security intent to SECURITY");

  const domainRoutes = ContextRouter.getDomainRoutes("BACKEND");
  assert(domainRoutes.includes("BACKEND"), "getDomainRoutes returns BACKEND");
  assert(domainRoutes.includes("DOMAIN"), "getDomainRoutes returns DOMAIN");

  const backendRoutes = ContextRouter.route("implement payment service");
  assert(ContextRouter.isExcluded("@skill.frontend", backendRoutes), "excludes frontend for backend task");
  assert(!ContextRouter.isExcluded("@skill.repository", backendRoutes), "keeps repository for backend task");

  console.log(`\nResults: Passed=${passCount}, Failed=${failCount}`);
  if (failCount > 0) process.exit(1);
}

run();
