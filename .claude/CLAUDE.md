# CLAUDE.md — Constitution for AI-Smart-Resource-Allocation

## 1. Purpose of This File
This file defines the operating rules for Claude Code within this repository.
It is the authoritative reference for all AI-assisted work here.
Established in: Phase 0-A (2026-03-24)

---

## 2. Single Source of Truth

| What | Where |
|------|-------|
| Feature spec | `docs/changes/{{TICKET}}/spec-pack.md` |
| Deliverables per ticket | `docs/changes/{{TICKET}}/` |
| Architecture (living docs) | `docs/architecture/` |
| Standards (living docs) | `docs/standards/` |
| Maintenance logs | `docs/maintenance/` |
| Phase 0 evidence | `docs/maintenance/phase0/` |
| Safety rules | `.claude/rules/` |
| Permissions | `.claude/settings.json` |

---

## 3. Absolute Rules

1. **No implementation outside scope** — never add specs based on guesses; ambiguous points → Open Issues.
2. **No destructive commands** — `rm -rf`, `git reset --hard`, `force push`, disk wipes are forbidden even as suggestions.
3. **No secrets in docs/** — API keys, tokens, passwords must never appear in any `docs/` file. Use `settings.local` or Secret Manager.
4. **Plan before edit** — always present a Plan (files to read / create / update / checkpoints) and wait for approval before editing.
5. **Deliverables stay in `docs/changes/{{TICKET}}/`** — no scattered files.

---

## 4. Working Mode

1. Present Plan as bullet points (files to read, files to create/update, checkpoints, risks).
2. Do not edit files until the user approves the plan.
3. Every deliverable must be presented as a (file path, content) pair.
4. Mark each checkpoint explicitly when completed.

---

## 5. Sensitive File Patterns (never read or write)

See `.claude/rules/00-safety.md` and `.claude/settings.json` for the full deny list.
Key patterns: `.env`, `*secret*`, `*credential*`, `*password*`, `*.pem`, `*.p12`, `*.keystore`, `id_rsa`, `id_ed25519`.

---

## 6. Onboarding Reference

New team members and new AI sessions must read:
- This file (`CLAUDE.md`)
- `.claude/rules/00-safety.md`
- `docs/maintenance/phase0/README.md` (operating policy)
- `docs/maintenance/phase0/phase0-decisions.md` (rationale behind the structure)
