# Chain Tests: Fast Path

Describe "Fast Path Chain Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Fast Path Definition" {
        It "fast-path.sdd exists" {
            $file = Join-Path $sddDir "chains/fast-path.sdd"
            $file | Should Be $true
        }
        
        It "fast path has 5 stages" {
            $file = Join-Path $sddDir "chains/fast-path.sdd"
            $content = Get-Content $file -Raw
            $content -match 'P1' | Should Be $true
            $content -match 'D1' | Should Be $true
            $content -match 'S1' | Should Be $true
            $content -match 'C1' | Should Be $true
            $content -match 'R1' | Should Be $true
        }
        
        It "fast path skips DEP1" {
            $file = Join-Path $sddDir "chains/fast-path.sdd"
            $content = Get-Content $file -Raw
            $content -notmatch 'DEP1' | Should Be $true
        }
        
        It "fast path has safety checks" {
            $file = Join-Path $sddDir "chains/fast-path.sdd"
            $content = Get-Content $file -Raw
            $content -match 'FP-S1' | Should Be $true
            $content -match 'FP-S2' | Should Be $true
            $content -match 'FP-S3' | Should Be $true
            $content -match 'FP-S4' | Should Be $true
            $content -match 'FP-S5' | Should Be $true
        }
    }
    
    Context "Fast Path Eligibility" {
        It "fast path requires LOW/MEDIUM risk" {
            $file = Join-Path $sddDir "chains/fast-path.sdd"
            $content = Get-Content $file -Raw
            $content -match 'LOW' | Should Be $true
            $content -match 'MEDIUM' | Should Be $true
        }
        
        It "fast path skips architectural changes" {
            $file = Join-Path $sddDir "chains/fast-path.sdd"
            $content = Get-Content $file -Raw
            $content -match 'Architectural Change' | Should Be $true
        }
    }
}
