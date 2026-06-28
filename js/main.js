/* ============================================
   BYG Media — main.js
   Vanilla JS · No dependencies
   ============================================ */

'use strict';

/* ============================================
   1. NAVBAR: Scroll effect & Mobile menu
   ============================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!navbar) return;

  // Scroll effect
  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on load

  // Mobile menu toggle
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');

      if (isOpen) {
        mobileMenu.classList.remove('open');
        menuBtn.classList.remove('open');
        // Wait for transition then hide
        setTimeout(() => {
          if (!mobileMenu.classList.contains('open')) {
            mobileMenu.classList.add('hidden');
          }
        }, 300);
      } else {
        mobileMenu.classList.remove('hidden');
        // Force reflow
        void mobileMenu.offsetHeight;
        mobileMenu.classList.add('open');
        menuBtn.classList.add('open');
      }
    });

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuBtn.classList.remove('open');
        setTimeout(() => {
          mobileMenu.classList.add('hidden');
        }, 300);
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        menuBtn.classList.remove('open');
        setTimeout(() => {
          mobileMenu.classList.add('hidden');
        }, 300);
      }
    });
  }
})();


/* ============================================
   2. SCROLL REVEAL: Animate cards on scroll
   ============================================ */
(function initScrollReveal() {
  const cards = document.querySelectorAll('.reveal-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  cards.forEach(card => observer.observe(card));
})();


/* ============================================
   3. PORTFOLIO FILTER
   ============================================ */
(function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  const noResults = document.getElementById('no-results');

  if (!filterBtns.length || !portfolioCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards
      let visibleCount = 0;

      portfolioCards.forEach(card => {
        const category = card.dataset.category;
        const shouldShow = filter === 'todos' || category === filter;

        if (shouldShow) {
          card.classList.remove('hiding', 'hidden-card');
          visibleCount++;
        } else {
          card.classList.add('hiding');
          setTimeout(() => {
            card.classList.add('hidden-card');
            card.classList.remove('hiding');
          }, 350);
        }
      });

      // Show/hide no results message
      if (noResults) {
        setTimeout(() => {
          noResults.classList.toggle('hidden', visibleCount > 0);
        }, 400);
      }
    });
  });
})();


/* ============================================
   4. CONTACT FORM: Validation & Submission
   ============================================ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const successMsg = document.getElementById('form-success');
  const errorMsg = document.getElementById('form-error');

  // Check for success redirect from FormSubmit
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('enviado') === 'true' && successMsg) {
    successMsg.classList.remove('hidden');
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Real-time validation helpers
  const showError = (field, msgEl) => {
    field.classList.add('input-error');
    if (msgEl) msgEl.classList.remove('hidden');
  };

  const clearError = (field, msgEl) => {
    field.classList.remove('input-error');
    if (msgEl) msgEl.classList.add('hidden');
  };

  // Validate individual field
  const validateField = (field) => {
    const parent = field.closest('div');
    const msgEl = parent ? parent.querySelector('.error-msg') : null;

    if (field.hasAttribute('required') && !field.value.trim()) {
      showError(field, msgEl);
      return false;
    }

    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        showError(field, msgEl);
        return false;
      }
    }

    clearError(field, msgEl);
    return true;
  };

  // Live validation on blur
  form.querySelectorAll('input[required], textarea[required], select[required]').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      const parent = field.closest('div');
      const msgEl = parent ? parent.querySelector('.error-msg') : null;
      if (field.value.trim()) clearError(field, msgEl);
    });
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide previous messages
    if (successMsg) successMsg.classList.add('hidden');
    if (errorMsg) errorMsg.classList.add('hidden');

    // Validate all required fields
    const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) {
      // Scroll to first error
      const firstError = form.querySelector('.input-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Enviando...';
    if (btnSpinner) btnSpinner.classList.remove('hidden');

    try {
      const formData = new FormData(form);

      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        // Success
        form.reset();
        if (successMsg) {
          successMsg.classList.remove('hidden');
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      // Error
      if (errorMsg) {
        errorMsg.classList.remove('hidden');
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      // Reset button
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Enviar mi consulta →';
      if (btnSpinner) btnSpinner.classList.add('hidden');
    }
  });
})();


/* ============================================
   5. SMOOTH SCROLL for anchor links
   ============================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();


/* ============================================
   6. ACTIVE NAV LINK highlight on scroll
   ============================================ */
(function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href*="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.remove('text-white');
            link.classList.add('text-zinc-400');
            if (link.getAttribute('href').includes(entry.target.id)) {
              link.classList.add('text-white');
              link.classList.remove('text-zinc-400');
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(section => observer.observe(section));
})();


/* ============================================
   7. PORTFOLIO CARD: Stagger reveal
      (re-trigger reveal for filtered cards)
   ============================================ */
(function initPortfolioReveal() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.portfolio-card');
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.08}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const innerCard = entry.target.querySelector('.group');
          if (innerCard) {
            innerCard.style.opacity = '1';
            innerCard.style.transform = 'none';
          }
        }
      });
    },
    { threshold: 0.1 }
  );

  cards.forEach(card => observer.observe(card));
})();


/* ============================================
   8. TYPING EFFECT in Hero (index only)
   ============================================ */
(function initTypingEffect() {
  const badge = document.querySelector('.animate-fade-in .text-zinc-400');
  if (!badge) return;

  const originalText = badge.textContent;
  const terms = ['Anti-Agencia · Chile', 'Resultados, no promesas.', 'Audio & Video Pro.', 'Anti-Agencia · Chile'];
  let termIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingTimeout;

  // Only run on index page (if specific hero element exists)
  const heroTitle = document.querySelector('h1');
  if (!heroTitle || !heroTitle.textContent.includes('Soluciones')) return;

  const type = () => {
    const current = terms[termIndex];

    if (isDeleting) {
      badge.textContent = current.substring(0, charIndex - 1);
      charIndex--;
    } else {
      badge.textContent = current.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === current.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      termIndex = (termIndex + 1) % terms.length;
      delay = 300;
    }

    typingTimeout = setTimeout(type, delay);
  };

  // Start after badge animation
  setTimeout(type, 1500);
})();


/* ============================================
   9. CURSOR GLOW (subtle, desktop only)
   ============================================ */
(function initCursorGlow() {
  if (window.innerWidth < 1024) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease;
    top: 0;
    left: 0;
  `;
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  const animate = () => {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';
    requestAnimationFrame(animate);
  };

  animate();
})();
