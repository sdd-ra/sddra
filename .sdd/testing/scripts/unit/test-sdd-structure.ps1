# Unit Tests: .sdd/ Structure

Describe ".sdd/ Structure Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent $PSScriptRoot
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Core Files" {
        It "PROJECT.sdd exists" {
            $file = Join-Path $sddDir "PROJECT.sdd"
            $file | Should -Exist
        }
        
        It "INDEX.sdd exists" {
            $file = Join-Path $sddDir "INDEX.sdd"
            $file | Should -Exist
        }
        
        It "protocol/ROOT.sdd exists" {
            $file = Join-Path $sddDir "protocol/ROOT.sdd"
            $file | Should -Exist
        }
        
        It "chains/graph.sdd exists" {
            $file = Join-Path $sddDir "chains/graph.sdd"
            $file | Should -Exist
        }
        
        It "templates/INDEX.sdd exists" {
            $file = Join-Path $sddDir "templates/INDEX.sdd"
            $file | Should -Exist
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
                $path | Should -Exist
            }
        }
    }
    
    Context "File Naming Conventions" {
        It "all .sdd files use kebab-case or UPPER-CASE" {
            $files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd"
            foreach ($file in $files) {
                $name = $file.Name
                $name -match '^[a-z0-9-]+\.sdd$|^[A-Z0-9-]+\.sdd$' | Should -Be $true
            }
        }
    }
}
