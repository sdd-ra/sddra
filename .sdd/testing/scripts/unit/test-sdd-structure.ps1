# Unit Tests: .sdd/ Structure

Describe ".sdd/ Structure Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Core Files" {
        It "PROJECT.sdd exists" {
            $file = Join-Path $sddDir "PROJECT.sdd"
            Test-Path $file | Should Be $true
        }
        
        It "INDEX.sdd exists" {
            $file = Join-Path $sddDir "INDEX.sdd"
            Test-Path $file | Should Be $true
        }
        
        It "protocol/ROOT.sdd exists" {
            $file = Join-Path $sddDir "protocol/ROOT.sdd"
            Test-Path $file | Should Be $true
        }
        
        It "chains/graph.sdd exists" {
            $file = Join-Path $sddDir "chains/graph.sdd"
            Test-Path $file | Should Be $true
        }
        
        It "templates/INDEX.sdd exists" {
            $file = Join-Path $sddDir "templates/INDEX.sdd"
            Test-Path $file | Should Be $true
        }
    }
    
    Context "Required Directories" {
        $requiredDirs = @(
            "architecture", "bugs", "cases", "chains", "commands",
            "context", "decisions", "dependencies", "discovery",
            "gates", "graph", "observability", "orchestrator",
            "patterns", "plugins", "project", "prompts", "protocol",
            "runtime", "schemas", "security", "skills", "stack",
            "stages", "standards", "state", "tasks", "templates",
            "testing", "workflow", "workflows"
        )
        
        foreach ($dir in $requiredDirs) {
            It "$dir directory exists" {
                $path = Join-Path $sddDir $dir
                Test-Path $path | Should Be $true
            }
        }
    }
    
    Context "File Naming Conventions" {
        It "all .sdd files use kebab-case or UPPER-CASE" {
            $files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd"
            foreach ($file in $files) {
                $name = $file.Name
                $name -match '^[a-z0-9-]+\.sdd$|^[A-Z0-9-]+\.sdd$|^[A-Za-z0-9-]+\.template\.sdd$' | Should Be $true
            }
        }
    }
}
