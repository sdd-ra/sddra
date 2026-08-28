# Integration Tests: Decision Workflow

Describe "Decision Workflow Integration Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent $PSScriptRoot
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Decision Ledger" {
        It "decisions/INDEX.sdd exists" {
            $file = Join-Path $sddDir "decisions/INDEX.sdd"
            $file | Should -Exist
        }
        
        It "decisions/workflow.sdd exists" {
            $file = Join-Path $sddDir "decisions/workflow.sdd"
            $file | Should -Exist
        }
        
        It "decisions/schema.sdd exists" {
            $file = Join-Path $sddDir "decisions/schema.sdd"
            $file | Should -Exist
        }
        
        It "example-lifecycle.sdd exists" {
            $file = Join-Path $sddDir "decisions/example-lifecycle.sdd"
            $file | Should -Exist
        }
    }
    
    Context "Decision Lifecycle" {
        It "workflow defines 6 states" {
            $file = Join-Path $sddDir "decisions/workflow.sdd"
            $content = Get-Content $file -Raw
            $content -match 'PROPOSED' | Should -Be $true
            $content -match 'REVIEW' | Should -Be $true
            $content -match 'APPROVED' | Should -Be $true
            $content -match 'IMPLEMENTED' | Should -Be $true
            $content -match 'VERIFIED' | Should -Be $true
            $content -match 'CLOSED' | Should -Be $true
        }
    }
}
