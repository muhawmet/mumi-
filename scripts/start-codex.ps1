param(
  [string]$Prompt,
  [string[]]$Image
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

$candidates = @()
if ($env:CODEX_CLI_PATH) {
  $candidates += $env:CODEX_CLI_PATH
}

$npmCodex = Join-Path $env:APPDATA 'npm\codex.cmd'
if (Test-Path -LiteralPath $npmCodex) {
  $candidates += $npmCodex
}

$binRoot = Join-Path $env:LOCALAPPDATA 'OpenAI\Codex\bin'
if (Test-Path -LiteralPath $binRoot) {
  $candidates += Get-ChildItem -LiteralPath $binRoot -Filter codex.exe -Recurse -File |
    Sort-Object LastWriteTime -Descending |
    Select-Object -ExpandProperty FullName
}

$pathCommand = Get-Command codex -ErrorAction SilentlyContinue
if ($pathCommand) {
  $candidates += $pathCommand.Source
}

$codex = $candidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
if (-not $codex) {
  throw 'Codex CLI bulunamadı. Codex masaüstü uygulamasını açıp güncelleyin.'
}

$codexArgs = @('-C', $projectRoot, '--search')

foreach ($item in $Image) {
  $resolved = (Resolve-Path -LiteralPath $item).Path
  $codexArgs += @('-i', $resolved)
}

if ($Prompt) {
  $codexArgs += $Prompt
}

Write-Host "MAMILAS Codex başlatılıyor: $codex" -ForegroundColor Cyan
# Bu launcher model/reasoning'i BURADA zorlamaz — Codex CLI kendi yapılandırmasından
# (config.toml / oturum) okur. Tutulmayan bir söz basmak yerine gerçeği söylüyoruz:
# model seçimi Codex tarafında yaşar. (launcher-parity.md drift #3 kapatıldı.)
Write-Host 'imagegen: .codex/config.toml · model/reasoning: Codex oturumundan' -ForegroundColor DarkCyan
& $codex @codexArgs
exit $LASTEXITCODE
