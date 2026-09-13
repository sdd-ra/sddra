You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

/sdd-research — Deep research command (RS1 arm entry point).
Full pipeline spec: .sdd/chains/arms/research.sdd
Protocol: .sdd/workflow/research-protocol.sdd

EXECUTION:
  Arguments: $ARGUMENTS (topic, --depth N, --breadth M, --continue <slug>, --status)

  --status:
    List tmp/research/ folders with their state (STAGED/IN_PROGRESS/GATED).
    DONE.

  --continue <slug>:
    Read tmp/research/{slug}/SOURCES.md + existing r*.md + research_state.
    Resume from the last incomplete pipeline stage. NEVER rescan completed
    streams (audit-trail resume, [RES-04]).

  Default run:
    1. SCOPE: read topic + arguments; set budget (depth 1-3, breadth 2-5,
       cap 3-5 streams, wall-clock 30m). Emit the research brief.
       If interactive: PRESENT BRIEF FOR APPROVAL before any searching.
    2. Create tmp/research/{date}-{slug}/ with SOURCES.md (protocol reminder
       + internal baseline from current .sdd state).
    3. PERSPECTIVE: before searching, mine 3-5 perspectives from analogous
       domains (STORM pattern) — write into SOURCES.md.
    4. SEARCH (parallel): launch 2-5 background research streams (task tool,
       background). Each stream: websearch/webfetch only, DOM-class sources;
       every claim URL-cited; LOW_CONFIDENCE markers where thin.
       Streams write r{N}-{topic}.md files. Streams NEVER write to .sdd/.
    5. LEARN/RECURSE: if depth>0 and streams surfaced new directions, run
       follow-up streams within budget; log learnings in SOURCES.md.
    6. VERIFY: read all r*.md files. Gate checks:
       - anchor gate: every claim has URL; unanchored prose marked/rejected
       - URL gate: spot-check cited URLs resolve (webfetch sample)
       - license gate: mark importable (MIT/Apache) vs analysis-only
    7. DECIDE: write DECISIONS.md — every finding INTEGRATE/SKIP with
       Pareto rationale (>= 80% relevance to SDDRA mission). Mark gate
       State: FINAL.
    8. INTEGRATE (only after gate): .sdd/ writes with provenance citations
       ([IMP1]-[IMP6]); imports through marketplace rules where applicable.
    9. CLEANUP: delete tmp/research/{slug}/ ENTIRELY. Append execution
       record to .claude/sdd/history.json (topic, streams, INTEGRATE/SKIP
       counts, artifacts, staging DELETED marker).
   10. Output the RESEARCH ROUND summary (format in .sdd/commands/sdd-research.sdd).

RULES (hard):
  - EVERY claim in research output carries a source URL — no exceptions.
  - Proprietary tools: analysis ONLY, never import.
  - MIT/Apache-2.0 only for imports; source-available/unlicensed = blocked.
  - No .sdd/ writes before DECISIONS.md gate is FINAL.
  - Staging ends DELETED; tmp/ must end empty.
  - Budget is fixed at Scope; overrun = terminate with partial report.
  - Code-bearing analysis is Docker-gated ([R59]-[R66]) — plan it, don't run it.

NAVIGATION:
  ArmSpec: .sdd/chains/arms/research.sdd
  Protocol: .sdd/workflow/research-protocol.sdd
  CommandSpec: .sdd/commands/sdd-research.sdd
  ResearcherRole: .sdd/agent/roles.sdd
  History: .claude/sdd/history.json
