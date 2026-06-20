/* ============================================
   V1 PORTFOLIO — FULLY AI GENERATED
   Particles, typewriter, skill bars, smooth scroll
   ============================================ */

// --- Particles ---
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124, 92, 252, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124, 92, 252, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    connectParticles();
    requestAnimationFrame(animate);
  }
  animate();
})();

// --- Cursor Glow ---
(function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX - 150 + 'px';
    glow.style.top = e.clientY - 150 + 'px';
  });
})();

// --- Typewriter Effect ---
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  const phrases = [
    'Hallo, ik ben Mert Can.',
    'Ik bouw dingen met code.',
    'Mods · Bots · Websites',
    'Examens voorbij. Wat nu?'
  ];
  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pause = 0;

  function tick() {
    const current = phrases[phraseIdx];

    if (pause > 0) {
      pause--;
      setTimeout(tick, 80);
      return;
    }

    if (!deleting) {
      charIdx++;
      el.textContent = current.substring(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        pause = 30;
      }
    } else {
      charIdx--;
      el.textContent = current.substring(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        pause = 5;
      }
    }

    setTimeout(tick, deleting ? 30 : 80);
  }

  tick();
})();

// --- Skill Bars Animation on Scroll ---
(function initSkillBars() {
  const bars = document.querySelectorAll('.bar-fill');
  let animated = false;

  function check() {
    if (animated) return;
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;
    const rect = skillsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.75) {
      animated = true;
      bars.forEach(bar => {
        const w = bar.getAttribute('data-width');
        setTimeout(() => {
          bar.style.width = w + '%';
        }, 200);
      });
    }
  }

  window.addEventListener('scroll', check);
  check();
})();

// --- Smooth Scroll for Nav Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// --- Fade-in Sections on Scroll ---
(function initFadeIn() {
  const sections = document.querySelectorAll('.section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(s => observer.observe(s));
})();

// --- Topbar hide/show on scroll ---
(function initTopbar() {
  const topbar = document.querySelector('.topbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.pageYOffset;
    if (current > lastScroll && current > 80) {
      topbar.style.transform = 'translateY(-100%)';
    } else {
      topbar.style.transform = 'translateY(0)';
    }
    lastScroll = current;
  });
})();

// --- Active nav highlight ---
(function initNavHighlight() {
  const navLinks = document.querySelectorAll('.topbar-nav a');
  const sections = document.querySelectorAll('.section, .hero');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.pageYOffset >= top) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });
})();