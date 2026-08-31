$scriptPath = $MyInvocation.MyCommand.Path
$scriptsDir = Split-Path -Parent $scriptPath
$testingDir = Split-Path -Parent $scriptsDir
$sddDir = Split-Path -Parent $testingDir

if (-not (Test-Path $sddDir)) {
    Write-Error "Cannot find .sdd directory at: $sddDir"
    exit 1
}

$files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd" -ErrorAction SilentlyContinue

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    $relativePath = $file.FullName.Substring($sddDir.Length + 1)
    $modified = $false
    
    # Fix Purpose
    if ($content -notmatch 'Purpose:') {
        $lines = $content -split "`r?`n"
        $insertIndex = 1
        for ($i = 1; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match '^#') { continue }
            if ($lines[$i] -match '^[A-Za-z]+:') {
                $insertIndex = $i
                break
            }
        }
        
        $name = $file.BaseName
        $purpose = "Purpose:`n  Auto-generated purpose for $name.`n"
        $lines = $lines[0..($insertIndex-1)] + ($purpose -split "`r?`n") + $lines[$insertIndex..($lines.Length-1)]
        $content = $lines -join "`r`n"
        $modified = $true
    }
    
    # Fix Owns or Rules
    if (($content -notmatch 'Owns:') -and ($content -notmatch 'Rules:')) {
        $lines = $content -split "`r?`n"
        $insertIndex = $lines.Length
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match '^Purpose:') {
                $insertIndex = $i + 1
                for ($j = $i + 1; $j -lt $lines.Length; $j++) {
                    if ($lines[$j] -match '^[A-Za-z]+:' -or $lines[$j] -match '^##') {
                        $insertIndex = $j
                        break
                    }
                    $insertIndex = $j + 1
                }
                break
            }
        }
        
        $owns = "Owns: $relativePath"
        $lines = $lines[0..($insertIndex-1)] + $owns + $lines[$insertIndex..($lines.Length-1)]
        $content = $lines -join "`r`n"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Output "Updated: $relativePath"
    }
}
