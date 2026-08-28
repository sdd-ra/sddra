# Chain Tests: Parallel Execution

Describe "Parallel Execution Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent $PSScriptRoot
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Parallel Execution Definition" {
        It "parallel-execution.sdd exists" {
            $file = Join-Path $sddDir "workflows/parallel-execution.sdd"
            $file | Should -Exist
        }
        
        It "parallel execution has stage-level parallelism" {
            $file = Join-Path $sddDir "workflows/parallel-execution.sdd"
            $content = Get-Content $file -Raw
            $content -match 'stage-level' | Should -Be $true
        }
        
        It "parallel execution has task-level parallelism" {
            $file = Join-Path $sddDir "workflows/parallel-execution.sdd"
            $content = Get-Content $file -Raw
            $content -match 'task-level' | Should -Be $true
        }
        
        It "parallel execution has fan-out pattern" {
            $file = Join-Path $sddDir "workflows/parallel-execution.sdd"
            $content = Get-Content $file -Raw
            $content -match 'fan-out' | Should -Be $true
        }
        
        It "parallel execution has fan-in pattern" {
            $file = Join-Path $sddDir "workflows/parallel-execution.sdd"
            $content = Get-Content $file -Raw
            $content -match 'fan-in' | Should -Be $true
        }
    }
    
    Context "Parallel Safety" {
        It "parallel execution has safety rules" {
            $file = Join-Path $sddDir "workflows/parallel-execution.sdd"
            $content = Get-Content $file -Raw
            $content -match 'PE1' | Should -Be $true
            $content -match 'PE2' | Should -Be $true
            $content -match 'PE3' | Should -Be $true
            $content -match 'PE4' | Should -Be $true
            $content -match 'PE5' | Should -Be $true
        }
        
        It "parallel execution has locking strategy" {
            $file = Join-Path $sddDir "workflows/parallel-execution.sdd"
            $content = Get-Content $file -Raw
            $content -match 'lock' | Should -Be $true
        }
    }
}
