$PSScriptRoot = 'D:\Tasks\ai_code\sddra.ai\.sdd\testing\scripts\unit'
$repoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$sddDir = Join-Path $repoRoot ".sdd"
Write-Output "repoRoot: $repoRoot"
Write-Output "sddDir: $sddDir"
Write-Output "exists: $(Test-Path $sddDir)"
