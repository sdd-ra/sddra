# Unit Tests: Metadata Completeness

Describe "Metadata Completeness Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent $PSScriptRoot
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Required Fields" {
        It "all .sdd files have Purpose" {
            $files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd"
            foreach ($file in $files) {
                $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
                $content -match 'Purpose:' | Should -Be $true
            }
        }
        
        It "all .sdd files have State" {
            $files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd"
            foreach ($file in $files) {
                $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
                $content -match 'State:' | Should -Be $true
            }
        }
        
        It "all .sdd files have Owns or Rules" {
            $files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd"
            foreach ($file in $files) {
                $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
                ($content -match 'Owns:' -or $content -match 'Rules:') | Should -Be $true
            }
        }
    }
    
    Context "State Values" {
        It "all State values are valid symbols" {
            $files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd"
            $validStates = @('+', '~', '@', '>', '*', '_')
            
            foreach ($file in $files) {
                $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
                if ($content -match 'State:\s*(\S+)') {
                    $state = $matches[1].Trim()
                    $validStates -contains $state | Should -Be $true
                }
            }
        }
    }
}
