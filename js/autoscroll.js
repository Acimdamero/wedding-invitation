/**
 * AutoScrollEngine — cinematic section-by-section autonomous scroll.
 * Pauses on user interaction; syncs cadence with BeatEngine downbeats.
 * Click = scroll to next section; long-press = toggle autoscroll on/off.
 */
(function (global) {
  'use strict';

  const DEFAULT_SECTION_MS = 4000;
  const PAUSE_SECTION_MS = 5500;
  const USER_PAUSE_MS = 9000;
  const LONG_PRESS_MS = 550;
  const EASE_IN_OUT_CUBIC = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const SECTION_DWELL = {
    hero: 5000,
    countdown: 4500,
    couple: 4000,
    story: 5500,
    'story-photo': 5000,
    'story-timeline': 7000,
    gallery: 4000,
    rsvp: 5000,
    wishes: 3500,
    location: 4000,
    share: 3000,
  };

  const MAIN_SECTION_IDS = ['hero', 'countdown', 'couple', 'story', 'gallery', 'rsvp', 'wishes', 'location', 'share'];

  class AutoScrollEngine {
    constructor(options = {}) {
      this.beatEngine = options.beatEngine ?? null;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.isMobile = window.matchMedia('(max-width: 768px)').matches;

      this.enabled = !this.reducedMotion;
      this.paused = false;
      this.userPausedUntil = 0;
      this.rafId = null;
      this.sections = [];
      this.currentIndex = 0;
      this.scrollAnim = null;
      this.isScrolling = false;
      this.loopAtEnd = true;
      this.dwellStart = 0;
      this.dwellDuration = DEFAULT_SECTION_MS;
      this.cooldownRaf = null;
      this._labelTimer = null;
      this._lastLabelSecond = -1;

      this._onUserIntent = this._onUserIntent.bind(this);
      this._tick = this._tick.bind(this);
      this._onBeat = this._onBeat.bind(this);
      this._updateCooldownRing = this._updateCooldownRing.bind(this);
      this._updateButtonStatus = this._updateButtonStatus.bind(this);

      this._buildUI();
      this._bindEvents();
      this._collectSections();
    }

    _buildUI() {
      this.progressBar = document.createElement('div');
      this.progressBar.className = 'autoscroll-progress';
      this.progressBar.setAttribute('role', 'progressbar');
      this.progressBar.setAttribute('aria-hidden', 'true');
      this.progressBar.innerHTML = '<span class="autoscroll-progress__fill"></span>';
      document.body.appendChild(this.progressBar);
      this.progressFill = this.progressBar.querySelector('.autoscroll-progress__fill');

      this.hint = document.createElement('div');
      this.hint.className = 'autoscroll-hint';
      this.hint.setAttribute('aria-live', 'polite');
      this.hint.innerHTML = '<span>Kembali ke atas…</span>';
      document.body.appendChild(this.hint);

      this.controlWrap = document.createElement('div');
      this.controlWrap.className = 'autoscroll-control';

      this.toggleBtn = document.createElement('button');
      this.toggleBtn.type = 'button';
      this.toggleBtn.id = 'autoscrollToggle';
      this.toggleBtn.className = 'autoscroll-toggle';
      this.toggleBtn.setAttribute('aria-pressed', 'true');
      this.toggleBtn.setAttribute('aria-label', 'Gulir ke bagian berikutnya');
      this.toggleBtn.innerHTML = `
        <svg class="autoscroll-toggle__ring" viewBox="0 0 48 48" aria-hidden="true">
          <circle class="autoscroll-toggle__ring-bg" cx="24" cy="24" r="20"></circle>
          <circle class="autoscroll-toggle__ring-progress" cx="24" cy="24" r="20"></circle>
        </svg>
        <span class="autoscroll-toggle__icon" aria-hidden="true">
          <i class="fa-solid fa-chevron-down"></i>
        </span>
      `;
      this.controlWrap.appendChild(this.toggleBtn);

      this.statusLabel = document.createElement('span');
      this.statusLabel.className = 'autoscroll-toggle__status';
      this.statusLabel.setAttribute('aria-live', 'polite');
      this.statusLabel.textContent = 'Gulir ke bawah';
      this.controlWrap.appendChild(this.statusLabel);

      document.body.appendChild(this.controlWrap);

      this.ringProgress = this.toggleBtn.querySelector('.autoscroll-toggle__ring-progress');
      const circumference = 2 * Math.PI * 20;
      this.ringProgress.style.strokeDasharray = `${circumference}`;
      this.ringProgress.style.strokeDashoffset = `${circumference}`;
      this._ringCircumference = circumference;

      this._bindToggleGestures();
      this._updateButtonStatus();
    }

    _bindToggleGestures() {
      let pressTimer = null;
      let longPressFired = false;

      const clearPress = () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };

      this.toggleBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        longPressFired = false;
        pressTimer = setTimeout(() => {
          longPressFired = true;
          this.setEnabled(!this.enabled);
        }, LONG_PRESS_MS);
      });

      this.toggleBtn.addEventListener('pointerup', (e) => {
        e.stopPropagation();
        clearPress();
        if (!longPressFired) {
          this.advanceToNext();
        }
      });

      this.toggleBtn.addEventListener('pointerleave', clearPress);
      this.toggleBtn.addEventListener('pointercancel', clearPress);
    }

    _bindEvents() {
      const events = ['wheel', 'touchstart', 'touchmove', 'keydown', 'mousedown'];
      events.forEach((ev) => {
        window.addEventListener(ev, this._onUserIntent, { passive: true });
      });

      document.querySelectorAll('.nav__link, .hero__scroll').forEach((link) => {
        link.addEventListener('click', this._onUserIntent);
      });

      window.addEventListener('resize', () => {
        this.isMobile = window.matchMedia('(max-width: 768px)').matches;
        this._collectSections();
      });
    }

    _onUserIntent(e) {
      if (!document.body.classList.contains('invite-open')) return;
      if (e.type === 'keydown' && !['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ', 'Home', 'End'].includes(e.key)) {
        return;
      }
      if (e.target === this.toggleBtn || this.toggleBtn.contains(e.target)) return;

      this.userPausedUntil = Date.now() + USER_PAUSE_MS;
      this.paused = true;
      this._cancelScrollAnim();
      this._stopCooldownRing();
      this._updateButtonStatus();

      if (this.beatEngine) this.beatEngine.setAutoScrollPaused(true);

      clearTimeout(this._resumeTimer);
      this._resumeTimer = setTimeout(() => {
        if (this.enabled && !this.reducedMotion) {
          this.paused = false;
          if (this.beatEngine) this.beatEngine.setAutoScrollPaused(false);
          this._scheduleNextSection();
          this._updateButtonStatus();
        }
      }, USER_PAUSE_MS);
    }

    _makeStop(element, stopId) {
      return { element, stopId };
    }

    _collectSections() {
      this.sections = [];

      MAIN_SECTION_IDS.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;

        if (id === 'story') {
          this.sections.push(this._makeStop(section, 'story'));
          const photo = section.querySelector('[data-scroll-target="story-photo"]');
          const timeline = section.querySelector('[data-scroll-target="story-timeline"]');
          if (photo) this.sections.push(this._makeStop(photo, 'story-photo'));
          if (timeline) this.sections.push(this._makeStop(timeline, 'story-timeline'));
          return;
        }

        this.sections.push(this._makeStop(section, id));
      });
    }

    connectBeatEngine(beatEngine) {
      this.beatEngine = beatEngine;
      if (beatEngine) {
        beatEngine.onDownbeat = this._onBeat;
        beatEngine.setAutoScrollDelegate(null);
      }
    }

    _onBeat() {
      if (!this.enabled || this.paused || this.reducedMotion || this.isScrolling) return;
    }

    start(options = {}) {
      if (this.reducedMotion) {
        this.setEnabled(false);
        return;
      }

      this._collectSections();
      const defaultOn = options.defaultOn ?? true;
      this.setEnabled(defaultOn, true);

      if (this.enabled) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        this.currentIndex = 0;
        const startDelay = options.startDelay ?? 500;
        setTimeout(() => this._scheduleNextSection(), startDelay);
        this.toggleBtn.classList.add('autoscroll-toggle--active');
        this._updateButtonStatus();
      }
    }

    getCooldownRemainingSeconds() {
      if (!this.enabled || this.paused || this.reducedMotion || this.isScrolling) return null;
      if (!this.dwellStart || !this.dwellDuration) return null;
      const elapsed = performance.now() - this.dwellStart;
      return Math.max(0, Math.ceil((this.dwellDuration - elapsed) / 1000));
    }

    _updateButtonStatus() {
      if (!this.statusLabel || !this.toggleBtn) return;

      const remaining = this.getCooldownRemainingSeconds();
      let desktopText = 'Gulir ke bawah';
      let mobileText = 'Gulir ke bawah';
      let ariaLabel = 'Gulir ke bagian berikutnya, ketuk untuk lanjut sekarang';
      let state = 'ready';

      if (this.isScrolling) {
        desktopText = 'Menggulir…';
        mobileText = '…';
        ariaLabel = 'Sedang menggulir ke bagian berikutnya';
        state = 'scrolling';
      } else if (this.paused) {
        desktopText = 'Dijeda · Ketuk untuk lanjut';
        mobileText = 'Dijeda';
        ariaLabel = 'Gulir dijeda, ketuk untuk lanjut ke bagian berikutnya';
        state = 'paused';
      } else if (!this.enabled) {
        desktopText = 'Gulir ke bawah';
        mobileText = 'Gulir';
        ariaLabel = 'Gulir ke bagian berikutnya. Tahan tombol untuk menyalakan gulir otomatis';
        state = 'disabled';
      } else if (remaining !== null && remaining > 0) {
        desktopText = `Lanjut dalam ${remaining}s…`;
        mobileText = `${remaining}s…`;
        ariaLabel = `Gulir ke bagian berikutnya, lanjut otomatis dalam ${remaining} detik`;
        state = 'cooldown';
      }

      const text = this.isMobile ? mobileText : desktopText;
      if (this._lastLabelSecond !== remaining || this.statusLabel.textContent !== text) {
        this.statusLabel.textContent = text;
        this._lastLabelSecond = remaining;
      }

      this.toggleBtn.setAttribute('aria-label', ariaLabel);
      this.toggleBtn.classList.toggle('autoscroll-toggle--ready', state === 'ready');
      this.toggleBtn.classList.toggle('autoscroll-toggle--cooldown', state === 'cooldown');
      this.controlWrap.classList.toggle('autoscroll-control--paused', state === 'paused');
      this.controlWrap.classList.toggle('autoscroll-control--cooldown', state === 'cooldown');
    }

    _startLabelTimer() {
      this._stopLabelTimer();
      this._labelTimer = setInterval(() => {
        this._updateButtonStatus();
      }, 1000);
    }

    _stopLabelTimer() {
      if (this._labelTimer) {
        clearInterval(this._labelTimer);
        this._labelTimer = null;
      }
    }

    setEnabled(on, silent = false) {
      this.enabled = on && !this.reducedMotion;
      this.toggleBtn.setAttribute('aria-pressed', String(this.enabled));
      document.body.classList.toggle('autoscroll-active', this.enabled);
      document.documentElement.classList.toggle('autoscroll-active', this.enabled);

      this.toggleBtn.classList.toggle('autoscroll-toggle--active', this.enabled);
      this.toggleBtn.classList.toggle('autoscroll-toggle--disabled', !this.enabled);

      if (!this.enabled) {
        this._stopCooldownRing();
        this._stopLabelTimer();
        this._setRingProgress(0);
      } else {
        this._startLabelTimer();
      }

      if (!silent) {
        if (this.enabled) {
          this.paused = false;
          this._scheduleNextSection();
        } else {
          this._cancelScrollAnim();
        }
      }

      this._updateButtonStatus();
      if (this.beatEngine) this.beatEngine.setAutoScrollPaused(!this.enabled || this.paused);
    }

    advanceToNext() {
      if (!document.body.classList.contains('invite-open')) return;

      if (this.paused) {
        this.paused = false;
        this.userPausedUntil = 0;
        if (this.beatEngine) this.beatEngine.setAutoScrollPaused(false);
      }

      this._updateButtonStatus();

      if (!this.enabled) {
        this.setEnabled(true);
      }

      clearTimeout(this._sectionTimer);
      this._cancelScrollAnim();

      const fromIndex = this._indexFromScroll();
      const fromStopId = this.sections[fromIndex]?.stopId ?? null;
      this.currentIndex = Math.min(fromIndex + 1, this.sections.length - 1);

      const stop = this.sections[this.currentIndex];
      if (!stop) return;

      this._scrollToStop(stop, () => {
        this._updateProgress();
        this._startDwellTimer(stop);
      }, { fromStopId });
    }

    _getNavHeight() {
      return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 56;
    }

    _indexFromScroll() {
      const navHeight = this._getNavHeight();
      const scrollY = window.scrollY + navHeight + 40;
      let idx = 0;
      this.sections.forEach((stop, i) => {
        const top = this._getStopScrollY(stop) - navHeight;
        if (top <= scrollY) idx = i;
      });
      return idx;
    }

    _getStopScrollY(stop) {
      const navHeight = this._getNavHeight();
      const el = stop.element;
      const rect = el.getBoundingClientRect();

      if (stop.stopId === 'story-timeline') {
        const viewport = window.innerHeight - navHeight;
        const visibleHeight = Math.min(rect.height, viewport * 0.75);
        const offset = Math.max(24, (viewport - visibleHeight) * 0.35);
        return rect.top + window.scrollY - navHeight - offset;
      }

      if (stop.stopId === 'story-photo') {
        return rect.top + window.scrollY - navHeight - 16;
      }

      return rect.top + window.scrollY - navHeight;
    }

    _getDwellForStop(stopId) {
      const dwell = SECTION_DWELL[stopId] ?? DEFAULT_SECTION_MS;
      const isPauseSection = ['countdown', 'story', 'story-photo', 'story-timeline', 'rsvp'].includes(stopId);
      if (stopId === 'story-timeline') return dwell;
      return isPauseSection ? Math.max(dwell, PAUSE_SECTION_MS) : dwell;
    }

    _getScrollDuration(distance, fromStopId) {
      if (fromStopId === 'story-timeline') {
        return this.isMobile ? 3000 : 3500;
      }

      const minDuration = this.isMobile ? 2000 : 2500;
      const maxDuration = this.isMobile ? 3000 : 4000;
      const vhTravel = Math.abs(distance) / Math.max(window.innerHeight, 1);
      const scaled = minDuration + vhTravel * (this.isMobile ? 400 : 500);
      return Math.min(maxDuration, Math.max(minDuration, scaled));
    }

    _scheduleNextSection() {
      if (!this.enabled || this.paused || this.reducedMotion) return;

      clearTimeout(this._sectionTimer);
      const stop = this.sections[this.currentIndex];
      if (!stop) return;

      const fromStopId = this.currentIndex > 0 ? this.sections[this.currentIndex - 1].stopId : null;

      this._scrollToStop(stop, () => {
        this._updateProgress();
        this._startDwellTimer(stop);
      }, { fromStopId });
    }

    _startDwellTimer(stop) {
      const wait = this._getDwellForStop(stop.stopId);
      this.dwellDuration = wait;
      this.dwellStart = performance.now();
      this._lastLabelSecond = -1;
      this._startCooldownRing();
      this._startLabelTimer();
      this._updateButtonStatus();

      clearTimeout(this._sectionTimer);
      this._sectionTimer = setTimeout(() => {
        this.currentIndex += 1;
        if (this.currentIndex >= this.sections.length) {
          if (this.loopAtEnd) {
            this._showBackToTop();
            this.currentIndex = 0;
          } else {
            this.setEnabled(false);
            return;
          }
        }
        this._scheduleNextSection();
      }, wait);
    }

    _startCooldownRing() {
      this._stopCooldownRing();
      if (!this.enabled || this.paused) return;
      this.cooldownRaf = requestAnimationFrame(this._updateCooldownRing);
    }

    _stopCooldownRing() {
      if (this.cooldownRaf) {
        cancelAnimationFrame(this.cooldownRaf);
        this.cooldownRaf = null;
      }
    }

    _updateCooldownRing() {
      if (!this.enabled || this.paused) {
        this._setRingProgress(0);
        this._updateButtonStatus();
        return;
      }

      const elapsed = performance.now() - this.dwellStart;
      const progress = Math.min(1, elapsed / this.dwellDuration);
      this._setRingProgress(progress);
      this._updateButtonStatus();

      if (progress < 1) {
        this.cooldownRaf = requestAnimationFrame(this._updateCooldownRing);
      } else {
        this.toggleBtn.classList.add('autoscroll-toggle--ready');
      }
    }

    _setRingProgress(progress) {
      if (!this.ringProgress) return;
      const offset = this._ringCircumference * (1 - progress);
      this.ringProgress.style.strokeDashoffset = `${offset}`;
    }

    _showBackToTop() {
      this.hint.querySelector('span').textContent = 'Kembali ke atas…';
      this.hint.classList.add('autoscroll-hint--visible');
    }

    _setTransitioning(active) {
      document.body.classList.toggle('autoscroll-transitioning', active);
      window.dispatchEvent(new CustomEvent(active ? 'autoscroll:transition-start' : 'autoscroll:transition-end'));
    }

    _scrollToStop(stop, onComplete, options = {}) {
      if (this.isScrolling) return;
      this._cancelScrollAnim();

      const targetY = this._getStopScrollY(stop);
      const startY = window.scrollY;
      const distance = targetY - startY;
      const fromStopId = options.fromStopId ?? null;

      if (Math.abs(distance) < 8) {
        if (onComplete) onComplete();
        return;
      }

      this.isScrolling = true;
      this._setTransitioning(true);
      this._updateButtonStatus();
      if (this.beatEngine) this.beatEngine.setAutoScrollPaused(true);

      const duration = this._getScrollDuration(distance, fromStopId);
      const startTime = performance.now();
      let lastAppliedY = startY;

      const finish = () => {
        this.scrollAnim = null;
        this.isScrolling = false;
        this._setTransitioning(false);
        if (this.beatEngine && this.enabled && !this.paused) {
          this.beatEngine.setAutoScrollPaused(false);
        }
        window.scrollTo({ top: targetY, behavior: 'instant' });
        this._updateButtonStatus();
        if (onComplete) onComplete();
      };

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = EASE_IN_OUT_CUBIC(progress);
        const nextY = Math.round(startY + distance * eased);

        if (nextY !== lastAppliedY) {
          window.scrollTo({ top: nextY, behavior: 'instant' });
          lastAppliedY = nextY;
        }

        if (progress < 1) {
          this.scrollAnim = requestAnimationFrame(step);
        } else {
          finish();
        }
      };

      this.scrollAnim = requestAnimationFrame(step);
    }

    _cancelScrollAnim() {
      if (this.scrollAnim) {
        cancelAnimationFrame(this.scrollAnim);
        this.scrollAnim = null;
      }
      if (this.isScrolling) {
        this.isScrolling = false;
        this._setTransitioning(false);
        if (this.beatEngine && this.enabled && !this.paused) {
          this.beatEngine.setAutoScrollPaused(false);
        }
      }
      clearTimeout(this._sectionTimer);
      this._stopCooldownRing();
    }

    _updateProgress() {
      if (!this.sections.length) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      this.progressFill.style.width = `${pct}%`;
    }

    _tick() {
      this._updateProgress();
      if (this.enabled) this.rafId = requestAnimationFrame(this._tick);
    }

    runProgressLoop() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(this._tick);
    }
  }

  global.AutoScrollEngine = AutoScrollEngine;
})(window);
