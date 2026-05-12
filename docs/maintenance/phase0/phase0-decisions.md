# Phase 0-A Decisions

Date: 2026-03-24

---

## D-1: Deny-first permission model in settings.json

**Decision:** Default stance is deny for sensitive files and destructive commands; allow is kept empty.

**Rationale:**
- A fresh repository has no known safe operations yet; it is safer to be restrictive by default.
- The risk of accidentally reading or writing secrets (e.g., `.env` created later by a developer) is higher than the inconvenience of having to explicitly allow an operation.
- Destructive Bash commands (`rm -rf`, `git reset --hard`, force push) have no legitimate automated use in this workflow and can cause irreversible damage.

**Alternatives considered:**
- Allow-first: rejected — too permissive for a repository where application code doesn't exist yet.
- Per-command ask: adopted only for push/publish operations (lower risk, still needs human confirmation).

---

## D-2: Storage location design (docs/ structure)

**Decision:** Separate directories for architecture (living), standards (living), changes (per-ticket), and maintenance (logs/evidence).

**Rationale:**
- `docs/changes/` keeps deliverables strictly scoped to their ticket — prevents deliverables from polluting shared docs.
- `docs/architecture/` and `docs/standards/` are living documents updated across tickets; separating them from per-ticket folders prevents overwrite conflicts.
- `docs/maintenance/` isolates operational logs (evidence packs, phase logs) from content that developers read day-to-day.

**Alternatives considered:**
- Flat `docs/` with naming conventions: rejected — harder to enforce, easy to scatter files.
- `docs/tickets/` instead of `docs/changes/`: rejected — "changes" is more neutral and accurate.

---

## D-3: .gitkeep as placeholder

**Decision:** Use `.gitkeep` files to commit empty directories to git.

**Rationale:**
- Git does not track empty directories; without a placeholder, the directory structure would not be committed and would be lost.
- `.gitkeep` is the conventional name; it is clearly a placeholder and not a deliverable.
- Each `.gitkeep` includes a comment explaining its purpose to prevent confusion.

---

## D-4: Evidence Pack scope (6 files)

**Decision:** Capture plan, execution log, decisions, risk register, and review as separate files, plus a README for the directory.

**Rationale:**
- Separating by concern (plan vs. execution vs. decisions vs. risks vs. review) makes it easy to find specific information without reading everything.
- A single "phase0.md" would become too long and hard to navigate.
- The README serves as the entry point and operating policy for the directory.

---

## D-5: CLAUDE.md as constitution (not runbook)

**Decision:** `.claude/CLAUDE.md` contains high-level rules and pointers, not step-by-step runbooks.

**Rationale:**
- Runbooks change frequently; the constitution should be stable.
- Detailed procedures belong in `docs/standards/` or ticket-specific docs.
- Keeping `CLAUDE.md` short ensures it is read fully, not skimmed.

---

## D-6: rules/00-safety.md naming convention

**Decision:** Prefix with `00-` to ensure it sorts first and is always read before other rules.

**Rationale:**
- Safety rules are the highest priority; they must be encountered first.
- Numeric prefixes allow future rules (01-, 02-, ...) to be ordered by priority.
