<#
  Gate guard. Answers one question: may this phase start?
  Exits non-zero when it may not, so a command can stop rather than proceed.

  Usage: .\check-prereqs.ps1 -Feature specs\002-add-brute-enemy -Phase plan
#>
param(
  [Parameter(Mandatory = $true)][string]$Feature,
  [ValidateSet('clarify','plan','tasks','implement','analyze','release')][string]$Phase,
  [switch]$Json
)
$ErrorActionPreference = 'Stop'
$fail = @(); $warn = @()

function Need($rel) {
  $p = Join-Path $Feature $rel
  if (-not (Test-Path $p)) { $script:fail += "missing $rel"; return $null }
  return $p
}

$statePath = Need 'state.json'
$state = if ($statePath) { Get-Content $statePath -Raw | ConvertFrom-Json } else { $null }

switch ($Phase) {
  'clarify'   { Need 'spec.md' | Out-Null }
  'plan' {
    $spec = Need 'spec.md'
    if ($spec) {
      $marks = (Select-String -Path $spec -Pattern '\[NEEDS CLARIFICATION' -AllMatches).Matches.Count
      if ($marks -gt 0) { $fail += "$marks unresolved [NEEDS CLARIFICATION] marker(s) — Article II" }
      # Article III: technology leaking into the spec.
      $tech = Select-String -Path $spec -Pattern '(?i)\b(api|endpoint|database|sql|react|npm|docker|class |function |\.js\b|\.ts\b|\.py\b)' -AllMatches
      if ($tech) { $warn += "possible technology noun in spec.md line(s): $(($tech | Select-Object -First 5 | ForEach-Object LineNumber) -join ', ') — Article III" }
    }
    if ($state -and $state.gates.specification.status -ne 'approved') { $fail += 'specification gate not approved' }
  }
  'tasks' {
    Need 'plan.md' | Out-Null
    if ($state -and $state.tier -eq 'deep' -and $state.gates.design.status -ne 'approved') { $fail += 'design gate not approved (deep tier)' }
  }
  'implement' { Need 'tasks.md' | Out-Null }
  'analyze'   { Need 'tasks.md' | Out-Null }
  'release' {
    Need 'quickstart.md' | Out-Null
    if ($state -and $state.gates.release.status -ne 'approved') { $fail += 'release gate not approved' }
  }
}

# Caps are part of the gate (Article IX).
if ($state) {
  foreach ($p in $state.artifacts.PSObject.Properties) {
    $cap = $p.Value.cap
    $f   = Join-Path $Feature $p.Name
    if ($cap -and (Test-Path $f)) {
      $n = (Get-Content $f).Count
      if ($n -gt $cap) { $fail += "$($p.Name) is $n lines, cap $cap — Article IX" }
    }
  }
}

$out = [ordered]@{ phase = $Phase; ok = ($fail.Count -eq 0); blocking = $fail; warnings = $warn }
if ($Json) { $out | ConvertTo-Json -Depth 4 }
else {
  if ($out.ok) { Write-Host "OK — $Phase may start" -ForegroundColor Green }
  else { Write-Host "BLOCKED — $Phase" -ForegroundColor Red; $fail | ForEach-Object { Write-Host "  x $_" } }
  $warn | ForEach-Object { Write-Host "  ! $_" -ForegroundColor Yellow }
}
if ($fail.Count) { exit 1 }
