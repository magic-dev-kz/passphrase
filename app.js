/**
 * PassPhrase — Password Generator
 * OpenClaw 2026
 * Uses crypto.getRandomValues() for secure generation
 */
(function () {
  'use strict';

  // === Secure random helpers ===
  function secureRandomInt(max) {
    // Uniform random integer in [0, max)
    const array = new Uint32Array(1);
    const maxValid = Math.floor(0xFFFFFFFF / max) * max;
    let value;
    do {
      crypto.getRandomValues(array);
      value = array[0];
    } while (value >= maxValid);
    return value % max;
  }

  function secureRandomElement(arr) {
    return arr[secureRandomInt(arr.length)];
  }

  function secureRandomChar(charset) {
    return charset[secureRandomInt(charset.length)];
  }

  // === Constants ===
  const SEPARATORS = ['-', '.', '_', ''];
  const SPECIAL_CHARS = '!@#$%^&*?';
  const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const DIGITS = '0123456789';
  const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  const MAX_HISTORY = 10;

  // === State ===
  let currentMode = 'phrase'; // phrase | classic | pin
  let customWords = []; // user-defined words for phrase mode (max 20)
  let useCustomWords = false;
  let phraseSettings = {
    wordCount: 4,
    separator: '-',
    addNumber: true,
    addSpecial: false,
    language: 'en'
  };
  let classicSettings = {
    length: 20,
    upper: true,
    lower: true,
    digits: true,
    symbols: true
  };
  let pinSettings = {
    length: 6
  };
  let currentPassword = '';
  let history = [];
  let typingTimer = null;

  // === DOM refs ===
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const $app = $('.app');
  const $tabs = $('#tabs');
  const $passwordText = $('#password-text');
  const $shieldSvg = $('#shield');
  const $shieldLabel = $('#shield-label');
  const $shieldTime = $('#shield-time');
  const $btnGenerate = $('#btn-generate');
  const $btnCopy = $('#btn-copy');
  const $settingsPhrase = $('#settings-phrase');
  const $settingsClassic = $('#settings-classic');
  const $settingsPin = $('#settings-pin');
  const $themeToggle = $('#btn-theme');
  const $historyToggle = $('#btn-history');
  const $historyOverlay = $('#history-overlay');
  const $historyList = $('#history-list');
  const $historyClose = $('#history-close');
  const $historyClear = $('#history-clear');
  const $confirmOverlay = $('#confirm-overlay');
  const $confirmYes = $('#confirm-yes');
  const $confirmNo = $('#confirm-no');

  // Strength meter
  const $strengthBar = $('#strength-bar');
  const $strengthLabel = $('#strength-label');
  const $strengthBits = $('#strength-bits');

  // Classic settings
  const $classicSlider = $('#classic-length');
  const $classicValue = $('#classic-length-value');

  // PIN settings
  const $pinSlider = $('#pin-length');
  const $pinValue = $('#pin-length-value');

  // === Theme ===
  function initTheme() {
    try {
      const saved = localStorage.getItem('pp-theme');
      if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
      }
    } catch (e) {
      // Safari private mode or localStorage unavailable
    }
    updateThemeIcon();
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const isDark = !current
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : current === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('pp-theme', next);
    } catch (e) {
      // Safari private mode or localStorage unavailable
    }
    updateThemeIcon();
  }

  function updateThemeIcon() {
    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = !theme
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme === 'dark';
    // Sun for dark (switch to light), moon for light (switch to dark)
    $themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    $themeToggle.innerHTML = isDark
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  // === Password Generation ===
  function generatePhrase() {
    let words;
    if (useCustomWords && customWords.length >= 2) {
      words = customWords;
    } else {
      words = phraseSettings.language === 'en' ? WORDS_EN : WORDS_RU;
    }
    if (!words || words.length === 0) {
      return 'error-empty-dictionary';
    }
    const selected = [];
    for (let i = 0; i < phraseSettings.wordCount; i++) {
      selected.push(secureRandomElement(words));
    }
    let result = selected.join(phraseSettings.separator);
    if (phraseSettings.addNumber) {
      result += phraseSettings.separator + (secureRandomInt(90) + 10); // 10-99
    }
    if (phraseSettings.addSpecial) {
      result += secureRandomChar(SPECIAL_CHARS);
    }
    return result;
  }

  function generateClassic() {
    let charset = '';
    if (classicSettings.lower) charset += LOWERCASE;
    if (classicSettings.upper) charset += UPPERCASE;
    if (classicSettings.digits) charset += DIGITS;
    if (classicSettings.symbols) charset += SYMBOLS;
    if (!charset) charset = LOWERCASE + DIGITS; // fallback
    let result = '';
    for (let i = 0; i < classicSettings.length; i++) {
      result += secureRandomChar(charset);
    }
    return result;
  }

  function generatePin() {
    let result = '';
    for (let i = 0; i < pinSettings.length; i++) {
      result += secureRandomChar(DIGITS);
    }
    return result;
  }

  function generate() {
    cancelAutoClear();
    switch (currentMode) {
      case 'phrase': currentPassword = generatePhrase(); break;
      case 'classic': currentPassword = generateClassic(); break;
      case 'pin': currentPassword = generatePin(); break;
    }
    typePassword(currentPassword);
    updateShield(currentPassword);
    updateStrengthMeter(currentPassword);
    addToHistory(currentPassword);
  }

  // === Typewriter effect ===
  function typePassword(text) {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }

    // Skip typewriter animation when user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      $passwordText.textContent = text;
      return;
    }

    $passwordText.textContent = '';
    $passwordText.classList.add('password-text--typing');

    let i = 0;
    const totalTime = Math.min(400, text.length * 25);
    const interval = Math.max(10, totalTime / text.length);

    typingTimer = setInterval(() => {
      i++;
      $passwordText.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(typingTimer);
        typingTimer = null;
        $passwordText.classList.remove('password-text--typing');
      }
    }, interval);
  }

  // === Entropy & Shield ===
  function calculateEntropy(password) {
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
    // For passphrases, calculate based on word count from dictionary
    if (currentMode === 'phrase') {
      var words;
      if (useCustomWords && customWords.length >= 2) {
        words = customWords;
      } else {
        words = phraseSettings.language === 'en' ? WORDS_EN : WORDS_RU;
      }
      const dictSize = words.length;
      let bits = phraseSettings.wordCount * Math.log2(dictSize);
      if (phraseSettings.addNumber) bits += Math.log2(90); // 10-99
      if (phraseSettings.addSpecial) bits += Math.log2(SPECIAL_CHARS.length);
      return Math.floor(bits);
    }
    if (charsetSize === 0) return 0;
    return Math.floor(password.length * Math.log2(charsetSize));
  }

  function getShieldLevel(entropy) {
    if (entropy < 30) return 1;
    if (entropy < 50) return 2;
    if (entropy < 70) return 3;
    if (entropy < 90) return 4;
    return 5;
  }

  function getShieldLabel(level) {
    const labels = {
      1: 'Cracked in a minute',
      2: 'A hacker needs a day',
      3: 'Needs a serious botnet',
      4: 'Fortress',
      5: 'Legendary'
    };
    return labels[level];
  }

  function getCrackTime(entropy) {
    // Assume 10 billion guesses/sec (modern GPU cluster)
    const guessesPerSec = 1e10;
    const totalGuesses = Math.pow(2, entropy);
    const seconds = totalGuesses / guessesPerSec / 2; // average = half

    if (seconds < 1) return 'Instant';
    if (seconds < 60) return Math.ceil(seconds) + ' seconds';
    if (seconds < 3600) return Math.ceil(seconds / 60) + ' minutes';
    if (seconds < 86400) return Math.ceil(seconds / 3600) + ' hours';
    if (seconds < 86400 * 365) return Math.ceil(seconds / 86400) + ' days';
    const years = seconds / (86400 * 365);
    if (years < 1000) return Math.ceil(years) + ' years';
    if (years < 1e6) return Math.ceil(years / 1000) + 'K years';
    if (years < 1e9) return Math.ceil(years / 1e6) + 'M years';
    if (years < 1.38e10) return Math.ceil(years / 1e9) + 'B years';
    return 'Longer than age of Universe';
  }

  function getShieldColor(level) {
    // Read from CSS vars so light/dark theme overrides apply
    var style = getComputedStyle(document.documentElement);
    var fromVar = style.getPropertyValue('--shield-' + level).trim();
    if (fromVar) return fromVar;
    var fallback = { 1: '#FF453A', 2: '#FF9F0A', 3: '#FFD60A', 4: '#30D158', 5: '#BF5AF2' };
    return fallback[level];
  }

  function updateShield(password) {
    const entropy = calculateEntropy(password);
    const level = getShieldLevel(entropy);
    const color = getShieldColor(level);

    document.documentElement.style.setProperty('--shield-color', color);
    $shieldSvg.setAttribute('data-level', level);

    // Show/hide check icon (levels 2-3)
    const $check = document.getElementById('shield-check');
    if ($check) {
      $check.style.opacity = (level === 2 || level === 3) ? '1' : '0';
    }

    // Pulse animation
    $shieldSvg.classList.remove('shield--pulse');
    void $shieldSvg.offsetWidth;
    $shieldSvg.classList.add('shield--pulse');

    $shieldLabel.textContent = getShieldLabel(level);
    $shieldLabel.style.color = color;
    $shieldTime.textContent = '~' + getCrackTime(entropy) + ' brute-force (' + entropy + ' bits)';
  }

  // === Strength Meter ===
  function updateStrengthMeter(password) {
    const entropy = calculateEntropy(password);
    let pct, label, color;

    if (entropy < 30) {
      pct = Math.max(5, (entropy / 30) * 20);
      label = 'Weak';
      color = '#ff4757';
    } else if (entropy < 50) {
      pct = 20 + ((entropy - 30) / 20) * 20;
      label = 'Fair';
      color = '#ffa502';
    } else if (entropy < 70) {
      pct = 40 + ((entropy - 50) / 20) * 20;
      label = 'Good';
      color = '#ffd32a';
    } else if (entropy < 90) {
      pct = 60 + ((entropy - 70) / 20) * 20;
      label = 'Strong';
      color = '#00e68a';
    } else {
      pct = Math.min(100, 80 + ((entropy - 90) / 40) * 20);
      label = 'Very Strong';
      color = '#00d4aa';
    }

    $strengthBar.style.width = pct + '%';
    $strengthBar.style.background = color;
    $strengthLabel.textContent = label;
    $strengthLabel.style.color = color;
    $strengthBits.textContent = entropy + ' bits';
  }

  // === Copy with auto-clear ===
  let clipboardClearTimer = null;
  let toastCountdownTimer = null;
  let autoClearTimer = null;

  function copyToClipboard(text, button) {
    if (!text) return;

    function onCopySuccess() {
      if (button) {
        button.classList.add('btn--copied');
        setTimeout(() => button.classList.remove('btn--copied'), 1200);
      }
      showCopyToast();
      scheduleClipboardClear();
    }

    navigator.clipboard.writeText(text).then(onCopySuccess).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
      onCopySuccess();
    });
  }

  function scheduleClipboardClear() {
    if (clipboardClearTimer) clearTimeout(clipboardClearTimer);
    clipboardClearTimer = setTimeout(() => {
      try { navigator.clipboard.writeText(''); } catch (e) { /* ignore */ }
      clipboardClearTimer = null;
    }, 30000);
  }

  function showCopyToast() {
    const $toast = document.getElementById('copy-toast');
    const $countdown = document.getElementById('toast-countdown');
    const $bar = document.getElementById('toast-bar');
    if (!$toast) return;

    // Reset
    if (toastCountdownTimer) clearInterval(toastCountdownTimer);
    if (autoClearTimer) clearTimeout(autoClearTimer);
    $toast.classList.add('show');
    $bar.classList.remove('animating');
    $bar.style.width = '100%';
    let remaining = 30;
    $countdown.textContent = remaining;

    // Force reflow then animate bar
    void $bar.offsetWidth;
    $bar.classList.add('animating');
    $bar.style.transitionDuration = '30s';
    $bar.style.width = '0%';

    // Schedule auto-clear of the password result after 30s
    autoClearTimer = setTimeout(() => {
      currentPassword = '';
      $passwordText.textContent = '';
      $strengthBar.style.width = '0%';
      $strengthLabel.textContent = '';
      $strengthBits.textContent = '';
      autoClearTimer = null;
    }, 30000);

    toastCountdownTimer = setInterval(() => {
      remaining--;
      $countdown.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(toastCountdownTimer);
        toastCountdownTimer = null;
        $toast.classList.remove('show');
        $bar.classList.remove('animating');
      }
    }, 1000);
  }

  function cancelAutoClear() {
    var $toast = document.getElementById('copy-toast');
    var $bar = document.getElementById('toast-bar');
    if (autoClearTimer) {
      clearTimeout(autoClearTimer);
      autoClearTimer = null;
    }
    if (toastCountdownTimer) {
      clearInterval(toastCountdownTimer);
      toastCountdownTimer = null;
    }
    if ($toast) {
      $toast.classList.remove('show');
    }
    if ($bar) {
      $bar.classList.remove('animating');
    }
  }

  // === History (session-only — never stored in localStorage) ===
  function addToHistory(password) {
    history.unshift({
      password: password,
      date: new Date().toISOString(),
      mode: currentMode
    });
    if (history.length > MAX_HISTORY) {
      history = history.slice(0, MAX_HISTORY);
    }
  }

  function renderHistory() {
    if (history.length === 0) {
      $historyList.innerHTML = '<div class="history-empty">No passwords yet</div>';
      return;
    }
    $historyList.innerHTML = '';
    history.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'history-item';
      el.innerHTML =
        '<div class="history-item__password history-item__password--hidden" data-index="' + index + '" role="button" tabindex="0" aria-label="Show password">' +
        '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' +
        '</div>' +
        '<div class="history-item__meta">' +
        '<span class="history-item__date">' + formatDate(item.date) + '</span>' +
        '<button class="history-item__copy" data-password="' + escapeAttr(item.password) + '" aria-label="Copy password">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>' +
        '</button>' +
        '</div>';

      const pwEl = el.querySelector('.history-item__password');
      pwEl.addEventListener('click', () => toggleHistoryPassword(pwEl, item.password));
      pwEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') toggleHistoryPassword(pwEl, item.password);
      });

      const copyBtn = el.querySelector('.history-item__copy');
      copyBtn.addEventListener('click', () => {
        copyToClipboard(item.password, null);
        copyBtn.classList.add('history-item__copy--done');
        setTimeout(() => copyBtn.classList.remove('history-item__copy--done'), 1200);
      });

      $historyList.appendChild(el);
    });
  }

  function toggleHistoryPassword(el, password) {
    const isHidden = el.classList.contains('history-item__password--hidden');
    if (isHidden) {
      el.textContent = password;
      el.classList.remove('history-item__password--hidden');
      el.setAttribute('aria-label', 'Hide password');
    } else {
      el.textContent = '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022';
      el.classList.add('history-item__password--hidden');
      el.setAttribute('aria-label', 'Show password');
    }
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatDate(isoStr) {
    const d = new Date(isoStr);
    const pad = (n) => String(n).padStart(2, '0');
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function openHistory() {
    renderHistory();
    $historyOverlay.classList.add('open');
    $historyClose.focus();
    releaseHistoryTrap = trapFocus($historyOverlay);
  }

  function closeHistory() {
    $historyOverlay.classList.remove('open');
    if (releaseHistoryTrap) { releaseHistoryTrap(); releaseHistoryTrap = null; }
    $historyToggle.focus();
  }

  function clearHistory() {
    $confirmOverlay.classList.add('open');
    $confirmNo.focus();
    releaseConfirmTrap = trapFocus($confirmOverlay);
  }

  function confirmClearHistory() {
    history = [];
    renderHistory();
    $confirmOverlay.classList.remove('open');
    if (releaseConfirmTrap) { releaseConfirmTrap(); releaseConfirmTrap = null; }
  }

  function cancelClearHistory() {
    $confirmOverlay.classList.remove('open');
    if (releaseConfirmTrap) { releaseConfirmTrap(); releaseConfirmTrap = null; }
  }

  // === Focus trap ===
  function trapFocus(container) {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handler(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    container.addEventListener('keydown', handler);
    return function release() {
      container.removeEventListener('keydown', handler);
    };
  }

  let releaseHistoryTrap = null;
  let releaseConfirmTrap = null;

  // === Tab switching ===
  function switchMode(mode) {
    if (mode === currentMode) return;
    currentMode = mode;

    $$('.tab').forEach(t => {
      const isActive = t.dataset.mode === mode;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      t.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    $settingsPhrase.classList.toggle('hidden', mode !== 'phrase');
    $settingsClassic.classList.toggle('hidden', mode !== 'classic');
    $settingsPin.classList.toggle('hidden', mode !== 'pin');

    generate();
  }

  // === Phrase settings binding ===
  function initPhraseSettings() {
    // Word count chips
    $$('[data-word-count]').forEach(chip => {
      chip.addEventListener('click', () => {
        phraseSettings.wordCount = parseInt(chip.dataset.wordCount);
        $$('[data-word-count]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        generate();
      });
    });

    // Separator chips
    $$('[data-separator]').forEach(chip => {
      chip.addEventListener('click', () => {
        phraseSettings.separator = chip.dataset.separator;
        $$('[data-separator]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        generate();
      });
    });

    // Add number toggle
    const $toggleNum = $('#toggle-number');
    $toggleNum.addEventListener('click', () => {
      phraseSettings.addNumber = !phraseSettings.addNumber;
      $toggleNum.classList.toggle('active', phraseSettings.addNumber);
      $toggleNum.setAttribute('aria-checked', phraseSettings.addNumber);
      generate();
    });

    // Add special toggle
    const $toggleSpecial = $('#toggle-special');
    $toggleSpecial.addEventListener('click', () => {
      phraseSettings.addSpecial = !phraseSettings.addSpecial;
      $toggleSpecial.classList.toggle('active', phraseSettings.addSpecial);
      $toggleSpecial.setAttribute('aria-checked', phraseSettings.addSpecial);
      generate();
    });

    // Language chips
    $$('[data-lang]').forEach(chip => {
      chip.addEventListener('click', () => {
        phraseSettings.language = chip.dataset.lang;
        $$('[data-lang]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        generate();
      });
    });
  }

  // === Classic settings ===
  function initClassicSettings() {
    $classicSlider.addEventListener('input', () => {
      classicSettings.length = parseInt($classicSlider.value);
      $classicValue.textContent = classicSettings.length;
      generate();
    });

    const toggles = {
      'toggle-upper': 'upper',
      'toggle-lower': 'lower',
      'toggle-digits': 'digits',
      'toggle-symbols': 'symbols'
    };

    Object.entries(toggles).forEach(([id, key]) => {
      const el = $('#' + id);
      el.addEventListener('click', () => {
        classicSettings[key] = !classicSettings[key];
        // Ensure at least one is on
        const anyOn = classicSettings.upper || classicSettings.lower || classicSettings.digits || classicSettings.symbols;
        if (!anyOn) {
          classicSettings[key] = true;
          // Shake feedback: user tried to disable the last toggle
          el.classList.remove('toggle--shake');
          void el.offsetWidth; // reflow
          el.classList.add('toggle--shake');
          return;
        }
        el.classList.toggle('active', classicSettings[key]);
        el.setAttribute('aria-checked', classicSettings[key]);
        generate();
      });
    });
  }

  // === PIN settings ===
  function initPinSettings() {
    $pinSlider.addEventListener('input', () => {
      pinSettings.length = parseInt($pinSlider.value);
      $pinValue.textContent = pinSettings.length;
      generate();
    });
  }

  // === Password Strength Checker ===
  function initChecker() {
    const $input = document.getElementById('checker-input');
    const $eye = document.getElementById('checker-eye');
    const $result = document.getElementById('checker-result');
    const $bar = document.getElementById('checker-bar');
    const $verdict = document.getElementById('checker-verdict');
    const $details = document.getElementById('checker-details');
    if (!$input) return;

    $eye.addEventListener('click', () => {
      const isPassword = $input.type === 'password';
      $input.type = isPassword ? 'text' : 'password';
      $eye.classList.toggle('active', isPassword);
    });

    $input.addEventListener('input', () => {
      const pw = $input.value;
      if (!pw) {
        $result.classList.add('hidden');
        return;
      }
      $result.classList.remove('hidden');
      const analysis = analyzePassword(pw);
      renderCheckerResult(analysis, $bar, $verdict, $details);
    });
  }

  function analyzePassword(pw) {
    const len = pw.length;
    let charsetSize = 0;
    const types = [];
    if (/[a-z]/.test(pw)) { charsetSize += 26; types.push('lowercase'); }
    if (/[A-Z]/.test(pw)) { charsetSize += 26; types.push('uppercase'); }
    if (/[0-9]/.test(pw)) { charsetSize += 10; types.push('digits'); }
    if (/[^a-zA-Z0-9]/.test(pw)) { charsetSize += 32; types.push('symbols'); }
    if (charsetSize === 0) charsetSize = 26;

    const entropy = Math.floor(len * Math.log2(charsetSize));

    // Simple dictionary check: common patterns
    const commonPatterns = ['password', '123456', 'qwerty', 'letmein', 'admin', 'welcome', 'monkey', 'dragon', 'master', 'abc123'];
    const lower = pw.toLowerCase();
    const isDictionary = commonPatterns.some(p => lower.includes(p));
    const isSequential = /^(.)\1+$/.test(pw) || /^(012|123|234|345|456|567|678|789|abc|bcd|cde|def)/.test(lower);

    let penalizedEntropy = entropy;
    if (isDictionary) penalizedEntropy = Math.floor(entropy * 0.3);
    if (isSequential) penalizedEntropy = Math.floor(entropy * 0.4);

    let level, label, color;
    if (penalizedEntropy < 30) { level = 1; label = 'Weak'; }
    else if (penalizedEntropy < 50) { level = 2; label = 'Fair'; }
    else if (penalizedEntropy < 70) { level = 3; label = 'Strong'; }
    else if (penalizedEntropy < 90) { level = 4; label = 'Very Strong'; }
    else { level = 5; label = 'Excellent'; }
    color = getShieldColor(level);

    const crackTime = getCrackTime(penalizedEntropy);

    return { entropy: penalizedEntropy, level, label, color, types, len, crackTime, isDictionary, isSequential };
  }

  function renderCheckerResult(a, $bar, $verdict, $details) {
    const pct = Math.min(100, (a.entropy / 120) * 100);
    $bar.style.width = pct + '%';
    $bar.style.background = a.color;
    $verdict.textContent = a.label;
    $verdict.style.color = a.color;

    let info = a.len + ' chars \u00B7 ' + a.types.join(', ') + ' \u00B7 ' + a.entropy + ' bits';
    if (a.isDictionary) info += ' \u00B7 Contains common word!';
    if (a.isSequential) info += ' \u00B7 Sequential pattern!';
    info += '\nTime to crack: ~' + a.crackTime;
    $details.textContent = info;
  }

  // === Custom Words ===
  function initCustomWords() {
    const $input = $('#custom-words-input');
    const $count = $('#custom-words-count');
    const $save = $('#custom-words-save');
    const $clear = $('#custom-words-clear');
    const $toggleUse = $('#toggle-custom-words');
    if (!$input) return;

    // Load from localStorage if available
    try {
      const saved = localStorage.getItem('pp-custom-words');
      if (saved) {
        $input.value = saved;
        parseCustomWords(saved);
        $count.textContent = customWords.length + '/20';
      }
    } catch (e) { /* ignore */ }

    $input.addEventListener('input', () => {
      parseCustomWords($input.value);
      $count.textContent = customWords.length + '/20';
    });

    $save.addEventListener('click', () => {
      parseCustomWords($input.value);
      $count.textContent = customWords.length + '/20';
      try { localStorage.setItem('pp-custom-words', $input.value); } catch (e) { /* ignore */ }
      if (useCustomWords && currentMode === 'phrase') generate();
    });

    $clear.addEventListener('click', () => {
      $input.value = '';
      customWords = [];
      $count.textContent = '0/20';
      try { localStorage.removeItem('pp-custom-words'); } catch (e) { /* ignore */ }
      if (useCustomWords && currentMode === 'phrase') generate();
    });

    $toggleUse.addEventListener('click', () => {
      useCustomWords = !useCustomWords;
      $toggleUse.classList.toggle('active', useCustomWords);
      $toggleUse.setAttribute('aria-checked', useCustomWords);
      if (currentMode === 'phrase') generate();
    });
  }

  function parseCustomWords(text) {
    customWords = text
      .split(',')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0)
      .slice(0, 20);
  }

  // === Event listeners ===
  function bindEvents() {
    // Tabs
    const tabs = Array.from($$('.tab'));
    tabs.forEach(tab => {
      tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });

    // WAI-ARIA tablist: Arrow Left/Right to move focus, Enter/Space to activate
    $tabs.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Enter' && e.key !== ' ') return;
      const current = tabs.indexOf(document.activeElement);
      if (current === -1) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const next = e.key === 'ArrowRight'
          ? (current + 1) % tabs.length
          : (current - 1 + tabs.length) % tabs.length;
        // Update roving tabindex
        tabs[current].setAttribute('tabindex', '-1');
        tabs[next].setAttribute('tabindex', '0');
        tabs[next].focus();
        switchMode(tabs[next].dataset.mode);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        switchMode(document.activeElement.dataset.mode);
      }
    });

    // Generate
    $btnGenerate.addEventListener('click', generate);

    // Copy
    $btnCopy.addEventListener('click', () => copyToClipboard(currentPassword, $btnCopy));

    // Theme
    $themeToggle.addEventListener('click', toggleTheme);

    // Keep button (cancel auto-clear)
    var $toastKeep = $('#toast-keep');
    if ($toastKeep) {
      $toastKeep.addEventListener('click', cancelAutoClear);
    }

    // History
    $historyToggle.addEventListener('click', openHistory);
    $historyClose.addEventListener('click', closeHistory);
    $('#history-backdrop').addEventListener('click', closeHistory);
    $historyClear.addEventListener('click', clearHistory);
    $confirmYes.addEventListener('click', confirmClearHistory);
    $confirmNo.addEventListener('click', cancelClearHistory);
    $('#confirm-backdrop').addEventListener('click', cancelClearHistory);

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if ($confirmOverlay.classList.contains('open')) {
          cancelClearHistory();
        } else if ($historyOverlay.classList.contains('open')) {
          closeHistory();
        }
      }
    });
  }

  // === Init ===
  function init() {
    initTheme();
    // history lives only in memory — no loadHistory() from localStorage
    initPhraseSettings();
    initClassicSettings();
    initPinSettings();
    initCustomWords();
    initChecker();
    bindEvents();
    generate(); // AC-1: auto-generate on open
  }

  // === Clipboard security: clear on tab close / hide ===
  window.addEventListener('beforeunload', function() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { navigator.clipboard.writeText(''); } catch(e) {}
    }
  });

  document.addEventListener('visibilitychange', function() {
    if (document.hidden && clipboardClearTimer) {
      try { navigator.clipboard.writeText(''); } catch(e) {}
      clearTimeout(clipboardClearTimer);
      clipboardClearTimer = null;
    }
  });

  // Wait for DOM + word lists
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
