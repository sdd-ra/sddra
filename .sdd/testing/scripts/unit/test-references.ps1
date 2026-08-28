# Unit Tests: @References Resolution

Describe "@References Resolution Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent $PSScriptRoot
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Reference Format" {
        It "all @references use valid path format" {
            $files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd"
            $refPattern = '@[a-zA-Z0-9_/\-\.]+'
            
            foreach ($file in $files) {
                $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
                if ($content -match $refPattern) {
                    $matches = [regex]::Matches($content, $refPattern)
                    foreach ($match in $matches) {
                        $ref = $match.Value
                        $ref -match '^@[a-zA-Z0-9_/\-\.]+$' | Should -Be $true
                    }
                }
            }
        }
    }
    
    Context "Reference Resolution" {
        It "all @references resolve to existing files" {
            $files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd"
            $refPattern = '@[a-zA-Z0-9_/\-\.]+'
            $missingRefs = @()
            
            foreach ($file in $files) {
                $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
                if ($content -match $refPattern) {
                    $matches = [regex]::Matches($content, $refPattern)
                    foreach ($match in $matches) {
                        $ref = $match.Value
                        $path = $ref.Substring(1) # Remove @
                        $fullPath = Join-Path $sddDir $path
                        if (-not (Test-Path $fullPath)) {
                            $missingRefs += "$($file.Name) -> $ref"
                        }
                    }
                }
            }
            
            $missingRefs | Should -BeNullOrEmpty
        }
    }
}
