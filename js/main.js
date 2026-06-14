/**
 * Wedding Invitation — Budi & Sari
 * Main JavaScript
 */

(function () {
  'use strict';

  // Wedding date: July 22, 2026 at 08:00 WIB (UTC+7)
  const WEDDING_DATE = new Date('2026-07-22T08:00:00+07:00');

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
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpNote = document.getElementById('rsvpNote');
  const wishesForm = document.getElementById('wishesForm');
  const wishesList = document.getElementById('wishesList');
  const copyLinkBtn = document.getElementById('copyLink');
  const shareToast = document.getElementById('shareToast');
  const shareWa = document.getElementById('shareWa');

  const YOUTUBE_VIDEO_ID = 'bLmDVZRhhRE';

  let isMusicPlaying = false;
  let youtubePlayer = null;
  let ytPlayerReady = false;
  let pendingAutoplay = false;
  let currentGalleryIndex = 0;
  let galleryImages = [];

  // ============================================
  // Cover / Envelope Opening
  // ============================================
  function openInvitation() {
    cover.classList.add('opening');

    setTimeout(() => {
      cover.classList.add('hidden');
      mainContent.hidden = false;
      musicControl.hidden = false;
      document.body.classList.add('invite-open');

      // Trigger hero reveal
      const heroReveal = document.querySelector('.hero__content.reveal');
      if (heroReveal) heroReveal.classList.add('visible');

      // Attempt autoplay music after user interaction
      tryPlayMusic();

      // Show nav after scroll
      setTimeout(() => nav.classList.add('visible'), 600);
    }, 1200);
  }

  openBtn.addEventListener('click', openInvitation);

  // ============================================
  // Background Music (YouTube IFrame Player API)
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
          if (pendingAutoplay) {
            pendingAutoplay = false;
            tryPlayMusic();
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            setMusicState(true);
          } else if (event.data === YT.PlayerState.ENDED) {
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

  function tryPlayMusic() {
    if (!ytPlayerReady) {
      pendingAutoplay = true;
      return;
    }

    try {
      youtubePlayer.playVideo();
    } catch {
      setMusicState(false);
      musicLabel.textContent = 'Putar Musik';
    }
  }

  function setMusicState(playing) {
    isMusicPlaying = playing;
    musicToggle.setAttribute('aria-pressed', String(playing));
    musicToggle.setAttribute('aria-label', playing ? 'Matikan musik' : 'Putar musik');

    if (playing) {
      musicIcon.className = 'fa-solid fa-volume-high';
      musicLabel.textContent = 'Musik Aktif';
      musicToggle.classList.add('playing');
    } else {
      musicIcon.className = 'fa-solid fa-volume-xmark';
      musicLabel.textContent = 'Putar Musik';
      musicToggle.classList.remove('playing');
    }
  }

  musicToggle.addEventListener('click', () => {
    if (!ytPlayerReady) {
      musicLabel.textContent = 'Memuat musik...';
      return;
    }

    if (isMusicPlaying) {
      youtubePlayer.pauseVideo();
      setMusicState(false);
    } else {
      try {
        youtubePlayer.playVideo();
      } catch {
        musicLabel.textContent = 'Ketuk untuk putar';
      }
    }
  });

  loadYouTubeAPI().then(initYouTubePlayer);

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
        const img = el.querySelector('img');
        if (img) {
          img.style.transform = `translateY(${offset}px) scale(1.1)`;
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
    const diff = WEDDING_DATE - now;

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

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ============================================
  // Gallery Lightbox
  // ============================================
  function initGallery() {
    const items = document.querySelectorAll('.gallery__item');
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
    lightboxImg.src = galleryImages[currentGalleryIndex];
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  function navigateGallery(direction) {
    currentGalleryIndex = (currentGalleryIndex + direction + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentGalleryIndex];
  }

  initGallery();

  // ============================================
  // RSVP Form (Frontend Only)
  // ============================================
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('rsvpName').value.trim();
    const attendance = document.getElementById('rsvpAttendance').value;

    if (!name || !attendance) {
      rsvpNote.textContent = 'Mohon lengkapi nama dan konfirmasi kehadiran.';
      rsvpNote.style.color = '#c45c5c';
      return;
    }

    const attendanceText = {
      yes: 'Hadir',
      no: 'Tidak Hadir',
      maybe: 'Belum Pasti',
    };

    rsvpNote.textContent = `Terima kasih, ${name}! Konfirmasi: ${attendanceText[attendance]}. (Demo — data tidak disimpan)`;
    rsvpNote.style.color = '';
    rsvpForm.reset();
  });

  // ============================================
  // Wishes / Guest Book (Frontend Only)
  // ============================================
  wishesForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('wishName').value.trim();
    const message = document.getElementById('wishMessage').value.trim();

    if (!name || !message) return;

    const card = document.createElement('article');
    card.className = 'wish-card glass reveal visible';
    card.innerHTML = `
      <div class="wish-card__avatar" aria-hidden="true">${name.charAt(0).toUpperCase()}</div>
      <div class="wish-card__body">
        <h4>${escapeHtml(name)}</h4>
        <p>${escapeHtml(message)}</p>
        <time datetime="${new Date().toISOString().split('T')[0]}">${formatDate(new Date())}</time>
      </div>
    `;

    wishesList.prepend(card);
    wishesForm.reset();
  });

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(date) {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // ============================================
  // Share / Copy Link
  // ============================================
  const pageUrl = window.location.href;
  const shareText = encodeURIComponent('The Wedding of Budi & Sari — Anda diundang! 🎊');
  shareWa.href = `https://wa.me/?text=${shareText}%20${encodeURIComponent(pageUrl)}`;

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
          title: 'The Wedding of Budi & Sari',
          text: 'Anda diundang ke pernikahan Budi & Sari!',
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
