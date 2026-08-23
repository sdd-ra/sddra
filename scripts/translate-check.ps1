<#
.SYNOPSIS
  Scans .sdd/ for Azerbaijani-language text so it can be tracked and
  translated to English (see index.md -> TranslationBacklog, and the
  original request in prompt/new/32.md's surrounding context).

.DESCRIPTION
  This is a detection aid, not a translator: AI (or a human) still does the
  actual translation, applying judgment per file (see the standing "apply,
  don't copy" rule) rather than a mechanical find/replace. This script's job
  is just to answer "which files still have Azerbaijani prose, and how much?"
  so the work can be tracked incrementally in index.md instead of attempted
  as one unreviewed mass rewrite across ~20 files / ~15k matched characters.

  Lives in scripts/ alongside split-chat-history.mjs and curate-prompts.mjs
  (repo-tooling convention) — NOT inside .sdd/, which stays pure spec
  content with no scripts of its own (see .sdd/PROJECT.sdd -> Note,
  ".sdd-only, no real scaffold").

  Detection heuristic: Azerbaijani-specific Latin letters that essentially
  never appear in English prose. Regex uses \u escapes rather than literal
  characters on purpose — Windows PowerShell 5.1 reads .ps1 source using the
  system codepage unless a BOM is present, so literal non-ASCII characters
  in the script body itself are not reliable; \u escapes sidestep that.

    e-schwa   0259/018F  (e, E)
    dotless-i 0131/0130  (i, I)
    g-breve   011F/011E  (g, G)
    s-cedilla 015F/015E  (s, S)
    c-cedilla 00E7/00C7  (c, C)
    o-umlaut  00F6/00D6  (o, O)
    u-umlaut  00FC/00DC  (u, U)

.OUTPUTS
  A per-file hit count table, sorted descending, plus a grand total.

.EXAMPLE
  powershell -File scripts/translate-check.ps1
  powershell -File scripts/translate-check.ps1 -ShowLines   # also print each matched line
#>

param(
  [string]$Root = (Join-Path $PSScriptRoot "../.sdd"),
  [switch]$ShowLines
)

$RootResolved = (Resolve-Path $Root).Path

$chars = [char[]](
  0x0259,0x018F,0x0131,0x0130,0x011F,0x011E,
  0x015F,0x015E,0x00E7,0x00C7,0x00F6,0x00D6,0x00FC,0x00DC
)
$pattern = '[' + ([string]::new($chars)) + ']'

$files = Get-ChildItem -Path $RootResolved -Recurse -Include *.sdd, *.md -File

$results = foreach ($f in $files) {
  $hits = Select-String -Path $f.FullName -Pattern $pattern -AllMatches -Encoding UTF8
  $count = ($hits | ForEach-Object { $_.Matches.Count } | Measure-Object -Sum).Sum
  if ($count -gt 0) {
    if ($ShowLines) {
      $hits | ForEach-Object { "  $($f.FullName):$($_.LineNumber): $($_.Line.Trim())" }
    }
    [PSCustomObject]@{
      File  = $f.FullName.Substring($RootResolved.Length + 1)
      Hits  = $count
      Lines = ($hits | Measure-Object).Count
    }
  }
}

$results = $results | Sort-Object Hits -Descending
$results | Format-Table -AutoSize
"TOTAL FILES WITH AZ TEXT: $($results.Count)"
"TOTAL AZ-CHAR HITS:       $((($results | Measure-Object Hits -Sum).Sum))"
