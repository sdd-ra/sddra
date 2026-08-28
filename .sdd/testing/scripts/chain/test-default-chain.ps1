# Chain Tests: Default Chain Execution

Describe "Default Chain Execution Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent $PSScriptRoot
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Default Chain Definition" {
        It "default.sdd exists" {
            $file = Join-Path $sddDir "chains/default.sdd"
            $file | Should -Exist
        }
        
        It "default chain includes P1" {
            $file = Join-Path $sddDir "chains/default.sdd"
            $content = Get-Content $file -Raw
            $content -match 'P1' | Should -Be $true
        }
        
        It "default chain includes D1" {
            $file = Join-Path $sddDir "chains/default.sdd"
            $content = Get-Content $file -Raw
            $content -match 'D1' | Should -Be $true
        }
        
        It "default chain includes S1" {
            $file = Join-Path $sddDir "chains/default.sdd"
            $content = Get-Content $file -Raw
            $content -match 'S1' | Should -Be $true
        }
        
        It "default chain includes C1" {
            $file = Join-Path $sddDir "chains/default.sdd"
            $content = Get-Content $file -Raw
            $content -match 'C1' | Should -Be $true
        }
        
        It "default chain includes R1" {
            $file = Join-Path $sddDir "chains/default.sdd"
            $content = Get-Content $file -Raw
            $content -match 'R1' | Should -Be $true
        }
        
        It "default chain includes DEP1" {
            $file = Join-Path $sddDir "chains/default.sdd"
            $content = Get-Content $file -Raw
            $content -match 'DEP1' | Should -Be $true
        }
    }
    
    Context "Chain Selector" {
        It "selector.sdd exists" {
            $file = Join-Path $sddDir "chains/selector.sdd"
            $file | Should -Exist
        }
        
        It "selector can choose default chain" {
            $file = Join-Path $sddDir "chains/selector.sdd"
            $content = Get-Content $file -Raw
            $content -match 'default' | Should -Be $true
        }
    }
}
