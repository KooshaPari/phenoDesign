# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Type-checked ESLint configuration (`.eslintrc.cjs`) using `@typescript-eslint/recommended-type-checked` and `eslint-config-prettier`.
- Prettier configuration (`.prettierrc` + `.prettierignore`) with library-friendly defaults (`singleQuote`, `semi: true`, `printWidth: 100`).
- Dedicated TS CI workflow at `.github/workflows/ts-ci.yml` running `npm ci`, `npm run lint`, `npm test`, and `npm run build` on push and PR to `main`.
- Dedicated Gitleaks workflow at `.github/workflows/gitleaks.yml` for secret scanning.
- New dev dependencies: `@types/node`, `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-config-prettier`, `prettier`.
- New npm scripts: `lint:eslint` (type-checked lint) and `format:check` (Prettier dry-run).
- New unit test file `tests/index.test.ts` covering the `src/index.ts` main entry (happy path + error/invariant paths).
- `SECURITY-NOTE.md` documenting the false-positive secret finding (TruffleHog `\$` shell escape and Scorecard `id-token: write` OIDC permission) — see file for full rationale.

### Changed

- `tsconfig.json`: switched `module` and `moduleResolution` from `ESNext`/`bundler` to `NodeNext`/`NodeNext` to align with the published package's `type: "module"` and Node ESM consumers.
- `src/index.ts`: import paths use explicit `.js` extensions as required by `NodeNext` module resolution.
- `README.md`: added a "Build / Test" section and updated install line to use the canonical `@phenotype/design` package name.

### Fixed

- No bug fixes in this release. The previously flagged "secret leak" in `.github/workflows/trufflehog.yml` (commit `547ee2a`) is a **false positive** — see `SECURITY-NOTE.md`.

[Unreleased]: https://github.com/KooshaPari/phenoDesign/compare/main...HEAD
