# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-

### Changed

-

### Fixed

-

## [2.0.1] - 2026-07-21

### Added

- First npm publish of `@phenotype/design` (scoped public package).
- Release runbook: `docs/guides/npm-release.md`.

### Changed

- Hardened `publish.yml`: `setup-node` registry auth, `release: published` trigger,
  `workflow_dispatch` dry-run, and explicit `NPM_TOKEN` guard.

### Fixed

- Package name SSOT restored to `@phenotype/design` after interim `@kooshapari/design`
  rename (supersedes git tag `v2.0.0`, which was never published to npm).

[Unreleased]: https://github.com/KooshaPari/phenoDesign/compare/v2.0.1...HEAD
[2.0.1]: https://github.com/KooshaPari/phenoDesign/compare/v2.0.0...v2.0.1
