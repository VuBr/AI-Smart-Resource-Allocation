# docs/maintenance/phase0/ — Operating Policy

## What Is This Directory?

This directory contains the **Evidence Pack** for Phase 0-A of the SDD (Software Delivery Design) process.
It serves as the authoritative record of how the repository foundation was established and why.

Established: 2026-03-24

---

## Who Updates This?

| File | Who updates | When |
|------|-------------|------|
| `phase0-plan.md` | AI assistant (Claude) | Before execution of Phase 0-A |
| `phase0-execution-log.md` | AI assistant (Claude) | During/after execution |
| `phase0-decisions.md` | AI assistant + human reviewer | When decisions are made or revised |
| `phase0-risk-register.md` | AI assistant + human reviewer | When risks are identified or resolved |
| `phase0-review.md` | AI assistant (self-review) | After execution, before handoff |
| `artifacts/` | AI assistant or human | Logs, screenshots, optional evidence |

---

## What Is Authoritative?

- **This directory is read-only after Phase 0-A is closed** (archived).
- If Phase 0 needs to be revised, create a new `phase0-revision-YYYYMMDD/` directory; do not overwrite.
- The living operating rules live in `.claude/CLAUDE.md` and `.claude/rules/`.
- If this directory conflicts with `.claude/CLAUDE.md`, the `.claude/CLAUDE.md` is authoritative.

---

## Relationship to Other Directories

```
docs/
├── architecture/        ← living docs: system design, ADRs
├── standards/           ← living docs: coding standards, conventions
├── changes/             ← per-ticket deliverables (spec-pack.md, etc.)
└── maintenance/
    └── phase0/          ← THIS DIRECTORY: Phase 0-A evidence (archived after close)
        └── artifacts/   ← optional: logs, screenshots
```

---

## How to Use This in Future Sessions

1. Read `.claude/CLAUDE.md` first.
2. If context about foundational decisions is needed, read `phase0-decisions.md`.
3. If risk context is needed, read `phase0-risk-register.md`.
4. Do NOT modify these files unless explicitly running a Phase 0 revision.
