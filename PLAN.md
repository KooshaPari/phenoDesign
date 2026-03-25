# @phenotype/design Implementation Plan

**Status:** Active
**Stack:** TypeScript, CSS, W3C DTCG tokens

## Phase 1: Token Foundation

| Task | Description | Depends On |
|------|-------------|------------|
| P1.1 | Define Keycap palette in W3C DTCG JSON format | -- |
| P1.2 | Generate CSS custom properties from DTCG tokens | P1.1 |
| P1.3 | Generate TypeScript constants from DTCG tokens | P1.1 |
| P1.4 | WCAG AA contrast validation for all combinations | P1.1 |

## Phase 2: Components

| Task | Description | Depends On |
|------|-------------|------------|
| P2.1 | Badge component styles using token references | P1.2 |
| P2.2 | Card component styles | P1.2 |
| P2.3 | Pipeline indicator styles | P1.2 |

## Phase 3: VitePress Integration

| Task | Description | Depends On |
|------|-------------|------------|
| P3.1 | VitePress theme CSS (imports palette + components) | P1.2, P2.1 |
| P3.2 | VitePress config helper JS module | P3.1 |
| P3.3 | Integration test with sample VitePress site | P3.2 |

## Phase 4: Quality

| Task | Description | Depends On |
|------|-------------|------------|
| P4.1 | CSS lint and validation | P2.3 |
| P4.2 | Token schema validation tests | P1.1 |
| P4.3 | npm package build and publish pipeline | P4.1 |
