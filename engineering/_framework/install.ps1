<#
  Installs the AI-coding framework into another repository.
  Usage:  .\install.ps1 -Target D:\AI\Dev\my-other-project
#>
param(
  [Parameter(Mandatory = $true)][string]$Target,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$src = Split-Path -Parent $PSCommandPath          # engineering/_framework
$repo = Split-Path -Parent (Split-Path -Parent $src)

if (-not (Test-Path $Target)) { throw "Target not found: $Target" }

$pairs = @(
  @{ From = Join-Path $repo '.claude\commands';  To = Join-Path $Target '.claude\commands' },
  @{ From = Join-Path $repo '.claude\agents';    To = Join-Path $Target '.claude\agents'   },
  @{ From = $src;                                To = Join-Path $Target 'engineering\_framework' }
)

foreach ($p in $pairs) {
  New-Item -ItemType Directory -Force -Path $p.To | Out-Null
  Copy-Item -Path (Join-Path $p.From '*') -Destination $p.To -Recurse -Force:$Force
  Write-Host "copied  $($p.From)  ->  $($p.To)"
}

foreach ($f in @('README.md', 'standards.md')) {
  $dest = Join-Path $Target "engineering\$f"
  if ((Test-Path $dest) -and -not $Force) { Write-Host "skipped $f (exists; use -Force)" ; continue }
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  Copy-Item (Join-Path $repo "engineering\$f") $dest -Force
  Write-Host "copied  engineering\$f"
}

New-Item -ItemType Directory -Force -Path (Join-Path $Target 'engineering\opportunities') | Out-Null

Write-Host ''
Write-Host 'Next in the target repo:' -ForegroundColor Cyan
Write-Host '  1. Copy engineering\_framework\CLAUDE.proposed.md -> CLAUDE.md and fix the git section'
Write-Host '  2. Run  /ctx   to build engineering\project-context\'
Write-Host '  3. Review invariants.md by hand'
Write-Host '  4. Trim standards.md to that project'
Write-Host '  5. Run  /eo <first change>'
