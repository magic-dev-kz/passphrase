# PassPhrase — Design Specification

**Author:** Sky, Creative Director @ OpenClaw
**Date:** 2026-03-29
**Based on:** spec.md by Sanya (Product Manager)

---

## 1. Color Palette

### 1.1. Dark Theme (default)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0D0D0F` | Page background |
| `--bg-card` | `#1A1A1E` | Card / panel background |
| `--bg-input` | `#252529` | Input fields, sliders, toggles |
| `--bg-hover` | `#2A2A30` | Hover state for interactive elements |
| `--border` | `#2E2E35` | Subtle borders between sections |
| `--text-primary` | `#F5F5F7` | Main text, password display |
| `--text-secondary` | `#8E8E93` | Labels, hints, timestamps |
| `--text-tertiary` | `#636366` | Disabled state, placeholders |
| `--accent` | `#6C5CE7` | Primary action buttons, links |
| `--accent-hover` | `#7C6DF7` | Button hover state |

### 1.2. Light Theme

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#F2F2F7` | Page background |
| `--bg-card` | `#FFFFFF` | Card / panel background |
| `--bg-input` | `#E5E5EA` | Input fields |
| `--bg-hover` | `#D1D1D6` | Hover state |
| `--border` | `#D1D1D6` | Borders |
| `--text-primary` | `#1C1C1E` | Main text |
| `--text-secondary` | `#6C6C70` | Labels |
| `--text-tertiary` | `#AEAEB2` | Disabled |
| `--accent` | `#5B4BD5` | Primary action (slightly darker for contrast on light bg) |
| `--accent-hover` | `#4A3BC4` | Button hover |

### 1.3. Shield Levels — 5 colors

These colors are consistent across both themes:

| Level | Token | Value | Glow | Label |
|-------|-------|-------|------|-------|
| 1 — Broken | `--shield-1` | `#FF3B30` | none | "Cracked in a minute" |
| 2 — Cracked | `--shield-2` | `#FF9500` | none | "A hacker's afternoon" |
| 3 — Solid | `--shield-3` | `#FFD60A` | none | "Needs a serious botnet" |
| 4 — Fortress | `--shield-4` | `#34C759` | `0 0 12px rgba(52,199,89,0.3)` | "Fortress" |
| 5 — Legend | `--shield-5` | `#AF52DE` | `0 0 20px rgba(175,82,222,0.4)` | "Legend" |

---

## 2. Layout

Single screen, mobile-first. Max-width: `480px`, centered. Vertical flow top to bottom.

### 2.1. Structure (top to bottom)

```
+---------------------------------------+
|  [sun/moon]             PassPhrase    |  <- Header: 56px
+---------------------------------------+
|                                       |
|          [ SHIELD ICON ]              |  <- Shield: 120x120px
|         "Fortress"                    |  <- Level label
|       ~200 years brute-force          |  <- Time estimate
|                                       |
+---------------------------------------+
|                                       |
|   hawk-marble-sunset-91               |  <- Password display: large mono
|                                       |
|   [Copy]          [Generate]          |  <- Action buttons, side by side
|                                       |
+---------------------------------------+
|  [ Phrase ]  [ Classic ]  [ PIN ]     |  <- Mode tabs: pill-shaped
+---------------------------------------+
|                                       |
|   Word count:    [3] [4] [5]          |  <- Settings panel
|   Separator:     [-] [.] [_] [none]   |     (collapsible on mobile)
|   Add number:    [toggle]             |
|   Add symbol:    [toggle]             |
|   Language:      [EN] [RU]            |
|                                       |
+---------------------------------------+
|                                       |
|   History (25)              [Clear]   |  <- History drawer
|   ******* | 12:04 | [eye] [copy]     |     (expandable)
|   ******* | 11:58 | [eye] [copy]     |
|                                       |
+---------------------------------------+
|   Passwords never leave your browser  |  <- Footer: 40px
+---------------------------------------+
```

### 2.2. Spacing System

- Base unit: `8px`
- Card padding: `24px`
- Gap between major sections: `16px`
- Border radius for cards: `16px`
- Border radius for buttons: `12px`
- Border radius for tabs/pills: `8px`

### 2.3. Responsive Behavior

- `< 480px`: full-width with `16px` side padding, settings stack vertically
- `480px+`: centered card, max-width `480px`
- No horizontal scrolling at any width
- Minimum touch target: `44x44px` (Apple HIG)

---

## 3. Shield Visualization

CSS-only solution using a combination of a CSS-drawn shield shape and emoji overlays. No external SVG files, no images.

### 3.1. Base Shield Shape

The shield is a `120x120px` container with a CSS `clip-path` that creates a classic shield silhouette:

```css
clip-path: polygon(50% 0%, 100% 12%, 100% 50%, 50% 100%, 0% 50%, 0% 12%);
```

The interior is filled with the level color. The shield sits inside a centered circle of `140x140px` that acts as a subtle shadow ring.

### 3.2. Visual Per Level

**Level 1 — Broken (red)**
Shield filled with `--shield-1`. A diagonal CSS pseudo-element (`::after`) draws a dark crack line across the surface (2px rotated element, `rgba(0,0,0,0.5)`). The shield pulses very subtly (opacity 0.7 to 1.0, 2s ease). Overall impression: damaged, urgent.

**Level 2 — Cracked (orange)**
Shield filled with `--shield-2`. The crack is thinner and shorter (top-right only). No pulse. A hairline `border` on the shield has a 1px gap to suggest stress. Feels: cautious, warning.

**Level 3 — Solid (yellow)**
Clean shield, `--shield-3` fill, no cracks. Smooth surface. A subtle inner shadow (`inset 0 2px 4px rgba(0,0,0,0.15)`) gives it depth. Feels: decent, functional.

**Level 4 — Fortress (green)**
Shield filled with `--shield-4`. A small sword icon (CSS pseudo-element: a rotated rectangle `4x24px` with a crossguard `12x4px`) sits behind the shield, angled 30deg. The shield has a soft green glow (`box-shadow`). Feels: strong, confident.

**Level 5 — Legend (purple)**
Shield filled with `--shield-5`. Sword behind (same as level 4). A small crown above the shield: three triangles made with CSS borders (3 `::before` triangles in a row, each `8px`). Purple glow pulses slowly (1.5s ease-in-out, shadow intensity cycles between 0.3 and 0.6 opacity). Feels: epic, maximum security.

### 3.3. Transition Between Levels

When the shield level changes, the entire shield container transitions:
- `background-color`: 400ms ease
- `box-shadow` (glow): 400ms ease
- `transform: scale(1.08)` then back to `1.0` over 300ms (a gentle "pop")
- Sword and crown elements fade in/out with `opacity` transition 300ms

---

## 4. Animations

### 4.1. Typewriter Effect (Password Display)

When a new password is generated:
1. Current text fades out: `opacity 1 -> 0` over `150ms`
2. Text is replaced, cursor (blinking `|`) appears at position 0
3. Characters reveal left-to-right: each character becomes `opacity: 1` with `20ms` stagger
4. Total duration for a 20-char password: ~400ms
5. Cursor blinks twice at the end, then disappears

Implementation: JS sets each character in a `<span>`, applies a CSS class with `animation-delay` per character. No `setInterval` needed, pure CSS `@keyframes` with staggered delays.

```css
@keyframes typeChar {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.char {
  opacity: 0;
  animation: typeChar 60ms ease forwards;
  /* animation-delay set inline per char */
}
```

### 4.2. Shield Transition

See section 3.3. Summary:
- Color crossfade: `400ms ease`
- Scale pop: `300ms ease-out`
- Elements (sword, crown) fade: `300ms`

### 4.3. Copy Button Feedback

1. User clicks "Copy"
2. Clipboard icon morphs to checkmark: swap of two SVG-inline icons via `opacity` toggle, `200ms`
3. Button background briefly flashes `--accent` at 20% opacity, `150ms`
4. After `1500ms`, checkmark fades back to clipboard icon

No toast. No alert. The button itself is the feedback.

### 4.4. Generate Button

On click:
- `transform: scale(0.95)` for `100ms`, then back to `1.0` — a tactile press effect
- Subtle rotation of a refresh-arrow icon inside the button: `360deg` over `400ms ease-in-out`

### 4.5. Theme Toggle

- Sun/moon icon crossfades: `200ms`
- All CSS custom properties transition via `transition: background-color 300ms, color 300ms` on `body`

### 4.6. History Drawer

- Expands/collapses with `max-height` transition: `300ms ease`
- Individual password items slide in on first open: staggered `50ms` per item, `translateY(8px) -> 0`

---

## 5. Typography

System font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif`

Monospace for passwords: `"SF Mono", "Fira Code", "Cascadia Code", "Consolas", monospace`

| Element | Size | Weight | Font | Letter-spacing |
|---------|------|--------|------|----------------|
| Password display | `28px` (mobile) / `32px` (desktop) | `500` | Monospace | `0.5px` |
| Shield level label | `18px` | `600` | System | `0` |
| Time estimate | `14px` | `400` | System | `0` |
| Action buttons | `16px` | `600` | System | `0.3px` |
| Mode tabs | `14px` | `500` | System | `0.2px` |
| Setting labels | `14px` | `400` | System | `0` |
| Setting values | `14px` | `500` | System | `0` |
| History items | `13px` | `400` | Monospace | `0.3px` |
| History timestamp | `12px` | `400` | System | `0` |
| Footer note | `12px` | `400` | System | `0` |

Line height: `1.4` globally. Password display: `1.6` (for breathing room).

---

## 6. Visual References

### 6.1. 1Password — Generator Screen (iOS app)

What to borrow: the large, confident password display in monospace centered on screen. The way the password is the hero element with generous whitespace around it. The clean pill-shaped mode switcher at the top. The "copy" action is primary and unmissable.

What to skip: 1Password's generator is buried inside their vault UI, behind authentication. We strip away all of that chrome. Our password display should be even larger and more prominent since it is the only thing on screen.

### 6.2. Bitwarden Web Generator

What to borrow: the settings panel with toggle switches and segmented controls for separator/word-count options. Clean vertical layout of options. The slider for password length in "Classic" mode is smooth and responsive. The strength meter color coding (red-to-green) informs our shield palette.

What to skip: Bitwarden's UI is utilitarian and dense. We need more whitespace, larger touch targets, and the settings should feel secondary to the password itself (collapsible, not always visible).

### 6.3. randompasswordgenerator.com

What to borrow: the instant-on experience. Page loads, password is already there. No onboarding, no modal, no instructions needed. The "Copy" and "Generate" buttons are immediately visible. This is the UX speed we are targeting.

What to skip: the visual design is outdated (flat 2015-era styling, small fonts, cluttered ads). Our dark iOS-like aesthetic with card-based layout, soft shadows, and generous spacing will elevate the same speed-of-use into a premium feeling.

---

## 7. HTML Skeleton

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PassPhrase</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="app">

    <!-- Header -->
    <header class="header">
      <button class="theme-toggle" aria-label="Toggle theme">
        <span class="theme-toggle__icon theme-toggle__icon--sun">&#9788;</span>
        <span class="theme-toggle__icon theme-toggle__icon--moon">&#9790;</span>
      </button>
      <h1 class="header__title">PassPhrase</h1>
    </header>

    <!-- Shield Section -->
    <section class="shield" aria-live="polite">
      <div class="shield__visual" data-level="4">
        <div class="shield__sword"></div>
        <div class="shield__crown"></div>
        <div class="shield__body">
          <div class="shield__crack"></div>
        </div>
      </div>
      <p class="shield__label">Fortress</p>
      <p class="shield__estimate">~200 years brute-force</p>
    </section>

    <!-- Password Display -->
    <section class="password">
      <output class="password__display" aria-live="polite">
        <!-- Each char wrapped in <span class="char"> by JS -->
      </output>
    </section>

    <!-- Action Buttons -->
    <div class="actions">
      <button class="btn btn--copy" aria-label="Copy password">
        <span class="btn__icon btn__icon--clipboard">&#128203;</span>
        <span class="btn__icon btn__icon--check">&#10003;</span>
        <span class="btn__text">Copy</span>
      </button>
      <button class="btn btn--generate" aria-label="Generate new password">
        <span class="btn__icon btn__icon--refresh">&#8635;</span>
        <span class="btn__text">Generate</span>
      </button>
    </div>

    <!-- Mode Tabs -->
    <nav class="tabs" role="tablist">
      <button class="tabs__tab tabs__tab--active" role="tab" data-mode="phrase">Phrase</button>
      <button class="tabs__tab" role="tab" data-mode="classic">Classic</button>
      <button class="tabs__tab" role="tab" data-mode="pin">PIN</button>
    </nav>

    <!-- Settings Panel -->
    <section class="settings">
      <div class="settings__row">
        <span class="settings__label">Words</span>
        <div class="settings__options">
          <button class="pill" data-words="3">3</button>
          <button class="pill pill--active" data-words="4">4</button>
          <button class="pill" data-words="5">5</button>
        </div>
      </div>

      <div class="settings__row">
        <span class="settings__label">Separator</span>
        <div class="settings__options">
          <button class="pill pill--active" data-sep="-">-</button>
          <button class="pill" data-sep=".">.</button>
          <button class="pill" data-sep="_">_</button>
          <button class="pill" data-sep="">none</button>
        </div>
      </div>

      <div class="settings__row">
        <span class="settings__label">Add number</span>
        <label class="toggle">
          <input type="checkbox" class="toggle__input" checked>
          <span class="toggle__slider"></span>
        </label>
      </div>

      <div class="settings__row">
        <span class="settings__label">Add symbol</span>
        <label class="toggle">
          <input type="checkbox" class="toggle__input">
          <span class="toggle__slider"></span>
        </label>
      </div>

      <div class="settings__row">
        <span class="settings__label">Language</span>
        <div class="settings__options">
          <button class="pill pill--active" data-lang="en">EN</button>
          <button class="pill" data-lang="ru">RU</button>
        </div>
      </div>

      <!-- Classic mode: length slider (hidden by default) -->
      <div class="settings__row settings__row--classic" hidden>
        <span class="settings__label">Length</span>
        <input type="range" class="slider" min="12" max="64" value="20">
        <span class="slider__value">20</span>
      </div>

      <!-- PIN mode: digit count (hidden by default) -->
      <div class="settings__row settings__row--pin" hidden>
        <span class="settings__label">Digits</span>
        <div class="settings__options">
          <button class="pill" data-digits="4">4</button>
          <button class="pill pill--active" data-digits="6">6</button>
          <button class="pill" data-digits="8">8</button>
        </div>
      </div>
    </section>

    <!-- History Drawer -->
    <section class="history">
      <button class="history__toggle" aria-expanded="false">
        <span>History</span>
        <span class="history__count">0</span>
        <span class="history__chevron">&#9662;</span>
      </button>

      <div class="history__drawer" hidden>
        <ul class="history__list">
          <!-- Items injected by JS:
          <li class="history__item">
            <span class="history__password history__password--hidden">********</span>
            <span class="history__time">12:04</span>
            <button class="history__reveal" aria-label="Show password">&#128065;</button>
            <button class="history__copy" aria-label="Copy">&#128203;</button>
          </li>
          -->
        </ul>
        <div class="history__footer">
          <p class="history__warning">Passwords are stored only in this browser</p>
          <button class="history__clear">Clear history</button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p class="footer__text">Passwords never leave your browser</p>
    </footer>

  </div>

  <script src="words-en.js"></script>
  <script src="words-ru.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

### Key CSS Class Conventions

- **BEM naming**: `block__element--modifier`
- **`data-*` attributes** for state: `data-level`, `data-mode`, `data-theme`
- **`hidden` attribute** for JS-toggled visibility (no `.d-none` classes)
- **`aria-*` attributes** for accessibility: `aria-live="polite"` on dynamic content, `role="tablist"` on mode switcher

---

## 8. Design Tokens Summary (CSS Custom Properties)

```css
:root {
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Timing */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 400ms;

  /* Shadows (dark theme) */
  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.3);
  --shadow-button: 0 1px 4px rgba(0, 0, 0, 0.2);

  /* Shield */
  --shield-1: #FF3B30;
  --shield-2: #FF9500;
  --shield-3: #FFD60A;
  --shield-4: #34C759;
  --shield-5: #AF52DE;
}
```

---

*This document is the single source of truth for visual decisions. Implementation should match these specs pixel-for-pixel on the shield colors, font sizes, and layout structure. Animation timing is approximate and should be tuned by feel during development.*
