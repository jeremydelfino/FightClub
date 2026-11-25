// Manette téléphone : rejoindre une room, choisir son perso, jouer.
import { loadRoster } from './shared/roster.js';
import { drawFrame } from './shared/sprites.js';
import { fillTicker } from './shared/news.js';

const $ = (s) => document.querySelector(s);
const store = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};
const session = {
  get(k) {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      if (v == null) sessionStorage.removeItem(k);
      else sessionStorage.setItem(k, v);
    } catch {}
  },
};

// crypto.randomUUID n'existe pas en http:// sur le réseau local
let clientId = store.get('fc_client');
if (!clientId) {
  clientId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  store.set('fc_client', clientId);
}

const S = { ws: null, code: '', name: '', want: false, retry: 0, roster: [], st: null, view: 'join', charIdx: 0 };
const inp = { x: 0, y: 0, a: false, b: false, j: false, s: false };

// ---------------------------------------------------------------- vues

function show(view) {
  if (S.view === 'pad' && view !== 'pad') releaseAll();
  S.view = view;
  for (const v of document.querySelectorAll('.view')) v.classList.toggle('active', v.id === `view-${view}`);
  if (view === 'pad') enterPad();
}

function banner(text) {
  const b = $('#banner');
  b.textContent = text || '';
  b.classList.toggle('hidden', !text);
}

// ---------------------------------------------------------------- retour tactile
// Android : API vibrate. iPhone (iOS 18+) : pas d'API vibrate, mais basculer un <input switch>
// déclenche le petit « tic » haptique du système. On garde un interrupteur caché pour ça.
// En plus, un clic sonore très court (option) donne la sensation de bouton sur tous les téléphones.
const opts = {
  haptics: store.get('fc_haptics') !== '0',
  click: store.get('fc_click') !== '0',
  size: store.get('fc_size') || 'm',
  hand: store.get('fc_hand') || 'r',
};
// iPhone : Safari n'a pas navigator.vibrate. Le seul moyen est de basculer un <input switch> (iOS 18+),
// et iOS ne joue le « tic » que pendant un vrai geste de l'utilisateur. On le déclenche donc dans les
// gestionnaires tactiles : à l'appui (quand iOS l'accepte) et au relâchement (toujours accepté),
// comme un vrai bouton qui fait « clic-clac ». Les vibrations venues de l'écran (coup reçu)
// attendent le prochain toucher.
const UA = navigator.userAgent;
const IOS = /iP(hone|ad|od)/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const IOS_VER = IOS ? parseFloat((UA.match(/OS (\d+)[._](\d+)/) || [0, 0, 0]).slice(1).join('.')) || 0 : 0;
const canVibrate = !IOS && typeof navigator.vibrate === 'function';
let iosSwitch = null, inGesture = false, pendingTicks = 0;

function iosTick() {
  if (!iosSwitch) {
    // affiché mais invisible : un élément en display:none ne fait pas vibrer sur certaines versions
    iosSwitch = document.createElement('label');
    iosSwitch.ariaHidden = 'true';
    iosSwitch.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;overflow:hidden;pointer-events:none;';
    const i = document.createElement('input');
    i.type = 'checkbox';
    i.setAttribute('switch', '');
    i.tabIndex = -1;
    iosSwitch.appendChild(i);
    document.body.appendChild(iosSwitch);
  }
  try {
    iosSwitch.click();
  } catch {}
}

function iosTicks(n) {
  iosTick();
  for (let k = 1; k < n; k++) setTimeout(iosTick, k * 75);
}

/** Les clics et changements d'options sont des gestes : iOS accepte d'y faire vibrer. */
for (const type of ['click', 'change', 'touchend', 'pointerup']) {
  document.addEventListener(type, () => {
    inGesture = true;
    setTimeout(() => (inGesture = false), 0);
  }, { capture: true });
}

/** À appeler au début de chaque geste : joue les vibrations en attente (coup reçu pendant qu'on ne touchait pas). */
function flushHaptics() {
  if (!pendingTicks) return;
  const n = pendingTicks;
  pendingTicks = 0;
  iosTicks(n);
}

/** Vibration : ms = durée sur Android ; sur iPhone, 1 tic (léger) à 3 tics (fort). */
function vibrate(ms, force = false) {
  if (!opts.haptics && !force) return;
  try {
    if (canVibrate) {
      if (navigator.userActivation?.hasBeenActive !== false) navigator.vibrate(ms); // Chrome refuse avant le 1er toucher
    } else if (IOS) {
      const n = ms >= 200 ? 3 : ms >= 60 ? 2 : 1;
      if (inGesture) iosTicks(n);
      else pendingTicks = Math.min(3, Math.max(pendingTicks, n));
    }
  } catch {}
}

/** Explication affichée dans les réglages selon le téléphone. */
function hapticNote() {
  if (IOS && IOS_VER && IOS_VER < 18) return `Ton iPhone est en iOS ${Math.floor(IOS_VER)} : la vibration web demande iOS 18. Active plutôt le clic sonore.`;
  if (IOS) return 'Sur iPhone, la vibration se sent surtout au relâchement. Si rien ne vibre : Réglages › Sons et vibrations › « Vibrations du système ».';
  if (!canVibrate) return 'Ce navigateur ne permet pas la vibration : active le clic sonore.';
  return 'Si rien ne vibre, vérifie que le téléphone n’est pas en mode « ne pas déranger » ou économie d’énergie.';
}

let ac = null;
function unlockAudio() {
  try {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ac = new AC();
    }
    if (ac?.state === 'suspended') ac.resume();
  } catch {}
}
/** Clic de bouton : un « toc » sec de 15 ms, plus grave pour les gros boutons. */
function click(pitch = 1) {
  if (!opts.click || !ac || ac.state !== 'running') return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(900 * pitch, t);
  o.frequency.exponentialRampToValueAtTime(260 * pitch, t + 0.025);
  g.gain.setValueAtTime(0.16, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
  o.connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + 0.04);
}
addEventListener('touchend', unlockAudio, { passive: true });
addEventListener('click', unlockAudio);

// ---------------------------------------------------------------- réseau

function send(o) {
  if (S.ws?.readyState === 1) S.ws.send(JSON.stringify(o));
}
const toScreen = (d) => send({ type: 'm', d });

function connect() {
  if (S.ws && S.ws.readyState <= 1) return;
  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
  S.ws = ws;
  ws.onopen = () => {
    S.retry = 0;
    send({ type: 'join', code: S.code, name: S.name, clientId });
  };
  ws.onmessage = (e) => {
    let m;
    try {
      m = JSON.parse(e.data);
    } catch {
      return;
    }
    onMessage(m);
  };
  ws.onclose = () => {
    if (S.ws === ws) S.ws = null;
    if (S.want) {
      banner('Connexion perdue… reconnexion');
      setTimeout(connect, Math.min(4000, 400 * ++S.retry));
    }
  };
}

function leave(msg) {
  S.want = false;
  S.st = null;
  session.set('fc_code', null);
  banner('');
  show('join');
  $('#join-error').textContent = msg || '';
  try {
    S.ws?.close();
  } catch {}
}

function onMessage(m) {
  switch (m.type) {
    case 'joined':
      session.set('fc_code', m.code);
      banner(m.hostOnline ? '' : 'L’écran est hors ligne… on attend');
      if (!S.st) {
        show('lobby');
        renderLobby();
      }
      break;
    case 'error':
    case 'kicked':
      leave(m.msg);
      break;
    case 'room-closed':
      leave('Le bureau de vote a fermé.');
      break;
    case 'host-lost':
      banner('L’écran a quitté l’hémicycle… on attend');
      break;
    case 'host-back':
      banner('');
      break;
    case 'm':
      onScreen(m.d || {});
      break;
  }
}

function onScreen(d) {
  if (d.t === 'state') {
    S.st = d;
    document.documentElement.style.setProperty('--me', d.color);
    if (d.phase === 'lobby' || d.phase === 'queue') {
      show('lobby');
      renderLobby();
    } else if (d.phase === 'fight') {
      show('pad');
      $('#hud-tag').textContent = `P${d.slot + 1}`;
      const ch = S.roster.find((c) => c.id === d.charId);
      if (ch && $('#hud-icon').dataset.id !== ch.id) {
        $('#hud-icon').dataset.id = ch.id;
        $('#hud-icon').src = ch.iconUrl;
      }
    } else if (d.phase === 'results') {
      show('results');
      renderResults();
    }
  } else if (d.t === 'hud') {
    renderHud(d);
  } else if (d.t === 'rumble') {
    vibrate(d.ms);
    hitFlash(d.ms);
  } else if (d.t === 'cd') {
    startCooldown(d.k, d.ms);
  } else if (d.t === 'deny') {
    denySpecial();
  }
}

// ---------------------------------------------------------------- rejoindre

const params = new URLSearchParams(location.search);
const urlRoom = (params.get('room') || '').toUpperCase();
const savedRoom = session.get('fc_code');
$('#code').value = urlRoom || savedRoom || '';
$('#name').value = store.get('fc_name') || '';
$('#code').addEventListener('input', (e) => (e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '')));

function goFullscreen() {
  const el = document.documentElement;
  if (!el.requestFullscreen) return;
  el.requestFullscreen({ navigationUI: 'hide' })
    .then(() => screen.orientation?.lock?.('landscape').catch(() => {}))
    .catch(() => {});
}

function startJoin() {
  S.want = true;
  S.st = null;
  banner('Connexion…');
  connect();
}

$('#join-form').addEventListener('submit', (e) => {
  e.preventDefault();
  S.code = $('#code').value.trim().toUpperCase();
  S.name = $('#name').value.trim().slice(0, 12) || 'Joueur';
  if (S.code.length !== 4) {
    $('#join-error').textContent = 'Le n° du bureau fait 4 lettres.';
    return;
  }
  store.set('fc_name', S.name);
  $('#join-error').textContent = '';
  goFullscreen();
  startJoin();
});

// ---------------------------------------------------------------- lobby

const STAT_BARS = [
  ['Vitesse', (s) => s.runSpeed ?? 2.4, 1.8, 3.0],
  ['Puissance', (s) => s.power ?? 1, 0.85, 1.3],
  ['Poids politique', (s) => s.weight ?? 100, 80, 130],
  ['Bouclier', (s) => s.shieldMax ?? 50, 40, 75],
];

function renderLobby() {
  const st = S.st;
  const queued = st?.phase === 'queue';
  $('#slot-tag').textContent = st && st.slot >= 0 ? `P${st.slot + 1}` : '…';
  $('#lobby-name').textContent = S.name;
  if (st?.charId) S.charIdx = Math.max(0, S.roster.findIndex((c) => c.id === st.charId));
  const c = S.roster[S.charIdx];
  $('#char-name').textContent = c ? c.name : '—';
  const src = c?.portraitUrl || '';
  if ($('#portrait').dataset.src !== src) {
    $('#portrait').dataset.src = src;
    $('#portrait').src = src;
  }
  document.documentElement.style.setProperty('--theme', c?.theme || '#2f6bff');
  $('#char-class').textContent = c?.class || '';
  $('#char-slogan').textContent = c?.slogan ? `« ${c.slogan} »` : '';
  $('#char-desc').textContent = c?.description || '';
  const sp = c?.specials || {};
  $('#char-specials').innerHTML = [['B', 'neutral'], ['B →', 'side'], ['B ↑', 'up'], ['B ↓', 'down']]
    .filter(([, k]) => sp[k])
    .map(([label, k]) => `<dt>${label}</dt><dd>${esc(sp[k])}</dd>`)
    .join('');
  $('#char-stats').innerHTML = c
    ? STAT_BARS.map(([label, get, lo, hi]) => {
        const n = Math.max(1, Math.min(5, Math.round(1 + ((get(c.stats || {}) - lo) / (hi - lo)) * 4)));
        return `<dt>${label}</dt><dd>${'<i class="on"></i>'.repeat(n)}${'<i></i>'.repeat(5 - n)}</dd>`;
      }).join('')
    : '';

  const ready = !!st?.ready;
  const btn = $('#ready');
  btn.textContent = ready ? 'Candidature déposée ✓' : 'Déposer ma candidature';
  btn.classList.toggle('on', ready);
  btn.disabled = !st || queued;

  const others = st ? st.players.filter((p) => p.slot !== st.slot) : [];
  for (const tile of document.querySelectorAll('#char-grid .tile')) {
    const id = S.roster[+tile.dataset.i].id;
    tile.classList.toggle('sel', +tile.dataset.i === S.charIdx);
    tile.disabled = ready || queued || !st;
    const rival = others.find((p) => p.charId === id);
    tile.querySelector('.other').textContent = rival ? `P${rival.slot + 1}` : '';
    tile.querySelector('.other').hidden = !rival;
  }

  let status = '';
  if (!st) status = 'Ouverture du bureau de vote…';
  else if (queued) status = 'Débat en cours : tu te présentes au prochain scrutin';
  else {
    status = others.length
      ? others.map((p) => `P${p.slot + 1} ${p.name} ${p.ready ? '✓' : '…'}`).join(' · ')
      : 'Pas encore d’adversaire. Une élection sans opposition, c’est louche.';
  }
  $('#lobby-status').textContent = status;
}

function pickChar(i) {
  if (!S.st || S.st.ready || S.st.phase !== 'lobby' || !S.roster[i]) return;
  S.charIdx = i;
  S.st.charId = S.roster[i].id;
  toScreen({ t: 'char', id: S.st.charId });
  vibrate(10);
  renderLobby();
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function buildGrid() {
  $('#char-grid').innerHTML = S.roster
    .map((c, i) => `<button type="button" class="tile" data-i="${i}" style="--t:${esc(c.theme)}"><img src="${c.iconUrl}" alt=""><span>${esc(c.short || c.name)}</span><i class="other" hidden></i></button>`)
    .join('');
}

$('#char-grid').addEventListener('click', (e) => {
  const tile = e.target.closest('.tile');
  if (tile) pickChar(+tile.dataset.i);
});
$('#ready').addEventListener('click', () => {
  if (!S.st) return;
  toScreen({ t: 'ready', v: !S.st.ready });
  vibrate(20);
});

function previewLoop(now) {
  if (S.view === 'lobby' && S.roster.length) {
    const cv = $('#preview');
    const c = cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, cv.width, cv.height);
    const ch = S.roster[S.charIdx];
    const tick = Math.floor(now / 16.67);
    // le sprite en pied, devant l'illustration du perso
    const fr = ch.gfx.get(S.st?.ready ? 'victory' : 'idle', tick);
    const k = Math.min(5, (cv.height - 8) / (fr.sh * (fr.scale || 1)));
    c.translate(cv.width / 2, cv.height - 3);
    c.scale(k, k);
    drawFrame(c, fr);
  }
  requestAnimationFrame(previewLoop);
}

// ---------------------------------------------------------------- manette

function renderHud(d) {
  const p = $('#hud-percent');
  if (p.textContent !== `${d.percent}%` && d.percent > 0) {
    p.classList.remove('bump');
    void p.offsetWidth;
    p.classList.add('bump');
  }
  p.textContent = `${d.percent}%`;
  const k = Math.min(1, d.percent / 150);
  p.style.color = `rgb(255, ${Math.round(255 - k * 190)}, ${Math.round(255 - k * 215)})`;
  $('#hud-stocks').textContent = '■'.repeat(Math.max(0, d.stocks));
}

function renderResults() {
  const st = S.st;
  const jokes = st.won
    ? ['Promesses non tenues : toutes. Bravo !', 'Le peuple a parlé. Enfin, deux personnes.', 'Tu prends tes fonctions dans 0 seconde.']
    : ['Il te reste les élections européennes.', 'Reconversion conseillée : chroniqueur télé.', 'Recours déposé, rejeté dans la foulée.'];
  $('#result-title').textContent = st.won ? 'ÉLU !' : 'BATTU';
  $('#result-sub').textContent = jokes[(Math.random() * jokes.length) | 0];
  const btn = $('#continue');
  btn.disabled = !!st.done;
  btn.textContent = st.done ? 'En attente des autres…' : 'Nouvelle élection';
}

$('#continue').addEventListener('click', () => {
  toScreen({ t: 'continue' });
  vibrate(20);
});

// Envoi des entrées : les boutons partent tout de suite, le joystick au plus une fois par image.
let sendQueued = false;
function sendInput() {
  sendQueued = false;
  toScreen({ t: 'in', x: inp.x, y: inp.y, a: +inp.a, b: +inp.b, j: +inp.j, s: +inp.s });
}
function queueSend() {
  if (!sendQueued) {
    sendQueued = true;
    requestAnimationFrame(sendInput);
  }
}

// Toute la manette passe par un seul gestionnaire tactile posé sur l'écran entier :
// chaque doigt est suivi par son identifiant, et on bloque tous les gestes du navigateur
// (zoom à deux doigts, double-tap, défilement) qui gênaient le jeu.
// - Côté joystick : joystick flottant, il apparaît sous le pouce et le suit s'il dépasse le rayon.
// - Côté boutons : un appui déclenche le bouton le plus proche, même entre deux boutons,
//   et on peut glisser le pouce d'un bouton à l'autre sans le lever.
const pad = $('#view-pad'), base = $('#stick-base'), knob = $('#stick-knob'), sector = $('#stick-sector'), hint = $('#stick-hint');
const STICK_ZONE = 0.45; // part de l'écran réservée au joystick
const DEAD = 0.15; // zone morte du joystick
let R = 56; // rayon du joystick en px écran (recalculé selon la taille de l'écran)
const BUTTONS = [...document.querySelectorAll('.pbtn')].map((el) => ({ el, k: el.dataset.k, cx: 0, cy: 0, r: 1 }));
const fingers = new Map(); // identifiant du doigt -> { kind: 'stick' } | { kind: 'btn', k } | { kind: 'none' }
let stickId = null, ox = 0, oy = 0, stickDir = -1, stickRim = false, lastTick = 0;
let tapJumpUntil = 0;
let tapJump = store.get('fc_tapjump') !== '0';
let tapArmed = true; // le saut au joystick se réarme dès qu'on relâche un peu vers le haut
let restX = 0, restY = 0;
const lefty = () => opts.hand === 'l';

// Disposition en arc autour du pouce, en fractions de la hauteur de l'écran, depuis le coin bas.
// ATTAQUE (le plus gros) là où le pouce se pose ; SPÉCIAL juste à côté ; SAUT au-dessus ; BOUCLIER en haut à gauche.
// ATTAQUE et SPÉCIAL sont les deux gros boutons côte à côte, à hauteur du pouce : on passe de l'un
// à l'autre sans viser. w : poids de la zone de toucher (un appui entre deux boutons va au plus « lourd »).
const LAYOUT = {
  a: { dx: 0.25, dy: 0.36, d: 0.29, w: 1 },
  b: { dx: 0.565, dy: 0.26, d: 0.285, w: 1.12 },
  j: { dx: 0.17, dy: 0.735, d: 0.22, w: 1 },
  s: { dx: 0.52, dy: 0.615, d: 0.18, w: 0.9 },
};
const SIZE = { s: 0.88, m: 1, l: 1.12 };
const PITCH = { a: 0.8, b: 1, j: 1.25, s: 1.1 };

function safeInsets() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const r = { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
  probe.remove();
  return r;
}

/** Place les boutons, les pastilles de recharge et le joystick d'après la taille de l'écran et les réglages. */
function layoutPad() {
  const W = innerWidth, H = innerHeight, ins = safeInsets();
  document.body.classList.toggle('lefty', lefty());
  const u = Math.min(H, W * 0.5) * SIZE[opts.size];
  const sx = (dx) => (lefty() ? ins.l + 4 + dx * u : W - ins.r - 4 - dx * u);
  const sy = (dy) => H - Math.max(ins.b, 2) - dy * u;
  for (const b of BUTTONS) {
    const L = LAYOUT[b.k];
    b.cx = sx(L.dx);
    b.cy = sy(L.dy);
    b.r = (L.d * u) / 2;
    b.w = L.w;
    b.el.style.setProperty('--d', `${L.d * u}px`);
    b.el.style.transform = `translate(${b.cx}px, ${b.cy}px)`;
  }
  const sp = BUTTONS.find((b) => b.k === 'b');
  // pastilles de recharge collées au-dessus de SPÉCIAL, côté opposé au pouce
  $('#cd-pips').style.transform = `translate(${sp.cx + (lefty() ? 1 : -1) * sp.r * 0.15}px, ${sp.cy - sp.r - 20}px) translate(-50%, -50%)`;
  R = Math.round(Math.max(46, Math.min(74, H * 0.15)));
  base.style.setProperty('--r', `${R}px`);
  restX = lefty() ? W - W * STICK_ZONE * 0.5 : W * STICK_ZONE * 0.48;
  restY = H * 0.6;
  hint.style.transform = `translate(${restX}px, ${restY + R * 1.3}px) translate(-50%, 0)`;
}

function nearestButton(x, y) {
  let best = null, bestD = Infinity;
  for (const b of BUTTONS) {
    const d = Math.hypot(x - b.cx, y - b.cy) / (b.r * b.w);
    if (d < bestD) {
      bestD = d;
      best = b;
    }
  }
  return bestD < 2.1 ? best.k : null;
}

function placeBase(x, y) {
  base.style.transform = `translate(${x}px, ${y}px)`;
}

function resetStick() {
  placeBase(restX, restY);
  knob.style.transform = '';
  base.classList.remove('active', 'rim');
  sector.style.opacity = 0;
  stickDir = -1;
  stickRim = false;
}

function setStick(x, y) {
  // Arrondi au 1/20 : assez fin pour le jeu, et bien moins de messages sur le Wi-Fi.
  x = Math.round(x * 20) / 20;
  y = Math.round(y * 20) / 20;
  if (x === inp.x && y === inp.y) return;
  // Saut en poussant le joystick vers le haut (option des réglages). Pour le double saut,
  // il suffit de relâcher un peu le joystick puis de repousser vers le haut.
  if (y > -0.4) tapArmed = true;
  if (tapJump && tapArmed && y < -0.6) {
    tapArmed = false;
    tapJumpUntil = performance.now() + 110;
    setTimeout(refreshButtons, 120);
  }
  inp.x = x;
  inp.y = y;
  if (!refreshButtons()) queueSend();
}

/** Petit tic quand le joystick change de cran (8 directions) ou touche le bord : on « sent » la direction. */
function stickFeedback(dx, dy, m) {
  const now = performance.now();
  const dir = m > 0.45 ? (Math.round(Math.atan2(dx, -dy) / (Math.PI / 4)) + 8) % 8 : -1;
  if (dir !== stickDir) {
    stickDir = dir;
    sector.style.opacity = dir < 0 ? 0 : 0.55;
    if (dir >= 0) {
      sector.style.transform = `rotate(${dir * 45}deg)`;
      if (now - lastTick > 60) {
        lastTick = now;
        vibrate(5);
      }
    }
  }
  const rim = m > 0.95;
  if (rim !== stickRim) {
    stickRim = rim;
    base.classList.toggle('rim', rim);
    if (rim) {
      sector.style.opacity = 0.9;
      if (now - lastTick > 40) {
        lastTick = now;
        vibrate(9);
      }
    } else if (dir >= 0) sector.style.opacity = 0.55;
  }
}

function moveStick(x, y) {
  let dx = x - ox, dy = y - oy;
  const d = Math.hypot(dx, dy);
  if (d > R) {
    const k = (d - R) / d;
    ox += dx * k;
    oy += dy * k;
    dx -= dx * k;
    dy -= dy * k;
    placeBase(ox, oy);
  }
  knob.style.transform = `translate(${dx}px, ${dy}px)`;
  const m = Math.hypot(dx, dy) / R;
  stickFeedback(dx, dy, m);
  if (m < DEAD) return setStick(0, 0);
  const s = Math.min(1, (m - DEAD) / (1 - DEAD)) / m;
  setStick((dx / R) * s, (dy / R) * s);
}

/** Recalcule l'état des 4 boutons d'après les doigts posés ; renvoie true si un message est parti. */
function refreshButtons() {
  let changed = false;
  for (const b of BUTTONS) {
    let on = false;
    for (const f of fingers.values()) if (f.kind === 'btn' && f.k === b.k) on = true;
    if (b.k === 'j' && performance.now() < tapJumpUntil) on = true;
    if (on !== inp[b.k]) {
      inp[b.k] = on;
      b.el.classList.toggle('on', on);
      changed = true;
      if (on) pressFeedback(b);
    }
  }
  if (changed) sendInput();
  return changed;
}

function pressFeedback(b) {
  vibrate(b.k === 'a' ? 14 : 10);
  click(PITCH[b.k]);
  const r = document.createElement('span');
  r.className = 'ripple';
  b.el.querySelector('.cap').appendChild(r);
  setTimeout(() => r.remove(), 380);
}

function inStickZone(x) {
  return lefty() ? x > innerWidth * (1 - STICK_ZONE) : x < innerWidth * STICK_ZONE;
}

function onGear(x, y) {
  const g = $('#pad-gear').getBoundingClientRect();
  return x > g.left - 8 && x < g.right + 8 && y > g.top - 8 && y < g.bottom + 8;
}

function fingerDown(id, x, y) {
  if (onGear(x, y)) {
    fingers.set(id, { kind: 'none' });
    openSettings();
    return;
  }
  if (inStickZone(x)) {
    if (stickId !== null) return fingers.set(id, { kind: 'none' });
    stickId = id;
    fingers.set(id, { kind: 'stick' });
    ox = x;
    oy = y;
    placeBase(x, y);
    base.classList.add('active');
    hint.classList.add('hide');
    moveStick(x, y);
  } else {
    fingers.set(id, { kind: 'btn', k: nearestButton(x, y) });
  }
}

function fingerMove(id, x, y) {
  const f = fingers.get(id);
  if (!f) return;
  if (f.kind === 'stick') moveStick(x, y);
  else if (f.kind === 'btn') f.k = nearestButton(x, y) ?? f.k;
}

function fingerUp(id) {
  const f = fingers.get(id);
  if (!f) return;
  fingers.delete(id);
  if (f.kind === 'stick') {
    stickId = null;
    resetStick();
    setStick(0, 0);
  }
}

function onTouch(e) {
  e.preventDefault();
  inGesture = true;
  if (e.type !== 'touchmove') flushHaptics();
  for (const t of e.changedTouches) {
    if (e.type === 'touchstart') fingerDown(t.identifier, t.clientX, t.clientY);
    else if (e.type === 'touchmove') fingerMove(t.identifier, t.clientX, t.clientY);
    else {
      // iPhone : « clac » du relâchement, le seul moment où iOS accepte toujours de vibrer
      const f = fingers.get(t.identifier);
      if (IOS && opts.haptics && e.type === 'touchend' && f?.kind === 'btn' && f.k) iosTick();
      fingerUp(t.identifier);
    }
  }
  refreshButtons();
  inGesture = false;
}
for (const type of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) pad.addEventListener(type, onTouch, { passive: false });

// Souris (test sur ordinateur) : même logique, un seul « doigt ».
pad.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse') return;
  fingerDown('mouse', e.clientX, e.clientY);
  refreshButtons();
});
addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse' && fingers.has('mouse')) {
    fingerMove('mouse', e.clientX, e.clientY);
    refreshButtons();
  }
});
addEventListener('pointerup', (e) => {
  if (e.pointerType === 'mouse' && fingers.has('mouse')) {
    fingerUp('mouse');
    refreshButtons();
  }
});

function releaseAll() {
  fingers.clear();
  stickId = null;
  tapJumpUntil = 0;
  Object.assign(inp, { x: 0, y: 0, a: false, b: false, j: false, s: false });
  for (const b of BUTTONS) b.el.classList.remove('on');
  resetStick();
  sendInput();
}

/** Appelé en entrant dans la manette : annule un éventuel zoom et place les boutons. */
function enterPad() {
  const vp = document.querySelector('meta[name=viewport]');
  vp.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
  window.scrollTo(0, 0);
  hint.classList.remove('hide');
  resetCooldowns();
  requestAnimationFrame(() => {
    layoutPad();
    resetStick();
  });
}

// ---------------------------------------------------------------- coups reçus, recharges

function hitFlash(ms) {
  const el = $('#hit-flash');
  el.style.setProperty('--a', Math.min(0.9, 0.25 + ms / 300).toFixed(2));
  el.style.setProperty('--d', `${Math.max(200, ms * 1.6)}ms`);
  el.classList.remove('on');
  void el.offsetWidth;
  el.classList.add('on');
}

const pipTimers = {};
function startCooldown(k, ms) {
  const pip = $(`#cd-pips i[data-k="${k}"]`);
  if (!pip) return;
  pip.hidden = false;
  clearTimeout(pipTimers[k]);
  pip.classList.remove('ready', 'pop', 'run');
  pip.style.setProperty('--ms', `${ms}ms`);
  void pip.offsetWidth;
  pip.classList.add('run');
  pipTimers[k] = setTimeout(() => {
    pip.classList.remove('run');
    pip.classList.add('ready', 'pop');
  }, ms);
}

function resetCooldowns() {
  for (const pip of document.querySelectorAll('#cd-pips i')) {
    clearTimeout(pipTimers[pip.dataset.k]);
    pip.classList.remove('run', 'pop');
    pip.classList.add('ready');
  }
}

function denySpecial() {
  const el = $('.pbtn.special');
  el.classList.remove('deny');
  void el.offsetWidth;
  el.classList.add('deny');
  setTimeout(() => el.classList.remove('deny'), 320);
  vibrate(70);
}

// ---------------------------------------------------------------- réglages

const sheet = $('#settings');
function openSettings() {
  releaseAll();
  syncSettings();
  sheet.classList.remove('hidden');
}
function closeSettings() {
  sheet.classList.add('hidden');
  if (S.view === 'pad') {
    layoutPad();
    resetStick();
  }
}
$('#test-haptics').addEventListener('click', () => {
  vibrate(70, true);
  click(1);
});
$('#haptic-note').textContent = hapticNote();

function syncSettings() {
  $('#opt-haptics').checked = opts.haptics;
  $('#opt-click').checked = opts.click;
  $('#tapjump').checked = tapJump;
  for (const seg of document.querySelectorAll('.seg')) {
    for (const b of seg.querySelectorAll('button')) b.classList.toggle('on', b.dataset.v === opts[seg.dataset.opt]);
  }
}
$('#open-settings').addEventListener('click', openSettings);
$('#settings-close').addEventListener('click', closeSettings);
sheet.addEventListener('click', (e) => {
  if (e.target === sheet) closeSettings();
});
$('#opt-haptics').addEventListener('change', (e) => {
  opts.haptics = e.target.checked;
  store.set('fc_haptics', opts.haptics ? '1' : '0');
  vibrate(20);
});
$('#opt-click').addEventListener('change', (e) => {
  opts.click = e.target.checked;
  store.set('fc_click', opts.click ? '1' : '0');
  unlockAudio();
  setTimeout(() => click(1), 30);
});
$('#tapjump').addEventListener('change', (e) => {
  tapJump = e.target.checked;
  store.set('fc_tapjump', tapJump ? '1' : '0');
});
for (const seg of document.querySelectorAll('.seg')) {
  seg.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    opts[seg.dataset.opt] = b.dataset.v;
    store.set(`fc_${seg.dataset.opt}`, b.dataset.v);
    vibrate(8);
    syncSettings();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !sheet.classList.contains('hidden')) closeSettings();
});
document.body.classList.toggle('lefty', lefty());

// Empêche zoom, double-tap, défilement et menu contextuel sur la manette
document.addEventListener('contextmenu', (e) => e.preventDefault());
for (const type of ['gesturestart', 'gesturechange', 'gestureend', 'dblclick']) document.addEventListener(type, (e) => e.preventDefault(), { passive: false });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) releaseAll();
  else if (S.want && !S.ws) connect();
});
addEventListener('resize', () => {
  if (S.view !== 'pad') return;
  layoutPad();
  if (stickId === null) resetStick();
});

// ---------------------------------------------------------------- démarrage

(async () => {
  try {
    S.roster = await loadRoster({ sd: true });
    buildGrid();
    if (S.view === 'lobby') renderLobby();
  } catch (e) {
    $('#join-error').textContent = 'Impossible de charger les personnages.';
    console.error(e);
  }
  requestAnimationFrame(previewLoop);
  fillTicker($('#ticker-text'));
  // Rechargement de la page en cours de partie : on rejoint automatiquement.
  const name = store.get('fc_name');
  if (savedRoom && name && (!urlRoom || urlRoom === savedRoom)) {
    S.code = savedRoom;
    S.name = name;
    startJoin();
  }
})();
