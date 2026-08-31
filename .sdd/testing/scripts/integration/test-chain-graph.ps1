# Integration Tests: Chain Graph

Describe "Chain Graph Integration Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Graph Structure" {
        It "graph.sdd defines D0 root node" {
            $graph = Join-Path $sddDir "chains/graph.sdd"
            $content = Get-Content $graph -Raw
            $content -match 'D0.*default' | Should Be $true
        }
        
        It "graph.sdd defines 6 arms" {
            $graph = Join-Path $sddDir "chains/graph.sdd"
            $content = Get-Content $graph -Raw
            $content -match 'P1' | Should Be $true
            $content -match 'D1' | Should Be $true
            $content -match 'S1' | Should Be $true
            $content -match 'C1' | Should Be $true
            $content -match 'R1' | Should Be $true
            $content -match 'DEP1' | Should Be $true
        }
        
        It "graph.sdd has cyclic edges" {
            $graph = Join-Path $sddDir "chains/graph.sdd"
            $content = Get-Content $graph -Raw
            $content -match 'D0->P1' | Should Be $true
            $content -match 'P1->D0' | Should Be $true
        }
    }
    
    Context "Chain Arms" {
        It "prompt arm exists" {
            $file = Join-Path $sddDir "chains/arms/prompt.sdd"
            $file | Should Be $true
        }
        
        It "docs arm exists" {
            $file = Join-Path $sddDir "chains/arms/docs.sdd"
            $file | Should Be $true
        }
        
        It "sdd arm exists" {
            $file = Join-Path $sddDir "chains/arms/sdd.sdd"
            $file | Should Be $true
        }
        
        It "code arm exists" {
            $file = Join-Path $sddDir "chains/arms/code.sdd"
            $file | Should Be $true
        }
        
        It "review arm exists" {
            $file = Join-Path $sddDir "chains/arms/review.sdd"
            $file | Should Be $true
        }
        
        It "deploy arm exists" {
            $file = Join-Path $sddDir "chains/arms/deploy.sdd"
            $file | Should Be $true
        }
    }
    
    Context "Fast Path" {
        It "fast-path.sdd exists" {
            $file = Join-Path $sddDir "chains/fast-path.sdd"
            $file | Should Be $true
        }
        
        It "fast-path has safety checks" {
            $file = Join-Path $sddDir "chains/fast-path.sdd"
            $content = Get-Content $file -Raw
            $content -match 'FP-S1' | Should Be $true
            $content -match 'FP-S2' | Should Be $true
        }
    }
}
