/* ============================================
   DNA CANVAS ANIMATIE (ACHTERGROND)
   ============================================ */
const canvas = document.getElementById('dna-canvas');
const ctx = canvas.getContext('2d');

const bases = ['A', 'T', 'G', 'C'];
const strands = [];

// Fewer strands on mobile for performance
const isMobile = () => window.innerWidth <= 768;
const STRAND_COUNT_DESKTOP = 8;
const STRAND_COUNT_MOBILE = 4;

function getStrandCount() {
  return isMobile() ? STRAND_COUNT_MOBILE : STRAND_COUNT_DESKTOP;
}

function initStrands() {
  const count = getStrandCount();
  strands.length = 0;
  for (let i = 0; i < count; i++) {
    strands.push({
      x: (canvas.width / count) * i + (canvas.width / count / 2),
      offset: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.002,
      amplitude: isMobile() ? 20 + Math.random() * 25 : 30 + Math.random() * 40,
    });
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStrands();
}

resizeCanvas();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeCanvas, 150);
});

let tick = 0;
let animFrameId;

// Pause animation when tab is hidden (saves battery on mobile)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animFrameId);
  } else {
    drawDNA();
  }
});

function drawDNA() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const STEP = 28;
  const rows = Math.floor(canvas.height / STEP) + 2;

  strands.forEach(strand => {
    for (let row = 0; row < rows; row++) {
      const y = row * STEP - (tick * strand.speed * 1000 % (STEP));
      const wave = Math.sin(row * 0.35 + strand.offset + tick * strand.speed * 60) * strand.amplitude;
      const x1 = strand.x + wave;
      const x2 = strand.x - wave;

      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.strokeStyle = 'rgba(0, 229, 160, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x1, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 180, 255, 0.6)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x2, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 160, 0.6)';
      ctx.fill();

      // Skip letter labels on mobile for performance
      if (!isMobile() && row % 3 === 0) {
        const base = bases[Math.floor((row + strand.x) % 4)];
        ctx.font = '9px Space Mono, monospace';
        ctx.fillStyle = 'rgba(0, 229, 160, 0.4)';
        ctx.fillText(base, x1 + 5, y + 3);
      }
    }
  });

  tick++;
  animFrameId = requestAnimationFrame(drawDNA);
}

drawDNA();

/* ============================================
   HAMBURGER / MOBILE NAV
   ============================================ */
const hamburger   = document.querySelector('.hamburger');
const mobileNav   = document.querySelector('.mobile-nav');
const backdrop    = document.querySelector('.mobile-nav__backdrop');
const navLinks    = document.querySelectorAll('.mobile-nav__panel a');

function openNav() {
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileNav.classList.add('open');
  mobileNav.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeNav() {
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeNav() : openNav();
  });

  // Sluit bij klikken op een link
  navLinks.forEach(link => link.addEventListener('click', closeNav));

  // Sluit bij klikken op backdrop
  backdrop?.addEventListener('click', closeNav);

  // Sluit met Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeNav();
  });
}

/* ============================================
   SCROLL REVEAL
   ============================================ */
const revealEls = document.querySelectorAll(
  'section > *, .project-card, .stat-card, .skill-group'
);

// Skip reveal animation if user prefers reduced motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced) {
  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 }); // slightly lower threshold for mobile viewports

  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('reveal', 'visible'));
}

/* ============================================
   ACTIVE NAV LINK
   ============================================ */
const sections = document.querySelectorAll('section[id]');
const desktopNavLinks = document.querySelectorAll('nav ul a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 200) {
      current = sec.getAttribute('id');
    }
  });
  desktopNavLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}`
      ? 'var(--accent)'
      : '';
  });
}, { passive: true });