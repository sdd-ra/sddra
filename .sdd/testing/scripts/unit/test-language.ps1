# Unit Tests: Language Compliance

Describe "Language Compliance Tests" {
    BeforeAll {
        $repoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
        $sddDir = Join-Path $repoRoot ".sdd"
    }
    
    Context "English Only" {
        It "no .sdd files contain Azerbaijani words" {
            $files = Get-ChildItem -Path $sddDir -Recurse -Filter "*.sdd"
            $nonEnglishFiles = @()
            
            foreach ($file in $files) {
                $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
                if ($content -match '\b(?:bu|qovluq|sened|melumat|gore|etmek|olan|ucun|ile|yeni|var|da|ki|ne|de|bir|daha|sistem|qayda|sert)\b') {
                    $nonEnglishFiles += $file.Name
                }
            }
            
            $nonEnglishFiles.Count | Should Be 0
        }
    }
    
    Context "Allowed Exceptions" {
        It "README.md can contain non-English content" {
            $readme = Join-Path $repoRoot "README.md"
            if (Test-Path $readme) {
                $content = Get-Content $readme -Raw -ErrorAction SilentlyContinue
                # README.md is allowed to have mixed content
                $null | Should Be $null
            }
        }
        
        It "old/ directory can contain non-English content" {
            # old/ is archived content, exempt from language check
            $null | Should Be $null
        }
    }
}
