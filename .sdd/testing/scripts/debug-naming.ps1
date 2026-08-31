$sddDir = 'D:\Tasks\ai_code\sddra.ai\.sdd'
$files = Get-ChildItem -Path $sddDir -Recurse -Filter '*.sdd'
foreach ($file in $files) {
    $name = $file.Name
    if ($name -notmatch '^[a-z0-9-]+\.sdd$|^[A-Z0-9-]+\.sdd$') {
        Write-Output $file.FullName
    }
}
