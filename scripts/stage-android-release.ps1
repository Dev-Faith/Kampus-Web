# Stage a signed APK and its metadata together; deployment is a separate step.
[CmdletBinding(SupportsShouldProcess)]
param(
  [Parameter(Mandatory)][string]$Apk,
  [string]$BuildTools,
  [uri]$AssetUrl,
  [switch]$ReplaceLegacyTestApk
)
$ErrorActionPreference = 'Stop'
$webRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$metadataPath = Join-Path $webRoot 'src/lib/constants/android-release.json'
$current = Get-Content -Raw -LiteralPath $metadataPath | ConvertFrom-Json
if (!$BuildTools) {
  $sdk = $env:ANDROID_HOME
  if (!$sdk) { $sdk = Join-Path $env:LOCALAPPDATA 'Android/Sdk' }
  $BuildTools = (Get-ChildItem (Join-Path $sdk 'build-tools') -Directory |
    Where-Object { $_.Name -match '^\d+(\.\d+){2}$' } |
    Sort-Object { [version]$_.Name } -Descending | Select-Object -First 1).FullName
}
function Get-SigningCertificate([string]$File) {
  $report = & (Join-Path $BuildTools 'apksigner.bat') verify --print-certs $File
  if ($LASTEXITCODE -ne 0) { throw 'Invalid APK signature.' }
  $line = $report | Select-String '^Signer #1 certificate SHA-256 digest: ([a-f0-9]{64})$'
  if (!$line) { throw 'Could not identify the signing certificate.' }
  return $line.Matches[0].Groups[1].Value
}
$artifact = Get-Item -LiteralPath $Apk
$manifest = & (Join-Path $BuildTools 'aapt.exe') dump badging $artifact.FullName
if ($LASTEXITCODE -ne 0) { throw 'Cannot read the APK manifest.' }
$package = $manifest | Select-String "^package: name='([^']+)' versionCode='(\d+)' versionName='(\d+\.\d+\.\d+)'"
if (!$package) { throw 'Expected an Android APK with a three-part numeric version.' }
$fields = $package.Matches[0].Groups
$code = [int]$fields[2].Value
$version = $fields[3].Value
if ($fields[1].Value -ne $current.packageName -or $code -le $current.versionCode) { throw 'Use the same Android package and a higher versionCode.' }
$publicDir = Join-Path $webRoot 'public'
$certificate = Get-SigningCertificate $artifact.FullName
if ($certificate -ne $current.signingCertificateSha256) {
  $legacyDebug = 'fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c'
  if (!$ReplaceLegacyTestApk -or $current.versionCode -ne 1 -or $current.signingCertificateSha256 -ne $legacyDebug) {
    throw 'Signing certificate differs. Only the original 1.0.0 debug baseline can be replaced, using -ReplaceLegacyTestApk.'
  }
  # Some testers already installed the signed EAS 1.0.1 / build 2 APK.
  # Preserve that identity during the website's one-time move off the debug key.
  $signedBuild2 = 'c113c6990af5f8a392c4ca2e1a66482d0fbc6e3edc8e8ac74f8decfdf707c5d0'
  if ($certificate -ne $signedBuild2) {
    throw 'Use the same signing certificate as the signed 1.0.1 build 2 APK so existing signed installs can update.'
  }
  Write-Warning 'Existing 1.0.0 testers must reinstall once to switch to this signing key.'
}
if ($AssetUrl) {
  if ($AssetUrl.Scheme -ne 'https' -or $AssetUrl.UserInfo -or $AssetUrl.Query -or $AssetUrl.Fragment) {
    throw 'Use a permanent public HTTPS asset link without credentials or an expiring query string.'
  }
  # Check the actual bytes before advertising a remotely hosted APK.
  $client = [Net.Http.HttpClient]::new()
  try {
    $stream = $client.GetStreamAsync($AssetUrl).GetAwaiter().GetResult()
    try { $remoteHash = (Get-FileHash -InputStream $stream -Algorithm SHA256).Hash }
    finally { $stream.Dispose() }
  } finally { $client.Dispose() }
  if ($remoteHash -ne (Get-FileHash -LiteralPath $artifact.FullName -Algorithm SHA256).Hash) {
    throw 'The hosted file differs from the signed APK.'
  }
} elseif ($artifact.Length -gt 100MB) {
  throw 'This APK exceeds the regular GitHub file limit. Upload it as a public release asset or to object storage and pass -AssetUrl.'
}
$filename = "kampus-v$version-build$code.apk"
$destination = Join-Path $publicDir $filename
if (Test-Path -LiteralPath $destination) { throw 'A file already exists for this build.' }
if ($PSCmdlet.ShouldProcess($webRoot, "Stage Kampus $version (Android build $code)")) {
  if (!$AssetUrl) { Copy-Item -LiteralPath $artifact.FullName -Destination $destination }
  $current.version = $version
  $current.versionCode = $code
  $current.apkFileName = $filename
  $current.assetUrl = if ($AssetUrl) { $AssetUrl.AbsoluteUri } else { '' }
  $current.signingCertificateSha256 = $certificate
  $current.fileSize = '{0:N1} MB' -f ($artifact.Length / 1MB)
  $current.releasedAt = Get-Date -Format 'MMMM yyyy'
  [System.IO.File]::WriteAllText($metadataPath, ($current | ConvertTo-Json) + [Environment]::NewLine)
  Write-Output "Staged $filename. Deploy the updated website."
}
