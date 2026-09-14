---
name: sddra-writing
description: SDDRA writing skills — clean user-facing text, remove AI marks. For any text a human will read: docs, README, UI copy, commit messages.
---

# SDDRA Writing Skills

Source of truth: `.sdd/skills/writing/` — this skill is the routing
wrapper.

## clean-user-facing-text

Before publishing any human-facing text (docs, UI copy):

1. Read `.sdd/skills/writing/clean-user-facing-text/INDEX.sdd`
2. Apply: plain language, direct address, no filler, correct UTF-8
   (Azerbaijani diacritics ə/ı/ş/ç/ö/ü/ğ must be real Unicode, never
   double-encoded — [R99] mojibake is CRITICAL)
3. Self-check pass: would a native reader wince anywhere? Fix it.

## remove-ai-marks

Before committing/publishing any text:

1. Read `.sdd/skills/writing/remove-ai-marks/INDEX.sdd`
2. Strip: AI tells ("certainly", "let me", "great question"),
   decorative emojis in headers ([SK32] reserved for humans),
   em-dash overload, bullet-point monoculture
3. Commit messages carry no AI signatures ([R97]) and follow
   DEC/TASK reference format ([R95])

## When to use

Always, before text leaves the repo: README, docs/, .sdd content,
commit messages, PR descriptions.
