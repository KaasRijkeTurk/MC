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
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    closeNav();

    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      setTimeout(() => {
        window.scrollTo({ top, behavior: 'smooth' });
      }, 50);
    }
  });
});
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

const track = document.querySelector('.marquee-track');
if (track) {
  const speed = 100;
  const halfWidth = track.scrollWidth / 2;
  const duration = halfWidth / speed;
  track.style.animationDuration = duration + 's';
  track.style.setProperty('--marquee-end', `-${halfWidth}px`);
}

/* ============================================
   TAAL TOGGLE
   ============================================ */
const translations = {
  nl: {
    'hero-sup':    'EXAMENS VOORBIJ!',
    'hero-sub':    'EXAMENS ZIJN VOORBIJ!',
    'btn-primary': 'Bekijk projecten',
    'panel-00':    '00 / identiteit',
    'panel-01':    '01 / over mij',
    'panel-02':    '02 / skills',
    'panel-03':    '03 / projecten',
    'over-bio':    '18 jaar. UITLAG KOMT. Ik bouw mods, sites en scripts voor <span class="accent">ervaring</span> en <span class="accent">connecties</span>.',
    'chip-0': 'De school met de glazen toilet deurtjes.',
    'chip-1': 'Ik wacht op mn uitlag',
    'chip-2': 'NL · TR · EN',
    'proj-desc-0': 'Islamitisch geïnspireerde items & blokken in Minecraft. Leert spelers over de Islam en zijn geschiedenis.',
    'proj-desc-1': 'Nieuwe edelstenen, mobs & structuren. Gems geven unieke abilities via de Smithing Table.',
    'proj-desc-2': 'Bezoek de website astublieft niet.',
    'proj-desc-3': 'Discord AI-bot voor MC serverbeheer via Ollama (llama3.2). Lokaal, geen API-kosten.',
    'status':      'EXAMENS VOORBIJ!',
    'nav-0': 'over', 'nav-1': 'skills', 'nav-2': 'projecten', 'nav-3': 'contact',
    'mob-0': 'over', 'mob-1': 'skills', 'mob-2': 'projecten', 'mob-3': 'contact',
    marquee: [
    'Wist je dat water nat is?',
    'Wist je dat als je valt, de grond je altijd vangt?',
    'Wist je dat je met je benen kunt lopen als je ze beweegt?',
    'Wist je dat als je hard rent, je sneller bent dan wanneer je langzaam loopt?',
    'Wist je dat een steen zwaar is, tenzij hij klein is?',
    'Wist je dat als je stopt met ademen, je dood gaat?',
    'Wist je dat als je een trap op loopt, je hoger komt dan toen je begon?',
    'Wist je dat water dat je niet drinkt, gewoon nat blijft?',
    'Wist je dat als je praat, er geluid uit je mond komt?',
    'Wist je dat een gat in de grond eigenlijk een afwezigheid van grond is?',
    'Wist je dat 6 bang is voor 7?',
    'Wist je dat, dat je wist?',
    ]
  },
  en: {
    'hero-sup':    'EXAMS ARE OVER!',
    'hero-sub':    'EXAMS ARE FINALLY OVER!',
    'btn-primary': 'View projects',
    'panel-00':    '00 / identity',
    'panel-01':    '01 / about me',
    'panel-02':    '02 / skills',
    'panel-03':    '03 / projects',
    'over-bio':    '18 years old. Results pending. I build mods, sites and scripts for <span class="accent">experience</span> and <span class="accent">connections</span>.',
    'chip-0': 'The school with the glass toilet doors.',
    'chip-1': 'Waiting for my results',
    'chip-2': 'NL · TR · EN',
    'proj-desc-0': 'Islamic inspired items & blocks in Minecraft. Teaches players about Islam and its history.',
    'proj-desc-1': 'New gemstones, mobs & structures. Gems grant unique abilities via the Smithing Table.',
    'proj-desc-2': 'Please do not visit the website.',
    'proj-desc-3': 'Discord AI-bot for MC server management via Ollama (llama3.2). Local, no API costs.',
    'status':      'EXAMS OVER!',
    'nav-0': 'about', 'nav-1': 'skills', 'nav-2': 'projects', 'nav-3': 'contact',
    'mob-0': 'about', 'mob-1': 'skills', 'mob-2': 'projects', 'mob-3': 'contact',
      marquee: [
    'Did you know water is wet?',
    'Did you know if you fall, the ground always catches you?',
    'Did you know you can walk with your legs if you move them?',
    'Did you know if you run fast, you\'re faster than when you walk slowly?',
    'Did you know a rock is heavy, unless it\'s small?',
    'Did you know if you stop breathing, you die?',
    'Did you know if you go up stairs, you end up higher than when you started?',
    'Did you know water you don\'t drink just stays wet?',
    'Did you know when you talk, sound comes out of your mouth?',
    'Did you know a hole in the ground is just an absence of ground?',
    'Did you know 6 is afraid of 7?',
    'Did you know that you knew that?',
  ]
  },
  tr: {
    'hero-sup':    'SINAVLAR BİTTİ!',
    'hero-sub':    'SINAVLAR SONUNDA BİTTİ!',
    'btn-primary': 'Projelere bak',
    'panel-00':    '00 / kimlik',
    'panel-01':    '01 / hakkımda',
    'panel-02':    '02 / beceriler',
    'panel-03':    '03 / projeler',
    'over-bio':    '18 yaşında. Sonuçlar bekleniyor. <span class="accent">Deneyim</span> ve <span class="accent">bağlantı</span> için mod, site ve script yapıyorum.',
    'chip-0': 'Cam tuvalet kapılı okul.',
    'chip-1': 'Sonuçlarımı bekliyorum',
    'chip-2': 'NL · TR · EN',
    'proj-desc-0': 'Minecraft\'a İslami ilhamlı eşyalar & bloklar. Oyunculara İslam\'ı ve tarihini öğretir.',
    'proj-desc-1': 'Yeni mücevherler, moblar & yapılar. Gems, Smithing Table ile benzersiz yetenekler verir.',
    'proj-desc-2': 'Lütfen siteyi ziyaret etmeyin.',
    'proj-desc-3': 'Ollama (llama3.2) ile MC sunucu yönetimi için Discord AI-botu. Yerel, API maliyeti yok.',
    'status':      'SINAVLAR BİTTİ!',
    'nav-0': 'hakkında', 'nav-1': 'beceriler', 'nav-2': 'projeler', 'nav-3': 'iletişim',
    'mob-0': 'hakkında', 'mob-1': 'beceriler', 'mob-2': 'projeler', 'mob-3': 'iletişim',
      marquee: [
    'Suyun ıslak olduğunu biliyor muydun?',
    'Düştüğünde yerin seni her zaman tuttuğunu biliyor muydun?',
    'Bacaklarını hareket ettirirsen yürüyebileceğini biliyor muydun?',
    'Hızlı koşarsan yavaş yürümekten daha hızlı olduğunu biliyor muydun?',
    'Taşın küçük olmadıkça ağır olduğunu biliyor muydun?',
    'Nefes almayı bırakırsan öleceğini biliyor muydun?',
    'Merdiven çıkarsan başladığından daha yüksekte olduğunu biliyor muydun?',
    'İçmediğin suyun ıslak kalmaya devam ettiğini biliyor muydun?',
    'Konuştuğunda ağzından ses çıktığını biliyor muydun?',
    'Yerdeki çukurun aslında toprağın yokluğu olduğunu biliyor muydun?',
    '6\'nın 7\'den korktuğunu biliyor muydun?',
    'Bunu bildiğini bildiğini biliyor muydun?',
  ]
  }
};
function applyLang(lang) {
  const t = translations[lang];

  document.querySelector('.hero-sup').textContent = t['hero-sup'];
  document.querySelector('.hero-sub').textContent = t['hero-sub'];
  document.querySelector('#projBtn').textContent  = t['btn-primary'];
  document.querySelector('.over-bio').innerHTML   = t['over-bio'];
  document.querySelector('.status-text').textContent = t['status'];

  // panel labels
  const labels = document.querySelectorAll('.panel-label');
  labels[0].textContent = t['panel-00'];
  labels[1].textContent = t['panel-01'];
  labels[2].textContent = t['panel-02'];
  labels[3].textContent = t['panel-03'];

  // stat chips
  document.querySelectorAll('.chip-val').forEach((el, i) => {
    if (t[`chip-${i}`]) el.textContent = t[`chip-${i}`];
  });

  // project descriptions
  document.querySelectorAll('.proj-card p').forEach((el, i) => {
    if (t[`proj-desc-${i}`]) el.textContent = t[`proj-desc-${i}`];
  });

  // desktop nav links
  document.querySelectorAll('nav ul a').forEach((el, i) => {
    if (t[`nav-${i}`]) el.textContent = t[`nav-${i}`];
  });

  // mobile nav links
  document.querySelectorAll('.mobile-nav__panel a').forEach((el, i) => {
    if (t[`mob-${i}`]) el.textContent = t[`mob-${i}`];
  });

  // active button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // marquee updaten
  const track = document.querySelector('.marquee-track');
  if (track && t.marquee) {
    const html = [...t.marquee, ...t.marquee]
      .map(text => `<span>${text}</span><span class="accent">//</span>`)
      .join('');
    track.innerHTML = html;
    const speed = 100;
    const halfWidth = track.scrollWidth / 2;
    track.style.setProperty('--marquee-end', `-${halfWidth}px`);
    track.style.animationDuration = (halfWidth / speed) + 's';
  }
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});