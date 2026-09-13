# AI Agents Comparative Analysis (2026-09-06)

Purpose:
  Research-grounded comparison of AI coding agents and design tools, with
  SDDRA's position: what we adopted to compensate each weakness. Single
  citation source for @agent/weak-point-map.sdd.

Date: 2026-09-06
Research: tmp/research/2026-09-06-ai-agents/ (r1-r4) — integrated then deleted;
  findings preserved here and in weak-point-map.sdd, skills, sources.sdd.
Method: 4 parallel web-research streams; every claim carries a source URL;
  LOW_CONFIDENCE marked where 2026 coverage is thin.

---

## 1. Coding Agents Matrix

| Agent | Orchestration | Design | Top strength | Top weakness | SDDRA adoption |
|---|---|---|---|---|---|
| Claude Code | Subagents (5 levels) + Agent Teams (peer msg, shared tasks, file locks) | Weak | Best reasoning (Opus 5, SWE-bench 97%); 1M context; hooks/skills/MCP ecosystem | 3-4x token burn; rate-limit walls; over-asks permission | Weakness PROOF for our token economy (Phase 147) + design module (Phase 148) |
| Codex CLI | Subagents GA (8 parallel sandboxes); MCP-server mode | Weak-moderate | Token efficiency ($8.39 vs $11.84/task); Terminal-Bench 85.8%; strong sandboxing | Same-prompt variability; 128-272K context forces chunking | Efficiency target validated; idempotency discipline answers variability |
| Gemini CLI | Single-agent loop (no teams; open request #19430) | Weak | Free tier 1000 req/day; 1M context; native Search grounding | Agentic precision trails Claude; shutdown report June 2026 LOW_CONFIDENCE | Grounding pattern → read-the-docs discipline |
| Cursor | 8 parallel agents + cloud Background Agents; worktrees | Strong | Design-to-code Composer; native browser DevTools loop; Tab UX | Opaque credits (burned 1-3 days); no session memory | Worktree isolation + parallel agents adopted (maps to TASK branches) |
| GitHub Copilot | 3 surfaces: IDE Agent Mode, async Coding Agent, CLI /fleet | Moderate | GitHub-native issue→PR; Spaces persistent context | Struggles >10-file changes; ignores .copilotignore | Async issue→PR pattern → SDD AUTO chain |
| Devin | Planner-executor cloud; sandboxed shell/editor/browser | Weak-moderate | End-to-end autonomy (writes ~89% of Cognition's code); enterprise evidence | Ambiguous tasks burn ACUs; "junior dev PR" quality | Task-contract explicitness (EXECUTION-CONTRACT) answers ambiguity burn |
| Replit Agent | Single conversational loop; plan→build→test→deploy | Moderate | Zero-setup full-stack deploy; autonomous testing | Effort pricing unpredictable; cloud lock-in; frontend jank | — |
| Aider | Repo-map + architect-editor split; no multi-agent | None | Git-native atomic commits; model-agnostic (LiteLLM) | No MCP/GUI; manual context steering | Atomic-commit + lint/test loop adopted |
| OpenCode | Plan/Build native modes; LSP grounding; SQLite sessions | None | Open MIT; 75+ providers; plan-then-execute as UI concept | ~78% slower than Claude Code; BYOK friction | Plan-gate pattern validated (BE stage); LSP-style deterministic feedback |
| Windsurf→Devin Desktop | Local Cascade/Devin Local + cloud Devin (Kanban center) | Moderate | Local+cloud orchestration in one editor; Memories | Tab trails Cursor (53-60% vs 70-75%); long-session crashes | — |

Key sources: codemyspec.com, morphllm.com, presenc.ai benchmarks 2026, devtoolsacademy.com, addyosmani.com (Code Agent Orchestra), digitalapplied.com (Cursor 3), baeseokjae.github.io (subagents, context engineering). Full URL list in research round (preserved citations below).

## 2. Design Tools Matrix (why output looks good)

| Tool | Core mechanism | What SDDRA adopted |
|---|---|---|
| Google Stitch (ex-Galileo) | Global theme tokens cascade; DESIGN.md normative YAML tokens + prose; Annotate visual loop; structured prompt discipline (one change/turn) | DESIGN.md format adopted (open spec, google-labs-code/design.md); one-change-per-iteration rule |
| v0 (Vercel) | Composite model: RAG + base + QuickEdit + AutoFix (93.87% error-free); tokens-first build order; self-screenshot verification; shadcn/Tailwind constraint IS quality | Tokens-before-screens rule #1; closed-loop verification rule #5; constrained generation rule #2 |
| Figma FirstDraft/Make | Assembles curated component stacks; Make kits ground in YOUR design system; Code Connect + MCP grounding | Curated-vocabulary rule #2; machine-consumable design-system package idea |
| Lovable | One opinionated stack; CSS-variable Themes; design-system-as-project with adherence enforcement (catches raw colors, drift) | Drift enforcement rule #5; stack commitment principle |
| Builder.io Visual Copilot | Component mapping CLI before generation; plan-then-generate (token replacement, reuse scan); 2M+ fine-tune | Reuse-scan (never create existing component); plan-before-emit checklist |
| Galileo (historical) | 4-stage pipeline: semantics → pattern-grounded layout → realistic content → standards styling; multi-variant then curate | 4-stage pipeline adopted into module; variants-not-nudges |
| Uizard | Structured editable components; sketch/screenshot ingestion; lo-fi mode | Lo-fi wireframe pass before styling (module stage 3) |
| Relume | Sitemap (IA) → unstyled wireframes w/ real copy → style guide → styled; 1000+ curated components; "no AI-template gimmicks" | IA-first stage 1-2; realistic-content rule (never lorem ipsum) |

Key sources: blog.google (Stitch Mar 2026), github.com/google-labs-code/design.md, vercel.com/blog (composite model, benchmarks), marcandrews.com (tokens-first), help.figma.com (FirstDraft), docs.lovable.dev (design systems), builder.io blogs (CLI plan-then-generate), discover.oreateai.com (Galileo pipeline), relume.ai.

## 3. Why AI UI Is Generic — root cause and the fix consensus

Root cause — distributional convergence: models sample from the statistical
center of training data (Inter font, purple-indigo gradients, centered hero +
3 cards, glassmorphism). Coding agents make it worse by "committing only to
what is easy to implement". Sources: superdesign.dev (Jason Zhou thesis),
claude.com engineering blog (same statement), prg.sh slop catalog.
Quantified: 1.7x more issues, 2.74x more security vulns (CodeRabbit, 470 PRs);
CHI 2025: AI systematically generates inaccessible markup.

Fix consensus (2026 canon): (1) lock tokens before generating (DESIGN.md),
(2) closed loop build→critique→fix→re-evaluate, (3) slop-test gates at
generation time (Hallmark 57 gates, MIT, 12k stars), (4) committed aesthetic
direction — "clean and modern" is not a direction, (5) separate taste
direction / exploration / implementation jobs, (6) grading with originality
weighted 40% (BSWEN framework).
ALL SIX encoded in SDDRA Design Intelligence module (Phase 148).

## 4. SDDRA Position Summary

SDDRA (spec-driven, human-curated .sdd/, token-economical, idempotent) already
compensates the top agent weaknesses (see @../../agent/weak-point-map.sdd):
- context rot → INDEX-first + tiered memory + plan-cache
- long-horizon → plan gates + decision ledger + DAG validation
- verification bottleneck → run.ps1 gates + watchdog + DONE-PROOF
- UI weakness → Design Intelligence module (Phase 148, this work)
- token economics → Phase 147 (cache, minimalism, efficient-frontier)
- LLM-written context → .sdd/ human-authored rule

Adopted from research (2026-09-06 round 2):
- 9 imported skills (governance/orchestration/audit — MIT)
- DESIGN.md token format + 6 anti-slop rules → design/intelligence/
- design/sources.sdd registry (19 sources, extraction roadmap)
- weak-point map with 12 compensated weaknesses
- ecosystem discovery layer: VoltAgent catalog, agentskills.io spec adoption,
  vercel-labs `npx skills` conventions, microsoft test-scenarios discipline,
  NVIDIA signing/Skill-Card provenance pattern (validates our provenance rule)

## 5. Citation Index (preserved from research round)

Coding agents: codemyspec.com/blog/claude-code-review-2026 · morphllm.com/comparisons/codex-vs-claude-code · presenc.ai/research/coding-agent-benchmarks-2026 · codex.danielvaughan.com (orchestration v2, Osmani synthesis) · addyosmani.com/blog/code-agent-orchestra · developersdigest.tech/blog/claude-code-agent-teams-subagents-2026 · baeseokjae.github.io (subagents, context engineering, copilot) · digitalapplied.com (Cursor 3) · cursor.com/blog/2-0 · idlen.io (Devin limits) · dynalord.com (Devin, OpenCode) · dev.to/aicoderscope (OpenCode) · aicoderscope.com (Windsurf)

Design tools: blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design · github.com/google-labs-code/design.md · uxpin.com (Stitch updates) · discuss.ai.google.dev/t/stitch-prompt-guide/83844 · vercel.com/blog/v0-composite-model-family · fireworks.ai/blog/vercel · marcandrews.com (v0 hands-on) · help.figma.com (FirstDraft, Make kits) · figma.com/blog/schema-2025-design-systems-recap · docs.lovable.dev/features/design-systems · builder.io blogs (Visual Copilot, CLI) · discover.oreateai.com (Galileo pipeline) · relume.ai · uizard.io

Anti-slop canon: superdesign.dev/blog/why-ai-design-looks-generic · claude.com/blog/improving-frontend-design-through-skills · github.com/Nutlope/hallmark · smoothui.dev/blog/ai-design-slop · rohitraj.tech (Hallmark guide) · vibecodekit.dev/ai-slop-design · docs.bswen.com (grading framework) · tasteskill.dev

Design sources: m3.material.io · carbondesignsystem.com · polaris.shopify.com · fluent2.microsoft.design · developer.apple.com/design/human-interface-guidelines · mobbin.com · refero.design (MCP) · awwwards.com (jury rubric) · godly.website · land-book.com · lapa.ninja · patterns.dev

Skill repos: github.com/artemrudenko/skill-governance-toolkit · github.com/BuilderIO/skills · github.com/khasky/awesome-agent-skills · github.com/VoltAgent/awesome-agent-skills · github.com/vercel-labs/skills · github.com/addyosmani/agent-skills · github.com/coleam00/skills · github.com/microsoft/agent-skills · agentskills.io (spec)

State: +
