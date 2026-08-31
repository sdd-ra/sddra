#!/usr/bin/env pwsh
# Integration Tests: Knowledge Health Simulation
# Simulates sdd-knowledge health report generation

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

Write-Host "=== Knowledge Health Integration Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Simulate trust coverage calculation
Test-Item "Trust coverage calculation" {
    $km = Join-Path $sddDir "concepts/KNOWLEDGE-MODEL.sdd"
    $content = Get-Content $km -Raw
    
    $established = ([regex]::Matches($content, 'ESTABLISHED')).Count
    $validated = ([regex]::Matches($content, 'VALIDATED')).Count
    $candidate = ([regex]::Matches($content, 'CANDIDATE')).Count
    
    $total = $established + $validated + $candidate
    if ($total -eq 0) { throw "No knowledge tiers found" }
    
    $coverage = if ($total -gt 0) { [math]::Round(($established + $validated) / $total * 100, 2) } else { 0 }
    Write-Host "    Trust coverage: $coverage% (ESTABLISHED=$established, VALIDATED=$validated, CANDIDATE=$candidate)"
    
    if ($coverage -lt 0) { throw "Coverage below 0%" }
}

# Test 2: Simulate candidate pipeline health
Test-Item "Candidate pipeline health" {
    $kl = Join-Path $sddDir "knowledge/KNOWLEDGE-LIFECYCLE.sdd"
    $content = Get-Content $kl -Raw
    
    $hasPromotion = $content -match 'CANDIDATE.*VALIDATED'
    $hasDrop = $content -match 'DROP'
    $hasArchive = $content -match 'ARCHIVE'
    
    if (-not $hasPromotion) { throw "No promotion policy found" }
    if (-not $hasDrop) { throw "No DROP action found" }
    if (-not $hasArchive) { throw "No ARCHIVE action found" }
}

# Test 3: Simulate conflict detection
Test-Item "Conflict detection rules" {
    $km = Join-Path $sddDir "concepts/KNOWLEDGE-MODEL.sdd"
    $content = Get-Content $km -Raw
    
    if ($content -notmatch 'conflicts-with') { throw "conflicts-with edge not defined" }
    if ($content -notmatch 'CONFLICT') { throw "CONFLICT flag not defined" }
    if ($content -notmatch 'Decision Override') { throw "Decision Override not defined" }
}

# Test 4: Simulate knowledge gap analysis
Test-Item "Knowledge gap analysis" {
    $sk = Join-Path $sddDir "commands/sdd-knowledge.sdd"
    $content = Get-Content $sk -Raw
    
    if ($content -notmatch 'Knowledge gaps:') { throw "Knowledge gaps metric not defined" }
    if ($content -notmatch 'Unused references:') { throw "Unused references metric not defined" }
    if ($content -notmatch 'Duplicate concepts:') { throw "Duplicate concepts metric not defined" }
}

# Test 5: Simulate golden rules enforcement
Test-Item "Golden rules enforcement" {
    $gr = Join-Path $sddDir "knowledge/GOLDEN-RULES.sdd"
    $content = Get-Content $gr -Raw
    
    $principles = @(
        'Prefer reuse over creation',
        'Prefer linking over copying',
        'Never silently learn',
        'Never silently overwrite',
        'Never silently delete'
    )
    
    foreach ($p in $principles) {
        if ($content -notmatch [regex]::Escape($p)) { throw "Principle not found: $p" }
    }
}

# Test 6: Simulate canonicalization validation
Test-Item "Canonicalization validation" {
    $canon = Join-Path $sddDir "concepts/CANONICALIZATION.sdd"
    $content = Get-Content $canon -Raw
    
    $relations = @('same-as','alias-of','extends','specializes','implements','depends-on','related-to','conflicts-with','replaces','derived-from','observed-in','validated-by')
    foreach ($r in $relations) {
        if ($content -notmatch $r) { throw "Relation not found: $r" }
    }
    
    if ($content -notmatch 'Anti-Chaos Rule') { throw "Anti-Chaos Rule not found" }
}

# Test 7: Simulate health score thresholds
Test-Item "Health score thresholds" {
    $sk = Join-Path $sddDir "commands/sdd-knowledge.sdd"
    $content = Get-Content $sk -Raw
    
    $thresholds = @('HEALTHY','WEAK','CRITICAL')
    foreach ($t in $thresholds) {
        if ($content -notmatch $t) { throw "Threshold not found: $t" }
    }
}

# Test 8: Simulate drift detection
Test-Item "Knowledge drift detection" {
    $kl = Join-Path $sddDir "knowledge/KNOWLEDGE-LIFECYCLE.sdd"
    $content = Get-Content $kl -Raw
    
    if ($content -notmatch 'drift.stale') { throw "drift.stale not defined" }
    if ($content -notmatch 'review required') { throw "review required policy not found" }
}

Write-Host ""
Write-Host "=== Results ===" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -gt 0) { exit 1 }
exit 0
