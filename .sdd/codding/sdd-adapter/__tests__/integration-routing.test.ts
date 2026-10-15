import { IntegrationRouter, Channel, Backend, ProbeStatus } from "../integration-routing";

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

function backend(name: string, status: ProbeStatus): Backend {
  return { name, probe: async () => status };
}

function backendSequence(name: string, statuses: ProbeStatus[]): Backend {
  let i = 0;
  return {
    name,
    probe: async () => {
      const s = statuses[Math.min(i, statuses.length - 1)];
      i++;
      return s;
    },
  };
}

async function main(): Promise<void> {
  console.log("=== Integration Routing Tests ===\n");

  console.log("Ordered backends + probe-based active_backend ([IR-01][IR-02]):");
  const router = new IntegrationRouter();
  const channel: Channel = {
    id: "browser-automation",
    tier: 1,
    backends: [backend("playwright", "error"), backend("puppeteer", "ok")],
  };
  const row = await router.probeChannel(channel);
  assert(row.status === "healthy", "channel healthy via fallback");
  assert((row as { active_backend: string }).active_backend === "puppeteer", "second backend wins after first errored [IR-09]");

  console.log("\nSwitch logging ([IR-03]):");
  const switches = router.switches();
  assert(switches.length === 1, "initial selection logged");
  assert(switches[0].to_backend === "puppeteer", "switch event names backend");

  console.log("\nTransient retry ([IR-05]):");
  const router2 = new IntegrationRouter();
  const flaky: Channel = {
    id: "flaky-channel",
    tier: 0,
    backends: [backendSequence("flaky", ["timeout", "error", "ok"])],
  };
  const flakyRow = await router2.probeChannel(flaky);
  assert(flakyRow.status === "healthy", "transient failures retried to ok");

  console.log("\nMissing/broken never heal ([IR-05]):");
  const router3 = new IntegrationRouter();
  const missing: Channel = {
    id: "missing-channel",
    tier: 0,
    backends: [backend("absent", "missing")],
  };
  const missingRow = await router3.probeChannel(missing);
  assert(missingRow.status === "unavailable", "missing backend => unavailable");

  console.log("\nUser override reorder ([IR-04]):");
  const ch: Channel = {
    id: "docs",
    tier: 0,
    backends: [backend("context7", "ok"), backend("filesystem", "ok")],
  };
  const overridden = IntegrationRouter.applyOverride(ch, "filesystem");
  assert(overridden.backends[0].name === "filesystem", "override moves backend to front");
  const unknown = IntegrationRouter.applyOverride(ch, "does-not-exist");
  assert(unknown.backends[0].name === "context7", "unknown override ignored - order intact");

  console.log("\nPer-channel degradation ([IR-06]):");
  const router4 = new IntegrationRouter();
  const report = await router4.healthReport([
    { id: "good", tier: 0, backends: [backend("a", "ok")] },
    { id: "bad", tier: 2, backends: [backend("b", "broken")] },
    { id: "empty", tier: 1, backends: [] },
  ]);
  assert(report.length === 3, "whole report survives a bad channel");
  assert(report.find((r) => r.channel === "good")?.status === "healthy", "good channel healthy");
  assert(report.find((r) => r.channel === "bad")?.status === "unavailable", "bad channel degrades to own row");
  assert(report.find((r) => r.channel === "empty")?.status === "unprobed", "unprobed distinguished from unavailable [IR-02]");

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
