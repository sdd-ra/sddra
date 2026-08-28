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

# Summary
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
