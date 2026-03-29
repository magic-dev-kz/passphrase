# PassPhrase — Audit Report

**Auditor:** House, QA Analyst @ OpenClaw
**Date:** 2026-03-29
**Files reviewed:** spec.md, design.md, index.html, style.css, app.js, words-en.js, words-ru.js
**Reference:** converter/index.html (quality benchmark)

---

## 1. Acceptance Criteria (10 AC)

### AC-1: Auto-generate passphrase on open — PASS
`init()` calls `generate()` at the end. Default state: 4 English words, dash separator, number. Works correctly.

### AC-2: Mode switching without reload — PASS
`switchMode()` toggles tabs, shows/hides settings panels via CSS class `.hidden`, and triggers `generate()`. Instant, no reload.

### AC-3: Phrase settings apply on next generation — PASS
All settings (word count, separator, number, symbol, language) update state immediately and call `generate()`. Settings apply in real-time, even better than spec's "next generation."

### AC-4: Shield updates with levels 1-5 and animation — PASS
`updateShield()` sets `data-level`, changes color, shows/hides sword/crown/check/cracks. Pulse animation via `.shield--pulse` class with reflow trick. Transitions are smooth.

### AC-5: Crack time estimate in human-readable format — PASS
`getCrackTime()` shows seconds/minutes/hours/days/years/K years/M years/B years/"Longer than age of Universe." Entropy bits displayed alongside. Correctly handles edge cases up to `2^1023` (JavaScript `Number` limit).

### AC-6: Copy button with animation feedback — PASS
`copyToClipboard()` uses `navigator.clipboard` with textarea fallback. Button gets `.btn--copied` class (green flash + checkmark) for 1200ms. No toast, no alert.

### AC-7: History with 25 items, show/hide, copy — PASS
`MAX_HISTORY = 25`. Passwords hidden with bullet dots by default. Click to reveal (via `textContent`, safe). Copy button per item. "Clear history" has confirm dialog. Warning text: "Passwords are stored only in this browser."

### AC-8: Theme toggle persists — PASS
Saves to `localStorage('pp-theme')`. Respects `prefers-color-scheme` via CSS media query when no saved preference. Toggle icon updates (sun/moon SVG swap).

### AC-9: No frameworks, fast load — PASS
Zero dependencies. 6 files total: HTML + CSS + JS + 2 word lists. System font stack. Should load in <100ms locally.

### AC-10: Responsive at 375px — PASS (with caveats)
Has `@media (max-width: 360px)` breakpoint with smaller fonts. Settings stack vertically via flexbox. History panel caps at `85vw`. However, there is no explicit 375px breakpoint, and password text at 22px can overflow on very long classic passwords.

**Score: 9/10 AC passed cleanly, 1 with minor caveats.**

---

## 2. Bugs & Edge Cases

### CRITICAL

**BUG-1: Dictionary size severely below spec**
- Spec requires ~2000 EN words, ~1000 RU words
- Actual: **668 unique EN** (12 duplicates), **495 unique RU** (5 duplicates)
- This directly impacts security: 4-word EN passphrase + number = **44 bits entropy** (shield level 2, "A hacker needs a day")
- With 2000 words it would be **50 bits** (level 3). With number + symbol = ~60 bits (level 3).
- Real-world crack time for 44 bits at 10B guesses/sec: **~15 minutes**. The tool is giving users a false sense of security.
- The duplicates also reduce effective dictionary size further.

**BUG-2: `saveHistory()` has no try/catch**
- `loadHistory()` correctly wraps `JSON.parse` in try/catch
- `saveHistory()` does raw `localStorage.setItem()` with no error handling
- If localStorage is full (5MB quota), this throws `QuotaExceededError` and the entire `generate()` flow breaks silently (no new password displayed after the error)
- Fix: wrap in try/catch, same as `loadHistory()`

### IMPORTANT

**BUG-3: No `prefers-reduced-motion` support**
- CSS has zero `prefers-reduced-motion` media queries
- Shield glow animation, pulse animation, typewriter effect, and copy button transitions all run regardless of user preference
- WCAG 2.1 SC 2.3.3 violation
- Fix: add `@media (prefers-reduced-motion: reduce)` to disable animations

**BUG-4: `icon-btn` is 36x36px, below 44x44 minimum touch target**
- Design spec and Apple HIG require 44x44px minimum
- Header buttons (history, theme toggle) are only 36x36px
- This fails the app's own spec (`--tap-target: 44px` is defined but not applied to `.icon-btn`)
- Fix: change `.icon-btn` width/height to `var(--tap-target)`

**BUG-5: Classic mode — last toggle silently prevented with no feedback**
- When user tries to disable the last active charset toggle, the code silently reverts (`classicSettings[key] = true; return;`)
- The toggle visually stays on (correct) but user gets zero feedback about why it didn't work
- Could frustrate users. Fix: brief shake animation or subtle flash.

**BUG-6: History panel has no focus trap**
- History overlay opens as a modal (`role="dialog" aria-modal="true"`) but Tab can escape to elements behind it
- Confirm dialog also lacks focus trap
- Keyboard users can interact with hidden elements behind the overlay
- Converter reference does implement focus trap for its overlay — this is a regression
- Fix: add focus trap like converter's `trapFocus()` function

**BUG-7: Missing footer**
- Spec and design both show a footer: "Passwords never leave your browser"
- HTML has no `<footer>` element
- The text exists only inside the history panel (`history-warning`), which is hidden by default
- Users never see this trust signal unless they open history

### MINOR

**BUG-8: Empty dictionary would produce `undefined` passwords**
- If `WORDS_EN` or `WORDS_RU` were empty (script load failure), `secureRandomInt(0)` returns `NaN`, generating passwords like `undefined-undefined-undefined-undefined-NaN`
- Low probability but should have a guard: check array length > 0

**BUG-9: Typewriter uses `setInterval`, not CSS animation**
- Design.md specifies pure CSS `@keyframes` with per-character `<span>` elements and `animation-delay`
- Implementation uses `setInterval` with `textContent` slice — simpler but less smooth, and prevents `user-select: all` from working mid-animation
- Not a functional bug but a deviation from design intent

**BUG-10: Copy button can be clicked during typewriter animation**
- If user clicks "Copy" while typewriter is still running, `currentPassword` has the full value but `$passwordText.textContent` shows partial text
- Clipboard gets the correct full password (copies `currentPassword`, not DOM text) — so this is cosmetically weird but functionally correct

---

## 3. Design Compliance

### Colors
- Dark theme: CSS uses `#1C1C1E` (bg), design.md specifies `#0D0D0F` — **mismatch**
- Dark card bg: CSS `#2C2C2E`, design `#1A1A1E` — **mismatch**
- Accent: CSS `#0A84FF` (iOS blue), design `#6C5CE7` (purple) — **significant mismatch**
- Light theme colors are close but not exact either
- Shield colors match design.md exactly

The developer chose an iOS system color palette instead of the custom palette in design.md. Visually it works well but is not "pixel-for-pixel" as the design doc requests.

### Layout
| Element | Design | Actual | Match |
|---------|--------|--------|-------|
| Max-width | 480px | 420px | NO |
| Shield size | 120x120px | 64x72px | NO |
| Password font | 28px/32px | 22px/24px | NO |
| Card border-radius | 16px | 16px | YES |
| Button border-radius | 12px | 24px (pill) | NO |
| Spacing base | 8px | 8px | YES |
| Tab pill radius | 8px | 8px | YES |

### Structure
Design shows: Header > Shield > Password > Buttons > Tabs > Settings > History > Footer
Actual: Header > Tabs > Password > Shield > Buttons > Settings (no visible History, no Footer)

The order of Shield and Password display is swapped. Tabs moved above password. History is a slide-in panel instead of inline drawer. Footer is missing entirely.

These are reasonable UX decisions (arguably better flow) but diverge from design.md.

### WCAG AA Contrast
| Pair | Ratio | Result |
|------|-------|--------|
| White on dark bg (#FFF/#1C1C1E) | 17.01:1 | AA PASS |
| Dark on light bg (#1C1C1E/#F2F2F7) | 15.25:1 | AA PASS |
| Secondary on dark (#A1A1A6/#1C1C1E) | 6.61:1 | AA PASS |
| Secondary on light (#636366/#F2F2F7) | 5.37:1 | AA PASS |
| Muted on dark (#636366/#1C1C1E) | 2.84:1 | **FAIL** |
| Muted on light (#8E8E93/#F2F2F7) | 2.92:1 | **FAIL** |
| Yellow shield on dark (#FFD60A/#1C1C1E) | 12.05:1 | AA PASS |
| Red shield on dark (#FF453A/#1C1C1E) | 4.99:1 | AA PASS |
| Purple shield on dark (#BF5AF2/#1C1C1E) | 4.83:1 | AA PASS |
| White on accent button (#FFF/#0A84FF) | 3.65:1 | AA-large only |

**Two failures:**
1. `--text-muted` (#636366) on dark bg: 2.84:1. Used for history timestamps, disabled states. Below 3:1 minimum.
2. `--text-muted` (#8E8E93) on light bg: 2.92:1. Same problem.
3. White on accent buttons: 3.65:1. Passes AA for large text (16px bold = large), but technically borderline.

### Focus States
- Global `:focus-visible` with 2px solid accent + 2px offset — **good**
- Range inputs have separate focus style — **good**
- History items have `tabindex="0"` and keyboard handlers — **good**
- Missing: focus styles for `.toggle` buttons (no `:focus-visible` override)

### Responsive
- 375px: works, content fits within padding
- 768px: centered card, looks good
- 1024px: same as 768px (single column, centered)
- Very long passwords (classic 64 chars) may overflow on narrow screens — `word-break: break-all` handles this

---

## 4. Code Quality

### Security: crypto.getRandomValues() — PASS
`secureRandomInt()` uses `crypto.getRandomValues(new Uint32Array(1))` with rejection sampling to avoid modulo bias. This is textbook correct implementation. No `Math.random()` anywhere.

### Entropy Calculation — CORRECT but MISLEADING
For phrase mode: `wordCount * log2(dictSize) + log2(90) + log2(9)`
This is mathematically correct for the given dictionary size. The problem is the dictionary is too small (see BUG-1), so the entropy displayed is accurate but the security level is lower than users expect from a "passphrase generator."

For classic mode: `length * log2(charsetSize)` — standard formula, correct.

The crack time assumes 10 billion guesses/second, which is reasonable for a modern GPU cluster. Average time is `2^entropy / guessRate / 2`.

**Issue:** For passphrase mode, the entropy calculation is based on dictionary attack (correct), but if an attacker doesn't know the dictionary, character-based entropy would apply. The tool shows the worst-case (dictionary attack), which is the right choice for security honesty.

### Overflow: No issues
- Maximum entropy: classic 64 chars, all charsets = 419 bits
- `Math.pow(2, 419)` = ~1.35e126, well within JavaScript `Number` range (max ~1.8e308)
- `getCrackTime` correctly handles values up to age of Universe and beyond

### Memory Leaks — NONE DETECTED
- Event listeners are bound once in `init()`, never re-bound
- History items use `addEventListener` on dynamically created elements, but these are replaced wholesale via `innerHTML = ''` on each `renderHistory()` call (old elements GC'd)
- `typingTimer` is always cleared before new interval starts
- No closures holding stale references

### Global Variables
Only `WORDS_EN` and `WORDS_RU` (intentionally global, loaded via `<script>` tags). All other code is wrapped in IIFE. Clean.

### Code Organization
- IIFE wrapper with `'use strict'` — good
- Clear separation: helpers > constants > state > DOM refs > functions > event binding > init
- Consistent naming conventions
- No dead code detected
- Missing: JSDoc beyond the file header

---

## 5. Comparison with Competitors

### vs random.org/passwords
- random.org uses atmospheric noise for randomness; PassPhrase uses `crypto.getRandomValues()` (CSPRNG) — both are cryptographically secure
- random.org has more password format options (pronounceable, custom)
- random.org has no passphrase mode — **PassPhrase wins here**
- random.org requires network — **PassPhrase works offline**
- PassPhrase has better visual design and mobile UX
- **Verdict: PassPhrase is better for the target persona (quick, visual, offline)**

### vs passwordsgenerator.net
- passwordsgenerator.net has ads, cluttered UI, dated design
- It does offer "exclude similar characters" and "exclude ambiguous" — PassPhrase lacks these
- passwordsgenerator.net has a passphrase option but it's buried
- passwordsgenerator.net has a much larger settings panel (intimidating for the target user)
- **Verdict: PassPhrase is cleaner and faster for the use case, but less flexible**

### vs 1Password generator (free web version)
- 1Password has stronger word lists (~18,000 words in EFF lists)
- 1Password shows entropy and crack time similarly
- PassPhrase's shield visualization is more engaging than 1Password's progress bar
- **Verdict: 1Password is more secure (larger dictionary), PassPhrase is more fun**

### Overall competitive position
PassPhrase sits in a good niche: faster and prettier than utilitarian generators, simpler than password managers. The main gap is **dictionary size** — fixing BUG-1 would bring it to competitive parity with serious tools.

---

## 6. Scores

| Category | Score | Notes |
|----------|-------|-------|
| Functionality (AC compliance) | **8/10** | 9/10 ACs pass, but dictionary size undermines core value proposition |
| Security | **5/10** | crypto.getRandomValues is correct, but 668-word dictionary makes default passphrases crackable in minutes. This is the core product — it must be solid. |
| Design fidelity | **5/10** | Color palette, sizes, layout order, and accent color all diverge from design.md. Looks good independently but does not match the spec. |
| Code quality | **8/10** | Clean IIFE, proper CSPRNG, good separation. Missing try/catch on save, no reduced-motion, no focus trap. |
| UX/Accessibility | **7/10** | Good ARIA, focus-visible, keyboard support. Fails on muted text contrast, missing focus trap, missing reduced-motion. |
| Mobile/Responsive | **8/10** | Works well at 375px. Touch targets on icon buttons are undersized. Long passwords handled. |

### **Overall: 6.5/10**

This is not an 8.5. The dictionary size issue alone drops the security score to unacceptable levels for a security tool. The design divergences suggest the spec was used as inspiration rather than as a contract. The code quality is the strongest aspect.

---

## 7. Action Items

### CRITICAL (blockers for launch)

1. **Expand word lists**: EN to 2048+ unique words, RU to 1024+ unique words. Remove all duplicates. Use established lists (EFF diceware) as a base if needed. This is the #1 priority.
2. **Wrap `saveHistory()` in try/catch**: localStorage quota errors will break the generate flow.

### IMPORTANT (next sprint)

3. **Add `prefers-reduced-motion` media query**: Disable all animations/transitions. WCAG requirement.
4. **Add focus trap to history panel and confirm dialog**: Keyboard accessibility requirement for modal overlays.
5. **Fix `icon-btn` touch targets**: Change from 36px to 44px.
6. **Add visible footer**: "Passwords never leave your browser" — trust signal should always be visible.
7. **Fix muted text contrast**: Lighten `--text-muted` in dark theme to at least #7C7C80 (3:1 minimum).
8. **Align colors with design.md or update design.md**: Either adopt the design spec colors or formally update the spec. Current state is ambiguous.

### NICE-TO-HAVE

9. **Add user feedback for last-toggle prevention**: Brief shake animation when user tries to disable the last charset toggle in classic mode.
10. **Guard against empty word lists**: Check `arr.length > 0` before calling `secureRandomInt()`.
11. **Implement CSS-based typewriter**: Per design.md, use `<span>` per character with CSS animation-delay instead of `setInterval`.
12. **Add "exclude similar characters" option for classic mode**: (l/1/I, 0/O) — common competitor feature.
13. **Add tabpanel ARIA linking**: Connect tabs to their panels via `aria-controls` and `id`.
14. **Increase password display font size**: Match design.md (28px mobile / 32px desktop) or update spec.
15. **PIN mode chips instead of slider**: Design.md shows pill buttons [4] [6] [8], implementation uses a range slider. Either works, but they don't match.

---

*"Everybody lies." Including password generators that say your 44-bit passphrase is safe. Fix the dictionary, then we'll talk about 8.5.*

-- House
