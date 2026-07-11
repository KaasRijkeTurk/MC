/* ============================================
   DNA CANVAS ANIMATIE (ACHTERGROND) - ULTRA OPTIMIZED
   ============================================ */
const canvas = document.getElementById('dna-canvas');
const ctx = canvas.getContext('2d');

const bases = ['A', 'T', 'G', 'C'];
const strands = [];

// Echte mobiele detectie (schermen tot 768px breed)
const isMobile = () => window.innerWidth <= 768;

const STRAND_COUNT_DESKTOP = 13;  
const STRAND_COUNT_MOBILE = 4;    // Aantal strengen op mobiel

function getStrandCount() {
  return isMobile() ? STRAND_COUNT_MOBILE : STRAND_COUNT_DESKTOP;
}

function initStrands() {
  const count = getStrandCount();
  strands.length = 0;
  
  for (let i = 0; i < count; i++) {
    let startX;
    
    if (isMobile()) {
      // Verdeelt de 4 strengen perfect evenredig over de mobiele breedte (10% tot 90%)
      startX = canvas.width * (0.1 + (i / (count - 1)) * 0.8);
    } else {
      startX = (canvas.width / count) * i + (canvas.width / count / 2);
    }

    strands.push({
      x: startX,
      offset: Math.random() * Math.PI * 2,
      // Mobiel golft extra rustig en traag voor een chique uitstraling
      speed: isMobile() ? 0.001 + Math.random() * 0.001 : 0.002 + Math.random() * 0.002, 
      
      // Grote amplitude op mobiel zodat de strengen prachtig wijd uitwaieren
      amplitude: isMobile() ? 45 + Math.random() * 20 : 30 + Math.random() * 40,
    });
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStrands();
}

// Direct starten bij inladen
resizeCanvas();

// Debounce op het resizen van het scherm (voorkomt lag tijdens slepen)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeCanvas, 150);
});

let tick = 0;
let animFrameId;

// Veiligheid tegen dubbele loops bij het wisselen van tabbladen (bespaart batterij)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animFrameId);
  } else {
    cancelAnimationFrame(animFrameId); // Reset eventuele actieve frames
    drawDNA();
  }
});

function drawDNA() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const STEP = isMobile() ? 45 : 28;
  const rows = Math.floor(canvas.height / STEP) + 3;

  strands.forEach(strand => {
    const yOffset = (tick * strand.speed * 200) % STEP;
    
    for (let row = -1; row < rows; row++) {
      const y = row * STEP - yOffset;
      const wave = Math.sin(row * 0.35 + strand.offset + tick * strand.speed * 60) * strand.amplitude;
      const x1 = strand.x + wave;
      const x2 = strand.x - wave;

      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.strokeStyle = 'rgba(0, 229, 160, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath(); ctx.arc(x1, y, 3.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 180, 255, 0.95)'; ctx.fill();
      ctx.beginPath(); ctx.arc(x1, y, 7, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 180, 255, 0.25)'; ctx.fill();
      ctx.beginPath(); ctx.arc(x2, y, 3.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 229, 160, 0.95)'; ctx.fill();
      ctx.beginPath(); ctx.arc(x2, y, 7, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 229, 160, 0.25)'; ctx.fill();

      if (!isMobile() && row % 3 === 0 && y > 0) {
        const base = bases[Math.abs(Math.floor((row + strand.x) % 4))];
        ctx.font = 'bold 9px Space Mono, monospace';
        ctx.fillStyle = 'rgba(0, 229, 160, 0.6)';
        ctx.fillText(base, x1 + 6, y + 3);
      }
    }
  });

  tick++;
  animFrameId = requestAnimationFrame(drawDNA);
}

// Start de animatiecyclus
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

  // Sluit bij klikken op een link en scroll soepel
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      closeNav();

      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
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

/* ============================================
   MARQUEE SPEED CALCULATION
   ============================================ */
const track = document.querySelector('.marquee-track');
if (track) {
  const speed = 100;
  const halfWidth = track.scrollWidth / 2;
  const duration = halfWidth / speed;
  track.style.animationDuration = duration + 's';
  track.style.setProperty('--marquee-end', `-${halfWidth}px`);
}
const translations = {
  nl: {
    'hero-sup': 'SOFTWARE DEVELOPER',
    'hero-sub': 'Gepassioneerd door het bouwen van efficiënte software, geautomatiseerde systemen en data-gedreven oplossingen.',
    'btn-primary': 'Bekijk projecten',
    'panel-00': '00 / identiteit',
    'panel-01': '01 / over mij',
    'panel-02': '02 / skills',
    'panel-03': '03 / projecten',
    'panel-04': "04 / extra's",
    'chip-status-key': 'STATUS',
    'chip-status-val': 'Opleiding Succesvol Afgerond',
    'chip-focus-key': 'FOCUS',
    'chip-focus-val': 'Software Development & AI Integratie',
    'chip-lang-key': 'TAAL',
    'chip-lang-val': 'NL · TR · EN',
    'over-bio': '18 jaar. Recent afgestudeerd. Ik focus op het bouwen van robuuste mods, webapplicaties en scripts om complexe processen te automatiseren en <span class="accent">waardevolle technische ervaring</span> op te doen.',
    'proj-desc-0': 'Islamitisch geïnspireerde items & blokken in Minecraft. Leert spelers over de Islam en zijn geschiedenis.',
    'proj-desc-1': 'Gameplay uitbreiding door middel van custom data-driven systemen en het implementeren van nieuwe in-game mechanics.',
    'proj-desc-2': 'Een experimenteel webontwikkelingsproject gericht op frontend architectuur, DOM-manipulatie en UI/UX iteratie.',
    'proj-desc-3': 'Discord AI-bot voor serverbeheer geïntegreerd met Ollama (llama3.2). Gehost in een lokale omgeving ter besparing van API-kosten.',
    'proj-desc-4': 'Discord Command-bot voor het dynamisch sorteren en categoriseren van YouTube-afspeellijsten via lokale LLM-verwerking (Ollama llama3.1:8b).',


    // AeroForge & Terminal
    'af-status':          'ONLINE',
    'af-title':           'Beek SMP',
    'af-version':         'NeoForge 1.21.1',
    'af-desc':            'Dit is een op maat gemaakte Minecraft server die volledig wordt beheerd door de geavanceerde AI Microslop Support Bot. Automatisch beheer, snelle interacties en direct verbonden met Discord.',
    'af-pack-title':      'MODPACK BESTAND (.mrpack)',
    'af-btn-download':    'Download mrpack',
    'af-download-sub':    'Klik om direct te installeren via Modrinth/CurseForge',
    'af-terminal-user':   'microslop-support-bot@system:~',
    'af-cat-general':     '── algemeen ──',
    'af-cmd-help':        '.help — laat dit zien',
    'af-cmd-uptime':      '.uptime — hoe lang de bot draait',
    'af-cmd-purge':       '.purge [1-100 / all] [ww] — verwijder berichten',
    'af-cmd-roast':       '.roast @user — roast iemand',
    'af-cmd-poll':        '.poll [vraag] | [opt1] | [opt2] — stemming',
    'af-cmd-coinflip':    '.coinflip — kop of munt',
    'af-cmd-mock':        '.mock [tekst] — SpOnGeBoB tekst',
    'af-cmd-ship':        '.ship @a @b — compatibiliteit',
    'af-cmd-userinfo':    '.userinfo [@user] — gebruikersinfo',
    'af-cmd-serverinfo':  '.serverinfo — discord server info',
    'af-cmd-freechat':    '.freechat — toggle free-chat voor dit kanaal',
    'af-cat-admin':       '── server beheer ──',
    'af-cmd-setup':       '.setup [ww] — zet de hele server op (kanalen, rollen, regels)',
    'af-cmd-setwelcome':  '.setwelcome #kanaal — stel het welkomstkanaal in',
    'af-cmd-setautorole': '.setautorole @rol — stel de auto-rol in bij joinen',
    'af-cmd-setwelcome-msg': '.setwelcomemsg [bericht] — pas het welkomstbericht aan ({user} = ping)',
    'af-cat-minecraft':   '── minecraft ──',
    'af-cmd-mchelp':      '.mchelp — alle minecraft commando\'s',
    'af-cmd-mcstatus':    '.mcstatus — online/offline + speleraantal',
    'af-cmd-mcplayers':   '.mcplayers — wie is er nu online',
    'af-cmd-mcmods':      '.mcmods — geïnstalleerde mods',
    'af-cmd-mcjoin':      '.mcjoin — hoe te joinen (IP, poort, versie, mods)',
    'af-cmd-mcinfo':      '.mcinfo — volledige server info',
    'af-cmd-mcwhitelist': '.mcwhitelist — whitelist',
    'af-cmd-mcbanned':    '.mcbanned — gebande spelers',
    'af-cmd-mcops':       '.mcops — operators/admins',
    'af-cmd-mcrcon':      '.mcrcon [commando] [ww] — stuur RCON commando',


    // Marquee
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
    ],
    
    // Navigation (Desktop & Mobile)
    nav_items: ['over', 'skills', 'projecten', 'extras', 'contact']
  },

  en: {
    // Hero & Over
    'hero-sup': 'SOFTWARE DEVELOPER',
    'hero-sub': 'Passionate about building efficient software, automated systems, and data-driven solutions.',
    'btn-primary': 'View projects',
    
    // Panels
    'panel-00': '00 / identity',
    'panel-01': '01 / about me',
    'panel-02': '02 / skills',
    'panel-03': '03 / projects',
    'panel-04': '04 / extras',

    // Bio Stats
    'chip-status-key': 'STATUS',
    'chip-status-val': 'Education Successfully Completed',
    'chip-focus-key': 'FOCUS',
    'chip-focus-val': 'Software Development & AI Integration',
    'chip-lang-key': 'LANG',
    'chip-lang-val': 'NL · TR · EN',
    
    'over-bio': '18 years old. Recently graduated. I focus on building robust mods, web apps, and scripts to automate complex processes and gain <span class="accent">valuable technical experience</span>.',

    // Projects
    'proj-desc-0': 'Islamic-inspired items & blocks in Minecraft. Teaches players about Islam and its history.',
    'proj-desc-1': 'Gameplay expansion through custom data-driven systems and implementation of new in-game mechanics.',
    'proj-desc-2': 'An experimental web development project focused on frontend architecture, DOM manipulation, and UI/UX iteration.',
    'proj-desc-3': 'Discord AI-bot for server management integrated with Ollama (llama3.2). Hosted locally to save on API costs.',
    'proj-desc-4': 'Discord Command-bot for dynamically sorting and categorizing YouTube playlists via local LLM processing (Ollama llama3.1:8b).',

      
    // AeroForge & Terminal
    'af-status':          'ONLINE',
    'af-title':           'Beek SMP',
    'af-version':         'NeoForge 1.21.1',
    'af-desc':            'This is a custom-built Minecraft server fully managed by the advanced AI Microslop Support Bot. Automated management, fast interactions, and directly linked to Discord.',
    'af-pack-title':      'MODPACK FILE (.mrpack)',
    'af-btn-download':    'Download mrpack',
    'af-download-sub':    'Click to install directly via Modrinth/CurseForge',
    'af-terminal-user':   'microslop-support-bot@system:~',
    'af-cat-general':     '── general ──',
    'af-cmd-help':        '.help — show this message',
    'af-cmd-uptime':      '.uptime — how long the bot has been running',
    'af-cmd-purge':       '.purge [1-100 / all] [pw] — delete messages',
    'af-cmd-roast':       '.roast @user — roast someone',
    'af-cmd-poll':        '.poll [question] | [opt1] | [opt2] — start a poll',
    'af-cmd-coinflip':    '.coinflip — flip a coin',
    'af-cmd-mock':        '.mock [text] — SpOnGeBoB text',
    'af-cmd-ship':        '.ship @a @b — compatibility check',
    'af-cmd-userinfo':    '.userinfo [@user] — user information',
    'af-cmd-serverinfo':  '.serverinfo — discord server info',
    'af-cmd-freechat':    '.freechat — toggle free-chat for this channel',
    'af-cat-admin':       '── server management ──',
    'af-cmd-setup':       '.setup [pw] — set up the entire server (channels, roles, rules)',
    'af-cmd-setwelcome':  '.setwelcome #channel — set the welcome channel',
    'af-cmd-setautorole': '.setautorole @role — set auto-role upon joining',
    'af-cmd-setwelcome-msg': '.setwelcomemsg [message] — customize the welcome message ({user} = ping)',
    'af-cat-minecraft':   '── minecraft ──',
    'af-cmd-mchelp':      '.mchelp — all minecraft commands',
    'af-cmd-mcstatus':    '.mcstatus — online/offline + player count',
    'af-cmd-mcplayers':   '.mcplayers — who is currently online',
    'af-cmd-mcmods':      '.mcmods — installed mods',
    'af-cmd-mcjoin':      '.mcjoin — how to join (IP, port, version, mods)',
    'af-cmd-mcinfo':      '.mcinfo — full server info',
    'af-cmd-mcwhitelist': '.mcwhitelist — whitelist',
    'af-cmd-mcbanned':    '.mcbanned — banned players',
    'af-cmd-mcops':       '.mcops — operators/admins',
    'af-cmd-mcrcon':      '.mcrcon [command] [pw] — send RCON command',

    // Marquee
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
    ],

    // Navigation (Desktop & Mobile)
    nav_items: ['about', 'skills', 'projects', 'extras', 'contact']
  },

  tr: {
    // Hero & Over
    'hero-sup': 'YAZILIM GELİŞTİRİCİSİ',
    'hero-sub': 'Verimli yazılım, otomatikleştirilmiş sistemler ve veriye dayalı çözümler oluşturmaya tutkuyla bağlıyım.',
    'btn-primary': 'Projeleri Görüntüle',
    
    // Panels
    'panel-00': '00 / kimlik',
    'panel-01': '01 / hakkımda',
    'panel-02': '02 / beceriler',
    'panel-03': '03 / projeler',
    'panel-04': '04 / ekstralar',

    // Bio Stats
    'chip-status-key': 'DURUM',
    'chip-status-val': 'Eğitim Başarıyla Tamamlandı',
    'chip-focus-key': 'ODAK',
    'chip-focus-val': 'Yazılım Geliştirme & AI Entegrasyonu',
    'chip-lang-key': 'DİL',
    'chip-lang-val': 'NL · TR · EN',
    
    'over-bio': '18 yaşında. Yeni mezun. Karmaşık süreçleri otomatikleştirmek ve <span class="accent">değerli teknik deneyim</span> kazanmak için sağlam modlar, web uygulamaları ve komut dosyaları oluşturmaya odaklanıyorum.',

    // Projects
    'proj-desc-0': 'Minecraft\'ta İslami ilhamlı eşyalar & bloklar. Oyunculara İslam\'ı ve tarihini öğretir.',
    'proj-desc-1': 'Özel veri odaklı sistemler ve yeni oyun içi mekaniklerin uygulanması ile oynanış genişletmesi.',
    'proj-desc-2': 'Ön yüz mimarisi, DOM manipülasyonu ve UI/UX yinelemesine odaklanan deneysel bir web geliştirme projesi.',
    'proj-desc-3': 'Ollama (llama3.2) ile entegre edilmiş sunucu yönetimi için Discord AI-botu. API maliyetlerinden tasarruf etmek için yerel olarak barındırılıyor.',
    'proj-desc-4': 'Yerel LLM işleme (Ollama llama3.1:8b) aracılığıyla YouTube oynatma listelerini dinamik olarak sıralayan ve kategorize eden Discord Komut-botu.',

    // AeroForge & Terminal
    'af-status':          'ÇEVRİMİÇİ',
    'af-title':           'Beek SMP',
    'af-version':         'NeoForge 1.21.1',
    'af-desc':            'Bu, gelişmiş yapay zeka Microslop Destek Botu tarafından tamamen yönetilen, özel tasarım bir Minecraft sunucusudur. Otomatik yönetim, hızlı etkileşimler ve doğrudan Discord bağlantısı.',
    'af-pack-title':      'MODPAKETİ DOSYASI (.mrpack)',
    'af-btn-download':    'mrpack İndir',
    'af-download-sub':    'Modrinth/CurseForge üzerinden doğrudan kurmak için tıkla',
    'af-terminal-user':   'microslop-support-bot@system:~',
    'af-cat-general':     '── genel ──',
    'af-cmd-help':        '.help — bunu gösterir',
    'af-cmd-uptime':      '.uptime — botun ne kadar süredir çalıştığı',
    'af-cmd-purge':       '.purge [1-100 / all] [şifre] — mesajları siler',
    'af-cmd-roast':       '.roast @user — birine laf sokar / roast',
    'af-cmd-poll':        '.poll [soru] | [sec1] | [sec2] — oylama',
    'af-cmd-coinflip':    '.coinflip — yazı tura',
    'af-cmd-mock':        '.mock [metin] — SpOnGeBoB metni',
    'af-cmd-ship':        '.ship @a @b — uyumluluk testi',
    'af-cmd-userinfo':    '.userinfo [@user] — kullanıcı bilgisi',
    'af-cmd-serverinfo':  '.serverinfo — discord sunucu bilgisi',
    'af-cmd-freechat':    '.freechat — bu kanal için serbest sohbeti aç/kapat',
    'af-cat-admin':       '── sunucu yönetimi ──',
    'af-cmd-setup':       '.setup [şifre] — tüm sunucuyu kurar (kanallar, roller, kurallar)',
    'af-cmd-setwelcome':  '.setwelcome #kanal — hoş geldin kanalını ayarlar',
    'af-cmd-setautorole': '.setautorole @rol — katılıma otomatik rol atar',
    'af-cmd-setwelcome-msg': '.setwelcomemsg [mesaj] — hoş geldin mesajını düzenler ({user} = etiket)',
    'af-cat-minecraft':   '── minecraft ──',
    'af-cmd-mchelp':      '.mchelp — tüm minecraft komutları',
    'af-cmd-mcstatus':    '.mcstatus — çevrimiçi/çevrimdışı + oyuncu sayısı',
    'af-cmd-mcplayers':   '.mcplayers — şu an kimler çevrimiçi',
    'af-cmd-mcmods':      '.mcmods — kurulu modlar',
    'af-cmd-mcjoin':      '.mcjoin — nasıl katılınır (IP, port, sürüm, modlar)',
    'af-cmd-mcinfo':      '.mcinfo — tam sunucu bilgisi',
    'af-cmd-mcwhitelist': '.mcwhitelist — beyaz liste (whitelist)',
    'af-cmd-mcbanned':    '.mcbanned — yasaklı oyuncular',
    'af-cmd-mcops':       '.mcops — authorities/admins',
    'af-cmd-mcrcon':      '.mcrcon [komut] [şifre] — RCON komutu gönderir',
    // Marquee
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
    ],

    // Navigation (Desktop & Mobile)
    nav_items: ['hakkında', 'beceriler', 'projeler', 'ekstralar', 'iletişim']
  }
};


function applyLang(lang) {
  const t = translations[lang];
  if (!t) return;

  if (document.querySelector('.hero-sup')) document.querySelector('.hero-sup').textContent = t['hero-sup'];
  if (document.querySelector('.hero-sub')) document.querySelector('.hero-sub').textContent = t['hero-sub'];
  if (document.querySelector('#projBtn')) document.querySelector('#projBtn').textContent  = t['btn-primary'];
  if (document.querySelector('.over-bio')) document.querySelector('.over-bio').innerHTML   = t['over-bio'];
  if (document.querySelector('.status-text')) document.querySelector('.status-text').textContent = t['status'];

  const labels = document.querySelectorAll('.panel-label');
  labels.forEach((el, i) => {
    const key = `panel-0${i}`;
    if (t[key]) el.textContent = t[key];
  });

  document.querySelectorAll('.chip-val').forEach((el, i) => {
    if (t[`chip-${i}`]) el.textContent = t[`chip-${i}`];
  });

  document.querySelectorAll('.proj-card p').forEach((el, i) => {
    if (t[`proj-desc-${i}`]) el.textContent = t[`proj-desc-${i}`];
    
  })
  if (document.querySelector('.proj-card:nth-of-type(5) .proj-version')) {
    document.querySelector('.proj-card:nth-of-type(5) .proj-version').textContent = t['proj-status-4'];
  }
  if (document.querySelector('.proj-card:nth-of-type(5) .wip-badge')) {
    document.querySelector('.proj-card:nth-of-type(5) .wip-badge').textContent = t['proj-badge-4'];
  };
  
  document.querySelectorAll('nav ul a').forEach((el, i) => {
    if (t[`nav-${i}`]) el.textContent = t[`nav-${i}`];
  });

  document.querySelectorAll('.mobile-nav__panel a').forEach((el, i) => {
    if (t[`mob-${i}`]) el.textContent = t[`mob-${i}`];
  });

  if (document.querySelector('.server-status-pill')) {
    document.querySelector('.server-status-pill').textContent = t['af-status'];
  }
  if (document.querySelector('.server-title-row h2')) {
    document.querySelector('.server-title-row h2').textContent = t['af-title'];
  }
  if (document.querySelector('.server-badge')) {
    document.querySelector('.server-badge').textContent = t['af-version'];
  }
  if (document.querySelector('.server-description')) {
    document.querySelector('.server-description').textContent = t['af-desc'];
  }
  
  if (document.querySelector('.download-label')) {
    document.querySelector('.download-label').textContent = t['af-pack-title'];
  }
  if (document.querySelector('.btn-title')) {
    document.querySelector('.btn-title').textContent = t['af-btn-download'];
  }
  if (document.querySelector('.btn-subtext')) {
    document.querySelector('.btn-subtext').textContent = t['af-download-sub'];
  }

  if (document.querySelector('.terminal-title')) {
    document.querySelector('.terminal-title').textContent = t['af-terminal-user'];
  }

  const cmdHeaders = document.querySelectorAll('.cmd-header');
  if (cmdHeaders.length >= 3) {
    cmdHeaders[0].textContent = t['af-cat-general'];
    cmdHeaders[1].textContent = t['af-cat-admin'];
    cmdHeaders[2].textContent = t['af-cat-minecraft'];
  }

  const cmdLines = document.querySelectorAll('.cmd-line');
  
  const cmdKeys = [
    'af-cmd-help', 'af-cmd-uptime', 'af-cmd-purge', 'af-cmd-roast', 'af-cmd-poll', 
    'af-cmd-coinflip', 'af-cmd-mock', 'af-cmd-ship', 'af-cmd-userinfo', 'af-cmd-serverinfo', 'af-cmd-freechat',
    'af-cmd-setup', 'af-cmd-setwelcome', 'af-cmd-setautorole', 'af-cmd-setwelcome-msg',
    'af-cmd-mchelp', 'af-cmd-mcstatus', 'af-cmd-mcplayers', 'af-cmd-mcmods', 'af-cmd-mcjoin', 
    'af-cmd-mcinfo', 'af-cmd-mcwhitelist', 'af-cmd-mcbanned', 'af-cmd-mcops', 'af-cmd-mcrcon'
  ];

  cmdLines.forEach((el, i) => {
    const key = cmdKeys[i];
    if (key && t[key]) {
      const cmdSpan = el.querySelector('.cmd');
      if (cmdSpan) {
        const cmdText = cmdSpan.outerHTML;
        const translationParts = t[key].split('—');
        if (translationParts.length > 1) {
          el.innerHTML = `${cmdText} — ${translationParts[1].trim()}`;
        }
      }
    }
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

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

/* ============================================
   ACCESSIBILITY: ZOOM FEATURE (+ / -)
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  let currentZoom = 100; // Start op de standaard 100%
  const ZOOM_STEP = 10;  // Verander met 10% per klik
  const MIN_ZOOM = 80;   // Minimale verkleining (veiligheidsgrens)
  const MAX_ZOOM = 140;  // Maximale vergroting (veiligheidsgrens)

  const htmlElement = document.documentElement;
  const btnZoomIn = document.getElementById('zoom-in');
  const btnZoomOut = document.getElementById('zoom-out');
  const zoomControls = document.querySelector('.zoom-controls');

  function updateZoomDisplay() {
    if (zoomControls) {
      zoomControls.setAttribute('data-zoom-level', currentZoom);
      // Show the zoom level temporarily
      zoomControls.classList.add('show-zoom-level');
      setTimeout(() => {
        zoomControls.classList.remove('show-zoom-level');
      }, 2000);
    }
  }

  // Functie om side-games te verbergen/tonen op basis van beschikbare ruimte
  function checkSideGames() {
    const viewportWidth = window.innerWidth;
    const dashboard = document.querySelector('.dashboard');
    const dashboardWidth = dashboard ? dashboard.offsetWidth : 650;
    const sideGames = document.querySelectorAll('.side-game');
    
    // Ruimte nodig: dashboard + 2x game breedte + marges
    const neededWidth = dashboardWidth + (220 * 2) + 80;
    
    sideGames.forEach(game => {
      if (viewportWidth < neededWidth) {
        game.style.display = 'none';
      } else {
        game.style.display = '';
      }
    });
  }

  if (btnZoomIn && btnZoomOut) {
    btnZoomIn.addEventListener('click', () => {
      if (currentZoom < MAX_ZOOM) {
        currentZoom += ZOOM_STEP;
        htmlElement.style.fontSize = `${currentZoom}%`;
        updateZoomDisplay();
        setTimeout(() => {
          checkSideGames();
          window.dispatchEvent(new Event('resize'));
        }, 100);
      }
    });

    btnZoomOut.addEventListener('click', () => {
      if (currentZoom > MIN_ZOOM) {
        currentZoom -= ZOOM_STEP;
        htmlElement.style.fontSize = `${currentZoom}%`;
        updateZoomDisplay();
        setTimeout(() => {
          checkSideGames();
          window.dispatchEvent(new Event('resize'));
        }, 100);
      }
    });
    
    // Initialize display en check side-games
    updateZoomDisplay();
    checkSideGames();
    
    // Luister naar resize events (voor browser zoom met Ctrl+/-)
    window.addEventListener('resize', checkSideGames);
  } else {
    console.warn("[System] Zoom-knoppen niet gevonden. Controleer of de IDs 'zoom-in' en 'zoom-out' correct zijn ingesteld.");
  }
});

/* ============================================
   DYNAMIC DASHBOARD MARGIN (ZOOM SAFE)
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  function updateDashboardMargin() {
    const nav = document.querySelector('nav');
    const dashboard = document.querySelector('.dashboard');
    if (nav && dashboard) {
      const navHeight = nav.offsetHeight;
      dashboard.style.marginTop = `${navHeight + 24}px`;
    }
    
    // Update side-game top position
    const navEl = document.querySelector('nav');
    const sideGames = document.querySelectorAll('.side-game');
    if (navEl) {
      const navBottom = navEl.getBoundingClientRect().bottom;
      sideGames.forEach(game => {
        game.style.top = `${navBottom + 8}px`;
      });
    }
  }

  // Run op load en bij resize/zoom
  updateDashboardMargin();
  window.addEventListener('resize', updateDashboardMargin);

  // Run ook bij zoom knoppen (via MutationObserver op fontSize)
  const observer = new MutationObserver(updateDashboardMargin);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
});
document.addEventListener('DOMContentLoaded', () => {
  const canvasL = document.getElementById('pong-left');
  const canvasR = document.getElementById('pong-right');
  
  if (!canvasL || !canvasR) return;

  const ctxL = canvasL.getContext('2d');
  const ctxR = canvasR.getContext('2d');

  // Zet vaste resoluties voor de canvassen
  const w = 220;
  const h = 450;
  canvasL.width = w; canvasL.height = h;
  canvasR.width = w; canvasR.height = h;

  // Dynamische totale breedte gebaseerd op de daadwerkelijke dashboard grootte
  const dashboard = document.querySelector('.dashboard');
  const dashboardWidth = dashboard ? dashboard.offsetWidth : 650;
  const gap = dashboardWidth + 40; // Dashboard breedte + marges
  const totalWidth = w + gap + w;

  // Game objecten
  const paddleWidth = 8;
  const paddleHeight = 60;
  
  const ball = {
    x: totalWidth / 2,
    y: h / 2,
    vx: 4,
    vy: 3,
    radius: 5,
    speed: 5
  };

  const p1 = { x: 10, y: h / 2 - paddleHeight / 2, score: 0, isManual: false };
  const p2 = { x: totalWidth - 10 - paddleWidth, y: h / 2 - paddleHeight / 2, score: 0, isManual: false };

  // Muisbesturing triggers per zijbalk
  canvasL.addEventListener('mousemove', (e) => {
    p1.isManual = true;
    const rect = canvasL.getBoundingClientRect();
    p1.y = e.clientY - rect.top - paddleHeight / 2;
  });

  canvasR.addEventListener('mousemove', (e) => {
    p2.isManual = true;
    const rect = canvasR.getBoundingClientRect();
    p2.y = e.clientY - rect.top - paddleHeight / 2;
  });

  // Reset als de muis de schermen verlaat (terug naar AI)
  canvasL.addEventListener('mouseleave', () => p1.isManual = false);
  canvasR.addEventListener('mouseleave', () => p2.isManual = false);

  function resetBall() {
    ball.x = totalWidth / 2;
    ball.y = h / 2;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.vy = (Math.random() * 2 - 1) * 3;
    ball.speed = 5;
  }

  function update() {
    // Beweeg de bal
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Kaatsen tegen boven- en onderkant
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = -ball.vy;
    } else if (ball.y + ball.radius > h) {
      ball.y = h - ball.radius;
      ball.vy = -ball.vy;
    }

    // AI Volg-logica (als speler niet handmatig stuurt)
    const aiSpeed = 3.5;
    if (!p1.isManual) {
      const targetY = ball.y - paddleHeight / 2;
      p1.y += (targetY - p1.y) * 0.1;
    }
    if (!p2.isManual) {
      const targetY = ball.y - paddleHeight / 2;
      p2.y += (targetY - p2.y) * 0.1;
    }

    // Beperk paddles binnen het scherm
    p1.y = Math.max(0, Math.min(h - paddleHeight, p1.y));
    p2.y = Math.max(0, Math.min(h - paddleHeight, p2.y));

    // Check collisions met paddles
    // Linker paddle
    if (ball.vx < 0 && ball.x < p1.x + paddleWidth && ball.x > p1.x) {
      if (ball.y > p1.y && ball.y < p1.y + paddleHeight) {
        ball.vx = -ball.vx;
        ball.speed += 0.2;
      }
    }
    // Rechter paddle
    if (ball.vx > 0 && ball.x > p2.x && ball.x < p2.x + paddleWidth) {
      if (ball.y > p2.y && ball.y < p2.y + paddleHeight) {
        ball.vx = -ball.vx;
        ball.speed += 0.2;
      }
    }

    // Punten scoren
    if (ball.x < 0) {
      p2.score++;
      resetBall();
    } else if (ball.x > totalWidth) {
      p1.score++;
      resetBall();
    }
  }

  function draw() {
    // Maak beide schermen leeg
    ctxL.clearRect(0, 0, w, h);
    ctxR.clearRect(0, 0, w, h);

    // Teken Cyberpunk Grid/Stippellijnen op achtergrond
    ctxL.strokeStyle = 'rgba(28, 36, 48, 0.4)';
    ctxR.strokeStyle = 'rgba(28, 36, 48, 0.4)';
    ctxL.lineWidth = 1; ctxR.lineWidth = 1;
    for(let i=0; i<h; i+=20) {
      ctxL.strokeRect(0, i, w, 1);
      ctxR.strokeRect(0, i, w, 1);
    }

    // Kleuren instellen (Matrix groen & Cyaan blauw)
    const accentGreen = '#00e5a0';
    const accentBlue = '#00b4ff';

    // Links tekenen
    ctxL.fillStyle = accentGreen;
    ctxL.fillRect(p1.x, p1.y, paddleWidth, paddleHeight); // Paddle 1
    ctxL.font = 'bold 20px "Space Mono"';
    ctxL.fillStyle = 'rgba(74, 92, 110, 0.3)';
    ctxL.fillText(p1.score, w - 40, 40); // Score links

    // Rechts tekenen
    ctxR.fillStyle = accentBlue;
    ctxR.fillRect(p2.x - (totalWidth - w), p2.y, paddleWidth, paddleHeight); // Paddle 2
    ctxR.font = 'bold 20px "Space Mono"';
    ctxR.fillStyle = 'rgba(74, 92, 110, 0.3)';
    ctxR.fillText(p2.score, 30, 40); // Score rechts

    // Teken de bal op het juiste scherm gebaseerd op zijn virtuele X positie
    ctxL.fillStyle = '#ffffff';
    ctxR.fillStyle = '#ffffff';
    
    if (ball.x <= w) {
      // Bal is op het linker scherm
      ctxL.beginPath();
      ctxL.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctxL.fill();
    } else if (ball.x >= totalWidth - w) {
      // Bal is op het rechter scherm
      ctxR.beginPath();
      ctxR.arc(ball.x - (totalWidth - w), ball.y, ball.radius, 0, Math.PI * 2);
      ctxR.fill();
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();
});
