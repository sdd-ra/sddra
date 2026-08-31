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
        (Join-Path $sddDir "insights")
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
