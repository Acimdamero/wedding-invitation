/**
 * Wedding Invitation — Erzal & Dhea
 * Main JavaScript
 */

(function () {
  'use strict';

  // Primary countdown: Akad Nikah — July 13, 2026 (Makkah)
  const AKAD_DATE = new Date('2026-07-13T08:00:00+03:00');

  // DOM Elements
  const cover = document.getElementById('cover');
  const openBtn = document.getElementById('openInvite');
  const mainContent = document.getElementById('mainContent');
  const musicControl = document.getElementById('musicControl');
  const musicToggle = document.getElementById('musicToggle');
  const musicIcon = document.getElementById('musicIcon');
  const musicLabel = document.getElementById('musicLabel');
  const nav = document.getElementById('nav');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const storyLightbox = document.getElementById('storyLightbox');
  const storyLightboxImg = document.getElementById('storyLightboxImg');
  const storyPhotoBtn = document.querySelector('.story__photo-btn');
  const copyLinkBtn = document.getElementById('copyLink');
  const shareToast = document.getElementById('shareToast');
  const shareWa = document.getElementById('shareWa');

  const YOUTUBE_VIDEO_ID = '-a-vbOxM-6s';
  const START_SECONDS = 24;
  const BEAT_BPM = 75;

  const PHOTOS_ENABLED = !(window.WEDDING_CONFIG && window.WEDDING_CONFIG.PHOTOS_ENABLED === false);
  if (!PHOTOS_ENABLED) {
    document.body.classList.add('photos-disabled');
    document.querySelectorAll('.nav__link--photos').forEach((link) => {
      link.hidden = true;
    });
  }

  let isMusicPlaying = false;
  let youtubePlayer = null;
  let ytPlayerReady = false;
  let pendingAutoplay = false;
  let inviteOpened = false;
  let currentGalleryIndex = 0;
  let galleryImages = [];
  let beatEngine = null;
  let autoScrollEngine = null;
  let opening3D = null;
  let scene3D = null;

  // ============================================
  // 3D Scenes (Three.js)
  // ============================================
  function init3D() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 374px)').matches;
    const hasWebGL = (() => {
      try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    })();

    if (reducedMotion || !hasWebGL) {
      document.body.classList.add('no-webgl');
    }

    const openingCanvas = document.getElementById('opening-canvas');
    if (openingCanvas && typeof Opening3D !== 'undefined' && hasWebGL && !reducedMotion && !isSmallScreen) {
      opening3D = new Opening3D(openingCanvas);
    } else if (openingCanvas) {
      openingCanvas.classList.add('canvas-3d--fallback');
    }

    // Defer background 3D on mobile until invite opens (saves GPU during envelope)
    if (!isMobile && !isSmallScreen) {
      initBackground3D(hasWebGL, reducedMotion);
    }
  }

  function initBackground3D(hasWebGL, reducedMotion) {
    const bgCanvas = document.getElementById('bg-canvas-3d');
    if (bgCanvas && typeof Scene3D !== 'undefined' && hasWebGL && !reducedMotion) {
      scene3D = new Scene3D(bgCanvas);
    } else if (bgCanvas) {
      bgCanvas.classList.add('canvas-3d--fallback');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3D);
  } else {
    init3D();
  }

  function initAutoScroll() {
    if (typeof AutoScrollEngine === 'undefined') return;
    autoScrollEngine = new AutoScrollEngine({ beatEngine });
    if (beatEngine) autoScrollEngine.connectBeatEngine(beatEngine);
  }

  if (typeof AutoScrollEngine !== 'undefined') {
    initAutoScroll();
  }

  // ============================================
  // Cover / Envelope Opening
  // ============================================
  function openInvitation() {
    // Music must start synchronously in this click/tap gesture (iOS Safari).
    inviteOpened = true;
    musicControl.hidden = false;
    tryPlayMusic();

    if (opening3D) opening3D.triggerOpen();
    cover.classList.add('opening');

    setTimeout(() => {
      cover.classList.add('hidden');
      mainContent.hidden = false;
      document.body.classList.add('invite-open');

      // Trigger hero reveal
      const heroReveal = document.querySelector('.hero__content.reveal');
      if (heroReveal) heroReveal.classList.add('visible');

      // Lazy-start background 3D on mobile after envelope opens
      if (!scene3D && window.matchMedia('(max-width: 768px)').matches) {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isSmallScreen = window.matchMedia('(max-width: 374px)').matches;
        const hasWebGL = !document.body.classList.contains('no-webgl');
        if (!isSmallScreen && hasWebGL) {
          initBackground3D(hasWebGL, reducedMotion);
        }
      }

      // Show nav after scroll
      setTimeout(() => nav.classList.add('visible'), 600);

      // Start cinematic autoscroll journey (default ON on all devices)
      if (autoScrollEngine) {
        autoScrollEngine.start({ defaultOn: true });
        autoScrollEngine.runProgressLoop();
      }

      if (typeof ScrollTrigger !== 'undefined') {
        setTimeout(() => ScrollTrigger.refresh(), 400);
      }
    }, 1200);
  }

  openBtn.addEventListener('click', openInvitation);

  // ============================================
  // Background Music (YouTube IFrame Player API)
  //
  // iOS Safari: audio only plays after a user gesture. Autoplay is attempted
  // when the guest taps "Buka Undangan"; if it fails, the music toggle retries.
  // YouTube IFrame API does not expose raw audio for Web Audio beat analysis.
  // ============================================
  function loadYouTubeAPI() {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      const existingCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof existingCallback === 'function') existingCallback();
        resolve();
      };

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(tag, firstScript);
    });
  }

  function initYouTubePlayer() {
    youtubePlayer = new YT.Player('youtubePlayer', {
      height: '1',
      width: '1',
      videoId: YOUTUBE_VIDEO_ID,
      playerVars: {
        autoplay: 0,
        start: START_SECONDS,
        loop: 1,
        playlist: YOUTUBE_VIDEO_ID,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          ytPlayerReady = true;
          event.target.setVolume(35);
          if (pendingAutoplay || inviteOpened) {
            pendingAutoplay = false;
            tryPlayMusic();
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            ensureMusicStartPosition(event.target);
            setMusicState(true);
          } else if (event.data === YT.PlayerState.PAUSED) {
            if (isMusicPlaying) setMusicState(false);
          } else if (event.data === YT.PlayerState.ENDED) {
            seekToMusicStart(event.target);
            event.target.playVideo();
          }
        },
        onError: () => {
          setMusicState(false);
          musicLabel.textContent = 'Musik tidak tersedia';
        },
      },
    });
  }

  function seekToMusicStart(player = youtubePlayer) {
    if (!player || typeof player.seekTo !== 'function') return;
    try {
      player.seekTo(START_SECONDS, true);
    } catch {
      /* ignore seek errors */
    }
  }

  function ensureMusicStartPosition(player = youtubePlayer) {
    if (!player || typeof player.getCurrentTime !== 'function') return;
    try {
      if (player.getCurrentTime() < START_SECONDS) {
        seekToMusicStart(player);
      }
    } catch {
      /* ignore */
    }
  }

  function tryPlayMusic() {
    setMusicState(true, { optimistic: !ytPlayerReady });

    if (!ytPlayerReady) {
      pendingAutoplay = true;
      return;
    }

    try {
      seekToMusicStart();
      youtubePlayer.playVideo();
    } catch {
      setMusicState(false);
    }
  }

  function setMusicState(playing, options = {}) {
    const { optimistic = false } = options;
    isMusicPlaying = playing;
    musicToggle.setAttribute('aria-pressed', String(playing));
    musicToggle.setAttribute('aria-label', playing ? 'Matikan musik' : 'Putar musik');

    if (playing) {
      musicIcon.className = 'fa-solid fa-music';
      const isTouch = window.matchMedia('(hover: none)').matches;
      musicLabel.textContent = optimistic
        ? 'Memuat musik...'
        : (isTouch ? 'Ketuk untuk mematikan musik' : 'Musik');
      musicToggle.title = 'Ketuk untuk mematikan musik';
      musicLabel.classList.add('music-control__label--visible');
      musicToggle.classList.add('playing');
      if (beatEngine && !optimistic) beatEngine.start();
    } else {
      musicIcon.className = 'fa-solid fa-volume-xmark';
      musicLabel.textContent = 'Putar Musik';
      musicToggle.title = 'Putar musik';
      musicLabel.classList.remove('music-control__label--visible');
      musicToggle.classList.remove('playing');
      if (beatEngine) beatEngine.stop();
    }
  }

  musicToggle.addEventListener('click', () => {
    if (!ytPlayerReady) {
      pendingAutoplay = true;
      setMusicState(true, { optimistic: true });
      return;
    }

    if (isMusicPlaying) {
      youtubePlayer.pauseVideo();
      setMusicState(false);
    } else {
      try {
        const currentTime = youtubePlayer.getCurrentTime();
        if (currentTime < START_SECONDS) {
          seekToMusicStart();
        }
        youtubePlayer.playVideo();
      } catch {
        setMusicState(false);
      }
    }
  });

  loadYouTubeAPI().then(() => {
    initYouTubePlayer();
    if (typeof BeatEngine !== 'undefined') {
      beatEngine = new BeatEngine({ bpm: BEAT_BPM });
      if (autoScrollEngine) {
        autoScrollEngine.connectBeatEngine(beatEngine);
      } else {
        initAutoScroll();
      }
    }
  });

  // ============================================
  // Scroll Reveal Animations
  // ============================================
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    if (!el.closest('.hero')) {
      revealObserver.observe(el);
    }
  });

  // ============================================
  // Navigation Active State
  // ============================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-56px 0px -50% 0px' }
  );

  sections.forEach((section) => navObserver.observe(section));

  // Hide/show nav on scroll direction
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 100) {
      nav.classList.add('visible');
      if (currentScroll > lastScroll && currentScroll > 300) {
        nav.style.transform = 'translateY(-100%)';
      } else {
        nav.style.transform = 'translateY(0)';
      }
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // ============================================
  // Parallax Effect
  // ============================================
  const parallaxElements = document.querySelectorAll('.parallax');

  function updateParallax() {
    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 0.3;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      if (rect.top < windowH && rect.bottom > 0) {
        const offset = (rect.top - windowH / 2) * speed;
        const img = el.querySelector('img:not(.hero__arch)');
        if (img) {
          img.style.transform = `translateY(${offset}px) scale(1.1)`;
        }
        const arch = el.querySelector('.hero__arch');
        if (arch) {
          arch.style.transform = `translateY(${offset * 0.5}px)`;
        }
      }
    });
  }

  window.addEventListener('scroll', updateParallax, { passive: true });

  // ============================================
  // Countdown Timer
  // ============================================
  function updateCountdown() {
    const now = new Date();
    const diff = AKAD_DATE - now;

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const values = [
      [daysEl, days],
      [hoursEl, hours],
      [minutesEl, minutes],
      [secondsEl, seconds],
    ];

    values.forEach(([el, val]) => {
      const next = String(val).padStart(2, '0');
      if (el.textContent !== next) {
        el.classList.add('is-flipping');
        el.textContent = next;
        el.addEventListener('animationend', () => el.classList.remove('is-flipping'), { once: true });
      }
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ============================================
  // Gallery Lightbox
  // ============================================
  function initGallery() {
    if (!PHOTOS_ENABLED || !lightbox || !lightboxImg) return;

    const items = document.querySelectorAll('.gallery__item');
    if (!items.length) return;

    galleryImages = Array.from(items).map((item) => item.querySelector('img').src);

    items.forEach((item) => {
      item.addEventListener('click', () => {
        currentGalleryIndex = parseInt(item.dataset.index, 10);
        openLightbox();
      });
    });

    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', () => navigateGallery(-1));
    lightbox.querySelector('.lightbox__nav--next').addEventListener('click', () => navigateGallery(1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateGallery(-1);
      if (e.key === 'ArrowRight') navigateGallery(1);
    });
  }

  function openLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = galleryImages[currentGalleryIndex];
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (autoScrollEngine) autoScrollEngine.setEnabled(false);
    if (beatEngine) beatEngine.setAutoScrollPaused(true);
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (autoScrollEngine && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      autoScrollEngine.setEnabled(true);
    }
    if (beatEngine) beatEngine.setAutoScrollPaused(false);
  }

  function navigateGallery(direction) {
    currentGalleryIndex = (currentGalleryIndex + direction + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentGalleryIndex];
  }

  initGallery();
  initStoryPhotoLightbox();

  // ============================================
  // Story Photo Lightbox (single image)
  // ============================================
  function initStoryPhotoLightbox() {
    if (!PHOTOS_ENABLED || !storyLightbox || !storyLightboxImg || !storyPhotoBtn) return;

    const storyImg = storyPhotoBtn.querySelector('img');
    if (!storyImg) return;

    storyPhotoBtn.addEventListener('click', () => {
      storyLightboxImg.src = storyImg.src;
      storyLightboxImg.alt = storyImg.alt;
      storyLightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (autoScrollEngine) autoScrollEngine.setEnabled(false);
      if (beatEngine) beatEngine.setAutoScrollPaused(true);
    });

    storyLightbox.querySelector('.lightbox__close').addEventListener('click', closeStoryLightbox);
    storyLightbox.addEventListener('click', (e) => {
      if (e.target === storyLightbox) closeStoryLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (storyLightbox.hidden) return;
      if (e.key === 'Escape') closeStoryLightbox();
    });
  }

  function closeStoryLightbox() {
    if (!storyLightbox) return;
    storyLightbox.hidden = true;
    document.body.style.overflow = '';
    if (autoScrollEngine && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      autoScrollEngine.setEnabled(true);
    }
    if (beatEngine) beatEngine.setAutoScrollPaused(false);
  }

  // ============================================
  // Share / Copy Link
  // ============================================
  const pageUrl = (window.WEDDING_CONFIG && window.WEDDING_CONFIG.canonicalUrl) || window.location.href;
  const shareMessage = 'Wedding Invitation Erzal & Dhea';
  shareWa.href = `https://wa.me/?text=${encodeURIComponent(`${shareMessage}\n${pageUrl}`)}`;

  copyLinkBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      shareToast.textContent = 'Link berhasil disalin! / Link copied!';
    } catch {
      shareToast.textContent = 'Gagal menyalin. Salin manual: ' + pageUrl;
    }

    setTimeout(() => {
      shareToast.textContent = '';
    }, 3000);
  });

  // Native share API fallback
  if (navigator.share) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn btn--outline';
    shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Bagikan / Share';
    shareBtn.addEventListener('click', async () => {
      try {
        await navigator.share({
          title: shareMessage,
          text: shareMessage,
          url: pageUrl,
        });
      } catch {
        /* user cancelled */
      }
    });
    document.querySelector('.share__buttons').appendChild(shareBtn);
  }

  // Set OG URL dynamically
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.content = pageUrl;

})();
