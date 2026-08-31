#!/usr/bin/env pwsh
# Integration Tests: Execution Loop State Transitions
# Validates state transition rules from execution-loop.sdd and TASK-STATE-MACHINE.sdd

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

Write-Host "=== Execution Loop Integration Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Validate main flow states
Test-Item "Main flow states exist" {
    $el = Join-Path $sddDir "workflow/execution-loop.sdd"
    $content = Get-Content $el -Raw
    
    $states = @('DISCOVERING','PLANNING','IMPLEMENTING','TESTING','REVIEWING','DOCUMENTING','LEARNING','COMPLETED')
    foreach ($state in $states) {
        if ($content -notmatch "state: $state") { throw "State not found: $state" }
    }
}

# Test 2: Validate testing failure transitions
Test-Item "Testing failure transitions" {
    $el = Join-Path $sddDir "workflow/execution-loop.sdd"
    $content = Get-Content $el -Raw
    
    if ($content -notmatch 'FAIL -> CLASSIFY') { throw "FAIL -> CLASSIFY transition not found" }
    if ($content -notmatch 'FIXABLE.*FIX') { throw "FIXABLE -> FIX not found" }
    if ($content -notmatch 'on_fix: return to TEST') { throw "on_fix: return to TEST not found" }
}

# Test 3: Validate review failure transitions
Test-Item "Review failure transitions" {
    $el = Join-Path $sddDir "workflow/execution-loop.sdd"
    $content = Get-Content $el -Raw
    
    if ($content -notmatch 'CHANGES_REQUIRED -> FIX') { throw "CHANGES_REQUIRED -> FIX not found" }
    if ($content -notmatch 'FIX -> TEST -> REVIEW') { throw "FIX -> TEST -> REVIEW not found" }
}

# Test 4: Validate blocked/escalated transitions
Test-Item "Blocked and escalated transitions" {
    $el = Join-Path $sddDir "workflow/execution-loop.sdd"
    $content = Get-Content $el -Raw
    
    if ($content -notmatch 'BLOCKED -> BLOCKED state') { throw "BLOCKED transition not found" }
    if ($content -notmatch 'ESCALATE -> ESCALATED state') { throw "ESCALATE transition not found" }
}

# Test 5: Validate loop protection integration
Test-Item "Loop protection integration" {
    $el = Join-Path $sddDir "workflow/execution-loop.sdd"
    $content = Get-Content $el -Raw
    
    if ($content -notmatch 'LOOP_SCORE') { throw "LOOP_SCORE not found" }
    if ($content -notmatch 'LOOP_RISK_HIGH') { throw "LOOP_RISK_HIGH not found" }
    if ($content -notmatch '60') { throw "Threshold 60 not found" }
}

# Test 6: Validate context level defaults
Test-Item "Context level defaults" {
    $el = Join-Path $sddDir "workflow/execution-loop.sdd"
    $content = Get-Content $el -Raw
    
    if ($content -notmatch 'CONTEXT LEVEL') { throw "CONTEXT LEVEL not found" }
    if ($content -notmatch '0.*1.*2') { throw "Default context levels not found" }
}

# Test 7: Validate state machine rules count
Test-Item "State machine has 10 rules" {
    $tsm = Join-Path $sddDir "tasks/TASK-STATE-MACHINE.sdd"
    $content = Get-Content $tsm -Raw
    
    for ($i = 1; $i -le 10; $i++) {
        $rule = "TM$i"
        if ($content -notmatch $rule) { throw "Rule $rule not found" }
    }
}

# Test 8: Validate loop protection rules count
Test-Item "Loop protection has 10 rules" {
    $lp = Join-Path $sddDir "tasks/LOOP-PROTECTION.sdd"
    $content = Get-Content $lp -Raw
    
    for ($i = 1; $i -le 10; $i++) {
        $rule = "LP$i"
        if ($content -notmatch $rule) { throw "Rule $rule not found" }
    }
}

# Test 9: Validate failure classification rules count
Test-Item "Failure classification has 10 rules" {
    $fc = Join-Path $sddDir "tasks/FAILURE-CLASSIFICATION.sdd"
    $content = Get-Content $fc -Raw
    
    for ($i = 1; $i -le 10; $i++) {
        $rule = "FC$i"
        if ($content -notmatch $rule) { throw "Rule $rule not found" }
    }
}

# Test 10: Validate execution loop rules count
Test-Item "Execution loop has 10 rules" {
    $el = Join-Path $sddDir "workflow/execution-loop.sdd"
    $content = Get-Content $el -Raw
    
    for ($i = 1; $i -le 10; $i++) {
        $rule = "EL$i"
        if ($content -notmatch $rule) { throw "Rule $rule not found" }
    }
}

# Test 11: Validate learning gate rules count
Test-Item "Learning gate has 5 rules" {
    $lg = Join-Path $sddDir "workflow/learning-gate.sdd"
    $content = Get-Content $lg -Raw
    
    for ($i = 1; $i -le 5; $i++) {
        $rule = "KG$i"
        if ($content -notmatch $rule) { throw "Rule $rule not found" }
    }
}

# Test 12: Simulate loop score breach
Test-Item "Loop score breach simulation" {
    $lp = Join-Path $sddDir "tasks/LOOP-PROTECTION.sdd"
    $content = Get-Content $lp -Raw
    
    if ($content -notmatch 'loop_score = 85') { throw "Loop score example not found" }
    if ($content -notmatch 'LOOP_RISK_HIGH') { throw "LOOP_RISK_HIGH not found" }
}

Write-Host ""
Write-Host "=== Results ===" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -gt 0) { exit 1 }
exit 0
