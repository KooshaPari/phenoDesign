# Architecture Decision Records -- @phenotype/design

## ADR-001: CSS-First, Framework-Agnostic Tokens

**Status:** Accepted
**Context:** Phenotype projects span multiple frameworks (VitePress, React, plain HTML). Design tokens must work everywhere.
**Decision:** Ship tokens as CSS custom properties in framework-agnostic CSS files. Provide TypeScript exports as a convenience layer.
**Alternatives:** Tailwind config (ties to Tailwind), JS-only tokens (requires runtime).
**Consequences:** Any project can consume via CSS import; no build tool dependency for basic usage.

## ADR-002: W3C DTCG Token Format

**Status:** Accepted
**Context:** Design tokens need a standardized, tool-interoperable format.
**Decision:** Use W3C Design Token Community Group (DTCG) JSON format as the source of truth for tokens.
**Alternatives:** Style Dictionary format (proprietary), Figma tokens (vendor lock-in).
**Consequences:** Tokens parseable by Style Dictionary, Figma plugins, and custom tooling.

## ADR-003: WCAG AA Contrast Enforcement

**Status:** Accepted
**Context:** All color combinations must be accessible.
**Decision:** Every foreground/background combination in the Keycap palette meets WCAG AA (4.5:1 contrast ratio minimum).
**Alternatives:** WCAG AAA (7:1) -- too restrictive for design flexibility.
**Consequences:** Color choices constrained by contrast requirements; automated contrast checks in CI.

## ADR-004: VitePress Theme as Primary Consumer

**Status:** Accepted
**Context:** Most Phenotype documentation uses VitePress; the theme should be a first-class export.
**Decision:** Provide `css/vitepress-theme.css` and `dist/vitepress.js` as dedicated VitePress integration exports.
**Alternatives:** Generic theme only (VitePress users would need manual integration).
**Consequences:** VitePress sites get one-line theme setup; other frameworks use the generic CSS exports.
