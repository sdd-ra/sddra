# Skill Tests: Skill Discovery

Describe "Skill Discovery Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent $PSScriptRoot
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Discovery Skill" {
        It "SKILL-DISCOVERY exists" {
            $file = Join-Path $sddDir "skills/SKILL-DISCOVERY.sdd"
            $file | Should -Exist
        }
        
        It "SKILL-DISCOVERY has input/output" {
            $file = Join-Path $sddDir "skills/SKILL-DISCOVERY.sdd"
            $content = Get-Content $file -Raw
            $content -match 'Input:' | Should -Be $true
            $content -match 'Output:' | Should -Be $true
        }
        
        It "SKILL-DISCOVERY has execute steps" {
            $file = Join-Path $sddDir "skills/SKILL-DISCOVERY.sdd"
            $content = Get-Content $file -Raw
            $content -match 'Execute:' | Should -Be $true
        }
    }
}
