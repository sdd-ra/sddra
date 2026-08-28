# Skill Tests: Relevance Scoring

Describe "Skill Relevance Scoring Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent $PSScriptRoot
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Relevance Calculation" {
        It "SKILL-RECOMMENDATION exists" {
            $file = Join-Path $sddDir "skills/SKILL-RECOMMENDATION.sdd"
            $file | Should -Exist
        }
        
        It "relevance has 4 dimensions" {
            $file = Join-Path $sddDir "skills/SKILL-RECOMMENDATION.sdd"
            $content = Get-Content $file -Raw
            $content -match 'Domain Match' | Should -Be $true
            $content -match 'Technology Match' | Should -Be $true
            $content -match 'Use Case Match' | Should -Be $true
            $content -match 'Maturity' | Should -Be $true
        }
        
        It "relevance threshold is 80%" {
            $file = Join-Path $sddDir "skills/SKILL-RECOMMENDATION.sdd"
            $content = Get-Content $file -Raw
            $content -match '80%' | Should -Be $true
        }
        
        It "relevance has recommendation levels" {
            $file = Join-Path $sddDir "skills/SKILL-RECOMMENDATION.sdd"
            $content = Get-Content $file -Raw
            $content -match 'Strongly recommend' | Should -Be $true
            $content -match 'Consider with caution' | Should -Be $true
            $content -match 'Do not recommend' | Should -Be $true
        }
    }
}
