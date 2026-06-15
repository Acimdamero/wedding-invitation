/**
 * Scroll-driven chapter animations — GSAP ScrollTrigger + parallax layers.
 */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isSmallScreen = window.matchMedia('(max-width: 480px)').matches;

  function initChapterObserver() {
    const chapters = document.querySelectorAll('.section[data-chapter]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.remove('chapter-exit');
            el.classList.add('chapter-active');
            if (!el.classList.contains('chapter-enter')) {
              el.classList.add('chapter-enter');
            }
          } else {
            el.classList.remove('chapter-active');
            if (entry.boundingClientRect.top < 0) {
              el.classList.add('chapter-exit');
            }
          }
        });
      },
      { threshold: 0.25, rootMargin: '-10% 0px -10% 0px' }
    );
    chapters.forEach((ch) => observer.observe(ch));
  }

  function initParallaxLayers() {
    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length || reducedMotion) return;

    let ticking = false;
    const update = () => {
      layers.forEach((layer) => {
        const speed = parseFloat(layer.dataset.parallax) || 0.15;
        const rect = layer.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        layer.style.transform = `translateY(${center * speed * -1}px)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function initGSAP() {
    if (reducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Hero staggered reveal
    const heroTitle = document.querySelector('.hero__title');
    if (heroTitle) {
      gsap.from(heroTitle, {
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.3,
      });
      gsap.from('.hero__title .amp', {
        scale: 0,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(2)',
        delay: 0.7,
      });

      gsap.from('.hero__pre, .hero__subtitle, .hero__date, .hero__ornament', {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.9,
      });
    }

    // Section headers — gold shimmer + divider expand
    gsap.utils.toArray('.section-header').forEach((header) => {
      const divider = header.querySelector('.section-divider');
      const title = header.querySelector('.section-title');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.from(header.querySelector('.section-label'), { opacity: 0, y: 20, duration: 0.6 })
        .from(title, { opacity: 0, y: 30, duration: 0.8 }, '-=0.3')
        .from(header.querySelector('.section-desc'), { opacity: 0, y: 20, duration: 0.6 }, '-=0.4');

      if (divider) {
        tl.fromTo(divider, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power2.inOut' }, '-=0.5');
      }
    });

    // Countdown numbers flip in
    gsap.utils.toArray('.countdown__item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none reverse' },
        opacity: 0,
        y: 50,
        rotateX: -40,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'back.out(1.4)',
      });
    });

    // Couple cards slide from sides (opacity handled in CSS — avoid invisible text on glass)
    const coupleCards = document.querySelectorAll('#couple .couple__card');
    const markCoupleVisible = () => {
      coupleCards.forEach((card) => card.classList.add('visible'));
    };
    if (coupleCards[0]) {
      gsap.from(coupleCards[0], {
        scrollTrigger: {
          trigger: '#couple',
          start: 'top 70%',
          onEnter: markCoupleVisible,
          onEnterBack: markCoupleVisible,
        },
        x: -80,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
      });
    }
    if (coupleCards[1]) {
      gsap.from(coupleCards[1], {
        scrollTrigger: {
          trigger: '#couple',
          start: 'top 70%',
          onEnter: markCoupleVisible,
          onEnterBack: markCoupleVisible,
        },
        x: 80,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
      });
    }

    // Love story — pin timeline on desktop
    const storySection = document.getElementById('story');
    const timelineItems = document.querySelectorAll('.timeline__item');
    const timelineLine = document.querySelector('.timeline');

    if (storySection && timelineItems.length && !isMobile) {
      timelineItems.forEach((item, i) => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          x: -40,
          duration: 0.7,
          delay: i * 0.05,
          ease: 'power2.out',
        });
      });

      if (timelineLine) {
        ScrollTrigger.create({
          trigger: storySection,
          start: 'top top',
          end: 'bottom bottom',
          pin: '.story__pin-wrap',
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
      }
    } else {
      timelineItems.forEach((item, i) => {
        gsap.from(item, {
          scrollTrigger: { trigger: item, start: 'top 90%' },
          opacity: 0,
          y: 40,
          duration: 0.7,
          delay: i * 0.1,
        });
      });
    }

    // Event cards scale up
    gsap.utils.toArray('.event-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%' },
        scale: 0.88,
        opacity: 0,
        duration: 0.9,
        delay: i * 0.15,
        ease: 'power2.out',
      });
    });

    // Gallery stagger + Ken Burns
    gsap.utils.toArray('.gallery__item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 92%' },
        opacity: 0,
        scale: 0.92,
        duration: 0.7,
        delay: (i % 3) * 0.08,
        ease: 'power2.out',
      });

      const img = item.querySelector('img');
      if (img) {
        gsap.to(img, {
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
          scale: 1.08,
          ease: 'none',
        });
      }
    });

    // Location pin drop
    const mapWrap = document.querySelector('.location__map');
    if (mapWrap) {
      gsap.from(mapWrap, {
        scrollTrigger: { trigger: mapWrap, start: 'top 80%' },
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: 'bounce.out',
      });
    }

    // RSVP form cascade
    const rsvpFields = document.querySelectorAll('#rsvpForm .form-group, #rsvpForm .btn');
    gsap.from(rsvpFields, {
      scrollTrigger: { trigger: '#rsvpForm', start: 'top 80%' },
      opacity: 0,
      y: 25,
      stagger: 0.08,
      duration: 0.6,
      ease: 'power2.out',
    });

    // Wishes cards
    gsap.utils.toArray('.wish-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 90%' },
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: i * 0.05,
      });
    });
  }

  function initMelatiPetals() {
    if (reducedMotion) return;
    const container = document.getElementById('floatingPetals');
    if (!container) return;

    const count = isSmallScreen ? 3 : isMobile ? 5 : 12;
    for (let i = 0; i < count; i += 1) {
      const petal = document.createElement('span');
      petal.className = 'floating-petal';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.animationDuration = `${12 + Math.random() * 10}s`;
      petal.style.animationDelay = `${Math.random() * 8}s`;
      petal.style.opacity = String(0.15 + Math.random() * 0.25);
      container.appendChild(petal);
    }
  }

  function boot() {
    initChapterObserver();
    initParallaxLayers();
    initMelatiPetals();

    if (typeof gsap !== 'undefined') {
      if (document.readyState === 'complete') {
        initGSAP();
      } else {
        window.addEventListener('load', initGSAP);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
