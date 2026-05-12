# 00-safety.md — Absolute Safety Rules

Established: Phase 0-A (2026-03-24)
Authority: `.claude/CLAUDE.md`

---

## FORBIDDEN COMMANDS (never suggest or execute)

| Command pattern | Reason |
|----------------|--------|
| `rm -rf <anything>` | Irreversible bulk deletion |
| `git reset --hard` | Discards uncommitted work without recovery |
| `git push --force` / `git push -f` | Can overwrite remote history for all collaborators |
| `git clean -fd` | Deletes untracked files irreversibly |
| `mkfs.*` | Formats disk partitions |
| `dd if=... of=...` | Raw disk write, can destroy data |
| `shred` | Secure-deletes files, unrecoverable |
| `:(){:|:&};:` (fork bomb) | Denies service |
| Any `DROP TABLE` / `DROP DATABASE` without explicit user confirmation | Destroys data |

If a workflow genuinely requires a dangerous operation, STOP and ask the user explicitly with full context of the risk.

---

## SENSITIVE FILE PATTERNS (never read, write, or print contents)

```
**/.env
**/.env.*
**/.env.local
**/.env.production
**/*secret*
**/*credential*
**/*password*
**/*api_key*
**/*apikey*
**/*.pem
**/*.p12
**/*.keystore
**/id_rsa
**/id_rsa.pub
**/id_ed25519
**/id_ed25519.pub
**/*.pfx
**/*.key          (private key files — NOT .lock or .gitkeep)
**/secrets.yaml
**/secrets.json
**/*token*        (when clearly an auth/access token file)
```

**If in doubt, treat as sensitive and refuse.**

---

## NO SECRETS IN DOCS/

- Never paste API keys, tokens, passwords, or connection strings into any `docs/` file.
- If documentation requires referencing a secret, use a placeholder like `${MY_API_KEY}` and add a note to use the Secret Manager or environment variables.
- If a secret is accidentally exposed in chat: immediately flag it to the user and recommend rotation.

---

## SCOPE DISCIPLINE

- Implement only what is specified in `docs/changes/{{TICKET}}/spec-pack.md`.
- Ambiguous requirements → create an Open Issue entry, do not guess.
- Do not add "nice to have" features, refactors, or improvements beyond the approved scope.

---

## PLAN-BEFORE-EDIT

- Always present a Plan and receive explicit approval before modifying any file.
- Exception: the Claude plan file at `.claude/plans/` (internal planning only).
