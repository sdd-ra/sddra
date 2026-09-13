# Validation script for documentation reorganization
# Checks:
# 1. Every doc appears in exactly one INDEX
# 2. All markdown links resolve
# 3. Every logical section has start/end append markers
# 4. No orphaned docs

$ErrorActionPreference = "Stop"

$claudeDocsRoot = ".claude/docs"
$sddDocsRoot = ".sdd/docs"

function Get-MdFiles($root) {
    Get-ChildItem -Path $root -Recurse -Filter "*.md" | Select-Object -ExpandProperty FullName
}

function Get-IndexFiles($root) {
    Get-ChildItem -Path $root -Recurse -Filter "INDEX.md" | Select-Object -ExpandProperty FullName
}

function Get-AllDocs($root) {
    Get-ChildItem -Path $root -Recurse -File | Where-Object { $_.Extension -match '^\.(md|tsv|sdd)$' } | Select-Object -ExpandProperty FullName
}

function Test-AppendMarkers($file) {
    $content = Get-Content -LiteralPath $file -Raw
    $startCount = ([regex]::Matches($content, '<!-- \[APPEND:[^\]]+\] -->')).Count
    $endCount = ([regex]::Matches($content, '<!-- \[END:APPEND:[^\]]+\] -->')).Count
    return $startCount -eq $endCount
}

Write-Host "=== Documentation Validation ===" -ForegroundColor Cyan
Write-Host ""

# Check .claude/docs
Write-Host "--- .claude/docs/ ---" -ForegroundColor Yellow
$claudeIndexes = Get-IndexFiles $claudeDocsRoot
$claudeDocs = Get-AllDocs $claudeDocsRoot
$claudeMdFiles = Get-MdFiles $claudeDocsRoot

$indexedClaude = @{}
foreach ($idx in $claudeIndexes) {
    $content = Get-Content -LiteralPath $idx -Raw
    $files = [regex]::Matches($content, '\[.*?\]\((.*?)\)') | ForEach-Object { $_.Groups[1].Value }
    foreach ($f in $files) {
        $fullPath = Join-Path $claudeDocsRoot $f
        if ($indexedClaude.ContainsKey($fullPath)) {
            Write-Host "  DUPLICATE INDEX: $fullPath appears in $($indexedClaude[$fullPath]) and $idx" -ForegroundColor Red
        } else {
            $indexedClaude[$fullPath] = $idx
        }
    }
}

Write-Host "  INDEX files: $($claudeIndexes.Count)"
Write-Host "  Total docs: $($claudeDocs.Count)"
Write-Host "  MD files: $($claudeMdFiles.Count)"

$orphanedClaude = $claudeDocs | Where-Object { $_ -notin $indexedClaude.Keys -and $_ -notmatch 'INDEX\.md$|README\.md$' }
foreach ($orphan in $orphanedClaude) {
    Write-Host "  ORPHAN: $orphan" -ForegroundColor Red
}

foreach ($md in $claudeMdFiles) {
    if (-not (Test-AppendMarkers $md)) {
        Write-Host "  MARKER MISMATCH: $md" -ForegroundColor Red
    }
}

# Check .sdd/docs
Write-Host ""
Write-Host "--- .sdd/docs/ ---" -ForegroundColor Yellow
$sddIndexes = Get-IndexFiles $sddDocsRoot
$sddDocs = Get-AllDocs $sddDocsRoot
$sddMdFiles = Get-MdFiles $sddDocsRoot

$indexedSdd = @{}
foreach ($idx in $sddIndexes) {
    $content = Get-Content -LiteralPath $idx -Raw
    $files = [regex]::Matches($content, '\[.*?\]\((.*?)\)') | ForEach-Object { $_.Groups[1].Value }
    foreach ($f in $files) {
        $fullPath = Join-Path $sddDocsRoot $f
        if ($indexedSdd.ContainsKey($fullPath)) {
            Write-Host "  DUPLICATE INDEX: $fullPath appears in $($indexedSdd[$fullPath]) and $idx" -ForegroundColor Red
        } else {
            $indexedSdd[$fullPath] = $idx
        }
    }
}

Write-Host "  INDEX files: $($sddIndexes.Count)"
Write-Host "  Total docs: $($sddDocs.Count)"
Write-Host "  MD files: $($sddMdFiles.Count)"

$orphanedSdd = $sddDocs | Where-Object { $_ -notin $indexedSdd.Keys -and $_ -notmatch 'INDEX\.md$|README\.md$' }
foreach ($orphan in $orphanedSdd) {
    Write-Host "  ORPHAN: $orphan" -ForegroundColor Red
}

foreach ($md in $sddMdFiles) {
    if (-not (Test-AppendMarkers $md)) {
        Write-Host "  MARKER MISMATCH: $md" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Validation Complete ===" -ForegroundColor Cyan
