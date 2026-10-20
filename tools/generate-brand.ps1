$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
function Draw-Brand($graphics, [single]$x, [single]$y, [single]$size) {
    $state = $graphics.Save()
    $graphics.TranslateTransform($x, $y)
    $graphics.ScaleTransform(($size / 128), ($size / 128))
    $background = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#147d75'))
    $graphics.FillEllipse($background, 8, 8, 112, 112)
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 7)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    foreach ($lineY in @(42, 64, 86)) { $graphics.DrawLine($pen, 35, $lineY, 62, $lineY) }
    $graphics.DrawLine($pen, 80, 43, 96, 59)
    $graphics.DrawLine($pen, 96, 59, 80, 75)
    $graphics.DrawLine($pen, 73, 59, 96, 59)
    $pen.Dispose()
    $background.Dispose()
    $graphics.Restore($state)
}
foreach ($size in @(16, 32, 48, 128)) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.Color]::Transparent)
    Draw-Brand $graphics 0 0 $size
    $bitmap.Save((Join-Path $projectRoot "icons/icon$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}
$bitmap = New-Object System.Drawing.Bitmap(440, 280)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#102b32'))
Draw-Brand $graphics 25 58 160
$font = New-Object System.Drawing.Font('Segoe UI', 28, [System.Drawing.FontStyle]::Bold)
$graphics.DrawString('ChatJump', $font, [System.Drawing.Brushes]::White, 180, 98)
$font.Dispose()
$pen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#6ed6c2'), 5)
$graphics.DrawLine($pen, 187, 162, 371, 162)
$graphics.DrawLine($pen, 187, 178, 327, 178)
$pen.Dispose()
$bitmap.Save((Join-Path $projectRoot 'store/promo-440x280.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()
