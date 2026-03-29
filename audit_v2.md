# PassPhrase QA Re-Audit v2 — 2026-03-29
**Auditor:** Nash, QA OpenClaw
**Previous score:** 8.5/10
**Scope:** verify 4 fixes from audit_fresh.md

---

## Fix verification

| # | Fix | Status | Evidence |
|---|-----|--------|----------|
| 1 | localStorage try/catch in initTheme/toggleTheme | PASS | `initTheme` L97-104: getItem wrapped. `toggleTheme` L115-118: setItem wrapped. Both catch silently -- Safari private mode safe. |
| 2 | --text-muted WCAG AA contrast | PASS | Dark `#8E8E93` on `#1C1C1E` = 4.6:1. Light `#6C6C70` on `#FFFFFF` = 4.9:1, on `#F2F2F7` = 4.6:1. All >= 4.5:1 AA. Applied in both `[data-theme="light"]` and `@media (prefers-color-scheme: light)` blocks. |
| 3 | Typewriter prefers-reduced-motion | PASS | `typePassword` L196-199: checks `matchMedia('(prefers-reduced-motion: reduce)')`, sets textContent instantly, returns before animation. CSS `@media (prefers-reduced-motion)` block also kills cursor blink. Both layers covered. |
| 4 | Tablist arrow key navigation | PASS | L613-628: ArrowLeft/Right move focus with wrapping, Enter/Space activate via `switchMode()`. Follows WAI-ARIA manual activation pattern. `e.preventDefault()` blocks scroll on arrows and form submit on Space. |

---

## Nit (non-blocking)

- **tabindex roving:** WAI-ARIA best practice recommends `tabindex="0"` on active tab and `tabindex="-1"` on inactive tabs (roving tabindex). Current implementation leaves all tabs in tab order, meaning Tab key cycles through all three instead of moving to the next widget. Functional but not ideal. Severity: low.

---

## Updated score

| Category | Score | Notes |
|----------|-------|-------|
| Security (crypto, no leaks) | 10/10 | `crypto.getRandomValues`, unbiased modulo, no network calls |
| Accessibility | 9/10 | ARIA roles, focus trap, reduced-motion (JS+CSS), contrast AA. Roving tabindex missing (nit). |
| Resilience | 9/10 | All localStorage wrapped, charset fallback, dictionary empty guard |
| UX / polish | 9/10 | Typewriter, shield animation, copy feedback, history panel |
| Code quality | 9/10 | IIFE, strict mode, clean separation, escapeAttr |

**Overall: 9.0 / 10**

All 4 fixes confirmed. Target reached.
