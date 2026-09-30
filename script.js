/*!
 * script.js - Main JavaScript for the birthday gift website
 * -------------------------------------------------------
 * Handles:
 *   • Smooth scrolling for internal links
 *   • Back‑to‑top button visibility
 *   • AOS (Animate On Scroll) initialization
 *   • Bootstrap tooltip & popover activation
 *   • Birthday countdown timer
 *   • Random birthday quote fetch (fallback safe)
 *   • Canvas confetti animation
 *   • Lightbox modal for gallery images
 *   • Dark/Light theme toggle (saved in localStorage)
 *   • Contact form validation & AJAX submit (mocked)
 *
 * All code is wrapped in an IIFE to avoid polluting the global scope.
 * The script assumes the following HTML structure (IDs / classes):
 *   - <a class="nav-link" href="#section-id">…</a>
 *   - <button id="backToTop">↑</button>
 *   - <div id="birthdayCountdown"></div>
 *   - <canvas id="confettiCanvas"></canvas>
 *   - <div id="quoteContainer"></div>
 *   - <button id="themeToggle"></button>
 *   - <form id="contactForm">…</form>
 *   - <div class="gallery"> <img src="…" data-full="…" class="gallery-item"> … </div>
 *   - <div id="lightboxModal" class="modal fade" tabindex="-1">…</div>
 */

(() => {
    'use strict';

    /** @type {number} */
    const BIRTHDAY_TIMESTAMP = new Date('2026-12-15T00:00:00').getTime(); // Adjust to actual birthday

    /** @type {HTMLElement|null} */
    const backToTopBtn = document.getElementById('backToTop');

    /** @type {HTMLElement|null} */
    const countdownEl = document.getElementById('birthdayCountdown');

    /** @type {HTMLCanvasElement|null} */
    const confettiCanvas = document.getElementById('confettiCanvas');

    /** @type {HTMLElement|null} */
    const quoteContainer = document.getElementById('quoteContainer');

    /** @type {HTMLElement|null} */
    const themeToggleBtn = document.getElementById('themeToggle');

    /** @type {HTMLFormElement|null} */
    const contactForm = document.getElementById('contactForm');

    /** @type {HTMLElement|null} */
    const lightboxModal = document.getElementById('lightboxModal');

    /** @type {HTMLElement|null} */
    const lightboxImg = lightboxModal?.querySelector('.modal-body img');

    /** @type {NodeListOf<Element>} */
    const galleryItems = document.querySelectorAll('.gallery-item');

    /** Initialize all modules after DOM is ready */
    document.addEventListener('DOMContentLoaded', () => {
        initSmoothScroll();
        initBackToTop();
        initAOS();
        initBootstrapComponents();
        initCountdown();
        initConfetti();
        fetchBirthdayQuote();
        initThemeToggle();
        initFormValidation();
        initGalleryLightbox();
    });

    /**
     * Enables smooth scrolling for all internal anchor links.
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const targetId = (anchor.getAttribute('href') || '').substring(1);
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    /**
     * Shows or hides the back‑to‑top button based on scroll position.
     */
    function initBackToTop() {
        if (!backToTopBtn) return;
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        };
        window.addEventListener('scroll', toggleVisibility);
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        toggleVisibility(); // initial check
    }

    /**
     * Initializes AOS (Animate On Scroll) library with sensible defaults.
     */
    function initAOS() {
        if (window.AOS) {
            window.AOS.init({
                once: true,
                duration: 800,
                easing: 'ease-out-cubic',
            });
        }
    }

    /**
     * Activates Bootstrap tooltips and popovers.
     */
    function initBootstrapComponents() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));

        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.forEach(el => new bootstrap.Popover(el));
    }

    /**
     * Starts a live countdown to the birthday.
     */
    function initCountdown() {
        if (!countdownEl) return;
        const update = () => {
            const now = Date.now();
            const diff = BIRTHDAY_TIMESTAMP - now;
            if (diff <= 0) {
                countdownEl.textContent = '🎉 Happy Birthday! 🎉';
                clearInterval(timer);
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        };
        const timer = setInterval(update, 1000);
        update();
    }

    /**
     * Fetches a random birthday‑related quote from an external API.
     * Falls back to a static list if the request fails.
     */
    async function fetchBirthdayQuote() {
        if (!quoteContainer) return;
        const fallbackQuotes = [
            "Count your age by friends, not years.",
            "Another year older, another year wiser!",
            "May your day be as bright as your smile.",
            "Celebrate the gift of life."
        ];
        const apiUrl = 'https://api.quotable.io/random?tags=celebration';
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            quoteContainer.textContent = `"${data.content}" — ${data.author}`;
        } catch (err) {
            console.warn('Quote fetch failed, using fallback.', err);
            const random = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
            quoteContainer.textContent = `"${random}"`;
        }
    }

    /**
     * Creates a lightweight confetti animation using Canvas.
     */
    function initConfetti() {
        if (!confettiCanvas) return;
        const ctx = confettiCanvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const colors = ['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0'];
        const particles = [];

        class Particle {
            /** @param {number} x @param {number} y */
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.r = Math.random() * 6 + 4;
                this.vx = (Math.random() - 0.5) * 6;
                this.vy = Math.random() * -8 - 4;
                this.opacity = 1;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.gravity = 0.3;
                this.friction = 0.99;
                this.life = Math.random() * 30 + 60;
            }
            update() {
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.life--;
                this.opacity = Math.max(this.life / 90, 0);
            }
            draw() {
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        const render = () => {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            particles.forEach((p, i) => {
                p.update();
                p.draw();
                if (p.life <= 0) particles.splice(i, 1);
            });
            requestAnimationFrame(render);
        };
        render();

        // Trigger confetti on birthday or on button click
        const launchConfetti = (count = 150) => {
            for (let i = 0; i < count; i++) {
                const x = Math.random() * confettiCanvas.width;
                const y = confettiCanvas.height + Math.random() * 100;
                particles.push(new Particle(x, y));
            }
        };

        // Auto‑launch when countdown reaches zero
        const observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                if (m.type === 'childList' && m.target.textContent.includes('Happy Birthday')) {
                    launchConfetti();
                }
            }
        });
        if (countdownEl) observer.observe(countdownEl, { childList: true });

        // Optional manual trigger via a button with id="confettiBtn"
        const confettiBtn = document.getElementById('confettiBtn');
        if (confettiBtn) {
            confettiBtn.addEventListener('click', () => launchConfetti());
        }
    }

    /**
     * Toggles between dark and light theme, persisting choice in localStorage.
     */
    function initThemeToggle() {
        if (!themeToggleBtn) return;
        const THEME_KEY = 'site-theme';
        const applyTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            themeToggleBtn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
        };
        const saved = localStorage.getItem(THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = saved || (prefersDark ? 'dark' : 'light');
        applyTheme(initialTheme);

        themeToggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(current);
            localStorage.setItem(THEME_KEY, current);
        });
    }

    /**
     * Validates the contact form fields and simulates an AJAX submit.
     */
    function initFormValidation() {
        if (!contactForm) return;
        const emailInput = contactForm.querySelector('input[type="email"]');
        const nameInput = contactForm.querySelector('input[name="name"]');
        const messageInput = contactForm.querySelector('textarea[name="message"]');
        const submitBtn = contactForm.querySelector('button[type="submit"]');

        const showFeedback = (el, message, type = 'error') => {
            const feedback = el.parentElement.querySelector('.invalid-feedback, .valid-feedback');
            if (feedback) feedback.textContent = message;
            el.classList.toggle('is-invalid', type === 'error');
            el.classList.toggle('is-valid', type === 'success');
        };

        const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
        const validateNotEmpty = (value) => value.trim().length > 0;

        const validateField = (el, validator, errMsg) => {
            const valid = validator(el.value);
            showFeedback(el, errMsg, valid ? 'success' : 'error');
            return valid;
        };

        const validateAll = () => {
            const vName = validateField(nameInput, validateNotEmpty, 'Name is required.');
            const vEmail = validateField(emailInput, validateEmail, 'Enter a valid email.');
            const vMsg = validateField(messageInput, validateNotEmpty, 'Message cannot be empty.');
            return vName && vEmail && vMsg;
        };

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validateAll()) return;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                // Simulated network delay
                await new Promise(res => setTimeout(res, 1500));
                // In a real scenario, replace with fetch('/api/contact', {method:'POST', body: new FormData(contactForm)})
                bootstrap.Modal.getInstance('#thankYouModal')?.hide();
                const thankYouModal = new bootstrap.Modal(document.getElementById('thankYouModal'));
                thankYouModal.show();
                contactForm.reset();
                contactForm.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
            } catch (err) {
                console.error('Form submission failed', err);
                alert('Oops! Something went wrong. Please try again later.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        });
    }

    /**
     * Sets up a simple lightbox modal for gallery images.
     */
    function initGalleryLightbox() {
        if (!galleryItems.length || !lightboxModal || !lightboxImg) return;
        galleryItems.forEach(img => {
            img.addEventListener('click', () => {
                const fullSrc = img.getAttribute('data-full') || img.src;
                lightboxImg.src = fullSrc;
                const modal = new bootstrap.Modal(lightboxModal);
                modal.show();
            });
        });
    }

})();