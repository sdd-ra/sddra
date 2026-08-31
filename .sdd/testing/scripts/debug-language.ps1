$sddDir = 'D:\Tasks\ai_code\sddra.ai\.sdd'
$files = Get-ChildItem -Path $sddDir -Recurse -Filter '*.sdd'
$nonEnglishFiles = @()
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match '\b(?:bu|qovluq|sened|melumat|gore|etmek|olan|ucun|ile|yeni|var|da|ki|ne|de|bir|daha|sistem|qayda|sert)\b') {
        $nonEnglishFiles += $file.FullName
    }
}
Write-Output "Found $($nonEnglishFiles.Count) files with Azerbaijani words:"
$nonEnglishFiles | ForEach-Object { Write-Output $_ }
