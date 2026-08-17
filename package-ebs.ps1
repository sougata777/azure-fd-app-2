# PowerShell Script to Publish and Package application for AWS Elastic Beanstalk with Unix path separators (/)
param(
    [string]$OutputZip = "app_source_bundle.zip"
)

$ErrorActionPreference = "Stop"

Write-Host "1. Building and publishing .NET application..." -ForegroundColor Cyan
dotnet publish -c Release -o ./bin/Release/net10.0/publish

$publishDir = Resolve-Path "./bin/Release/net10.0/publish"
$zipPath = Resolve-Path -Path "." | Select-Object -ExpandProperty Path
$fullZipPath = Join-Path $zipPath $OutputZip

if (Test-Path $fullZipPath) {
    Remove-Item $fullZipPath -Force
}

Write-Host "2. Creating deployment ZIP bundle with Unix-style forward slashes (/)..." -ForegroundColor Cyan
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archive = [System.IO.Compression.ZipFile]::Open($fullZipPath, [System.IO.Compression.ZipArchiveMode]::Create)
$files = Get-ChildItem -Path $publishDir -Recurse -File

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($publishDir.Path.Length + 1).Replace("\", "/")
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $relativePath)
}
$archive.Dispose()

Write-Host "3. Verifying path separators inside $OutputZip..." -ForegroundColor Cyan
$zip = [System.IO.Compression.ZipFile]::OpenRead($fullZipPath)
$backslashCount = 0
foreach ($entry in $zip.Entries) {
    if ($entry.FullName.Contains("\")) {
        $backslashCount++
        Write-Host "WARNING: Backslash found in entry: $($entry.FullName)" -ForegroundColor Red
    }
}
$zip.Dispose()

if ($backslashCount -eq 0) {
    Write-Host "SUCCESS: Created $OutputZip with 100% Unix forward-slash paths!" -ForegroundColor Green
} else {
    Write-Error "FAILED: $backslashCount entry paths contain backslashes."
}
