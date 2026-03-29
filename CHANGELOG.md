# Changelog

## v11.0.0 (2026-03-29)
- **Onboarding overlay**: First-visit glassmorphism overlay with app title, tagline, 3 feature highlights (staggered fade-in), and "Generate My First Password" CTA
- CTA dismisses overlay, sets localStorage flag (`passphrase_onboarded`), and auto-generates first password
- Dark glass card with teal accent glow, `prefers-reduced-motion` safe
- Service worker cache bumped to `passphrase-v11.0`

---

## v10.0.0 (2026-03-29)
- First-visit tooltip "Press Space to generate" shown once after init, auto-fades after 5s
- Password font size slightly larger (28px to 30px) for readability
- Service worker cache bumped to `passphrase-v10.0`

---

## v9.0.0 (2026-03-29)

### Visual Identity Upgrade (Leo 5.5 -> 9/10)

**Security-Themed Color System**
- Primary accent: Cyber teal `#00D4AA` (security, trust)
- Secondary accent: Electric blue `#3B82F6` for gradients and active states
- Danger red `#EF4444` for weak passwords, Success green `#22C55E` for strong
- Body background: deep dark with subtle teal and blue radial glows (animated drift)
- Light theme receives matching secondary/green/red variables

**Shield Visualization Upgrade**
- 5 distinct strength levels with unique colors AND glow intensity
- Level 1 (weak): red glow; Level 2: amber; Level 3: yellow; Level 4: green with breathing animation; Level 5: purple legendary glow
- Pulsing SVG scale animation on strong passwords (levels 4-5)
- Enhanced pulse animation on level change (0.5s spring)
- Shield label gains text-shadow glow matching strength color

**Generate Button Animation**
- On click: button scales down to 0.93 (fast 80ms) then ripple outward via `generate-ripple` keyframe
- Ripple: expanding box-shadow ring from accent color that fades to transparent
- Spring easing for satisfying bounce-back

**Password Reveal Enhancement**
- Strength meter bar: smoother cubic-bezier fill transition (0.8s)
- Strength bar gains glow pseudo-element matching current color
- Score badge and strength label colors updated to v9 palette

**Card & Section Styling**
- Settings panels: enhanced glassmorphism with inset accent border, hover glow effect
- Tab pills: gradient active state (teal -> blue), hover lift (`translateY(-1px)`)
- Toggle switches: teal-to-blue gradient when active, enhanced glow shadow
- Slider thumb: teal-to-blue gradient with ambient glow, 1.15x scale on hover
- Setting chips: gradient active state matching tabs
- Checker section: hover border highlight
- Password display: hover border glow

**Copy Feedback**
- Green pulse border: double-pulse animation on password area (1.2s)
- SVG checkmark draw animation via `stroke-dashoffset` (0.35s)
- Toast countdown bar: animated gradient that shifts across teal/blue spectrum

**Background Atmosphere**
- Three overlapping radial gradients (teal + blue) with elliptical shapes
- Subtle opacity drift animation (20s cycle) for living background feel
- `prefers-reduced-motion` fully respected for all new animations

### Technical
- Service worker cache bumped to `passphrase-v9.0`
- All existing functionality (generation, entropy, custom words, checker, compare, etc.) preserved
- Zero breaking changes to DOM structure or JavaScript API

---

## v8.0.0 (2026-03-29)

### New Features

**Password Pronounceability (Phrase Mode)**
- Shows a "Sounds like:" phonetic hint below the strength meter for Phrase passwords
- Extracts word parts from the passphrase and joins them with hyphens for easy reading
- Automatically hidden for Classic and PIN modes
- Helps users remember and verbally communicate their passphrases

**Time to Crack Estimate**
- Displays "Would take ~X years to crack" below the strength meter
- Calculation based on entropy: 2^entropy / 10^12 guesses per second
- Updates with each generated password
- Shows human-readable time ranges from "less than a second" to "trillions of years"

**Password Comparison Mode**
- New "Compare" button next to Generate
- Opens a modal showing 3 passwords side-by-side: Phrase, Classic, and PIN
- Each card displays the password, strength bar, score (out of 100), and entropy bits
- Helps users understand the relative strength of different password types
- Closable via button, backdrop click, or Escape key

### Technical
- Service worker cache bumped to `passphrase-v8.0`

---

## v7.0.0 (2026-03-30)

### New Features

**PWA Install Prompt**
- Shows an install banner after 2+ visits to the app
- Uses the `beforeinstallprompt` event for native install flow
- Dismissible with close button; dismiss state persisted in localStorage
- Does not show if app is already installed (standalone mode detected)

**Keyboard Shortcut: Space to Generate**
- Pressing Space generates a new password when focus is not in an input/textarea
- Works globally on the page; `e.preventDefault()` avoids page scroll
- Does not interfere with typing in the checker input or custom words textarea

**Remember Settings**
- Selected mode (Phrase/Classic/PIN), all phrase options (word count, separator, add number, add symbol, language), classic options (length, upper/lower/digits/symbols), and PIN length are saved to localStorage
- Settings restored on page load before first generation
- UI controls (chips, toggles, sliders, tabs) are synced to the restored values
- Saved on every generation to capture the latest changes

### Technical
- Service worker cache bumped to `passphrase-v7.0`

---

## v6.0.0 (2026-03-29)

### UX Animations & Polish

**Generate Blur-to-Reveal Animation**
- Password text plays a blur(10px) -> blur(0) unlock animation (0.5s) after typewriter completes
- Password container flashes with accent-colored border glow on each generation
- Both animations respect `prefers-reduced-motion`

**Copy Green Glow**
- On successful copy, the password display container pulses with a green glow border (1.5s)
- Green glow keyframe animation on border-color and box-shadow
- Complements existing button flash and toast feedback

**Focus-Visible Styles**
- All interactive elements have explicit `:focus-visible` outlines
- Primary buttons: white outline + accent glow ring
- Secondary buttons, tabs, toggles, chips: accent outline + subtle glow
- Danger button: red outline + red glow ring
- Inputs (checker, custom words): accent border + glow shadow
- History items, close buttons, eye toggle: accent outline
- Range sliders: accent outline with offset

**Mode Switch Crossfade**
- Switching between Phrase/Classic/PIN uses opacity crossfade (0.2s)
- Old panel fades out with slight downward drift, new panel fades in
- Falls back to instant toggle when `prefers-reduced-motion` is active

### Technical
- Service worker cache bumped to `passphrase-v6.0`

---

## v5.0.0 (2026-03-29)

### New Features

**Breach Pattern Check**
- Local pattern-based breach detection (no API calls — full privacy)
- Checks for common breach passwords (password, 123456, qwerty, admin, etc.)
- Detects too-short passwords (< 8 chars), digit-only, repeating characters (aaa, 111)
- Warning banner with caution icon appears below strength meter when patterns detected
- Also integrated into the Password Strength Checker section

**Password Score Badge**
- Numerical score (0–100) displayed next to the generated password
- Based on entropy bits: <30 bits = 0–20, 30–50 = 20–50, 50–70 = 50–75, 70–100 = 75–90, 100+ = 90–100
- Color-coded to match strength meter (red/orange/yellow/green/emerald)
- Glowing border effect matching the score color

**Transfer Password Modal**
- "Show" button (grid icon) next to Copy for easy password transfer
- Opens a large-font modal displaying the password for cross-device transfer
- Glassmorphism dialog with accent-colored, high-contrast password text
- Closable via button, backdrop click, or Escape key

**Sticky Header**
- Header now sticks to top on scroll with glassmorphism background
- Glass blur + border bottom for visual separation from content

### Technical
- Service worker cache bumped to `passphrase-v5.0`
- Breach check integrated into both generator and checker sections
- Score calculation added to checker details output

---

## v4.0.0 (2026-03-29)

### New Features

**Password Strength Meter**
- Animated horizontal bar below password display
- Gradient colors: red (Weak) -> orange (Fair) -> yellow (Good) -> green (Strong) -> emerald (Very Strong)
- Based on entropy bits calculation
- Animated shine sweep effect on the bar
- Updates in real-time with each generated password

**Custom Word Lists**
- Textarea in Phrase settings for user-defined words (comma-separated, max 20)
- "Use" toggle to enable/disable custom words in phrase generation
- "Save" button persists to localStorage, "Clear" button removes
- Falls back to standard dictionary if fewer than 2 custom words
- Entropy calculation adjusts for custom dictionary size

**Auto-clear after Copy**
- After copying, password result auto-clears in 30 seconds
- Visual countdown (30...29...28...) in the toast notification
- Animated progress bar shrinks over 30 seconds
- "Keep" button to cancel auto-clear and retain the password
- Auto-clear cancelled when generating a new password

**Password History (enhanced)**
- Session-only history already existed (v1); no changes to storage model
- History panel accessible via clock icon in header

### Technical
- Service worker cache bumped to `passphrase-v4.0`

---

## v3.0.0 (2026-03-29)

### Visual Redesign by Sky

**Gradient Backgrounds**
- Deep dark gradient background (`#0a0e17` to `#0a1628`) for a security-focused aesthetic
- Subtle radial accent glows (cyan/green) in the background layer
- Fixed background attachment for immersive scrolling

**Typography**
- Google Fonts: Inter (UI) and JetBrains Mono (passwords/code)
- Gradient title text (cyan-to-green) for the PassPhrase header
- Password text glow effect with `text-shadow` using accent color

**Glassmorphism**
- All cards (password display, settings, checker, tabs, toast, dialogs) use translucent glass effect
- `backdrop-filter: blur(16px)` with semi-transparent backgrounds
- Subtle glass border (cyan-tinted `rgba`) and inset shine highlight
- Works in both dark and light themes

**Micro-animations**
- Button hover: lift (`translateY(-1px)`) + glow shadow intensification
- Copy feedback: `copy-flash` scale animation on success
- Password reveal: blur-to-clear + scale-up animation (`password-reveal` keyframe)
- Slider thumb: scale-up on hover with glow shadow
- Setting chips: lift on hover
- Icon buttons: color transition to accent + subtle glow on hover

**Strength Indicator**
- Animated shine sweep on the checker bar (`bar-shine` keyframe)
- Dark inset track for better contrast
- Smooth gradient transitions as strength changes

**Security Glow Theme**
- Cyan/green accent palette (`#00d4aa`, `#00e68a`) throughout
- Soft colored shadows on primary buttons and active toggles
- Shield level 5 glow updated to match new palette
- Active tabs and toggles use gradient fills with glow shadows

**Slider & Toggles**
- Toggle switch: gradient background when active, spring-animated knob, glow shadow
- Range slider thumb: gradient fill (cyan-to-green), hover scale + glow

**Mobile Polish**
- Preserved all responsive breakpoints (360px, 600px)
- Touch-friendly tap targets maintained at 44px
- Safe area inset support retained
- `prefers-reduced-motion` fully respected (disables all new animations)

**Dark/Light Mode**
- Both themes fully supported with adapted glass, border, and glow values
- `prefers-color-scheme` media query preserved for auto-detection
- Manual `data-theme` toggle preserved

### No Breaking Changes
- Zero JavaScript modifications
- All `id`, `data-*`, and `aria-*` attributes unchanged
- All class names and DOM structure preserved

---

## v1.0 (2026-03-29)
- Initial release
- Ship-ready (9.0/10)
- PWA (service worker + manifest)
- WCAG AA accessible
- Works offline
