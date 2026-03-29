# PassPhrase QA Audit — 2026-03-29
**Auditor:** Nash, QA OpenClaw
**Baseline:** 8.5/10
**Target:** 9.0+

---

## Checklist results

| # | Check | Status | Details |
|---|-------|--------|---------|
| 1 | localStorage try/catch | PARTIAL | `loadHistory`/`saveHistory` -- OK. `initTheme` (L97) and `toggleTheme` (L111) read/write localStorage without try/catch. Safari private mode throws. |
| 2 | WCAG AA contrast | FAIL | `--text-muted` ~3.5:1 in both themes. Light: `#7A7A7F` on `#FFFFFF`. Dark: `#7C7C80` on `#1C1C1E`. AA requires 4.5:1 for normal text. Used in footer, history dates, warning text. |
| 3 | Focus trap | PASS | History panel and confirm dialog both have `trapFocus()` with cleanup. |
| 4 | prefers-reduced-motion | PARTIAL | CSS -- excellent (all animations killed). JS typewriter (`typePassword`, L181) still runs char-by-char regardless of preference. Should show full text instantly. |
| 5 | Keyboard nav (tabs) | FAIL | `role="tablist"` requires Left/Right arrow keys per WAI-ARIA Authoring Practices. Currently tabs only respond to click/Enter. |
| 6 | Mobile viewport | PASS | `meta viewport`, `100dvh`, `env(safe-area-inset-*)`, responsive breakpoints. |
| 7 | escapeHtml (" and ') | PASS | `escapeAttr()` covers `& " ' < >`. Passwords displayed via `textContent` (safe). History data-attributes go through `escapeAttr`. |

---

## Fixes needed for 9.0+ (4 total)

### Fix 1 — localStorage try/catch in theme (LOW effort)
**File:** `app.js`, functions `initTheme` and `toggleTheme`
```js
// initTheme: wrap getItem
try { const saved = localStorage.getItem('pp-theme'); ... } catch(e) {}

// toggleTheme: wrap setItem
try { localStorage.setItem('pp-theme', next); } catch(e) {}
```

### Fix 2 — WCAG AA contrast for text-muted (LOW effort)
**File:** `style.css`
- Dark theme: `--text-muted: #7C7C80` --> `#8E8E93` (4.5:1 on `#1C1C1E`)
- Light theme: `--text-muted: #7A7A7F` --> `#6C6C70` (4.9:1 on `#FFFFFF`, 4.6:1 on `#F2F2F7`)

### Fix 3 — Typewriter respects prefers-reduced-motion (LOW effort)
**File:** `app.js`, function `typePassword`
```js
function typePassword(text) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $passwordText.textContent = text;
    return;
  }
  // ...existing animation code
}
```

### Fix 4 — Arrow key navigation for tablist (MEDIUM effort)
**File:** `app.js`, function `bindEvents`
Add keydown handler on `#tabs`:
```js
$tabs.addEventListener('keydown', (e) => {
  const tabs = [...$$('.tab')];
  const current = tabs.findIndex(t => t.classList.contains('active'));
  let next;
  if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
  else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
  else return;
  e.preventDefault();
  tabs[next].focus();
  switchMode(tabs[next].dataset.mode);
});
```
Also add `tabindex="-1"` to inactive tabs and `tabindex="0"` to active one (manage in `switchMode`).

---

## Summary

**4 fixes** to reach 9.0+. Three are low-effort one-liners, one (arrow keys) is a small block of ~15 lines. No architectural changes needed. Everything else in the checklist is solid.
