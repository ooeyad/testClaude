<#
  Allocates the next feature number, creates specs/NNN-slug/, and reports the
  branch name. Does NOT create the branch or any artifact — the tier decides
  which artifacts exist, and /speckit.specify decides the tier.

  Usage: .\create-feature.ps1 -Name "add brute enemy" [-Kind feat] [-Json]
#>
param(
  [Parameter(Mandatory = $true)][string]$Name,
  [ValidateSet('feat','fix','docs','refactor','chore','perf')][string]$Kind = 'feat',
  [switch]$Json
)
$ErrorActionPreference = 'Stop'

$repo = (git rev-parse --show-toplevel 2>$null)
if (-not $repo) { $repo = (Get-Location).Path }
$specs = Join-Path $repo 'specs'
New-Item -ItemType Directory -Force -Path $specs | Out-Null

# Next free number. Width grows past 999 rather than colliding.
$used = Get-ChildItem $specs -Directory -ErrorAction SilentlyContinue |
        ForEach-Object { if ($_.Name -match '^(\d+)-') { [int]$Matches[1] } }
# [int] is load-bearing: Windows PowerShell 5.1 returns Maximum as a double, and
# the D3 format specifier below only accepts an integral type.
$next = if ($used) { [int]($used | Measure-Object -Maximum).Maximum + 1 } else { 1 }
$num  = if ($next -lt 1000) { '{0:D3}' -f $next } else { "$next" }

$slug = ($Name.ToLower() -replace '[^a-z0-9]+', '-').Trim('-')
if ($slug.Length -gt 40) { $slug = $slug.Substring(0, 40).Trim('-') }

$dir    = Join-Path $specs "$num-$slug"
$branch = "$Kind/$num-$slug"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$result = [ordered]@{
  id       = $num
  slug     = $slug
  dir      = $dir
  branch   = $branch
  specPath = Join-Path $dir 'spec.md'
}
if ($Json) { $result | ConvertTo-Json -Compress }
else { $result.GetEnumerator() | ForEach-Object { '{0,-9} {1}' -f $_.Key, $_.Value } }
