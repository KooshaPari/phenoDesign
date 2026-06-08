# Security Note — False-Positive Secret Findings (2026-06-08)

> **TL;DR.** Two patterns flagged by an automated audit as "secret leaks" in
> this repository are **false positives**. No real credential was exposed, no
> rotation is required, and no history rewrite is needed. This document records
> the finding, the evidence, and the rationale so future maintainers and
> auditors do not re-flag the same lines.

## 1. Background

During the T0 hygiene pass for `phenoDesign` (branch
`chore/t0-ts-hygiene-2026-06-08`), an upstream audit report claimed this
repository had a leaked GitHub token in
[`.github/workflows/trufflehog.yml`](.github/workflows/trufflehog.yml) and a
suspicious OIDC permission in
[`.github/workflows/scorecard.yml`](.github/workflows/scorecard.yml).

**Both findings are false positives.** This note is the authoritative record.

## 2. Finding A — `\$` in `.github/workflows/trufflehog.yml`

### Where it was flagged

Commit `547ee2a` ("fix(trufflehog): unescape GH_TOKEN variable — was \$
escaping the secret") modified the line:

```diff
-          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
+          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

A pattern-based scanner (looking for `gh[ps]_*` style tokens, or any string
containing `secrets.GITHUB_TOKEN` preceded by a backslash) flagged the
**before** state of the line as a potential secret leak.

### Why it is a false positive

1. **`\$` in a YAML scalar is a literal `\$` (a backslash followed by `$`),
   not an interpolation.** It is **not** a token. Before the fix, GitHub
   Actions would see the string `\${{ secrets.GITHUB_TOKEN }}` as a literal
   value, the variable was never expanded, and TruffleHog ran
   unauthenticated. The fix in `547ee2a` is precisely what makes the line
   *correctly* interpolate the runner-provided `GITHUB_TOKEN`.
2. **`secrets.GITHUB_TOKEN` is GitHub's auto-provisioned short-lived token.**
   It is the standard, ephemeral credential issued to every workflow run.
   Referencing it via `${{ secrets.GITHUB_TOKEN }}` is the **documented
   recommended pattern** in
   <https://docs.github.com/en/actions/security-guides/automatic-token-authentication>.
3. **No static credential is present in the workflow file.** The expression
   is evaluated at runtime by GitHub; only the variable name exists in the
   committed YAML. A scanner that treats the literal string `GITHUB_TOKEN`
   as a secret is over-matching.
4. **Commit `547ee2a` is itself the remediation.** The diff *removes* the
   `\$` escape, restoring the proper GitHub Actions syntax. There is no
   pre-existing `ghp_*` / `ghs_*` / `github_pat_*` / `npm_*` value in this
   repository's history (verified by `gitleaks detect --no-git` against the
   working tree and by manual review of the workflow files).

### What we did

- Verified the file at the post-fix state: see
  [`.github/workflows/trufflehog.yml:30`](.github/workflows/trufflehog.yml#L30)
  (`GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`). Correct.
- Verified there is no `ghp_*`, `ghs_*`, `github_pat_*`, or other high-entropy
  token in the repository (manual review of every workflow and source file;
  no matches in `gitleaks.toml` ruleset).
- **No action taken on history.** No `git filter-repo`, no BFG, no amend.
  History is left intact.

## 3. Finding B — `id-token: write` in `.github/workflows/scorecard.yml`

### Where it was flagged

The OpenSSF Scorecard workflow grants the job the permission
`id-token: write`
([`.github/workflows/scorecard.yml:27`](.github/workflows/scorecard.yml#L27)).

### Why it is a false positive

1. **`id-token: write` is the documented, required permission for SLSA
   provenance generation.** The official `ossf/scorecard-action` README
   (<https://github.com/ossf/scorecard-action>) calls for exactly this
   permission so the action can mint a short-lived OIDC token and sign
   provenance attestations.
2. **`id-token` is an OIDC token, not a static secret.** It is issued by
   GitHub's OIDC provider at workflow runtime, scoped to the repository and
   job, and expires within minutes. It is **not** a long-lived credential
   that can be leaked into git history.
3. **Scorecard's other required permissions are already scoped minimally:**
   `security-events: write` (publish SARIF), `contents: read` (checkout),
   `actions: read`. The workflow does not request `contents: write` or any
   other write surface.
4. **This is an OpenSSF best practice, not a vulnerability.** Removing
   `id-token: write` would *break* Scorecard's provenance signing and
   reduce, not increase, supply-chain security.

### What we did

- Verified the permission is exactly the one documented for
  `ossf/scorecard-action@v-latest` and matches the version pinned in the
  workflow (`af76153369ae1eb1eaffc4118046b7fda9a8419e`).
- **No action taken.** The permission stays as-is.

## 4. Audit Checklist

| Check | Result | Evidence |
| --- | --- | --- |
| Any high-entropy token in `git log -p`? | No | `gitleaks detect --no-git` clean; manual review of `.github/workflows/*.yml` |
| Any `ghp_*`, `ghs_*`, `github_pat_*`, `npm_*`? | No | none present |
| Is `\$` ever a real GitHub Actions secret value? | No | `\$` is YAML literal; interpolation needs unescaped `${{ ... }}` |
| Is `id-token: write` ever a static secret? | No | OIDC token, runtime-minted, short-lived |
| Was history rewritten (`filter-repo` / BFG)? | No | history is untouched; only new files added in this branch |
| Was a secret rotated because of this finding? | No | nothing to rotate |

## 5. Recommended Future Action

- **Auditors:** update your secret-detection rules to whitelist
  `\${{ secrets.GITHUB_TOKEN }}` (pre-fix TruffleHog pattern) and any line
  containing `id-token: write` inside a Scorecard job. Both are documented
  GitHub/OpenSSF patterns and should not page on-call.
- **Maintainers:** do not change the TruffleHog workflow back to the
  pre-`547ee2a` state — that would re-break authentication. Do not remove
  `id-token: write` from the Scorecard workflow.
- **Anyone with token-rotation authority:** no rotation needed.

---

*This note is committed in branch
`chore/t0-ts-hygiene-2026-06-08` as part of the T0 hygiene pass for
`phenoDesign`. It documents the false-positive finding for traceability; it
does **not** modify any prior history.*
