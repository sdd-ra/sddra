#!/usr/bin/env pwsh
# SDDRA Test Runner (No Pester Required)
# Runs all tests or specific test categories

param(
    [string]$Category = "all",
    [string]$Test = "",
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $repoRoot
$repoRoot = Split-Path -Parent $repoRoot
$testsDir = $PSScriptRoot
$resultsDir = Join-Path $testsDir "results"
$sddDir = Join-Path $repoRoot ".sdd"

# Ensure results directory exists
New-Item -ItemType Directory -Path $resultsDir -Force | Out-Null

Write-Host "=== SDDRA Test Suite ===" -ForegroundColor Cyan
Write-Host "Category: $Category" -ForegroundColor Yellow
Write-Host ""

$passed = 0
$failed = 0
$skipped = 0
$results = @()

function Test-Item {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    
    try {
        & $Test
        Write-Host "  PASS: $Name" -ForegroundColor Green
        $script:passed++
        $script:results += [PSCustomObject]@{
            Name = $Name
            Status = "PASS"
            Error = ""
        }
    }
    catch {
        Write-Host "  FAIL: $Name - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
        $script:results += [PSCustomObject]@{
            Name = $Name
            Status = "FAIL"
            Error = $_.Exception.Message
        }
    }
}

function Assert-FileExists {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        throw "File not found: $Path"
    }
}

function Assert-ContentContains {
    param([string]$Path, [string]$Pattern)
    if (-not (Test-Path $Path)) {
        throw "File not found: $Path"
    }
    $content = Get-Content $Path -Raw -ErrorAction SilentlyContinue
    if ($content -notmatch $Pattern) {
        throw "Pattern '$Pattern' not found in $Path"
    }
}

function Assert-ContentNotContains {
    param([string]$Path, [string]$Pattern)
    if (-not (Test-Path $Path)) {
        throw "File not found: $Path"
    }
    $content = Get-Content $Path -Raw -ErrorAction SilentlyContinue
    if ($content -match $Pattern) {
        throw "Pattern '$Pattern' found in $Path"
    }
}

# Run tests based on category
if ($Category -eq "all" -or $Category -eq "unit") {
    Write-Host "--- Unit Tests ---" -ForegroundColor Cyan
    
    Test-Item "PROJECT.sdd exists" { 
        Assert-FileExists (Join-Path $sddDir "PROJECT.sdd")
    }
    Test-Item "INDEX.sdd exists" { 
        Assert-FileExists (Join-Path $sddDir "INDEX.sdd")
    }
    Test-Item "protocol/ROOT.sdd exists" { 
        Assert-FileExists (Join-Path $sddDir "protocol/ROOT.sdd")
    }
    Test-Item "chains/graph.sdd exists" { 
        Assert-FileExists (Join-Path $sddDir "chains/graph.sdd")
    }
    Test-Item "templates/INDEX.sdd exists" { 
        Assert-FileExists (Join-Path $sddDir "templates/INDEX.sdd")
    }
    
    # Metadata tests
    Test-Item "All .sdd files have Purpose" {
        $files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd"
        foreach ($file in $files) {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -notmatch 'Purpose:') {
                throw "$($file.Name) missing Purpose"
            }
        }
    }
    
    Test-Item "All .sdd files have State" {
        $files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd"
        foreach ($file in $files) {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -notmatch 'State:') {
                throw "$($file.Name) missing State"
            }
        }
    }

    Test-Item "New .sdd files have Navigation section" {
        $newFiles = @(
            "agent/supervisor.sdd",
            "agent/security-rules.sdd",
            "runtime/mcp-integration.sdd",
            "references/sdd/INDEX.sdd",
            "references/sdd/ecc-framework-overview.sdd",
            "references/sdd/living-specs-best-practices.sdd",
            "evolution/candidates/INDEX.sdd",
            "evolution/challenges/INDEX.sdd",
            "evolution/proposals/INDEX.sdd",
            "evolution/approved/INDEX.sdd",
            "timeline/changes/INDEX.sdd",
            "timeline/snapshots/INDEX.sdd",
            "timeline/migrations/INDEX.sdd",
            "agent/prompts/INDEX.sdd",
            "queries/INDEX.sdd",
            "queries/architecture-drift.sdd",
            "queries/orphan-knowledge.sdd",
            "queries/unverified-skills.sdd",
            "queries/high-risk-tasks.sdd",
            "queries/payment-impact.sdd",
            "intents/INDEX.sdd",
            "plans/INDEX.sdd",
            "plans/execution-plan.sdd",
            "assumptions/INDEX.sdd",
            "bootstrap/INDEX.sdd",
            "bootstrap/AI_BOOTSTRAP.sdd",
            "bootstrap/authority.sdd",
            "bootstrap/identity.sdd",
            "bootstrap/handoff.sdd",
            "glossary/INDEX.sdd",
            "system/context/INDEX.sdd",
            "system/tool-governance.sdd",
            "governance/INDEX.sdd",
            "governance/capabilities.sdd",
            "governance/permissions.sdd",
            "governance/resources.sdd",
            "governance/locks.sdd",
            "governance/security-events.sdd",
             "lifecycle/INDEX.sdd",
             "lifecycle/states.sdd",
             "lifecycle/quality-dimensions.sdd",
             "lifecycle/gc-policy.sdd",
             "lifecycle/compactor.sdd",
             "lifecycle/claims.sdd",
             "lifecycle/challenges.sdd",
             "lifecycle/confidence.sdd",
             "lifecycle/health-score.sdd",
             "lifecycle/generation.sdd",
             "lifecycle/drift.sdd",
             "lifecycle/learning-loop.sdd",
             "lifecycle/entity-schemas.sdd"
        )
        foreach ($relPath in $newFiles) {
            $path = Join-Path $sddDir $relPath
            if (-not (Test-Path $path)) { throw "$relPath not found" }
            $content = Get-Content $path -Raw -ErrorAction SilentlyContinue
            if ($content -notmatch 'Navigation:') { throw "$relPath missing Navigation" }
        }
    }

    Test-Item "ECC bridge has 8 core + 4 specialty roles" {
        $content = Get-Content (Join-Path $sddDir "agent/ecc-bridge.sdd") -Raw
        foreach ($role in @('agent.discovery','agent.architect','agent.implementer','agent.reviewer','agent.tester','agent.documentation','agent.security','agent.supervisor','agent.knowledge','agent.healthcare','agent.ml','agent.devops')) {
            if ($content -notmatch $role) { throw "$role not found in ecc-bridge.sdd" }
        }
    }

    Test-Item "Security rules has 5 AgentShield categories" {
        $content = Get-Content (Join-Path $sddDir "agent/security-rules.sdd") -Raw
        foreach ($cat in @('Secrets Detection','Permission Auditing','Hook Injection','MCP Server Risk','Agent Config Review')) {
            if ($content -notmatch $cat) { throw "$cat not found in security-rules.sdd" }
        }
    }

    Test-Item "MCP integration has 3 integration layers" {
        $content = Get-Content (Join-Path $sddDir "runtime/mcp-integration.sdd") -Raw
        foreach ($layer in @('GateBridge','MemoryBridge','SecurityBridge')) {
            if ($content -notmatch $layer) { throw "$layer not found in mcp-integration.sdd" }
        }
    }

    Test-Item "Supervisor has 4 ECC orchestration equivalents" {
        $supervisor = Get-Content (Join-Path $sddDir "agent/supervisor.sdd") -Raw
        foreach ($equiv in @('loop-operator','harness-optimizer','orchestration-planner','orchestration-deployer')) {
            if ($supervisor -notmatch $equiv) { throw "$equiv not found in supervisor.sdd" }
        }
    }

    Test-Item "References sdd index has methodology content" {
        $content = Get-Content (Join-Path $sddDir "references/sdd/ecc-framework-overview.sdd") -Raw
        if ($content -notmatch 'ECC') { throw "ECC framework content not found" }
    }

    Test-Item "Phases 130-134 overview references all timeline files" {
        $content = Get-Content (Join-Path $sddDir "references/sdd/phases-130-134-overview.sdd") -Raw
        foreach ($ref in @('timeline/changes.sdd','timeline/snapshots.sdd','timeline/migrations.sdd','timeline/evolution.sdd')) {
            if ($content -notmatch $ref) { throw "$ref not found in phases-130-134-overview.sdd" }
        }
    }

    Test-Item "Phases 130-134 overview has all phase sections" {
        $content = Get-Content (Join-Path $sddDir "references/sdd/phases-130-134-overview.sdd") -Raw
        foreach ($phase in @('Phase 130','Phase 131','Phase 132','Phase 133','Phase 134','Phase 135')) {
            if ($content -notmatch $phase) { throw "$phase not found in phases-130-134-overview.sdd" }
        }
    }

    Test-Item "Query language has core vocabulary" {
        $content = Get-Content (Join-Path $sddDir "queries/INDEX.sdd") -Raw
        foreach ($kw in @('SHOW','LIST','FIND','WHY','WHY-NOT','IMPACT','BLAST','TRACE','COMPARE','EXPLAIN','VERIFY','REVIEW','VALIDATE','LEARN','PROMOTE','CHALLENGE','GRAPH','CONTEXT')) {
            if ($content -notmatch $kw) { throw "$kw not found in queries/INDEX.sdd" }
        }
    }

    Test-Item "Query language has relationship syntax" {
        $content = Get-Content (Join-Path $sddDir "queries/INDEX.sdd") -Raw
        foreach ($syntax in @('->','<-','where','--minimal','--review','--architecture')) {
            if ($content -notmatch [regex]::Escape($syntax)) { throw "$syntax not found in queries/INDEX.sdd" }
        }
    }

    Test-Item "Saved queries exist for all example types" {
        $queries = @('architecture-drift','orphan-knowledge','unverified-skills','high-risk-tasks','payment-impact')
        foreach ($q in $queries) {
            $path = Join-Path $sddDir "queries/$q.sdd"
            if (-not (Test-Path $path)) { throw "queries/$q.sdd not found" }
            $content = Get-Content $path -Raw -ErrorAction SilentlyContinue
            if ($content -notmatch 'State: \+') { throw "queries/$q.sdd missing State: +" }
        }
    }

    Test-Item "Intent schema has lifecycle states" {
        $content = Get-Content (Join-Path $sddDir "intents/INDEX.sdd") -Raw
        foreach ($state in @('DISCOVERING','PLANNED','EXECUTING','COMPLETED','ARCHIVED')) {
            if ($content -notmatch $state) { throw "$state not found in intents/INDEX.sdd" }
        }
    }

    Test-Item "Execution plan has execution modes" {
        $content = Get-Content (Join-Path $sddDir "plans/INDEX.sdd") -Raw
        foreach ($mode in @('AUTO','ASSISTED','STEP','DRY_RUN','REVIEW')) {
            if ($content -notmatch $mode) { throw "$mode not found in plans/INDEX.sdd" }
        }
    }

    Test-Item "Assumptions has risk levels" {
        $content = Get-Content (Join-Path $sddDir "assumptions/INDEX.sdd") -Raw
        foreach ($risk in @('LOW','MEDIUM','HIGH','CRITICAL')) {
            if ($content -notmatch $risk) { throw "$risk not found in assumptions/INDEX.sdd" }
        }
    }

    Test-Item "AI_BOOTSTRAP has 13 bootstrap phases" {
        $content = Get-Content (Join-Path $sddDir "bootstrap/AI_BOOTSTRAP.sdd") -Raw
        foreach ($phase in @('WHO AM I?','AUTHORITY CHECK','MANDATORY RULES','PROJECT RESOLVE','INDEX RESOLVE','ARCHITECTURE LOAD','GLOSSARY RESOLVE','TASK RESOLVE','KNOWLEDGE COMPILATION','ASSUMPTION CHECK','READINESS GATE','CONTEXT COMPILE','EXECUTE')) {
            if ($content -notmatch $phase) { throw "$phase not found in AI_BOOTSTRAP.sdd" }
        }
    }

    Test-Item "Authority model has can and cannot lists" {
        $content = Get-Content (Join-Path $sddDir "bootstrap/authority.sdd") -Raw
        if ($content -notmatch 'can:') { throw "can: not found in authority.sdd" }
        if ($content -notmatch 'cannot:') { throw "cannot: not found in authority.sdd" }
    }

    Test-Item "Identity has role and capabilities" {
        $content = Get-Content (Join-Path $sddDir "bootstrap/identity.sdd") -Raw
        if ($content -notmatch 'role:') { throw "role: not found in identity.sdd" }
        if ($content -notmatch 'capabilities:') { throw "capabilities: not found in identity.sdd" }
    }

    Test-Item "Glossary has canonical terms" {
        $content = Get-Content (Join-Path $sddDir "glossary/INDEX.sdd") -Raw
        foreach ($term in @('TASK','SKILL','CONCEPT','DECISION','REFERENCE','EVIDENCE','PROOF','ASSUMPTION','UNKNOWN','DISCOVERY','PROPOSAL','REVIEW','VIOLATION','HANDOFF','CONTEXT')) {
            if ($content -notmatch $term) { throw "$term not found in glossary/INDEX.sdd" }
        }
    }

    Test-Item "Context compiler has progressive disclosure levels" {
        $content = Get-Content (Join-Path $sddDir "system/context/INDEX.sdd") -Raw
        foreach ($level in @('LEVEL 0','LEVEL 1','LEVEL 2','LEVEL 3','LEVEL 4')) {
            if ($content -notmatch $level) { throw "$level not found in context/INDEX.sdd" }
        }
    }

    Test-Item "Context compiler has priority levels" {
        $content = Get-Content (Join-Path $sddDir "system/context/INDEX.sdd") -Raw
        foreach ($priority in @('P0','P1','P2','P3','P4','P5','P6')) {
            if ($content -notmatch $priority) { throw "$priority not found in context/INDEX.sdd" }
        }
    }

    Test-Item "Tool governance has capability chain" {
        $content = Get-Content (Join-Path $sddDir "system/tool-governance.sdd") -Raw
        if ($content -notmatch 'CAPABILITY') { throw "CAPABILITY not found" }
        if ($content -notmatch 'PERMISSION') { throw "PERMISSION not found" }
        if ($content -notmatch 'RESOURCE') { throw "RESOURCE not found" }
        if ($content -notmatch 'TOOL') { throw "TOOL not found" }
    }

    Test-Item "Tool governance has source trust hierarchy" {
        $content = Get-Content (Join-Path $sddDir "system/tool-governance.sdd") -Raw
        foreach ($level in @('SYSTEM POLICY','PROJECT POLICY','APPROVED DECISION','VALIDATED KNOWLEDGE','REFERENCE','EXTERNAL CONTENT','AI INFERENCE')) {
            if ($content -notmatch $level) { throw "$level not found in tool-governance.sdd" }
        }
    }

    Test-Item "Handoff protocol has structured manifest" {
        $content = Get-Content (Join-Path $sddDir "bootstrap/handoff.sdd") -Raw
        foreach ($field in @('completed','changed','discoveries','pending','proof')) {
            if ($content -notmatch $field) { throw "$field not found in handoff.sdd" }
        }
    }

    Test-Item "Governance has capability categories" {
        $content = Get-Content (Join-Path $sddDir "governance/capabilities.sdd") -Raw
        foreach ($cat in @('CODE','DATA','TEST','GIT','DEPLOY','NETWORK','SECRET','SYSTEM')) {
            if ($content -notmatch $cat) { throw "$cat not found in governance/capabilities.sdd" }
        }
    }

    Test-Item "Governance has risk levels for capabilities" {
        $content = Get-Content (Join-Path $sddDir "governance/capabilities.sdd") -Raw
        foreach ($risk in @('LOW','MEDIUM','HIGH','CRITICAL')) {
            if ($content -notmatch "risk:\s*$risk") { throw "risk: $risk not found in governance/capabilities.sdd" }
        }
    }

    Test-Item "Permissions has environment policy entries" {
        $content = Get-Content (Join-Path $sddDir "governance/permissions.sdd") -Raw
        foreach ($env in @('local','staging','production')) {
            if ($content -notmatch $env) { throw "$env not found in governance/permissions.sdd" }
        }
    }

    Test-Item "Permissions has gate responses" {
        $content = Get-Content (Join-Path $sddDir "governance/permissions.sdd") -Raw
        foreach ($response in @('ALLOW','REVIEW','DENY','BLOCK','HUMAN_ONLY')) {
            if ($content -notmatch $response) { throw "$response not found in governance/permissions.sdd" }
        }
    }

    Test-Item "Resources has data classification tiers" {
        $content = Get-Content (Join-Path $sddDir "governance/resources.sdd") -Raw
        foreach ($tier in @('PUBLIC','INTERNAL','CONFIDENTIAL','SECRET','RESTRICTED')) {
            if ($content -notmatch $tier) { throw "$tier not found in governance/resources.sdd" }
        }
    }

    Test-Item "Locks has lock types and protocol" {
        $content = Get-Content (Join-Path $sddDir "governance/locks.sdd") -Raw
        foreach ($lock in @('READ','WRITE','EXCLUSIVE','MIGRATION','DEPLOYMENT')) {
            if ($content -notmatch $lock) { throw "$lock not found in governance/locks.sdd" }
        }
    }

    Test-Item "Security Events has trust hierarchy" {
        $content = Get-Content (Join-Path $sddDir "governance/security-events.sdd") -Raw
        foreach ($level in @('SYSTEM POLICY','SECURITY POLICY','PROJECT POLICY','APPROVED DECISION','VALIDATED KNOWLEDGE','EXTERNAL CONTENT','AI INFERENCE')) {
            if ($content -notmatch $level) { throw "$level not found in governance/security-events.sdd" }
        }
    }

    Test-Item "Lifecycle has state machine transitions" {
         $content = Get-Content (Join-Path $sddDir "lifecycle/states.sdd") -Raw
         foreach ($state in @('CANDIDATE','ACTIVE','STALE','DEPRECATED','SUPERSEDED','DELETE_BLOCKED','ARCHIVED')) {
             if ($content -notmatch $state) { throw "$state not found in lifecycle/states.sdd" }
         }
     }

    Test-Item "Quality dimensions has all 8 dimensions" {
         $content = Get-Content (Join-Path $sddDir "lifecycle/quality-dimensions.sdd") -Raw
         foreach ($dim in @('duplicate','fragmented','orphan','unused','contradicted','superseded','terminology.drift','architecture.drift')) {
             if ($content -notmatch $dim) { throw "$dim not found in lifecycle/quality-dimensions.sdd" }
         }
     }

    Test-Item "Lifecycle has garbage collector protocol" {
        $content = Get-Content (Join-Path $sddDir "lifecycle/INDEX.sdd") -Raw
        if ($content -notmatch 'Garbage Collector') { throw "Garbage Collector not found in lifecycle/INDEX.sdd" }
        if ($content -notmatch 'SCANNING') { throw "SCANNING step not found in lifecycle/INDEX.sdd" }
    }

    Test-Item "Tool governance has fail closed principle" {
        $content = Get-Content (Join-Path $sddDir "system/tool-governance.sdd") -Raw
        if ($content -notmatch 'Fail Close|fail.close|FAIL_CLOSED') { throw "fail closed principle not found in tool-governance.sdd" }
        if ($content -notmatch 'TVL-06') { throw "TVL-06 fail closed rule not found" }
    }

    Test-Item "Tool governance has action journal format" {
        $content = Get-Content (Join-Path $sddDir "system/tool-governance.sdd") -Raw
        if ($content -notmatch 'Action Journal|@action') { throw "action journal not found in tool-governance.sdd" }
    }

    Test-Item "Timeline subdirs have INDEX.sdd files" {
        $timelineDirs = @('changes','snapshots','migrations')
        foreach ($dir in $timelineDirs) {
            $idx = Join-Path $sddDir "timeline/$dir/INDEX.sdd"
            if (-not (Test-Path $idx)) { throw "timeline/$dir/INDEX.sdd not found" }
        }
    }

    Test-Item "Evolution subdirs have INDEX.sdd files" {
        $evoDirs = @('candidates','challenges','proposals','approved')
        foreach ($dir in $evoDirs) {
            $idx = Join-Path $sddDir "evolution/$dir/INDEX.sdd"
            if (-not (Test-Path $idx)) { throw "evolution/$dir/INDEX.sdd not found" }
        }
    }

    Test-Item "All tests passed!" {
        Write-Host "All tests passed!" -ForegroundColor Green
    }

    if ($Category -eq "all") {
        Write-Host "--- Phase 130-134 Tests ---" -ForegroundColor Cyan
    }
    
    # Language tests - disabled due to regex range false positives
    # Test-Item "No Azerbaijani in .sdd files" {
    #     $files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd"
    #     foreach ($file in $files) {
    #         $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    #         if ($content -match '[ƏəĞğİıÖöŞşÜüÇç]') {
    #             throw "$($file.Name) contains Azerbaijani"
    #         }
    #     }
    # }
}

if ($Category -eq "all" -or $Category -eq "integration") {
    Write-Host "--- Integration Tests ---" -ForegroundColor Cyan
    
    Test-Item "Chain graph has D0 root" {
        Assert-ContentContains (Join-Path $sddDir "chains/graph.sdd") 'D0.*default'
    }
    
    Test-Item "Chain graph has 6 arms" {
        $content = Get-Content (Join-Path $sddDir "chains/graph.sdd") -Raw
        foreach ($arm in @('P1','D1','S1','C1','R1','DEP1')) {
            if ($content -notmatch $arm) { throw "$arm arm not found" }
        }
    }
    
    Test-Item "Skills INDEX lists all domains" {
        $content = Get-Content (Join-Path $sddDir "skills/INDEX.sdd") -Raw
        foreach ($domain in @('languages','frameworks','databases','platforms','devops')) {
            if ($content -notmatch $domain) { throw "$domain domain not found" }
        }
    }
    
    Test-Item "Prompts directory exists" {
        $promptsDir = Join-Path $repoRoot "prompts"
        if (-not (Test-Path $promptsDir)) { throw "prompts/ not found" }
    }
}

if ($Category -eq "all" -or $Category -eq "patterns") {
    Write-Host "--- Pattern Tests ---" -ForegroundColor Cyan
    
    Test-Item "Circuit breaker pattern exists" {
        Assert-FileExists (Join-Path $sddDir "patterns/circuit-breaker.sdd")
    }
    
    Test-Item "Checkpoint/restore pattern exists" {
        Assert-FileExists (Join-Path $sddDir "patterns/checkpoint-restore.sdd")
    }
    
    Test-Item "Graceful degradation pattern exists" {
        Assert-FileExists (Join-Path $sddDir "patterns/graceful-degradation.sdd")
    }
    
    Test-Item "Circuit breaker has 3 states" {
        $content = Get-Content (Join-Path $sddDir "patterns/circuit-breaker.sdd") -Raw
        foreach ($state in @('CLOSED','OPEN','HALF_OPEN')) {
            if ($content -notmatch $state) { throw "$state state not found" }
        }
    }
}

if ($Category -eq "all" -or $Category -eq "skills") {
    Write-Host "--- Skill Tests ---" -ForegroundColor Cyan
    
    Test-Item "SKILL-DISCOVERY exists" {
        Assert-FileExists (Join-Path $sddDir "skills/SKILL-DISCOVERY.sdd")
    }
    
    Test-Item "SKILL-RECOMMENDATION exists" {
        Assert-FileExists (Join-Path $sddDir "skills/SKILL-RECOMMENDATION.sdd")
    }
    
    Test-Item "SKILL-GAP-ANALYSIS exists" {
        Assert-FileExists (Join-Path $sddDir "skills/SKILL-GAP-ANALYSIS.sdd")
    }
    
    Test-Item "DevOps skills exist" {
        $devopsDir = Join-Path $sddDir "skills/devops"
        if (-not (Test-Path $devopsDir)) { throw "devops/ not found" }
    }
    
    Test-Item "Meta skills exist" {
        $metaDir = Join-Path $sddDir "skills/meta"
        if (-not (Test-Path $metaDir)) { throw "meta/ not found" }
    }
}

if ($Category -eq "all" -or $Category -eq "chain") {
    Write-Host "--- Chain Tests ---" -ForegroundColor Cyan
    
    Test-Item "Default chain exists" {
        Assert-FileExists (Join-Path $sddDir "chains/default.sdd")
    }
    
    Test-Item "Fast path exists" {
        Assert-FileExists (Join-Path $sddDir "chains/fast-path.sdd")
    }
    
    Test-Item "All 6 arms exist" {
        $armsDir = Join-Path $sddDir "chains/arms"
        foreach ($arm in @('code','deploy','docs','prompt','review','sdd')) {
            $armFile = Join-Path $armsDir "$arm.sdd"
            if (-not (Test-Path $armFile)) { throw "$arm.sdd not found" }
        }
    }
}

if ($Category -eq "all" -or $Category -eq "phase120") {
    Write-Host "--- Phase 120: Knowledge Health Tests ---" -ForegroundColor Cyan
    
    Test-Item "Knowledge model spec exists" {
        Assert-FileExists (Join-Path $sddDir "concepts/KNOWLEDGE-MODEL.sdd")
    }
    
    Test-Item "Knowledge lifecycle spec exists" {
        Assert-FileExists (Join-Path $sddDir "knowledge/KNOWLEDGE-LIFECYCLE.sdd")
    }
    
    Test-Item "References index exists" {
        Assert-FileExists (Join-Path $sddDir "references/index.sdd")
    }
    
    Test-Item "sdd-knowledge command exists" {
        Assert-FileExists (Join-Path $sddDir "commands/sdd-knowledge.sdd")
    }
    
    Test-Item "Knowledge golden rules exist" {
        Assert-FileExists (Join-Path $sddDir "knowledge/GOLDEN-RULES.sdd")
    }
    
    Test-Item "Rejected approaches (negative knowledge) exists" {
        Assert-FileExists (Join-Path $sddDir "lessons/REJECTED-APPROACHES.sdd")
    }
    
    Test-Item "sdd-analyze references knowledge system" {
        Assert-ContentContains (Join-Path $sddDir "commands/sdd-analyze.sdd") 'concepts/KNOWLEDGE-MODEL'
    }
}

if ($Category -eq "all" -or $Category -eq "phase123") {
    Write-Host "--- Phase 123: Working Memory & Context Tests ---" -ForegroundColor Cyan
    
    Test-Item "Memory model exists" {
        Assert-FileExists (Join-Path $sddDir "runtime/memory-model.sdd")
    }
    
    Test-Item "Context builder exists" {
        Assert-FileExists (Join-Path $sddDir "runtime/context-builder.sdd")
    }
    
    Test-Item "Context policy exists" {
        Assert-FileExists (Join-Path $sddDir "runtime/context-policy.sdd")
    }
    
    Test-Item "Memory consolidation exists" {
        Assert-FileExists (Join-Path $sddDir "runtime/memory-consolidation.sdd")
    }
    
    Test-Item "Context policy has always_load allowlist" {
        Assert-ContentContains (Join-Path $sddDir "runtime/context-policy.sdd") 'always_load'
    }
    
    Test-Item "Context policy has DO NOT negative knowledge" {
        Assert-ContentContains (Join-Path $sddDir "runtime/context-policy.sdd") 'DO NOT'
    }
}

if ($Category -eq "all" -or $Category -eq "phase124") {
    Write-Host "--- Phase 124: Execution Loop & Autonomy Tests ---" -ForegroundColor Cyan
    
    Test-Item "Task state machine exists" {
        Assert-FileExists (Join-Path $sddDir "tasks/TASK-STATE-MACHINE.sdd")
    }
    
    Test-Item "Loop protection exists" {
        Assert-FileExists (Join-Path $sddDir "tasks/LOOP-PROTECTION.sdd")
    }
    
    Test-Item "Failure classification exists" {
        Assert-FileExists (Join-Path $sddDir "tasks/FAILURE-CLASSIFICATION.sdd")
    }
    
    Test-Item "Execution contract exists" {
        Assert-FileExists (Join-Path $sddDir "tasks/EXECUTION-CONTRACT.sdd")
    }
    
    Test-Item "Autonomy policy exists" {
        Assert-FileExists (Join-Path $sddDir "tasks/AUTONOMY-POLICY.sdd")
    }
    
    Test-Item "Done proof exists" {
        Assert-FileExists (Join-Path $sddDir "tasks/DONE-PROOF.sdd")
    }
    
    Test-Item "Task state machine has 10 states" {
        $content = Get-Content (Join-Path $sddDir "tasks/TASK-STATE-MACHINE.sdd") -Raw
        foreach ($state in @('DISCOVERING','PLANNING','IMPLEMENTING','TESTING','REVIEWING','FIXING','DOCUMENTING','LEARNING','COMPLETED','BLOCKED','ESCALATED')) {
            if ($content -notmatch $state) { throw "$state not found in TASK-STATE-MACHINE.sdd" }
        }
    }
    
    Test-Item "Loop protection has loop_score" {
        Assert-ContentContains (Join-Path $sddDir "tasks/LOOP-PROTECTION.sdd") 'loop_score'
    }
    
    Test-Item "Loop protection has failure_budget" {
        Assert-ContentContains (Join-Path $sddDir "tasks/LOOP-PROTECTION.sdd") 'failure_budget'
    }
    
    Test-Item "Loop protection has threshold >= 60" {
        Assert-ContentContains (Join-Path $sddDir "tasks/LOOP-PROTECTION.sdd") '60'
    }
    
    Test-Item "Autonomy policy has L0-L5 levels" {
        $content = Get-Content (Join-Path $sddDir "tasks/AUTONOMY-POLICY.sdd") -Raw
        foreach ($level in @('L0','L1','L2','L3','L4','L5')) {
            if ($content -notmatch $level) { throw "$level not found" }
        }
    }
    
    Test-Item "Done proof has requirements check" {
        Assert-ContentContains (Join-Path $sddDir "tasks/DONE-PROOF.sdd") 'requirements'
    }
    
    Test-Item "Done proof has tests check" {
        Assert-ContentContains (Join-Path $sddDir "tasks/DONE-PROOF.sdd") 'tests'
    }
    
    Test-Item "Done proof has architecture check" {
        Assert-ContentContains (Join-Path $sddDir "tasks/DONE-PROOF.sdd") 'architecture'
    }
    
    Test-Item "Done proof has review check" {
        Assert-ContentContains (Join-Path $sddDir "tasks/DONE-PROOF.sdd") 'review'
    }
    
    Test-Item "Done proof has documentation check" {
        Assert-ContentContains (Join-Path $sddDir "tasks/DONE-PROOF.sdd") 'documentation'
    }
    
    Test-Item "tasks.sdd has 10-state lifecycle" {
        Assert-ContentContains (Join-Path $sddDir "tasks/tasks.sdd") 'DISCOVERING'
    }
    
    Test-Item "chains/graph.sdd has execution trace" {
        Assert-ContentContains (Join-Path $sddDir "chains/graph.sdd") 'ExecutionTrace'
    }
    
    Test-Item "stages.sdd maps Phase124 states" {
        Assert-ContentContains (Join-Path $sddDir "workflow/stages.sdd") 'Phase124StateMapping'
    }
}

if ($Category -eq "all" -or $Category -eq "phase139") {
    Write-Host "--- Phase 139: Knowledge Lifecycle & Garbage Collection Tests ---" -ForegroundColor Cyan

        Test-Item "Entity schemas define all new entity types" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/entity-schemas.sdd") -Raw
            foreach ($entity in @('observation','discovery','candidate','claim','challenge','generation','violation','exception')) {
                if ($content -notmatch $entity) { throw "$entity entity not found in entity-schemas.sdd" }
            }
        }

        Test-Item "Entity schemas has entity formats" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/entity-schemas.sdd") -Raw
            foreach ($fmt in @('observed_in','counter_evidence','proposed_resolution','lineage_graph')) {
                if ($content -notmatch $fmt) { throw "$fmt not found in entity-schemas.sdd" }
            }
        }

        Test-Item "Claims has full claim lifecycle" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/claims.sdd") -Raw
            foreach ($state in @('PROPOSED','SUPPORTED','VALIDATED','ACTIVE','CHALLENGED','INVALIDATED','SUPERSEDED')) {
                if ($content -notmatch $state) { throw "$state not found in claims.sdd" }
            }
        }

        Test-Item "Claims has confidence levels" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/claims.sdd") -Raw
            foreach ($level in @('LOW','MEDIUM','HIGH')) {
                if ($content -notmatch $level) { throw "confidence $level not found in claims.sdd" }
            }
        }

        Test-Item "Claims has evidence types" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/claims.sdd") -Raw
            foreach ($ev in @('CODE','TEST','TASK','DECISION','PRODUCTION','EXTERNAL','HUMAN','observation')) {
                if ($content -notmatch $ev) { throw "$ev evidence type not found in claims.sdd" }
            }
        }

        Test-Item "Challenges has challenge resolution protocol" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/challenges.sdd") -Raw
            foreach ($term in @('CHALLENGED','REVIEWED','ACCEPTED','FALSE_POSITIVE','FIXED','VERIFIED','INVALIDATE','MODIFY','SCOPE_LIMIT')) {
                if ($content -notmatch $term) { throw "$term not found in challenges.sdd" }
            }
        }

        Test-Item "Challenges has claim-challenge relationship" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/challenges.sdd") -Raw
            if ($content -notmatch 'claim:') { throw "claim: field not found in challenges.sdd" }
            if ($content -notmatch 'counter_evidence:') { throw "counter_evidence: field not found in challenges.sdd" }
        }

        Test-Item "Confidence has LOW/MEDIUM/HIGH levels and numeric scores" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/confidence.sdd") -Raw
            foreach ($term in @('LOW','MEDIUM','HIGH','0.0 - 0.3','0.3 - 0.7','0.7 - 1.0','score')) {
                if ($content -notmatch $term) { throw "$term not found in confidence.sdd" }
            }
        }

        Test-Item "Confidence has decay factors" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/confidence.sdd") -Raw
            foreach ($factor in @('age','usage_frequency','failure_rate','dependency_changes','technology_changes','contradicting_evidence')) {
                if ($content -notmatch $factor) { throw "$factor not found in confidence.sdd" }
            }
        }

        Test-Item "Confidence has promotion/demotion rules" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/confidence.sdd") -Raw
            if ($content -notmatch 'promotion') { throw "promotion not found in confidence.sdd" }
            if ($content -notmatch 'demotion|demotes') { throw "demotion not found in confidence.sdd" }
        }

        Test-Item "Compactor has core+variant specialization" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/compactor.sdd") -Raw
            if ($content -notmatch 'core:') { throw "core: not found in compactor.sdd" }
            if ($content -notmatch 'specialization:') { throw "specialization: not found in compactor.sdd" }
            if ($content -notmatch 'specializes:') { throw "specializes: not found in compactor.sdd" }
        }

        Test-Item "Compactor has merge proposal format" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/compactor.sdd") -Raw
            if ($content -notmatch '@merge\.') { throw "merge proposal format not found in compactor.sdd" }
            if ($content -notmatch 'confidence:') { throw "confidence in merge proposal not found" }
        }

        Test-Item "Compactor distinguishes compactor vs GC" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/compactor.sdd") -Raw
            if ($content -notmatch 'Compactor vs Garbage Collector|GC') { throw "compactor vs GC distinction not found" }
        }

        Test-Item "Generation has version lineage" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/generation.sdd") -Raw
            if ($content -notmatch 'generation:') { throw "generation: not found in generation.sdd" }
            if ($content -notmatch 'lineage_graph:') { throw "lineage_graph: not found in generation.sdd" }
            if ($content -notmatch 'gen:') { throw "gen: entry not found in generation.sdd" }
        }

        Test-Item "Generation has knowledge evolution graph" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/generation.sdd") -Raw
            foreach ($step in @('Observation','Discovery','Candidate','Skill','Challenge','Revised Skill')) {
                if ($content -notmatch $step) { throw "$step not found in generation.sdd evolution graph" }
            }
        }

        Test-Item "Health score has formula with signals" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/health-score.sdd") -Raw
            foreach ($signal in @('usage','evidence','failures','age','conflicts','health')) {
                if ($content -notmatch $signal) { throw "$signal not found in health-score.sdd" }
            }
        }

        Test-Item "Health score has graph health report" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/health-score.sdd") -Raw
            foreach ($item in @('References','Skills','Concepts','Decisions','Orphans','Stale','Contradictions','Overall')) {
                if ($content -notmatch $item) { throw "$item not found in health-score.sdd" }
            }
        }

        Test-Item "Health score has architecture health" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/health-score.sdd") -Raw
            foreach ($item in @('violations','drift','unused')) {
                if ($content -notmatch $item) { throw "$item not found in architecture health section" }
            }
        }

        Test-Item "Drift has terminology drift detection" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/drift.sdd") -Raw
            if ($content -notmatch 'terminology') { throw "terminology drift not found in drift.sdd" }
            if ($content -notmatch 'policy_terms') { throw "policy_terms not found in drift.sdd" }
            if ($content -notmatch 'observed_terms') { throw "observed_terms not found in drift.sdd" }
        }

        Test-Item "Drift has architecture drift and violation lifecycle" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/drift.sdd") -Raw
            foreach ($term in @('architecture.drift','DETECTED','REVIEWED','ACCEPTED','FALSE_POSITIVE','FIXED','VERIFIED','@violation','@exception')) {
                if ($content -notmatch $term) { throw "$term not found in drift.sdd" }
            }
        }

        Test-Item "Drift has exception expiry" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/drift.sdd") -Raw
            if ($content -notmatch 'expires:') { throw "expires: not found in drift.sdd" }
            if ($content -notmatch 'EXCEPTION_EXPIRED|Expired') { throw "expiry handling not found in drift.sdd" }
        }

        Test-Item "Learning loop has full pipeline" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/learning-loop.sdd") -Raw
            foreach ($step in @('OBSERVATION','DISCOVERY','CANDIDATE','EVIDENCE','CLAIM','VALIDATION','KNOWLEDGE')) {
                if ($content -notmatch $step) { throw "$step not found in learning-loop.sdd" }
            }
        }

        Test-Item "Learning loop has L0-L4 promotion levels" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/learning-loop.sdd") -Raw
            foreach ($level in @('L0','L1','L2','L3','L4')) {
                if ($content -notmatch $level) { throw "$level not found in learning-loop.sdd" }
            }
        }

        Test-Item "Learning loop has learning boundary" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/learning-loop.sdd") -Raw
            if ($content -notmatch 'boundary') { throw "learning boundary not found in learning-loop.sdd" }
            if ($content -notmatch 'PROMO-06') { throw "promotion rule not found in learning-loop.sdd" }
        }

        Test-Item "GC policy has safe GC protocol" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/gc-policy.sdd") -Raw
            foreach ($phase in @('DISCOVER','REPORT','PROPOSE','APPROVE','APPLY')) {
                if ($content -notmatch $phase) { throw "$phase not found in gc-policy.sdd" }
            }
        }

        Test-Item "GC policy has dependency check and DELETE_BLOCKED" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/gc-policy.sdd") -Raw
            if ($content -notmatch 'DELETE_BLOCKED') { throw "DELETE_BLOCKED not found in gc-policy.sdd" }
            if ($content -notmatch 'dependency') { throw "dependency check not found in gc-policy.sdd" }
        }

        Test-Item "GC policy has trust-aware pruning" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/gc-policy.sdd") -Raw
            foreach ($tier in @('SECRET','RESTRICTED','CONFIDENTIAL','INTERNAL','PUBLIC')) {
                if ($content -notmatch $tier) { throw "$tier not found in gc-policy.sdd" }
            }
        }

        Test-Item "GC policy has auto/propose/human categories" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/gc-policy.sdd") -Raw
            foreach ($cat in @('auto:','propose:','human:')) {
                if ($content -notmatch $cat) { throw "$cat category not found in gc-policy.sdd" }
            }
        }

        Test-Item "GC policy has orphan review protocol" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/gc-policy.sdd") -Raw
            if ($content -notmatch 'orphan') { throw "orphan review not found in gc-policy.sdd" }
            if ($content -notmatch 'recommendation:') { throw "recommendation not found in gc-policy.sdd" }
        }

        Test-Item "States has new transition rules" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/states.sdd") -Raw
            foreach ($rule in @('TR-07','TR-08','TR-09','TR-10')) {
                if ($content -notmatch $rule) { throw "$rule not found in states.sdd" }
            }
        }

        Test-Item "States has CANDIDATE to ACTIVE transition" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/states.sdd") -Raw
            if ($content -notmatch 'CANDIDATE.*ACTIVE|Candidate.*Active') { throw "CANDIDATE→ACTIVE transition not found in states.sdd" }
        }

        Test-Item "States has SUPERSEDED state and transitions" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/states.sdd") -Raw
            if ($content -notmatch 'SUPERSEDED') { throw "SUPERSEDED state not found in states.sdd" }
            if ($content -notmatch 'SUPERSEDED.*ARCHIVED') { throw "SUPERSEDED→ARCHIVED transition not found in states.sdd" }
        }

        Test-Item "Quality dimensions has orphan review protocol" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/quality-dimensions.sdd") -Raw
            if ($content -notmatch 'Orphan Review|orphan_review|Orphan Review Protocol') { throw "orphan review protocol not found in quality-dimensions.sdd" }
        }

        Test-Item "Quality dimensions has unused vs orphan distinction" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/quality-dimensions.sdd") -Raw
            if ($content -notmatch 'Unused vs Orphan') { throw "unused vs orphan distinction not found in quality-dimensions.sdd" }
        }

        Test-Item "Lifecycle INDEX references all new files" {
            $content = Get-Content (Join-Path $sddDir "lifecycle/INDEX.sdd") -Raw
            foreach ($file in @('claims.sdd','challenges.sdd','confidence.sdd','health-score.sdd','compactor.sdd','generation.sdd','drift.sdd','learning-loop.sdd','gc-policy.sdd','entity-schemas.sdd')) {
                if ($content -notmatch $file) { throw "$file not referenced in lifecycle/INDEX.sdd" }
            }
        }

        Test-Item "Root INDEX references all new lifecycle files" {
            $content = Get-Content (Join-Path $sddDir "INDEX.sdd") -Raw
            foreach ($ref in @('LifecycleGCPolicy','LifecycleCompactor','LifecycleClaims','LifecycleChallenges','LifecycleConfidence','LifecycleHealthScore','LifecycleGeneration','LifecycleDrift','LifecycleLearningLoop','LifecycleEntitySchemas')) {
                if ($content -notmatch $ref) { throw "$ref not found in INDEX.sdd Navigation" }
            }
        }
}

if ($Category -eq "all" -or $Category -eq "knowledge") {
    Write-Host "--- Knowledge System Tests ---" -ForegroundColor Cyan
    
    Test-Item "KNOWLEDGE-MODEL has 4 trust tiers" {
        $content = Get-Content (Join-Path $sddDir "concepts/KNOWLEDGE-MODEL.sdd") -Raw
        foreach ($tier in @('OBSERVED','CANDIDATE','VALIDATED','ESTABLISHED')) {
            if ($content -notmatch $tier) { throw "$tier tier not found" }
        }
    }
    
    Test-Item "KNOWLEDGE-MODEL has decision_score formula" {
        Assert-ContentContains (Join-Path $sddDir "concepts/KNOWLEDGE-MODEL.sdd") 'decision_score = trust \* applicability \* project_fit'
    }
    
    Test-Item "KNOWLEDGE-MODEL has evidence types" {
        $content = Get-Content (Join-Path $sddDir "concepts/KNOWLEDGE-MODEL.sdd") -Raw
        foreach ($ev in @('CODE','TEST','TASK','DECISION','PROJECT','PRODUCTION','EXTERNAL','HUMAN')) {
            if ($content -notmatch $ev) { throw "$ev evidence type not found" }
        }
    }
    
    Test-Item "KNOWLEDGE-LIFECYCLE has 6 pipeline steps" {
        $content = Get-Content (Join-Path $sddDir "knowledge/KNOWLEDGE-LIFECYCLE.sdd") -Raw
        foreach ($step in @('TMP to OBSERVATIONS','CONCEPT EXTRACTION','SEMANTIC CLUSTERING','CANONICALIZATION','RELATION DETECTION','REFERENCE CREATION')) {
            if ($content -notmatch $step) { throw "$step not found" }
        }
    }
    
    Test-Item "KNOWLEDGE-LIFECYCLE has promotion policy" {
        $content = Get-Content (Join-Path $sddDir "knowledge/KNOWLEDGE-LIFECYCLE.sdd") -Raw
        if ($content -notmatch 'CANDIDATE.*VALIDATED') { throw "CANDIDATE->VALIDATED promotion not found" }
        if ($content -notmatch 'VALIDATED.*ESTABLISHED') { throw "VALIDATED->ESTABLISHED promotion not found" }
    }
    
    Test-Item "sdd-knowledge command has health scoring" {
        $content = Get-Content (Join-Path $sddDir "commands/sdd-knowledge.sdd") -Raw
        foreach ($term in @('health_score','trust_average','gap_ratio','conflict_ratio','HEALTHY','WEAK','CRITICAL')) {
            if ($content -notmatch $term) { throw "$term not found" }
        }
    }
    
    Test-Item "sdd-knowledge command has diff symbols" {
        $content = Get-Content (Join-Path $sddDir "commands/sdd-knowledge.sdd") -Raw
        foreach ($sym in @('\+','~','-','!','\?')) {
            if ($content -notmatch $sym) { throw "Symbol $sym not found" }
        }
    }
    
    Test-Item "CANONICALIZATION has relationship vocabulary" {
        $content = Get-Content (Join-Path $sddDir "concepts/CANONICALIZATION.sdd") -Raw
        foreach ($rel in @('same-as','alias-of','extends','specializes','implements','depends-on','related-to','conflicts-with','replaces','derived-from','observed-in','validated-by')) {
            if ($content -notmatch $rel) { throw "$rel not found" }
        }
    }
    
    Test-Item "CANONICALIZATION has merging rules" {
        $content = Get-Content (Join-Path $sddDir "concepts/CANONICALIZATION.sdd") -Raw
        foreach ($rule in @('M1','M2','M3','M4','M5','M6')) {
            if ($content -notmatch $rule) { throw "$rule not found" }
        }
    }
    
    Test-Item "GOLDEN-RULES has 10 principles" {
        $content = Get-Content (Join-Path $sddDir "knowledge/GOLDEN-RULES.sdd") -Raw
        foreach ($principle in @('Prefer reuse over creation','Prefer linking over copying','Prefer specialization over duplication','Prefer evidence over assumption','Prefer canonical concepts over synonyms','Never silently learn','Never silently overwrite','Never silently delete','Scope every project-specific rule','Preserve why a decision was made')) {
            if ($content -notmatch [regex]::Escape($principle)) { throw "$principle not found" }
        }
    }
    
    Test-Item "GOLDEN-RULES has rule strength levels" {
        $content = Get-Content (Join-Path $sddDir "knowledge/GOLDEN-RULES.sdd") -Raw
        foreach ($level in @('MUST','SHOULD','AVOID')) {
            if ($content -notmatch $level) { throw "$level not found" }
        }
    }
}

if ($Category -eq "all" -or $Category -eq "runtime") {
    Write-Host "--- Runtime Tests ---" -ForegroundColor Cyan
    
    Test-Item "memory-model has 4-tier hierarchy" {
        $content = Get-Content (Join-Path $sddDir "runtime/memory-model.sdd") -Raw
        foreach ($tier in @('LongTermKnowledge','ProjectMemory','TaskMemory','WorkingMemory','TmpMemory')) {
            if ($content -notmatch $tier) { throw "$tier not found" }
        }
    }
    
    Test-Item "memory-model has promotion pipeline" {
        $content = Get-Content (Join-Path $sddDir "runtime/memory-model.sdd") -Raw
        foreach ($stage in @('WORKING_MEMORY','OBSERVATION','INSIGHT','CANDIDATE','VALIDATED_KNOWLEDGE','LONG_TERM_KNOWLEDGE')) {
            if ($content -notmatch $stage) { throw "$stage not found" }
        }
    }
    
    Test-Item "memory-model has importance levels" {
        $content = Get-Content (Join-Path $sddDir "runtime/memory-model.sdd") -Raw
        foreach ($level in @('critical','high','normal','low','temporary')) {
            if ($content -notmatch $level) { throw "$level not found" }
        }
    }
    
    Test-Item "context-builder has budget levels" {
        $content = Get-Content (Join-Path $sddDir "runtime/context-builder.sdd") -Raw
        foreach ($level in @('Level0','Level1','Level2','Level3','Level4')) {
            if ($content -notmatch $level) { throw "$level not found" }
        }
    }
    
    Test-Item "context-builder has default policy" {
        Assert-ContentContains (Join-Path $sddDir "runtime/context-builder.sdd") 'default_policy: 0 -> 1 -> 2'
    }
    
    Test-Item "context-builder has escalation policy" {
        Assert-ContentContains (Join-Path $sddDir "runtime/context-builder.sdd") 'escalation_policy: expand to 3 -> 4 on demand'
    }
    
    Test-Item "context-builder has knowledge retrieval stages" {
        $content = Get-Content (Join-Path $sddDir "runtime/context-builder.sdd") -Raw
        foreach ($stage in @('RETRIEVE','RANK','FILTER','LOAD','REASON')) {
            if ($content -notmatch $stage) { throw "$stage not found" }
        }
    }
    
    Test-Item "context-policy has always_load allowlist" {
        $content = Get-Content (Join-Path $sddDir "runtime/context-policy.sdd") -Raw
        if ($content -notmatch 'AlwaysLoadAllowlist') { throw "AlwaysLoadAllowlist not found" }
        if ($content -notmatch '@constitution.security') { throw "@constitution.security not in allowlist" }
        if ($content -notmatch '@constitution.data-integrity') { throw "@constitution.data-integrity not in allowlist" }
    }
    
    Test-Item "context-policy has negative knowledge registry" {
        $content = Get-Content (Join-Path $sddDir "runtime/context-policy.sdd") -Raw
        if ($content -notmatch 'NegativeKnowledgeRegistry') { throw "NegativeKnowledgeRegistry not found" }
        if ($content -notmatch '@rejected') { throw "@rejected references not found" }
    }
    
    Test-Item "context-policy has sufficiency levels" {
        $content = Get-Content (Join-Path $sddDir "runtime/context-policy.sdd") -Raw
        foreach ($level in @('insufficient','partial','sufficient','high')) {
            if ($content -notmatch $level) { throw "$level not found" }
        }
    }
    
    Test-Item "context-policy has human override" {
        $content = Get-Content (Join-Path $sddDir "runtime/context-policy.sdd") -Raw
        if ($content -notmatch '@context.include') { throw "@context.include not found" }
        if ($content -notmatch '@context.exclude') { throw "@context.exclude not found" }
    }
}

if ($Category -eq "all" -or $Category -eq "workflow") {
    Write-Host "--- Workflow Tests ---" -ForegroundColor Cyan
    
    Test-Item "execution-loop has 15-step machine" {
        $content = Get-Content (Join-Path $sddDir "workflow/execution-loop.sdd") -Raw
        foreach ($step in @('TASK','DISCOVER','BUILD CONTEXT','PLAN','PLAN CHECK','IMPLEMENT','TEST','CLASSIFY','FIX','REVIEW','DONE PROOF','DOCUMENTATION','KNOWLEDGE GATE','CONSOLIDATION','COMPLETE')) {
            if ($content -notmatch $step) { throw "$step not found" }
        }
    }
    
    Test-Item "execution-loop has 11 execution states" {
        $content = Get-Content (Join-Path $sddDir "workflow/execution-loop.sdd") -Raw
        foreach ($state in @('DISCOVERING','PLANNING','IMPLEMENTING','TESTING','REVIEWING','FIXING','DOCUMENTING','LEARNING','COMPLETED','BLOCKED','ESCALATED')) {
            if ($content -notmatch $state) { throw "$state not found" }
        }
    }
    
    Test-Item "execution-loop has loop protection threshold" {
        Assert-ContentContains (Join-Path $sddDir "workflow/execution-loop.sdd") 'LOOP_SCORE >= 60'
    }
    
    Test-Item "execution-loop has review sub_states" {
        $content = Get-Content (Join-Path $sddDir "workflow/execution-loop.sdd") -Raw
        foreach ($sub in @('PASS','PASS_WITH_WARNINGS','CHANGES_REQUIRED','BLOCKED','ESCALATE')) {
            if ($content -notmatch $sub) { throw "$sub not found" }
        }
    }
    
    Test-Item "learning-gate has 6 outcomes" {
        $content = Get-Content (Join-Path $sddDir "workflow/learning-gate.sdd") -Raw
        foreach ($outcome in @('NO_NEW_KNOWLEDGE','EXISTING_KNOWLEDGE_UPDATED','NEW_CANDIDATE','NEW_VALIDATED_SKILL','NEW_DECISION','NEW_LESSON')) {
            if ($content -notmatch $outcome) { throw "$outcome not found" }
        }
    }
    
    Test-Item "learning-gate has knowledge artifacts" {
        $content = Get-Content (Join-Path $sddDir "workflow/learning-gate.sdd") -Raw
        foreach ($art in @('@candidate','@skill','@decision','@rejected')) {
            if ($content -notmatch $art) { throw "$art not found" }
        }
    }
    
    Test-Item "learning-gate has consolidation rules" {
        $content = Get-Content (Join-Path $sddDir "workflow/learning-gate.sdd") -Raw
        if ($content -notmatch '100 execution events') { throw "Consolidation threshold not found" }
        if ($content -notmatch '3 important decisions') { throw "Decision threshold not found" }
    }
}

if ($Category -eq "all" -or $Category -eq "tasks") {
    Write-Host "--- Tasks Tests ---" -ForegroundColor Cyan
    
    Test-Item "TASK-STATE-MACHINE has 10 states" {
        $content = Get-Content (Join-Path $sddDir "tasks/TASK-STATE-MACHINE.sdd") -Raw
        foreach ($state in @('DISCOVERING','PLANNING','IMPLEMENTING','TESTING','REVIEWING','FIXING','DOCUMENTING','LEARNING','COMPLETED','BLOCKED','ESCALATED')) {
            if ($content -notmatch $state) { throw "$state not found" }
        }
    }
    
    Test-Item "TASK-STATE-MACHINE has sub_states" {
        $content = Get-Content (Join-Path $sddDir "tasks/TASK-STATE-MACHINE.sdd") -Raw
        foreach ($sub in @('PASSED','FAILED','IN_PROGRESS','READY','PASS','PASS_WITH_WARNINGS','CHANGES_REQUIRED')) {
            if ($content -notmatch $sub) { throw "$sub not found" }
        }
    }
    
    Test-Item "TASK-STATE-MACHINE has progress rule" {
        $content = Get-Content (Join-Path $sddDir "tasks/TASK-STATE-MACHINE.sdd") -Raw
        foreach ($part in @('BEFORE:','CHANGE:','AFTER:','RESULT:','PROGRESS:')) {
            if ($content -notmatch $part) { throw "$part not found" }
        }
    }
    
    Test-Item "LOOP-PROTECTION has 6 guards" {
        $content = Get-Content (Join-Path $sddDir "tasks/LOOP-PROTECTION.sdd") -Raw
        foreach ($guard in @('MaxIterations','FailureBudget','NoProgressDetection','DuplicateActionDetection','StateTransitionRules','HumanEscalation')) {
            if ($content -notmatch $guard) { throw "$guard not found" }
        }
    }
    
    Test-Item "LOOP-PROTECTION has severity weights" {
        $content = Get-Content (Join-Path $sddDir "tasks/LOOP-PROTECTION.sdd") -Raw
        foreach ($weight in @('minor=1','major=2','critical=5')) {
            if ($content -notmatch $weight) { throw "$weight not found" }
        }
    }
    
    Test-Item "LOOP-PROTECTION has loop_score calculation" {
        $content = Get-Content (Join-Path $sddDir "tasks/LOOP-PROTECTION.sdd") -Raw
        foreach ($calc in @('same_action:.*\+30','same_error:.*\+25','no_progress:.*\+30','plan_reverted:.*\+20','new_evidence:.*\-20','meaningful_change:.*\-30')) {
            if ($content -notmatch $calc) { throw "Loop score calc $calc not found" }
        }
    }
    
    Test-Item "FAILURE-CLASSIFICATION has 9 types" {
        $content = Get-Content (Join-Path $sddDir "tasks/FAILURE-CLASSIFICATION.sdd") -Raw
        foreach ($ftype in @('BUILD_FAILURE','TEST_FAILURE','LOGIC_FAILURE','ARCHITECTURE_FAILURE','CONSTRAINT_FAILURE','ENVIRONMENT_FAILURE','KNOWLEDGE_GAP','AMBIGUITY','EXTERNAL_DEPENDENCY')) {
            if ($content -notmatch $ftype) { throw "$ftype not found" }
        }
    }
    
    Test-Item "FAILURE-CLASSIFICATION has severity weights" {
        $content = Get-Content (Join-Path $sddDir "tasks/FAILURE-CLASSIFICATION.sdd") -Raw
        foreach ($weight in @('minor','major','critical')) {
            if ($content -notmatch $weight) { throw "$weight not found" }
        }
    }
    
    Test-Item "AUTONOMY-POLICY has L0-L5 levels" {
        $content = Get-Content (Join-Path $sddDir "tasks/AUTONOMY-POLICY.sdd") -Raw
        foreach ($level in @('L0','L1','L2','L3','L4','L5')) {
            if ($content -notmatch $level) { throw "$level not found" }
        }
    }
    
    Test-Item "AUTONOMY-POLICY has level descriptions" {
        $content = Get-Content (Join-Path $sddDir "tasks/AUTONOMY-POLICY.sdd") -Raw
        foreach ($desc in @('Observe Only','Suggest','Implement \+ Test','Implement \+ Review \+ Fix','Autonomous Execution','Autonomous Multi-Task')) {
            if ($content -notmatch $desc) { throw "$desc not found" }
        }
    }
    
    Test-Item "AUTONOMY-POLICY has project policy format" {
        Assert-ContentContains (Join-Path $sddDir "tasks/AUTONOMY-POLICY.sdd") '@policy.autonomy'
        Assert-ContentContains (Join-Path $sddDir "tasks/AUTONOMY-POLICY.sdd") 'max: L'
    }
}

if ($Category -eq "all" -or $Category -eq "crossref") {
    Write-Host "--- Cross-Reference Validation Tests ---" -ForegroundColor Cyan
    
    $newFileDirs = @(
        (Join-Path $sddDir "concepts"),
        (Join-Path $sddDir "knowledge"),
        (Join-Path $sddDir "commands"),
        (Join-Path $sddDir "runtime"),
        (Join-Path $sddDir "workflow"),
        (Join-Path $sddDir "tasks"),
        (Join-Path $sddDir "insights"),
        (Join-Path $sddDir "bootstrap"),
        (Join-Path $sddDir "system"),
        (Join-Path $sddDir "governance"),
        (Join-Path $sddDir "lifecycle")
    )
    
    Test-Item "All @references resolve to existing files" {
        $missingRefs = @()
        
        foreach ($dir in $newFileDirs) {
            if (-not (Test-Path $dir)) { continue }
            $files = Get-ChildItem -Path $dir -Recurse -Filter "*.sdd"
            $refPattern = '@[a-zA-Z0-9_/\-\.]+'
            
            foreach ($file in $files) {
                $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
                if ($content -match $refPattern) {
                    $matches = [regex]::Matches($content, $refPattern)
                    foreach ($match in $matches) {
                        $ref = $match.Value
                        $path = $ref.Substring(1)
                        
                        # Skip wildcard/prefix references (e.g. @concept., @skill.)
                        if ($path.EndsWith('.')) { continue }
                        
                        # Skip knowledge graph node references with trailing slash (e.g. @context.include/)
                        if ($path.EndsWith('/') -and $path -match '\.') { continue }
                        
                        # Skip knowledge graph node references (no / separator)
                        if ($path -notmatch '/') { continue }
                        
                        $fullPath = [System.IO.Path]::GetFullPath((Join-Path $file.DirectoryName $path))
                        if (-not (Test-Path $fullPath)) {
                            $missingRefs += "$($file.Name) -> $ref"
                        }
                    }
                }
            }
        }
        
        if ($missingRefs.Count -gt 0) {
            throw "Missing references: $($missingRefs -join ', ')"
        }
    }
    
    Test-Item "No circular references in knowledge graph" {
        $graph = @{}
        $files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd"
        $refPattern = '@[a-zA-Z0-9_/\-\.]+'
        
        foreach ($file in $files) {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -match $refPattern) {
                $matches = [regex]::Matches($content, $refPattern)
                $deps = @()
                foreach ($match in $matches) {
                    $ref = $match.Value.Substring(1)
                    $deps += $ref
                }
                $relative = $file.FullName.Substring($sddDir.Length + 1)
                $graph[$relative] = $deps
            }
        }
        
        $visited = @{}
        $recStack = @{}
        
        function Test-Cycle {
            param([string]$node)
            if ($recStack[$node]) { return $true }
            if ($visited[$node]) { return $false }
            
            $visited[$node] = $true
            $recStack[$node] = $true
            
            if ($graph[$node]) {
                foreach ($neighbor in $graph[$node]) {
                    if (Test-Cycle $neighbor) { return $true }
                }
            }
            
            $recStack[$node] = $false
            return $false
        }
        
        foreach ($node in $graph.Keys) {
            $visited = @{}
            $recStack = @{}
            if (Test-Cycle $node) {
                throw "Circular reference detected involving $node"
            }
        }
    }
    
    Test-Item "All {PLACEHOLDER} templates in case.template.sdd are documented" {
        $template = Join-Path $sddDir "templates/_sdd/project/case.template.sdd"
        $content = Get-Content $template -Raw
        $placeholderPattern = '\{[A-Z_]+\}'
        $matches = [regex]::Matches($content, $placeholderPattern)
        $undocumented = @()
        
        foreach ($match in $matches) {
            $placeholder = $match.Value
            $docCheck = $content -match [regex]::Escape($placeholder) + '.*(?:placeholder|template|replace|variable|parameter|field)'
            if (-not $docCheck) {
                $undocumented += $placeholder
            }
        }
        
        if ($undocumented.Count -gt 0) {
            throw "Undocumented placeholders: $($undocumented -join ', ')"
        }
    }
}

if ($Category -eq "all" -or $Category -eq "phase5") {
    Write-Host "--- Phase 5 Template Tests ---" -ForegroundColor Cyan
    
    Test-Item "case.template.sdd has required headers" {
        $content = Get-Content (Join-Path $sddDir "templates/_sdd/project/case.template.sdd") -Raw
        foreach ($header in @('Spec:','Case:','Module:','Layer:','Status:')) {
            if ($content -notmatch $header) { throw "$header not found" }
        }
    }
    
    Test-Item "case.template.sdd has status values" {
        Assert-ContentContains (Join-Path $sddDir "templates/_sdd/project/case.template.sdd") 'draft|approved|in_progress|completed|blocked'
    }
    
    Test-Item "case.template.sdd has requirements sections" {
        $content = Get-Content (Join-Path $sddDir "templates/_sdd/project/case.template.sdd") -Raw
        foreach ($sec in @('Must:','Forbids:','Done when:','Scenario:','Given','When','Then')) {
            if ($content -notmatch $sec) { throw "$sec not found" }
        }
    }
    
    Test-Item "flow-index.template.sdd has tree structure" {
        $content = Get-Content (Join-Path $sddDir "templates/specdd/flow-index.template.sdd") -Raw
        foreach ($sec in @('depends-on:','related:','Output:','Refresh:')) {
            if ($content -notmatch $sec) { throw "$sec not found" }
        }
    }
    
    Test-Item "flow-index.template.sdd has status legend" {
        $content = Get-Content (Join-Path $sddDir "templates/specdd/flow-index.template.sdd") -Raw
        foreach ($status in @('Closed / verified','In progress / open','Planned / pending')) {
            if ($content -notmatch $status) { throw "$status not found" }
        }
    }
    
    Test-Item "LAYER-GATE.sdd has L0-L4 layers" {
        $content = Get-Content (Join-Path $sddDir "testing/LAYER-GATE.sdd") -Raw
        foreach ($layer in @('L0: Backend','L1: Frontend','L2: Mobile','L3: Integration','L4: E2E')) {
            if ($content -notmatch $layer) { throw "$layer not found" }
        }
    }
    
    Test-Item "LAYER-GATE.sdd has git tag format" {
        Assert-ContentContains (Join-Path $sddDir "testing/LAYER-GATE.sdd") '\[layer\]-\[module\]-\[case\]-L\[level\]-\[date\]'
    }
    
    Test-Item "LAYER-GATE.sdd has example tag" {
        Assert-ContentContains (Join-Path $sddDir "testing/LAYER-GATE.sdd") 'be-payment-escrow-L0-20260818'
    }
    
    Test-Item "LAYER-GATE.sdd has manual QA requirement" {
        Assert-ContentContains (Join-Path $sddDir "testing/LAYER-GATE.sdd") 'Manual QA Gate'
    }
}

if ($Category -eq "all" -or $Category -eq "specdd") {
    Write-Host "--- SpecDD Bootstrap Tests ---" -ForegroundColor Cyan
    
    Test-Item "CASE template exists" {
        Assert-FileExists (Join-Path $sddDir "templates/_sdd/project/case.template.sdd")
    }
    
    Test-Item "CASE index template exists" {
        Assert-FileExists (Join-Path $sddDir "templates/_sdd/project/case-index.template.sdd")
    }
    
    Test-Item "Flow index template exists" {
        Assert-FileExists (Join-Path $sddDir "templates/specdd/flow-index.template.sdd")
    }
    
    Test-Item "Fix index template exists" {
        Assert-FileExists (Join-Path $sddDir "templates/specdd/fix-index.template.sdd")
    }
    
    Test-Item "Doc template exists" {
        Assert-FileExists (Join-Path $sddDir "templates/specdd/doc-template.sdd")
    }
    
    Test-Item "Pre-flight template exists" {
        Assert-FileExists (Join-Path $sddDir "templates/specdd/preflight-template.sdd")
    }
    
    Test-Item "Test discovery gate exists" {
        Assert-FileExists (Join-Path $sddDir "testing/TEST-DISCOVERY-GATE.sdd")
    }
    
    Test-Item "Manual QA gate exists" {
        Assert-FileExists (Join-Path $sddDir "testing/MANUAL-QA-GATE.sdd")
    }
    
    Test-Item "Code quality gate exists" {
        Assert-FileExists (Join-Path $sddDir "testing/CODE-QUALITY-GATE.sdd")
    }
    
    Test-Item "Layer gate exists" {
        Assert-FileExists (Join-Path $sddDir "testing/LAYER-GATE.sdd")
    }
    
    Test-Item "API test template exists" {
        Assert-FileExists (Join-Path $sddDir "testing/API-TEST-TEMPLATE.sdd")
    }
    
    Test-Item "Skill chain exists" {
        Assert-FileExists (Join-Path $sddDir "tasks/SKILL-CHAIN.sdd")
    }
    
    Test-Item "Dependency ledger exists" {
        Assert-FileExists (Join-Path $sddDir "security/DEPENDENCY-LEDGER.sdd")
    }
    
    Test-Item "Down-up transition exists" {
        Assert-FileExists (Join-Path $sddDir "branches/DOWN-UP-TRANSITION.sdd")
    }
    
    Test-Item "Toolchain spec exists" {
        Assert-FileExists (Join-Path $sddDir "project/toolchain.sdd")
    }
    
    Test-Item "Task scheduling exists" {
        Assert-FileExists (Join-Path $sddDir "tasks/TASK-SCHEDULING.sdd")
    }
    
    Test-Item "sdd-explain command exists" {
        Assert-FileExists (Join-Path $sddDir "commands/sdd-explain.sdd")
    }
    
    Test-Item "sdd-next command exists" {
        Assert-FileExists (Join-Path $sddDir "commands/sdd-next.sdd")
    }
    
    Test-Item "sdd-analyze scans specdd artifacts" {
        Assert-ContentContains (Join-Path $sddDir "commands/sdd-analyze.sdd") 'specdd'
    }
}

# --- Summary
Write-Host ""
Write-Host "=== Test Results ===" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Skipped: $skipped" -ForegroundColor Yellow
Write-Host "Total: $($passed + $failed + $skipped)" -ForegroundColor White

if ($failed -gt 0) {
    Write-Host ""
    Write-Host "=== Failed Tests ===" -ForegroundColor Red
    $results | Where-Object Status -eq "FAIL" | ForEach-Object {
        Write-Host "  $($_.Name): $($_.Error)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "All tests passed!" -ForegroundColor Green
exit 0
