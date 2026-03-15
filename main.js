/**
 * PackRight Storefront – main.js
 * GSAP-powered animations, interactions, cart logic, search UX
 */

'use strict';

/* ============================================================
   1. GSAP SCROLL ANIMATIONS
   (runs after DOM + GSAP CDN scripts are loaded)
   ============================================================ */
window.addEventListener('load', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Default eases
    const easeOut = 'power3.out';
    const easeElastic = 'elastic.out(0.8, 0.5)';

    // --- Hero entry animations ---
    const heroLeft = document.querySelector('[data-gsap="hero-left"]');
    const heroRight = document.querySelector('[data-gsap="hero-right"]');
    if (heroLeft) {
        const children = heroLeft.children;
        gsap.set(children, { opacity: 0, y: 30 });
        gsap.to(children, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: easeOut,
            delay: 0.2,
        });
    }
    if (heroRight) {
        gsap.from(heroRight, {
            opacity: 0,
            x: 50,
            scale: 0.95,
            duration: 1,
            ease: easeOut,
            delay: 0.4,
        });
    }

    // --- Trust bar items ---
    ScrollTrigger.batch('[data-gsap="trust"]', {
        start: 'top 90%',
        onEnter: (batch) =>
            gsap.from(batch, {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.6,
                ease: easeOut,
            }),
        once: true,
    });

    // --- Section titles ---
    ScrollTrigger.batch('[data-gsap="section-title"], [data-gsap="section-subtitle"]', {
        start: 'top 88%',
        onEnter: (batch) =>
            gsap.from(batch, {
                opacity: 0,
                y: 24,
                stagger: 0.08,
                duration: 0.65,
                ease: easeOut,
            }),
        once: true,
    });

    // --- Category cards ---
    ScrollTrigger.batch('[data-gsap="card"]', {
        start: 'top 88%',
        onEnter: (batch) =>
            gsap.from(batch, {
                opacity: 0,
                y: 40,
                scale: 0.96,
                stagger: 0.07,
                duration: 0.7,
                ease: easeOut,
            }),
        once: true,
    });

    // --- Product cards ---
    ScrollTrigger.batch('[data-gsap="product-card"]', {
        start: 'top 88%',
        onEnter: (batch) =>
            gsap.from(batch, {
                opacity: 0,
                y: 50,
                stagger: 0.1,
                duration: 0.75,
                ease: easeOut,
            }),
        once: true,
    });

    // --- CTA Banner ---
    const ctaBanner = document.querySelector('[data-gsap="cta-banner"]');
    if (ctaBanner) {
        ScrollTrigger.create({
            trigger: ctaBanner,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.from(ctaBanner.children, {
                    opacity: 0,
                    y: 30,
                    stagger: 0.12,
                    duration: 0.8,
                    ease: easeOut,
                });
            },
        });
    }

    // --- Review cards ---
    ScrollTrigger.batch('[data-gsap="review-card"]', {
        start: 'top 88%',
        onEnter: (batch) =>
            gsap.from(batch, {
                opacity: 0,
                y: 40,
                stagger: 0.1,
                duration: 0.7,
                ease: easeOut,
            }),
        once: true,
    });
});

/* ============================================================
   2. STICKY HEADER
   ============================================================ */
(function () {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    let lastScroll = 0;
    const SCROLL_THRESHOLD = 50;

    const onScroll = () => {
        const currentScroll = window.scrollY;
        header.classList.toggle('scrolled', currentScroll > SCROLL_THRESHOLD);
        lastScroll = currentScroll;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initial call
})();

/* ============================================================
   3. BACK TO TOP
   ============================================================ */
(function () {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener(
        'scroll',
        () => {
            btn.hidden = window.scrollY < 400;
            btn.classList.toggle('visible', window.scrollY >= 400);
        },
        { passive: true }
    );

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

/* ============================================================
   4. SEARCH BAR
   ============================================================ */
(function () {
    const input = document.getElementById('searchInput');
    const suggestions = document.getElementById('searchSuggestions');
    const btn = document.getElementById('searchBtn');
    if (!input || !suggestions || !btn) return;

    const SUGGESTIONS = [
        { icon: '📦', text: 'Corrugated shipping boxes' },
        { icon: '📬', text: 'White poly courier bags' },
        { icon: '🛡️', text: 'Bubble wrap rolls' },
        { icon: '📏', text: 'BOPP packing tape' },
        { icon: '🖨️', text: 'Custom printed boxes' },
        { icon: '📄', text: 'Kraft paper rolls' },
        { icon: '📦', text: '3-ply corrugated boxes' },
        { icon: '🛍️', text: 'E-commerce mailer bags' },
    ];

    let timer;

    const renderSuggestions = (query) => {
        const q = query.toLowerCase().trim();
        if (q.length < 2) {
            hideSuggestions();
            return;
        }
        const matched = SUGGESTIONS.filter((s) => s.text.toLowerCase().includes(q));
        if (!matched.length) {
            hideSuggestions();
            return;
        }
        suggestions.innerHTML = matched
            .map(
                (s) => `
            <div class="suggestion-item" role="option" tabindex="0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <span>${s.icon} ${s.text}</span>
            </div>`
            )
            .join('');
        suggestions.classList.add('visible');

        // Click on suggestion
        suggestions.querySelectorAll('.suggestion-item').forEach((item) => {
            item.addEventListener('click', () => {
                input.value = item.querySelector('span').textContent.replace(/^[^\s]+\s/, '');
                hideSuggestions();
                input.focus();
            });
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') item.click();
            });
        });
    };

    const hideSuggestions = () => {
        suggestions.classList.remove('visible');
        suggestions.innerHTML = '';
    };

    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => renderSuggestions(input.value), 180);
    });

    input.addEventListener('focus', () => {
        if (input.value.length >= 2) renderSuggestions(input.value);
    });

    document.addEventListener('click', (e) => {
        if (!input.closest('.search-wrapper').contains(e.target)) hideSuggestions();
    });

    btn.addEventListener('click', () => {
        if (input.value.trim()) {
            console.log('Search:', input.value);
            // In production, this would navigate or filter
        }
        hideSuggestions();
        input.focus();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btn.click();
    });
})();

/* ============================================================
   5. CART SYSTEM
   ============================================================ */
(function () {
    let cartCount = 3; // Simulated initial cart state
    const badge = document.getElementById('cartBadge');
    const toast = document.getElementById('cartToast');
    const toastMsg = document.getElementById('cartToastMsg');

    const updateBadge = () => {
        if (!badge) return;
        badge.textContent = cartCount;
        badge.style.display = cartCount > 0 ? 'flex' : 'none';
        // Animate bump
        badge.style.transform = 'scale(1.5)';
        setTimeout(() => (badge.style.transform = ''), 200);
    };

    const showToast = (productName) => {
        if (!toast || !toastMsg) return;
        toastMsg.textContent = `"${productName}" added to cart!`;
        toast.hidden = false;
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => (toast.hidden = true), 400);
        }, 3000);
    };

    // Variant chip selection
    document.querySelectorAll('.product-card').forEach((card) => {
        card.querySelectorAll('.variant-chip').forEach((chip) => {
            chip.addEventListener('click', () => {
                chip.closest('.product-variants').querySelectorAll('.variant-chip').forEach((c) => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });
    });

    // Add to Cart buttons
    document.querySelectorAll('.product-cart-btn').forEach((btn) => {
        btn.addEventListener('click', function () {
            const product = this.dataset.product || 'Item';
            cartCount++;
            updateBadge();
            showToast(product);

            // Button feedback
            const original = this.innerHTML;
            this.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:17px;height:17px">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
                Added!`;
            this.style.background = '#10B981';
            this.style.borderColor = '#10B981';
            this.disabled = true;
            setTimeout(() => {
                this.innerHTML = original;
                this.style.background = '';
                this.style.borderColor = '';
                this.disabled = false;
            }, 2000);
        });
    });

    // Cart icon click
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast(`You have ${cartCount} item${cartCount !== 1 ? 's' : ''} in your cart`);
        });
    }
})();

/* ============================================================
   6. MOBILE SUB-NAV TOGGLE
   ============================================================ */
(function () {
    const toggle = document.getElementById('subNavToggle');
    const list = document.getElementById('subNavList');
    if (!toggle || !list) return;

    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !expanded);
        list.style.display = expanded ? '' : 'flex';
        // On mobile, stack vertically when open
        if (!expanded) {
            list.style.flexDirection = 'column';
            list.style.width = '100%';
            list.style.background = 'rgba(255,255,255,0.05)';
        } else {
            list.style.flexDirection = '';
            list.style.width = '';
            list.style.background = '';
        }
    });
})();

/* ============================================================
   7. NEWSLETTER FORM
   ============================================================ */
(function () {
    const form = document.getElementById('newsletterForm');
    const success = document.getElementById('newsletterSuccess');
    if (!form || !success) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('newsletterEmail')?.value.trim();

        if (!email || !email.includes('@')) {
            // Subtle shake
            form.querySelector('input').style.borderColor = '#E53E3E';
            setTimeout(() => (form.querySelector('input').style.borderColor = ''), 1500);
            return;
        }

        // Hide form, show success
        form.style.display = 'none';
        success.hidden = false;
        console.log('Newsletter signup:', email);
    });
})();

/* ============================================================
   8. CATEGORY CARD – GSAP MICRO INTERACTIONS
   (only when GSAP is available)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Variant chip click feedback
    document.querySelectorAll('.variant-chip').forEach((chip) => {
        chip.addEventListener('click', function () {
            // Already handled above; adding ripple class
            this.classList.add('active');
        });
    });

    // Product wishlist toggling (visual only)
    document.querySelectorAll('.product-wishlist').forEach((btn) => {
        btn.addEventListener('click', function () {
            const svg = this.querySelector('svg');
            if (svg.style.fill === 'rgb(229, 62, 62)') {
                svg.style.fill = 'none';
                svg.style.stroke = 'currentColor';
            } else {
                svg.style.fill = '#E53E3E';
                svg.style.stroke = '#E53E3E';
                // Quick scale pop
                this.style.transform = 'scale(1.4)';
                setTimeout(() => (this.style.transform = ''), 200);
            }
        });
    });
});

/* ============================================================
   9. SMOOTH ANCHOR SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const headerHeight = document.getElementById('siteHeader')?.offsetHeight || 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

console.log('%c🚀 PackRight Storefront Loaded', 'color:#FF6B00;font-size:14px;font-weight:bold;');
