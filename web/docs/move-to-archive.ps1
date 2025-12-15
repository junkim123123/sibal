# Archive old documentation files
# Keep only HANDOVER.md in the docs folder

$docsPath = $PSScriptRoot
$archivePath = Join-Path $docsPath "archive"

# Create archive directory if it doesn't exist
if (-not (Test-Path $archivePath)) {
    New-Item -ItemType Directory -Path $archivePath | Out-Null
}

# Get all markdown files except HANDOVER.md
Get-ChildItem -Path $docsPath -Filter "*.md" | Where-Object { $_.Name -ne "HANDOVER.md" } | ForEach-Object {
    $destination = Join-Path $archivePath $_.Name
    Move-Item -Path $_.FullName -Destination $destination -Force
    Write-Host "Moved: $($_.Name) -> archive/"
}

Write-Host "`nDone! All files moved to archive/ except HANDOVER.md"

