$sddDir = 'D:\Tasks\ai_code\sddra.ai\.sdd'
$files = Get-ChildItem -Path $sddDir -Recurse -Filter '*.sdd'
$validStates = @('+', '~', '@', '>', '*', '_')
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match '(?m)^State:[ \t]*(\S+)') {
        $state = $matches[1].Trim()
        if ($validStates -notcontains $state) {
            Write-Output ('{0}: {1}' -f $file.FullName, $state)
        }
    }
}
