/**
 * ACELIDA DE TORTAS — script.js
 * Funcionalidades:
 *   1. Header com efeito de scroll (scrolled)
 *   2. Menu hamburger para mobile
 *   3. Fechar menu ao clicar em um link
 *   4. Animações de reveal via IntersectionObserver
 *   5. Slider de depoimentos (mobile-friendly)
 *   6. Atualizar ano no rodapé automaticamente
 *   7. Highlight de link ativo na navegação
 *   8. Smooth scroll polyfill simples
 */

'use strict';

/* ============================
   1. ANO NO RODAPÉ
============================ */
(function setCurrentYear() {
  const el = document.getElementById('anoAtual');
  if (el) {
    el.textContent = new Date().getFullYear();
  }
})();


/* ============================
   2. HEADER COM EFEITO DE SCROLL
============================ */
(function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Verifica estado inicial (caso a página já esteja scrollada ao carregar)
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ============================
   3. MENU HAMBURGER MOBILE
============================ */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav');
  if (!hamburger || !nav) return;

  // Alterna o menu
  hamburger.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');

    // Trava o scroll do body quando o menu está aberto
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Fecha o menu ao clicar num link
  const navLinks = nav.querySelectorAll('.nav__link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Fecha o menu ao pressionar Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
    }
  });

  function closeMenu() {
    nav.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menu');
    document.body.style.overflow = '';
  }
})();


/* ============================
   4. REVEAL AO SCROLLAR
   (IntersectionObserver)
============================ */
(function initReveal() {
  // Verifica suporte
  if (!('IntersectionObserver' in window)) {
    // Fallback: mostra todos imediatamente
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Para de observar após animação
        }
      });
    },
    {
      threshold: 0.12,       // 12% do elemento visível para triggar
      rootMargin: '0px 0px -40px 0px'
    }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });
})();


/* ============================
   5. SLIDER DE DEPOIMENTOS
============================ */
(function initDepoimentosSlider() {
  const slider    = document.getElementById('depoimentosSlider');
  const dotsWrap  = document.getElementById('sliderDots');
  const btnPrev   = document.getElementById('sliderPrev');
  const btnNext   = document.getElementById('sliderNext');

  if (!slider || !dotsWrap || !btnPrev || !btnNext) return;

  const cards = slider.querySelectorAll('.depoimento-card');
  if (cards.length === 0) return;

  let current      = 0;
  let autoPlayTimer = null;
  const ITEMS_VISIBLE = getItemsVisible();

  // — Cria os dots —
  function createDots() {
    dotsWrap.innerHTML = '';
    const totalDots = Math.ceil(cards.length / ITEMS_VISIBLE);
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Ir para depoimento ' + (i + 1));
      dot.addEventListener('click', function () {
        goTo(i * ITEMS_VISIBLE);
      });
      dotsWrap.appendChild(dot);
    }
  }

  // — Descobre quantos itens são visíveis por tela —
  function getItemsVisible() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  // — Atualiza quais cards são visíveis —
  function updateDisplay() {
    const visible = getItemsVisible();
    cards.forEach(function (card, idx) {
      if (idx >= current && idx < current + visible) {
        card.style.display = '';
        card.removeAttribute('aria-hidden');
      } else {
        card.style.display = 'none';
        card.setAttribute('aria-hidden', 'true');
      }
    });

    // Atualiza dots
    const dots = dotsWrap.querySelectorAll('.slider-dot');
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === Math.floor(current / visible));
    });
  }

  // — Navega para um índice —
  function goTo(idx) {
    const visible = getItemsVisible();
    const max = cards.length - visible;
    current = Math.max(0, Math.min(idx, max));
    updateDisplay();
    resetAutoPlay();
  }

  function goNext() {
    const visible = getItemsVisible();
    const max = cards.length - visible;
    goTo(current >= max ? 0 : current + visible);
  }

  function goPrev() {
    const visible = getItemsVisible();
    const max = cards.length - visible;
    goTo(current <= 0 ? max : current - visible);
  }

  // — Auto-play —
  function startAutoPlay() {
    autoPlayTimer = setInterval(goNext, 5000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  // — Botões —
  btnPrev.addEventListener('click', goPrev);
  btnNext.addEventListener('click', goNext);

  // — Swipe em touch devices —
  let touchStartX = 0;
  slider.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', function (e) {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
  }, { passive: true });

  // — Atualiza em resize —
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      createDots();
      current = 0;
      updateDisplay();
    }, 250);
  });

  // — Inicia —
  createDots();
  updateDisplay();
  startAutoPlay();

  // Pausa ao hover
  slider.addEventListener('mouseenter', function () { clearInterval(autoPlayTimer); });
  slider.addEventListener('mouseleave', startAutoPlay);
})();


/* ============================
   6. LINK ATIVO NA NAVEGAÇÃO
   (Highlight via scroll spy)
============================ */
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link');
  if (sections.length === 0 || navLinks.length === 0) return;

  function updateActive() {
    const scrollY = window.scrollY + 120; // offset do header fixo

    let activeId = '';
    sections.forEach(function (section) {
      if (section.offsetTop <= scrollY) {
        activeId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === '#' + activeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive(); // inicial
})();


/* ============================
   7. GALERIA — LIGHTBOX SIMPLES
============================ */
(function initGaleria() {
  const items = document.querySelectorAll('.galeria__item');
  if (items.length === 0) return;

  // Cria o overlay do lightbox
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Imagem ampliada');
  overlay.innerHTML = `
    <div class="lightbox__backdrop"></div>
    <div class="lightbox__content">
      <button class="lightbox__close" aria-label="Fechar imagem">&times;</button>
      <img class="lightbox__img" src="" alt="" />
      <p class="lightbox__caption"></p>
    </div>
  `;

  // Estilos inline do lightbox (evita dependência de CSS externo)
  const style = document.createElement('style');
  style.textContent = `
    #lightbox {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    #lightbox.open {
      opacity: 1;
      pointer-events: all;
    }
    .lightbox__backdrop {
      position: absolute;
      inset: 0;
      background: rgba(30, 10, 5, 0.92);
      cursor: pointer;
    }
    .lightbox__content {
      position: relative;
      z-index: 1;
      max-width: min(90vw, 900px);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .lightbox__img {
      max-width: 100%;
      max-height: 78vh;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.5);
    }
    .lightbox__caption {
      color: rgba(255,255,255,0.75);
      font-size: 0.9rem;
      font-family: 'Nunito', sans-serif;
      text-align: center;
    }
    .lightbox__close {
      position: absolute;
      top: -2.5rem;
      right: -0.5rem;
      background: none;
      border: none;
      color: #fff;
      font-size: 2rem;
      cursor: pointer;
      line-height: 1;
      opacity: 0.75;
      transition: opacity 0.2s;
    }
    .lightbox__close:hover { opacity: 1; }
    .galeria__item { cursor: zoom-in; }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  const lbImg     = overlay.querySelector('.lightbox__img');
  const lbCaption = overlay.querySelector('.lightbox__caption');
  const lbClose   = overlay.querySelector('.lightbox__close');
  const lbBack    = overlay.querySelector('.lightbox__backdrop');

  function openLightbox(img) {
    lbImg.src     = img.src;
    lbImg.alt     = img.alt;
    lbCaption.textContent = img.closest('.galeria__item').querySelector('.galeria__overlay span')?.textContent || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      const img = item.querySelector('.galeria__img');
      if (img) openLightbox(img);
    });
    // Acessibilidade: permite abrir com teclado
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const img = item.querySelector('.galeria__img');
        if (img) openLightbox(img);
      }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbBack.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeLightbox();
    }
  });
})();


/* ============================
   8. SMOOTH SCROLL POLYFILL
   Para navegadores que não
   suportam scroll-behavior: smooth
============================ */
(function initSmoothScroll() {
  // Detecta suporte nativo
  if ('scrollBehavior' in document.documentElement.style) return;

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const headerHeight = document.getElementById('header')?.offsetHeight || 70;
      const targetY = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
})();


/* ============================
   9. NAV LINK — OFFSET CORRETO
   Compensa o header fixo no
   scroll nativo (CSS: scroll-margin)
============================ */
(function addScrollMargin() {
  const header = document.getElementById('header');
  if (!header) return;

  function applyMargin() {
    const h = header.offsetHeight + 16;
    document.querySelectorAll('section[id]').forEach(function (sec) {
      sec.style.scrollMarginTop = h + 'px';
    });
  }

  applyMargin();
  window.addEventListener('resize', applyMargin);
})();


/* ============================
   10. CONTADOR DE NÚMEROS
   Anima os números nas stats do hero
============================ */
(function initCounters() {
  const stats = document.querySelectorAll('.stat__number');
  if (stats.length === 0) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const el       = entry.target;
      const text     = el.textContent.trim();
      const suffix   = text.replace(/[\d,]+/, ''); // ex: "+", "★", "h"
      const numMatch = text.match(/\d+/);
      if (!numMatch) return;

      const target   = parseInt(numMatch[0], 10);
      const duration = 1500; // ms
      const start    = performance.now();

      function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Easing: easeOutQuart
        const eased    = 1 - Math.pow(1 - progress, 4);
        const value    = Math.round(eased * target);
        el.textContent = (text.startsWith('+') ? '+' : '') + value + (suffix.replace('+', '') || '');
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = text; // Restaura valor original exato
        }
      }

      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });

  stats.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ============================
   11. COOKIE / TOAST DE BOAS-VINDAS
   Aparece uma vez por sessão
============================ */
(function initWelcomeToast() {
  // Verifica se já foi mostrado nesta sessão
  if (sessionStorage.getItem('toastShown')) return;

  // Delay de 3s para não ser intrusivo
  setTimeout(function () {
    const toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <div style="
        position:fixed;
        bottom:6rem;
        left:1.5rem;
        background:#fff;
        border:1px solid #e8c4b8;
        border-left:4px solid #c4786a;
        border-radius:12px;
        padding:1rem 1.25rem;
        box-shadow:0 8px 32px rgba(92,45,30,0.15);
        max-width:280px;
        font-family:'Nunito',sans-serif;
        font-size:0.88rem;
        color:#5c2d1e;
        display:flex;
        gap:0.75rem;
        align-items:flex-start;
        z-index:899;
        animation: slideInToast 0.5s ease forwards;
      ">
        <span style="font-size:1.5rem;flex-shrink:0;">🎂</span>
        <div>
          <strong style="display:block;margin-bottom:0.2rem;">Bem-vindo(a)!</strong>
          <span>Faça sua encomenda com pelo menos 48h de antecedência. 💕</span>
        </div>
        <button onclick="this.closest('[role=status]').remove()" aria-label="Fechar aviso" style="
          background:none;border:none;cursor:pointer;
          color:#9a7060;font-size:1.1rem;padding:0;
          align-self:flex-start;line-height:1;flex-shrink:0;
        ">&times;</button>
      </div>
    `;

    // Keyframe via style tag
    if (!document.getElementById('toastStyle')) {
      const s = document.createElement('style');
      s.id = 'toastStyle';
      s.textContent = `
        @keyframes slideInToast {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `;
      document.head.appendChild(s);
    }

    document.body.appendChild(toast);
    sessionStorage.setItem('toastShown', '1');

    // Auto remove após 6s
    setTimeout(function () {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(function () { toast.remove(); }, 400);
      }
    }, 6000);
  }, 3000);
})();
