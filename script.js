/* ─── Navbar scroll effect ───────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ─── Mobile nav toggle ──────────────────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ─── Scroll-reveal (Intersection Observer) ──────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 5) * 80}ms`;
  revealObserver.observe(el);
});

// Safety fallback: ensure everything becomes visible even if IntersectionObserver stalls
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'));
}, 400);

/* ─── Roles carousel ─────────────────────────────────────────────────────── */
(function rolesCarousel() {
  const roles = document.querySelectorAll('.role');
  if (!roles.length) return;
  let current = 0;
  setInterval(() => {
    roles[current].classList.remove('active');
    roles[current].classList.add('exit');
    const prev = current;
    current = (current + 1) % roles.length;
    roles[current].classList.add('active');
    setTimeout(() => roles[prev].classList.remove('exit'), 450);
  }, 2800);
})();

/* ─── Hero canvas — floating particles ───────────────────────────────────── */
(function heroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); initParticles(); }, { passive: true });

  const COLORS = ['108,99,255', '62,207,207', '167,139,250'];

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.r = Math.random() * 1.8 + 0.4;
      this.speed = Math.random() * 0.35 + 0.1;
      this.drift = (Math.random() - 0.5) * 0.25;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * 0.02 + 0.005;
    }
    update() {
      this.y -= this.speed;
      this.x += this.drift;
      this.twinkle += this.twinkleSpeed;
      if (this.y < -10) this.reset(false);
    }
    draw() {
      const a = this.alpha * (0.7 + 0.3 * Math.sin(this.twinkle));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${a})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.min(120, Math.floor(W * H / 10000));
    particles = Array.from({ length: count }, () => new Particle());
  }
  initParticles();

  let raf;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }
  loop();

  // Pause when off screen
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else loop();
  });
})();

/* ─── Smooth active section highlight in nav ─────────────────────────────── */
(function activeNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active-nav'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active-nav');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => obs.observe(s));
})();

/* ─── Tilt effect on project cards ──────────────────────────────────────── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-5px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ─── Stats counter animation ────────────────────────────────────────────── */
(function animateStats() {
  const stats = document.querySelectorAll('.stat-num');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);

      const el = entry.target;
      const text = el.textContent.trim();
      const numMatch = text.match(/[\d.]+/);
      if (!numMatch) return;

      const target = parseFloat(numMatch[0]);
      const prefix = text.slice(0, numMatch.index);
      const suffix = text.slice(numMatch.index + numMatch[0].length);
      const isDecimal = numMatch[0].includes('.');
      const decimals  = isDecimal ? numMatch[0].split('.')[1].length : 0;

      const duration = 1200;
      const start    = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        const value    = (target * eased).toFixed(decimals);
        el.textContent = prefix + value + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });

  stats.forEach(s => obs.observe(s));
})();
