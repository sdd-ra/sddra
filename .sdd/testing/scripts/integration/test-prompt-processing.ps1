# Integration Tests: Prompt Processing

Describe "Prompt Processing Integration Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "Prompts Directory Structure" {
        It "prompts/ directory exists at root" {
            $promptsDir | Should Be $true
        }
        
        It "prompts/inbox/ exists" {
            $inbox = Join-Path $promptsDir "inbox"
            $inbox | Should Be $true
        }
        
        It "prompts/active/ exists" {
            $active = Join-Path $promptsDir "active"
            $active | Should Be $true
        }
        
        It "prompts/archive/ exists" {
            $archive = Join-Path $promptsDir "archive"
            $archive | Should Be $true
        }
        
        It "prompts/extracted/ exists" {
            $extracted = Join-Path $promptsDir "extracted"
            $extracted | Should Be $true
        }
    }
    
    Context "Example Prompts" {
        It "at least one example prompt exists" {
            $examples = Get-ChildItem -Path $promptsDir -Directory -Filter "prompt-*"
            $examples.Count | Should BeGreaterOrThan 0
        }
        
        It "example prompt has prompt.md" {
            $examples = Get-ChildItem -Path $promptsDir -Directory -Filter "prompt-*"
            if ($examples.Count -gt 0) {
                $promptFile = Join-Path $examples[0].FullName "prompt.md"
                $promptFile | Should Be $true
            }
        }
        
        It "example prompt has skill/ directory" {
            $examples = Get-ChildItem -Path $promptsDir -Directory -Filter "prompt-*"
            if ($examples.Count -gt 0) {
                $skillDir = Join-Path $examples[0].FullName "skill"
                $skillDir | Should Be $true
            }
        }
    }
    
    Context "/sdd Command Integration" {
        It "sdd.sdd references prompts/ folder" {
            $sddFile = Join-Path $sddDir "commands/sdd.sdd"
            $content = Get-Content $sddFile -Raw
            $content -match 'prompts/' | Should Be $true
        }
        
        It "PROJECT.sdd has prompts root path" {
            $project = Join-Path $sddDir "PROJECT.sdd"
            $content = Get-Content $project -Raw
            $content -match '../prompts' | Should Be $true
        }
    }
}
