$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$version = $env:RELEASE_VERSION
$manifest = Get-Content -Raw -LiteralPath 'manifest.json' | ConvertFrom-Json
if ($version -ne $manifest.version -or $version -notmatch '^\d+\.\d+\.\d+$') {
    throw 'Release version must match the manifest version.'
}
$tag = "v$version"
$repo = $env:GITHUB_REPOSITORY
$commit = $env:GITHUB_SHA
if (!$repo -or !$commit) { throw 'GitHub repository and commit are required.' }
$zip = Join-Path $projectRoot "dist/chatjump-$version.zip"
if (!(Test-Path -LiteralPath $zip)) { throw "Missing release ZIP: $zip" }
$notes = @"
ChatJump $version — a searchable question navigator for ChatGPT.

## Install in Chrome

1. Download **chatjump-$version.zip** from the Assets below.
2. Extract the ZIP into a permanent folder.
3. Open chrome://extensions and enable **Developer mode**.
4. Choose **Load unpacked** and select the extracted folder containing manifest.json.
5. Disable the original ChatGPT Navigator extension if installed, then reload ChatGPT tabs.

Questions update automatically. Click a question to jump to it, search the list, or use Alt+N to hide/show the panel. Questions and answers remain fully visible.

For an existing unpacked installation, replace its files with this version, click Reload on its card in chrome://extensions, and reload ChatGPT tabs. GitHub releases do not automatically update installed Chrome extensions.

The release ZIP passed the automated regression suite and an isolated Chromium extension test. It contains runtime files, icons, and the original MIT license.

Source commit: $commit
"@
$notesPath = Join-Path $env:RUNNER_TEMP 'chatjump-release-notes.md'
Set-Content -LiteralPath $notesPath -Value $notes -Encoding utf8

$existingJson = & gh release view $tag --repo $repo --json isDraft,targetCommitish 2>$null
if ($LASTEXITCODE -eq 0) {
    $existing = $existingJson | ConvertFrom-Json
    if (!$existing.isDraft) {
        Write-Output "$tag is already published."
        exit 0
    }
    if ($existing.targetCommitish -ne $commit) { throw 'Existing draft targets a different commit; inspect it before retrying.' }
    & gh release upload $tag $zip --repo $repo --clobber
    if ($LASTEXITCODE -ne 0) { throw 'Could not upload release ZIP.' }
} else {
    & gh release create $tag $zip --repo $repo --target $commit --title "ChatJump $version" --notes-file $notesPath --draft
    if ($LASTEXITCODE -ne 0) { throw 'Could not create draft release.' }
}
& gh release edit $tag --repo $repo --draft=false --latest --notes-file $notesPath
if ($LASTEXITCODE -ne 0) { throw 'Could not publish release.' }
