# Integration Tests: Skill Loading

Describe "Skill Loading Integration Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Skill Registry" {
        It "skills/INDEX.sdd exists" {
            $file = Join-Path $sddDir "skills/INDEX.sdd"
            $file | Should Be $true
        }
        
        It "skills/INDEX.sdd lists all domains" {
            $file = Join-Path $sddDir "skills/INDEX.sdd"
            $content = Get-Content $file -Raw
            $content -match 'languages' | Should Be $true
            $content -match 'frameworks' | Should Be $true
            $content -match 'databases' | Should Be $true
            $content -match 'platforms' | Should Be $true
            $content -match 'devops' | Should Be $true
        }
        
        It "all skill domains have INDEX.sdd" {
            $domains = @("languages", "frameworks", "databases", "platforms", "messaging", "cross-cutting", "devops", "meta")
            foreach ($domain in $domains) {
                $file = Join-Path $sddDir "skills/$domain/INDEX.sdd"
                $file | Should Be $true
            }
        }
    }
    
    Context "Skill Discovery" {
        It "SKILL-DISCOVERY skill exists" {
            $file = Join-Path $sddDir "skills/SKILL-DISCOVERY.sdd"
            $file | Should Be $true
        }
        
        It "SKILL-RECOMMENDATION skill exists" {
            $file = Join-Path $sddDir "skills/SKILL-RECOMMENDATION.sdd"
            $file | Should Be $true
        }
        
        It "SKILL-GAP-ANALYSIS skill exists" {
            $file = Join-Path $sddDir "skills/SKILL-GAP-ANALYSIS.sdd"
            $file | Should Be $true
        }
    }
    
    Context "Skill Execution Model" {
        It "SKILL-EXECUTION skill exists" {
            $file = Join-Path $sddDir "skills/SKILL-EXECUTION.sdd"
            $file | Should Be $true
        }
        
        It "at least 10 language skills exist" {
            $langDir = Join-Path $sddDir "skills/languages"
            $count = (Get-ChildItem -Path $langDir -Directory).Count
            $count | Should BeGreaterOrEqual 10
        }
        
        It "at least 5 framework skills exist" {
            $fwDir = Join-Path $sddDir "skills/frameworks"
            $count = (Get-ChildItem -Path $fwDir -Directory).Count
            $count | Should BeGreaterOrEqual 5
        }
    }
}
