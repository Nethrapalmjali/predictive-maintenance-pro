$source = "c:\Users\Ganesh Biradar\.gemini\antigravity\scratch\predictive-maintenance"
$dest = "C:\Users\Ganesh Biradar\Downloads\predictive-maintenance.zip"

Write-Host "Creating ZIP archive of ALL files (this may take a while if node_modules is large)..."
if (Test-Path $dest) { Remove-Item $dest -Force }

# Using Compress-Archive on the folder itself to include everything
Compress-Archive -Path $source -DestinationPath $dest -Force

Write-Host "Project zipped successfully including all files to: $dest"
