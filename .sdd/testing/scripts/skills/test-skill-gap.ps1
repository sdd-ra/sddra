# Skill Tests: Gap Analysis

Describe "Skill Gap Analysis Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Gap Analysis" {
        It "SKILL-GAP-ANALYSIS exists" {
            $file = Join-Path $sddDir "skills/SKILL-GAP-ANALYSIS.sdd"
            $file | Should Be $true
        }
        
        It "gap analysis has coverage thresholds" {
            $file = Join-Path $sddDir "skills/SKILL-GAP-ANALYSIS.sdd"
            $content = Get-Content $file -Raw
            $content -match '80%' | Should Be $true
            $content -match '60%' | Should Be $true
        }
        
        It "gap analysis has priority matrix" {
            $file = Join-Path $sddDir "skills/SKILL-GAP-ANALYSIS.sdd"
            $content = Get-Content $file -Raw
            $content -match 'CRITICAL' | Should Be $true
            $content -match 'HIGH' | Should Be $true
            $content -match 'MEDIUM' | Should Be $true
            $content -match 'LOW' | Should Be $true
        }
    }
}
