#!/usr/bin/env pwsh
# Integration Tests: Context Builder Budget Escalation
# Validates context budget escalation rules from context-builder.sdd and context-policy.sdd

param(
    [string]$RepoRoot = (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))))
)

$ErrorActionPreference = "Stop"
$sddDir = Join-Path $RepoRoot ".sdd"

$passed = 0
$failed = 0

function Test-Item {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    try {
        & $Test
        Write-Host "  PASS: $Name" -ForegroundColor Green
        $script:passed++
    }
    catch {
        Write-Host "  FAIL: $Name - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
    }
}

Write-Host "=== Context Builder Integration Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Validate default context budget
Test-Item "Default context budget is Level 0-1-2" {
    $cb = Join-Path $sddDir "runtime/context-builder.sdd"
    $content = Get-Content $cb -Raw
    
    if ($content -notmatch 'Level0') { throw "Level0 not found" }
    if ($content -notmatch 'Level1') { throw "Level1 not found" }
    if ($content -notmatch 'Level2') { throw "Level2 not found" }
    if ($content -notmatch 'default_policy: 0 -> 1 -> 2') { throw "default_policy not found" }
}

# Test 2: Validate escalation triggers
Test-Item "Escalation triggers Level 3-4" {
    $cb = Join-Path $sddDir "runtime/context-builder.sdd"
    $content = Get-Content $cb -Raw
    
    if ($content -notmatch 'Level3') { throw "Level3 not found" }
    if ($content -notmatch 'Level4') { throw "Level4 not found" }
    if ($content -notmatch 'escalation_policy: expand to 3 -> 4 on demand') { throw "escalation_policy not found" }
}

# Test 3: Validate context discovery pipeline
Test-Item "Context discovery pipeline stages" {
    $cb = Join-Path $sddDir "runtime/context-builder.sdd"
    $content = Get-Content $cb -Raw
    
    $stages = @('task','project','module','domain','dependencies','relevant_concepts','relevant_skills','relevant_decisions','relevant_constraints')
    foreach ($s in $stages) {
        if ($content -notmatch $s) { throw "Stage not found: $s" }
    }
}

# Test 4: Validate knowledge retrieval engine
Test-Item "Knowledge retrieval engine stages" {
    $cb = Join-Path $sddDir "runtime/context-builder.sdd"
    $content = Get-Content $cb -Raw
    
    foreach ($stage in @('RETRIEVE','RANK','FILTER','LOAD','REASON')) {
        if ($content -notmatch $stage) { throw "Stage not found: $stage" }
    }
}

# Test 5: Validate context relevance levels
Test-Item "Context relevance levels" {
    $cb = Join-Path $sddDir "runtime/context-builder.sdd"
    $content = Get-Content $cb -Raw
    
    foreach ($level in @('direct','indirect','historical','optional')) {
        if ($content -notmatch $level) { throw "Level not found: $level" }
    }
}

# Test 6: Validate sufficiency checkpoints
Test-Item "Sufficiency checkpoints" {
    $cp = Join-Path $sddDir "runtime/context-policy.sdd"
    $content = Get-Content $cp -Raw
    
    foreach ($level in @('insufficient','partial','sufficient','high')) {
        if ($content -notmatch $level) { throw "Level not found: $level" }
    }
}

# Test 7: Validate always_load cannot be excluded
Test-Item "Always load cannot be excluded" {
    $cp = Join-Path $sddDir "runtime/context-policy.sdd"
    $content = Get-Content $cp -Raw
    
    if ($content -notmatch 'always_load references cannot be excluded by @context.exclude') {
        throw "always_load exclusion rule not found"
    }
}

# Test 8: Validate negative knowledge registry
Test-Item "Negative knowledge registry structure" {
    $cp = Join-Path $sddDir "runtime/context-policy.sdd"
    $content = Get-Content $cp -Raw
    
    if ($content -notmatch 'NegativeKnowledgeRegistry') { throw "NegativeKnowledgeRegistry not found" }
    if ($content -notmatch '@rejected') { throw "@rejected references not found" }
    if ($content -notmatch 'failed_approach') { throw "failed_approach not found" }
    if ($content -notmatch 'preferred') { throw "preferred not found" }
    if ($content -notmatch 'status: active') { throw "status: active not found" }
    if ($content -notmatch 'superseded') { throw "superseded not found" }
}

# Test 9: Validate trust hierarchy in context policy
Test-Item "Trust hierarchy in context policy" {
    $cp = Join-Path $sddDir "runtime/context-policy.sdd"
    $content = Get-Content $cp -Raw
    
    if ($content -notmatch 'TrustHierarchy') { throw "TrustHierarchy not found" }
    if ($content -notmatch 'explicit project constraints') { throw "explicit project constraints not found" }
    if ($content -notmatch 'AI suggestions') { throw "AI suggestions not found" }
}

# Test 10: Validate hard/soft rules
Test-Item "Hard and soft rules" {
    $cp = Join-Path $sddDir "runtime/context-policy.sdd"
    $content = Get-Content $cp -Raw
    
    if ($content -notmatch 'hard_rules') { throw "hard_rules not found" }
    if ($content -notmatch 'soft_rules') { throw "soft_rules not found" }
    if ($content -notmatch 'blocking') { throw "blocking not found" }
    if ($content -notmatch 'advisory') { throw "advisory not found" }
}

# Test 11: Validate context builder rule count
Test-Item "Context builder has 12 rules" {
    $cb = Join-Path $sddDir "runtime/context-builder.sdd"
    $content = Get-Content $cb -Raw
    
    for ($i = 1; $i -le 12; $i++) {
        $rule = "RT-CTX-BLD-{0:D2}" -f $i
        if ($content -notmatch $rule) { throw "Rule $rule not found" }
    }
}

# Test 12: Validate context policy rule count
Test-Item "Context policy has 15 rules" {
    $cp = Join-Path $sddDir "runtime/context-policy.sdd"
    $content = Get-Content $cp -Raw
    
    for ($i = 1; $i -le 15; $i++) {
        $rule = "RT-CTX-POL-{0:D2}" -f $i
        if ($content -notmatch $rule) { throw "Rule $rule not found" }
    }
}

# Test 13: Validate memory model rule count
Test-Item "Memory model has 14 rules" {
    $mm = Join-Path $sddDir "runtime/memory-model.sdd"
    $content = Get-Content $mm -Raw
    
    for ($i = 1; $i -le 14; $i++) {
        $rule = "RT-MM-{0:D2}" -f $i
        if ($content -notmatch $rule) { throw "Rule $rule not found" }
    }
}

# Test 14: Validate TTL rules
Test-Item "Memory TTL rules" {
    $mm = Join-Path $sddDir "runtime/memory-model.sdd"
    $content = Get-Content $mm -Raw
    
    $ttls = @('30 days','indefinite','project lifetime','task lifetime','immediate')
    foreach ($ttl in $ttls) {
        if ($content -notmatch $ttl) { throw "TTL not found: $ttl" }
    }
}

Write-Host ""
Write-Host "=== Results ===" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -gt 0) { exit 1 }
exit 0
