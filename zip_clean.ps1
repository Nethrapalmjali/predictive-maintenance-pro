$source = "c:\Users\Ganesh Biradar\.gemini\antigravity\scratch\predictive-maintenance"
$dest = "C:\Users\Ganesh Biradar\Downloads\predictive-maintenance-clean.zip"

Write-Host "Creating CLEAN ZIP archive (excluding dependencies)..."

if (Test-Path $dest) { Remove-Item $dest -Force }

# Create a temporary list of files to include
$files = Get-ChildItem -Path $source -Recurse | Where-Object { 
    $_.FullName -notmatch "node_modules" -and 
    $_.FullName -notmatch "venv" -and 
    $_.FullName -notmatch ".next" -and 
    $_.FullName -notmatch "__pycache__" -and
    $_.FullName -notmatch ".git"
}

Compress-Archive -Path $files.FullName -DestinationPath $dest -Force

Write-Host "Clean project zipped successfully to: $dest"
