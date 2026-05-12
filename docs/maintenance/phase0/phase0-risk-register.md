# Phase 0-A Risk Register

Date: 2026-03-24
Last updated: 2026-03-24

---

## Active Risks

### R-1: Deny patterns may miss new sensitive file types

| Field | Value |
|-------|-------|
| Likelihood | Medium |
| Impact | High |
| Status | OPEN — accepted |

**Description:** The deny list in `settings.json` covers known patterns as of 2026-03-24. New credential file types (e.g., cloud provider-specific formats) may not be covered.

**Mitigation:**
- Patterns use broad globs (`**/*secret*`, `**/*credential*`) to catch many variants.
- The deny list is documented in `phase0-decisions.md` (D-1) with a clear rationale, making future additions straightforward.

**Residual risk:** An unknown file type not matching any pattern could be read/written.

**Acceptance reason:** Zero-residual-risk is impossible without denying all file access. Broad glob patterns provide sufficient coverage for a new repository with no existing secrets.

**Review trigger:** Any time a new secret file format is introduced to the project.

---

### R-2: .gitkeep files mistaken for deliverables

| Field | Value |
|-------|-------|
| Likelihood | Low |
| Impact | Low |
| Status | OPEN — mitigated |

**Description:** A developer or AI session may interpret `.gitkeep` files as meaningful content.

**Mitigation:**
- Each `.gitkeep` contains a comment explaining it is a placeholder.
- `docs/maintenance/phase0/README.md` explicitly documents the `.gitkeep` convention.

---

### R-3: Evidence Pack ignored during onboarding

| Field | Value |
|-------|-------|
| Likelihood | Medium |
| Impact | Medium |
| Status | OPEN — mitigated |

**Description:** New team members or new AI sessions may skip reading the Evidence Pack, missing foundational decisions.

**Mitigation:**
- `.claude/CLAUDE.md` (section 6) explicitly references `phase0/README.md` and `phase0-decisions.md` as required reading.
- `CLAUDE.md` is loaded automatically by Claude Code at session start.

---

### R-4: settings.json schema incompatibility

| Field | Value |
|-------|-------|
| Likelihood | Low |
| Impact | Medium |
| Status | OPEN — monitor |

**Description:** The `$schema` URL and permission format in `settings.json` may change across Claude Code versions.

**Mitigation:**
- File includes `_comment` noting the establishment date (2026-03-24).
- Schema URL points to the official Anthropic repository.

**Review trigger:** Claude Code version upgrade.

---

### R-5: Repository has no application code yet

| Field | Value |
|-------|-------|
| Likelihood | N/A (known state) |
| Impact | Low |
| Status | ACKNOWLEDGED |

**Description:** Phase 0-A was run on an empty repository. The `docs/` structure assumes an application will be developed here, but none exists yet.

**Mitigation:**
- `.gitkeep` files ensure the structure is preserved even with no content.
- The structure is neutral and does not assume any specific application technology.

---

## Closed Risks

*(None at Phase 0-A close)*
