import { PatternsRuntime } from "../security/patterns-runtime";

const runtime = new PatternsRuntime();

const insecureCode = `
import yaml
yaml.load(user_input)

import pickle
pickle.loads(data)

eval(user_code)

import subprocess
subprocess.run(cmd, shell=True)

element.innerHTML = userContent

query = "SELECT * FROM users WHERE id = " + user_id

api_key = "1234567890abcdef"
password = "supersecret123"
token = "abc123def456"

import random
random.random()

import hashlib
hashlib.md5(data)

import os
os.system("rm -rf /")

import requests
requests.get("http://" + user_input)

redirect(request.GET.get("url"))

with open("../../etc/passwd") as f:
    data = f.read()

Access-Control-Allow-Origin: *

def login(request):
    return "ok"

app.post("/admin", handler)
`;

const safeCode = `
import yaml
yaml.safe_load(config)

import json
json.loads(data)

result = ast.literal_eval(expr)

import subprocess
subprocess.run(["ls", user_dir])

textContent = userContent

query = "SELECT * FROM users WHERE id = ?"
cursor.execute(query, (user_id,))

api_key = os.environ.get("API_KEY")

import secrets
token = secrets.token_hex(16)

import hashlib
hashlib.sha256(data)

import requests
requests.get("https://api.example.com/data")

return redirect(url_for("safe_route"))

from pathlib import Path
safe_path = Path("/safe/dir").joinpath(user_input)
if str(safe_path).startswith("/safe/dir"):
    with open(safe_path) as f:
        data = f.read()

CORS = {
    "Access-Control-Allow-Origin": "https://trusted.example.com"
}

def process_request(request):
    return "ok"
`;

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

console.log("=== Patterns Runtime Tests ===\n");

console.log("Testing insecure code detection:");
const insecureFindings = runtime.scan(insecureCode);
assert(insecureFindings.length > 0, `Found ${insecureFindings.length} patterns in insecure code`);
assert(insecureFindings.some(f => f.patternId === "PAT.yaml_load"), "Detects unsafe yaml.load");
assert(insecureFindings.some(f => f.patternId === "PAT.pickle_loads"), "Detects unsafe pickle.loads");
assert(insecureFindings.some(f => f.patternId === "PAT.eval_exec"), "Detects eval/exec");
assert(insecureFindings.some(f => f.patternId === "PAT.shell_true"), "Detects shell=True");
assert(insecureFindings.some(f => f.patternId === "PAT.innerHTML"), "Detects innerHTML");
assert(insecureFindings.some(f => f.patternId === "PAT_hardcoded_secret"), "Detects hardcoded secrets");
assert(insecureFindings.some(f => f.patternId === "PAT_weak_crypto"), "Detects weak crypto");
assert(insecureFindings.some(f => f.patternId === "PAT_path_traversal"), "Detects path traversal");
assert(insecureFindings.some(f => f.patternId === "PAT_cors_wildcard"), "Detects CORS wildcard");
assert(insecureFindings.some(f => f.patternId === "PAT_missing_auth"), "Detects missing auth");

console.log("\nTesting safe code (no false positives for matched patterns):");
const safeFindings = runtime.scan(safeCode);
console.log("Safe code findings:", safeFindings.map(f => `${f.patternId}(${f.severity})`));
assert(safeFindings.length <= 3, `Safe code has minimal findings: ${safeFindings.length}`);

console.log("\nTesting evaluation:");
const blockResult = runtime.evaluate(insecureFindings, 2);
assert(blockResult.decision === "BLOCK", `Insecure code blocks: ${blockResult.decision}`);
assert(blockResult.exitCode === 2, `Insecure code exit code: ${blockResult.exitCode}`);

const passResult = runtime.evaluate(safeFindings, 2);
assert(passResult.decision === "PASS", `Safe code passes: ${passResult.decision}`);
assert(passResult.exitCode === 0, `Safe code exit code: ${passResult.exitCode}`);

console.log("\n=== Results ===");
console.log(`Passed: ${passCount}, Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
}
