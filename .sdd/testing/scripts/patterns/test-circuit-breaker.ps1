# Pattern Tests: Circuit Breaker

Describe "Circuit Breaker Pattern Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Circuit Breaker Definition" {
        It "circuit-breaker.sdd exists" {
            $file = Join-Path $sddDir "patterns/circuit-breaker.sdd"
            $file | Should Be $true
        }
        
        It "circuit breaker has 3 states" {
            $file = Join-Path $sddDir "patterns/circuit-breaker.sdd"
            $content = Get-Content $file -Raw
            $content -match 'CLOSED' | Should Be $true
            $content -match 'OPEN' | Should Be $true
            $content -match 'HALF_OPEN' | Should Be $true
        }
        
        It "circuit breaker has failure detection" {
            $file = Join-Path $sddDir "patterns/circuit-breaker.sdd"
            $content = Get-Content $file -Raw
            $content -match 'TIMEOUT' | Should Be $true
            $content -match 'ERROR' | Should Be $true
            $content -match 'VALIDATION' | Should Be $true
        }
        
        It "circuit breaker has recovery mechanism" {
            $file = Join-Path $sddDir "patterns/circuit-breaker.sdd"
            $content = Get-Content $file -Raw
            $content -match 'recovery' | Should Be $true
        }
    }
    
    Context "Circuit Breaker Configuration" {
        It "circuit breaker has default thresholds" {
            $file = Join-Path $sddDir "patterns/circuit-breaker.sdd"
            $content = Get-Content $file -Raw
            $content -match 'failure_threshold' | Should Be $true
            $content -match 'recovery_timeout' | Should Be $true
            $content -match 'success_threshold' | Should Be $true
        }
        
        It "circuit breaker has per-stage configuration" {
            $file = Join-Path $sddDir "patterns/circuit-breaker.sdd"
            $content = Get-Content $file -Raw
            $content -match 'P1:' | Should Be $true
            $content -match 'D1:' | Should Be $true
            $content -match 'C1:' | Should Be $true
        }
    }
}
