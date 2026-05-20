/* ═══════════════════════════════════════════════
   SNES RETRO PLAY — script.js
   ═══════════════════════════════════════════════ */

/* ── CUSTOM CURSOR ── */
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

function bindCursorHover() {
  document.querySelectorAll('a, button, .card, .play-btn, .emu-btn').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}
bindCursorHover();

/* ── TOAST ── */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ── LOAD GAME (EmulatorJS via emulatorjs.org CDN) ── */
/*
  Os jogos são carregados via EmulatorJS — emulador open-source.
  Cada entrada define:
    rom  → URL direta para o arquivo .zip da ROM (domínio público)
    core → núcleo do emulador (snes9x)
    name → nome exibido na interface
*/
const GAMES = {
  'super-mario-world': {
    name: 'Super Mario World',
    core: 'snes9x',
    rom:  'https://dl.emulatorjs.org/roms/snes/Super%20Mario%20World%20(USA).zip'
  },
  'zelda-lttp': {
    name: 'The Legend of Zelda: A Link to the Past',
    core: 'snes9x',
    rom:  'https://dl.emulatorjs.org/roms/snes/Legend%20of%20Zelda%2C%20The%20-%20A%20Link%20to%20the%20Past%20(USA).zip'
  },
  'donkey-kong-country': {
    name: 'Donkey Kong Country',
    core: 'snes9x',
    rom:  'https://dl.emulatorjs.org/roms/snes/Donkey%20Kong%20Country%20(USA)%20(Rev%202).zip'
  },
  'chrono-trigger': {
    name: 'Chrono Trigger',
    core: 'snes9x',
    rom:  'https://dl.emulatorjs.org/roms/snes/Chrono%20Trigger%20(USA).zip'
  },
  'super-metroid': {
    name: 'Super Metroid',
    core: 'snes9x',
    rom:  'https://dl.emulatorjs.org/roms/snes/Super%20Metroid%20(Japan%2C%20USA)%20(En%2CJa).zip'
  },
  'street-fighter-ii': {
    name: 'Street Fighter II Turbo',
    core: 'snes9x',
    rom:  'https://dl.emulatorjs.org/roms/snes/Street%20Fighter%20II%20Turbo%20-%20Hyper%20Fighting%20(USA).zip'
  },
  'final-fantasy-vi': {
    name: 'Final Fantasy VI',
    core: 'snes9x',
    rom:  'https://dl.emulatorjs.org/roms/snes/Final%20Fantasy%20III%20(USA)%20(Rev%201).zip'
  },
  'super-mario-kart': {
    name: 'Super Mario Kart',
    core: 'snes9x',
    rom:  'https://dl.emulatorjs.org/roms/snes/Super%20Mario%20Kart%20(USA).zip'
  }
};

let emuLoaded = false;

function loadGame(gameKey) {
  const game = GAMES[gameKey];
  if (!game) return;

  const placeholder    = document.getElementById('emuPlaceholder');
  const emuContainer   = document.getElementById('emuContainer');
  const nowPlayingText = document.getElementById('nowPlayingText');

  /* Highlight active card */
  document.querySelectorAll('.card').forEach(c => c.classList.remove('active-game'));
  const target = document.querySelector(`.card[data-game="${gameKey}"]`);
  if (target) target.classList.add('active-game');

  nowPlayingText.textContent = '▶ ' + game.name.toUpperCase();
  showToast('🎮 Carregando: ' + game.name + '...<br><span style="font-size:0.45rem;color:#9b30ff">Iniciando EmulatorJS</span>');

  /* Clear previous emulator instance */
  emuContainer.innerHTML = '';
  placeholder.style.display = 'none';
  emuContainer.style.display = 'block';

  /* EmulatorJS config — injetado dinamicamente para cada jogo */
  window.EJS_player       = '#emuContainer';
  window.EJS_gameName     = game.name;
  window.EJS_biosUrl      = '';
  window.EJS_gameUrl      = game.rom;
  window.EJS_core         = game.core;
  window.EJS_pathtodata   = 'https://cdn.emulatorjs.org/stable/data/';
  window.EJS_startOnLoaded = true;
  window.EJS_color        = '#9b30ff';
  window.EJS_backgroundColor = '#07050f';
  window.EJS_language     = 'pt-BR';
  window.EJS_defaultControls = {
    0: {
      0: { value: 'ArrowUp',    value2: '' },
      1: { value: 'ArrowDown',  value2: '' },
      2: { value: 'ArrowLeft',  value2: '' },
      3: { value: 'ArrowRight', value2: '' },
      4: { value: 'Enter',      value2: '' },  /* Start  */
      5: { value: 'ShiftLeft',  value2: '' },  /* Select */
      6: { value: 'KeyZ',       value2: '' },  /* A      */
      7: { value: 'KeyX',       value2: '' },  /* B      */
      8: { value: 'KeyA',       value2: '' },  /* X      */
      9: { value: 'KeyS',       value2: '' },  /* Y      */
      10:{ value: 'KeyQ',       value2: '' },  /* L      */
      11:{ value: 'KeyW',       value2: '' }   /* R      */
    }
  };

  /* Remove script anterior e injeta novo */
  const old = document.getElementById('ejs-loader');
  if (old) old.remove();

  const script = document.createElement('script');
  script.id  = 'ejs-loader';
  script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
  document.body.appendChild(script);

  emuLoaded = true;

  /* Scroll suave até o emulador */
  setTimeout(() => {
    document.getElementById('emulatorSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    bindCursorHover(); /* Re-bind para novos elementos */
  }, 400);
}

/* ── FULLSCREEN ── */
function toggleFullscreen() {
  const wrap = document.getElementById('emuWrap');
  if (!document.fullscreenElement) {
    wrap.requestFullscreen().catch(() => showToast('⚠ Tela cheia bloqueada pelo navegador'));
  } else {
    document.exitFullscreen();
  }
}

/* ── SCROLL TO GAMES ── */
function scrollToGames() {
  document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
}

/* ── NAV FILTER ── */
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    const filter = link.dataset.filter;

    document.querySelectorAll('.card').forEach(card => {
      const genre = card.dataset.genre;
      const show  = (filter === 'all' || genre === filter);
      card.style.display = show ? '' : 'none';
      if (show) {
        card.style.animation = 'none';
        void card.offsetHeight;
        card.style.animation = '';
      }
    });
  });
});

/* ── COUNT-UP ANIMATION ── */
function countUp(el, target, duration = 1800) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start).toLocaleString('pt-BR');
    if (start >= target) clearInterval(timer);
  }, 16);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('[data-count]').forEach(el => {
        countUp(el, parseInt(el.dataset.count));
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

/* ── CARD ENTRANCE ANIMATION ── */
const cardObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity    = '1';
        entry.target.style.transform  = 'translateY(0)';
      }, i * 80);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card').forEach(card => {
  card.style.opacity    = '0';
  card.style.transform  = 'translateY(30px)';
  card.style.transition = 'opacity .5s ease, transform .5s ease, box-shadow .25s, border-color .25s';
  cardObserver.observe(card);
});

/* ── PARALLAX HERO GRID ── */
window.addEventListener('scroll', () => {
  const grid = document.querySelector('.hero-grid');
  if (grid) {
    const scrolled = window.scrollY;
    grid.style.transform = `rotateX(35deg) translateY(calc(-20% + ${scrolled * 0.15}px))`;
  }
});
