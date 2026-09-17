const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const OUTPUT_DIR = path.join(__dirname, "output");
const TIMESTAMP = new Date().toISOString();

function generateArtifact(type, platform) {
  const content = JSON.stringify({
    artifact: `${type}.${platform}`,
    platform,
    buildType: type,
    timestamp: TIMESTAMP,
    size: Math.floor(Math.random() * 50000000) + 1000000,
    checksum: crypto.randomBytes(16).toString("hex"),
    status: "MOCK BUILD",
    note: "This is a simulation artifact generated inside Docker container per R102. Not a real binary.",
  }, null, 2);
  return content;
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const buildReport = {
    buildId: `mobile-${Date.now()}`,
    timestamp: TIMESTAMP,
    framework: process.env.MOBILE_FRAMEWORK || "react-native",
    status: "COMPLETED",
    artifacts: [],
  };

  const artifacts = [
    { file: "app.android.apk", content: generateArtifact("app", "android") },
    { file: "app.ios.ipa", content: generateArtifact("app", "ios") },
    { file: "bundle.android.jsbundle", content: generateArtifact("bundle", "android") },
    { file: "bundle.ios.jsbundle", content: generateArtifact("bundle", "ios") },
    { file: "assets.zip", content: generateArtifact("assets", "shared") },
  ];

  for (const artifact of artifacts) {
    const artifactPath = path.join(OUTPUT_DIR, artifact.file);
    fs.writeFileSync(artifactPath, artifact.content, "utf-8");
    buildReport.artifacts.push({
      name: artifact.file,
      path: artifactPath,
      size: fs.statSync(artifactPath).size,
    });
  }

  const buildReportPath = path.join(OUTPUT_DIR, "build-report.json");
  fs.writeFileSync(buildReportPath, JSON.stringify(buildReport, null, 2), "utf-8");

  const summary = [
    "MOBILE BUILD COMPLETE (SIMULATION)",
    "",
    `Build ID: ${buildReport.buildId}`,
    `Framework: ${buildReport.framework}`,
    `Status: ${buildReport.status}`,
    `Artifacts: ${buildReport.artifacts.length}`,
    `Output: ${OUTPUT_DIR}`,
    "",
    "NOTE: This is a SIMULATED mobile build (R102 — Docker only).",
    "Real builds require Android Studio (Android) / Xcode (iOS).",
    "Use this to validate SDDRA chain execution, not for production builds.",
  ].join("\n");

  fs.writeFileSync(path.join(OUTPUT_DIR, "summary.txt"), summary, "utf-8");

  console.log(summary);
}

main();
