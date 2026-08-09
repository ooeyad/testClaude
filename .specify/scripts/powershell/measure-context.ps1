<#
  Context-economy audit (Article IX). Answers: what did this feature cost, and
  was that proportionate to what it changed?

  Token estimate is bytes/4 — good enough to spot an order-of-magnitude problem,
  which is the only thing worth acting on here.

  Usage: .\measure-context.ps1 -Feature specs\002-add-brute-enemy [-Since HEAD]
#>
param(
  [Parameter(Mandatory = $true)][string]$Feature,
  [string]$Since = 'HEAD',
  [switch]$Json
)
$ErrorActionPreference = 'Stop'
$est = { param($bytes) [math]::Round($bytes / 4) }

$state = $null
$sp = Join-Path $Feature 'state.json'
if (Test-Path $sp) { $state = Get-Content $sp -Raw | ConvertFrom-Json }

# --- artifacts ---------------------------------------------------------------
$rows = @()
Get-ChildItem $Feature -Recurse -File | ForEach-Object {
  $rel   = $_.FullName.Substring((Resolve-Path $Feature).Path.Length).TrimStart('\','/')
  $lines = if ($_.Extension -in '.md','.json','.txt') { (Get-Content $_.FullName).Count } else { 0 }
  $cap   = $null
  if ($state -and $state.artifacts.PSObject.Properties.Name -contains $rel) { $cap = $state.artifacts.$rel.cap }
  $rows += [pscustomobject]@{
    Artifact = $rel; Bytes = $_.Length; Tokens = (& $est $_.Length)
    Lines = $lines; Cap = $cap; Over = if ($cap -and $lines -gt $cap) { 'OVER' } else { '' }
  }
}
$docBytes = ($rows | Measure-Object Bytes -Sum).Sum

# --- code delta, line endings normalised (see the CRLF trap) -----------------
$codeBytes = 0; $changed = @()
$tracked = git ls-files 2>$null
foreach ($f in $tracked) {
  if ($f -like 'specs/*' -or $f -like '.specify/*' -or $f -like '.claude/*') { continue }
  $head = git show "${Since}:$f" 2>$null
  if ($null -eq $head) { continue }
  $now = Get-Content $f -Raw -ErrorAction SilentlyContinue
  if (($head -replace "`r`n", "`n") -ne ($now -replace "`r`n", "`n")) {
    $changed += $f; $codeBytes += (Get-Item $f).Length
  }
}
foreach ($f in (git ls-files --others --exclude-standard 2>$null)) {
  if ($f -like 'specs/*' -or $f -like '.specify/*' -or $f -like '.claude/*') { continue }
  $changed += "$f (new)"; $codeBytes += (Get-Item $f).Length
}

$ratio = if ($codeBytes -gt 0) { [math]::Round($docBytes / $codeBytes, 1) } else { $null }

$summary = [ordered]@{
  feature        = $Feature
  tier           = $state.tier
  artifactBytes  = $docBytes
  artifactTokens = (& $est $docBytes)
  codeBytes      = $codeBytes
  codeFiles      = $changed
  docToCodeRatio = $ratio
  targetTokens   = $state.budget.targetTokens
  contextGaps    = $state.contextGaps
  overCap        = ($rows | Where-Object Over).Artifact
}

if ($Json) { [ordered]@{ summary = $summary; artifacts = $rows } | ConvertTo-Json -Depth 5 ; return }

$rows | Sort-Object Bytes -Descending | Format-Table Artifact, Lines, Cap, Over, Bytes, Tokens -AutoSize
''
'Tier              {0}' -f $state.tier
'Paperwork         {0:N0} bytes  (~{1:N0} tokens)' -f $docBytes, (& $est $docBytes)
'Code delta        {0:N0} bytes across {1} file(s)' -f $codeBytes, $changed.Count
'Doc : code        {0}x' -f $ratio
if ($state.budget.targetTokens) { 'Budget            {0:N0} tokens' -f $state.budget.targetTokens }
if ($summary.overCap) { 'OVER CAP          {0}' -f ($summary.overCap -join ', ') }
if ($state.contextGaps) { 'CONTEXT GAPS      {0}  <- task details written as pointers' -f ($state.contextGaps -join '; ') }
''
if ($ratio -and $ratio -gt 10 -and $state.tier -ne 'deep') {
  Write-Host 'Paperwork outweighs the code delta by more than 10x on a non-deep tier.' -ForegroundColor Yellow
  Write-Host 'Either the tier was too high, or an artifact is doing work another one already did.' -ForegroundColor Yellow
}
