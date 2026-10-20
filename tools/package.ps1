$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content -Raw -LiteralPath (Join-Path $projectRoot 'manifest.json') | ConvertFrom-Json
$distDir = Join-Path $projectRoot 'dist'
New-Item -ItemType Directory -Force -Path $distDir | Out-Null
$archivePath = Join-Path $distDir ('chatjump-' + $manifest.version + '.zip')
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$stream = [System.IO.File]::Open($archivePath, [System.IO.FileMode]::Create)
$archive = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    $files = @('manifest.json', 'content.js', 'styles.css', 'LICENSE.txt')
    $files += $manifest.content_scripts[0].js | Where-Object { $_ -ne 'content.js' }
    $files += $manifest.icons.PSObject.Properties.Value
    foreach ($relativePath in ($files | Sort-Object -Unique)) {
        $sourcePath = Join-Path $projectRoot $relativePath
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $sourcePath, $relativePath.Replace('\', '/')) | Out-Null
    }
} finally { $archive.Dispose() }
Write-Output $archivePath
