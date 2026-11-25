// Écran principal : crée la room, gère le lobby, lance les parties et affiche le combat.
import { loadRoster } from '../shared/roster.js';
import { drawFrame } from '../shared/sprites.js';
import { fillTicker } from '../shared/news.js';
import { drawFlag } from '../shared/flags.js';
import { Game } from './game.js';
import { STAGE, renderScenery } from './stage.js';
import { SFX } from './audio.js';
import { CPU, Keyboard, blankInput } from './input.js';

const SLOT_COLORS = ['#e5383b', '#2f6bff'];
const MAX_PLAYERS = 2;
const STOCKS = 3;
const STEP = 1000 / 60;
const TYPE_LABEL = { phone: 'TÉLÉPHONE', keyboard: 'CLAVIER', cpu: 'CPU' };

const $ = (s) => document.querySelector(s);
const canvas = $('#game');
const ctx = canvas.getContext('2d');
const sfx = new SFX();
const keyboard = new Keyboard();

let roster = [];
let players = []; // joueurs actifs (max 2), triés par slot
let queue = []; // téléphones arrivés pendant une partie
let phase = 'lobby'; // lobby | fight | results
let game = null;
let ws = null;
let lastWinner = null;
let startTimer = null;
let W = 0, H = 0;
let idleT = 0;
const idleCam = { x: 240, y: 150, zoom: 1 };

const slotEls = [...document.querySelectorAll('.poster')].map((el) => ({
  card: el,
  cv: el.querySelector('canvas'),
  portrait: el.querySelector('.portrait'),
  name: el.querySelector('.name'),
  type: el.querySelector('.type'),
  char: el.querySelector('.char'),
  slogan: el.querySelector('.slogan'),
  status: el.querySelector('.status'),
}));

// ---------------------------------------------------------------- réseau

function connect() {
  ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
  ws.onopen = () => {
    toast('#conn', '');
    ws.send(JSON.stringify({ type: 'host', code: sessionStorage.getItem('fc_room') }));
  };
  ws.onmessage = (e) => {
    let m;
    try {
      m = JSON.parse(e.data);
    } catch {
      return;
    }
    onNet(m);
  };
  ws.onclose = () => {
    toast('#conn', 'Serveur injoignable… reconnexion');
    setTimeout(connect, 1500);
  };
}

function net(msg) {
  if (ws?.readyState === 1) ws.send(JSON.stringify(msg));
}

function sendTo(p, d) {
  if (p.type === 'phone' && p.connected) net({ type: 'to', id: p.id, d });
}

function kick(id, reason) {
  net({ type: 'kick', id, reason });
}

function onNet(m) {
  switch (m.type) {
    case 'hosted':
      sessionStorage.setItem('fc_room', m.code);
      $('#room-code').textContent = m.code;
      $('#join-url').textContent = m.address;
      $('#qr').innerHTML = m.qr;
      showDevices(m.devices);
      break;
    case 'devices':
      showDevices(m.count);
      break;
    case 'player-join':
      onPhoneJoin(m.id, m.name);
      break;
    case 'player-leave':
      onPhoneLeave(m.id);
      break;
    case 'player-remove':
      onPhoneRemove(m.id);
      break;
    case 'm':
      onPhoneMsg(m.id, m.d || {});
      break;
  }
}

// Nombre d'appareils du réseau qui ont réussi à ouvrir la page : si ça reste à 0
// alors qu'un téléphone essaie, c'est le Wi-Fi qui bloque, pas le jeu.
function showDevices(n) {
  const el = $('#net-status');
  el.classList.toggle('ok', n > 0);
  el.textContent = n > 0
    ? `${n} appareil${n > 1 ? 's ont' : ' a'} atteint ce Mac`
    : 'Aucun téléphone n’a encore atteint ce Mac';
}

// ---------------------------------------------------------------- joueurs

const findPlayer = (id) => players.find((p) => p.id === id) || queue.find((p) => p.id === id);
const charOf = (p) => roster.find((c) => c.id === p.charId) || roster[0];

function freeSlot() {
  for (let s = 0; s < MAX_PLAYERS; s++) if (!players.some((p) => p.slot === s)) return s;
  return -1;
}

function seat(p) {
  const s = freeSlot();
  if (s >= 0) {
    p.slot = s;
    players.push(p);
  } else {
    const bot = players.find((q) => q.type !== 'phone');
    if (!bot) return false;
    p.slot = bot.slot;
    players = players.filter((q) => q !== bot);
    players.push(p);
  }
  if (!p.charId) p.charId = roster[p.slot % roster.length].id;
  players.sort((a, b) => a.slot - b.slot);
  return true;
}

function onPhoneJoin(id, name) {
  const known = findPlayer(id);
  if (known) {
    known.connected = true;
    known.name = name;
  } else {
    const p = { id, name, type: 'phone', connected: true, ready: false, charId: null, input: blankInput(), slot: -1 };
    if (phase === 'lobby') {
      if (!seat(p)) return kick(id, 'Bureau complet.');
    } else queue.push(p);
  }
  refreshLobby();
  syncAll();
}

function onPhoneLeave(id) {
  const p = findPlayer(id);
  if (!p) return;
  p.connected = false;
  Object.assign(p.input, blankInput());
  if (phase === 'lobby' || queue.includes(p)) {
    kick(id);
    dropPlayer(id);
  }
  refreshLobby();
}

function onPhoneRemove(id) {
  if (phase === 'fight' && game && players.some((p) => p.id === id)) game.forfeit(id);
  dropPlayer(id);
  refreshLobby();
  syncAll();
}

function dropPlayer(id) {
  players = players.filter((p) => p.id !== id);
  queue = queue.filter((p) => p.id !== id);
}

function onPhoneMsg(id, d) {
  const p = findPlayer(id);
  if (!p) return;
  switch (d.t) {
    case 'in': {
      const i = p.input;
      i.x = Math.max(-1, Math.min(1, +d.x || 0));
      i.y = Math.max(-1, Math.min(1, +d.y || 0));
      i.a = !!d.a; i.b = !!d.b; i.j = !!d.j; i.s = !!d.s;
      break;
    }
    case 'char':
      if (phase === 'lobby' && !p.ready && roster.some((c) => c.id === d.id)) {
        p.charId = d.id;
        refreshLobby();
        syncAll();
      }
      break;
    case 'ready':
      if (phase === 'lobby' && players.includes(p)) {
        p.ready = !!d.v;
        sfx.ui();
        refreshLobby();
        syncAll();
        checkStart();
      }
      break;
    case 'continue':
      if (phase === 'results') {
        p.done = true;
        syncAll();
        const humans = players.filter((q) => q.type === 'phone' && q.connected);
        if (humans.every((q) => q.done)) backToLobby();
      }
      break;
  }
}

function addLocal(type) {
  if (players.length >= MAX_PLAYERS) return flashMsg('Les 2 places sont prises');
  if (type === 'keyboard' && players.some((p) => p.type === 'keyboard')) return;
  const p = {
    id: type === 'cpu' ? `cpu-${Date.now()}` : 'keyboard',
    type,
    name: type === 'cpu' ? 'CPU' : 'Clavier',
    connected: true,
    ready: type === 'cpu',
    charId: type === 'cpu' ? roster[(Math.random() * roster.length) | 0].id : null,
    input: blankInput(),
    slot: -1,
  };
  seat(p);
  sfx.ui();
  refreshLobby();
  syncAll();
  checkStart();
}

function removeLocal() {
  const local = [...players].reverse().find((p) => p.type !== 'phone');
  if (!local) return;
  dropPlayer(local.id);
  refreshLobby();
  syncAll();
}

function setChar(p, id) {
  if (phase !== 'lobby' || p.charId === id) return;
  p.charId = id;
  sfx.ui();
  refreshLobby();
  syncAll();
}

function cycleChar(p, dir) {
  const i = roster.findIndex((c) => c.id === p.charId);
  setChar(p, roster[(i + dir + roster.length) % roster.length].id);
}

// Un joueur local (clavier ou CPU) peut changer de perso ; les téléphones choisissent chez eux.
const canPickHere = (p) => !!p && (p.type === 'cpu' || (p.type === 'keyboard' && !p.ready));

function pickFromRoster(id) {
  const target = players.find((p) => p.type === 'keyboard' && !p.ready) || [...players].reverse().find((p) => p.type === 'cpu');
  if (target) setChar(target, id);
  else flashMsg('Chaque candidat choisit sur son téléphone');
}

function buildRosterUI() {
  $('#roster').innerHTML = roster
    .map((c) => `<div class="tile" data-id="${escapeHtml(c.id)}" style="--t:${escapeHtml(c.theme)}"><img src="${c.iconUrl}" alt=""><span class="tname">${escapeHtml(c.short || c.name)}</span><span class="marks"></span></div>`)
    .join('');
  $('#roster').addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (tile) pickFromRoster(tile.dataset.id);
  });
  slotEls.forEach((el, s) =>
    el.card.addEventListener('click', () => {
      const p = players.find((q) => q.slot === s);
      if (canPickHere(p)) cycleChar(p, 1);
    }),
  );
}

function stateFor(p) {
  return {
    t: 'state',
    phase: queue.includes(p) ? 'queue' : phase,
    slot: p.slot,
    color: SLOT_COLORS[p.slot] || '#9c8fc4',
    charId: p.charId,
    ready: p.ready,
    done: !!p.done,
    won: lastWinner === p.id,
    players: players.map((q) => ({ name: q.name, charId: q.charId, ready: q.ready, slot: q.slot, type: q.type })),
  };
}

function syncAll() {
  for (const p of [...players, ...queue]) {
    sendTo(p, stateFor(p));
    // manette rechargée en plein combat : on lui renvoie tout de suite son % et ses vies
    const f = phase === 'fight' && game?.fighters.find((q) => q.id === p.id);
    if (f) sendTo(p, { t: 'hud', percent: Math.floor(f.percent), stocks: f.stocks });
  }
}

// ---------------------------------------------------------------- phases

function checkStart() {
  if (phase !== 'lobby' || startTimer) return;
  if (players.length === MAX_PLAYERS && players.every((p) => p.ready)) {
    startTimer = setTimeout(() => {
      startTimer = null;
      if (phase === 'lobby' && players.length === MAX_PLAYERS && players.every((p) => p.ready)) startMatch();
    }, 700);
  }
}

async function startMatch() {
  phase = 'fight';
  const same = players[0].charId === players[1].charId;
  if (same) await charOf(players[1]).loadAlt(); // même perso des deux côtés : version recolorée pour P2
  for (const p of players) {
    p.alt = same && p.slot === 1;
    p.done = false;
    Object.assign(p.input, blankInput());
    p.brain = p.type === 'cpu' ? new CPU(p) : null;
  }
  game = new Game({ players, roster, sfx, stage: STAGE, rules: { stocks: STOCKS }, slotColors: SLOT_COLORS, onEvent: onGameEvent });
  $('#lobby').classList.add('hidden');
  $('#results').classList.add('hidden');
  $('#ticker').classList.add('hidden'); // le bandeau d'info cacherait le haut de l'arène
  syncAll();
}

function onGameEvent(e) {
  const p = players.find((q) => q.id === e.id);
  if (e.type === 'hud' && p) sendTo(p, { t: 'hud', percent: e.percent, stocks: e.stocks });
  else if (e.type === 'rumble' && p) sendTo(p, { t: 'rumble', ms: e.ms });
  else if (e.type === 'cd' && p) sendTo(p, { t: 'cd', k: e.k, ms: e.ms }); // recharge d'un spécial, affichée sur la manette
  else if (e.type === 'deny' && p) sendTo(p, { t: 'deny' });
  else if (e.type === 'end') {
    lastWinner = e.winner;
    phase = 'results';
    showResults();
    syncAll();
  }
}

function showResults() {
  const w = game.fighters.find((f) => f.id === lastWinner);
  $('#win-name').textContent = w ? w.player.name : 'Égalité';
  $('#win-name').style.color = w ? w.color : 'inherit';
  $('#results-card').style.setProperty('--c', w ? w.color : 'var(--or)');
  $('#win-portrait').src = w ? w.char.portraitUrl : '';
  $('#win-portrait').classList.toggle('hidden', !w);
  $('#win-char').textContent = w ? [w.char.name, w.char.class].filter(Boolean).join(' · ') : '';
  // Score « officiel » : plus la victoire est large, plus le plébiscite est suspect
  const margin = w ? w.stocks : 0;
  const pct = (50 + margin * 15 + Math.random() * 4).toFixed(2).replace('.', ',');
  $('#win-score').textContent = w ? `Élu avec ${pct} % des voix. Participation : 100 % (2 électeurs).` : 'Ballottage parfait. Tout le monde a perdu.';
  $('#win-stats').innerHTML =
    '<tr><th>Candidat</th><th>KO infligés</th><th>Scandales (chutes)</th><th>Dégâts</th><th>Meilleur combo</th></tr>' +
    game.fighters
      .map((f) => `<tr><td style="color:${f.color}">${escapeHtml(f.player.name)}</td><td>${f.record.kos}</td><td>${f.record.falls}</td><td>${Math.round(f.record.dealt)} %</td><td>${f.record.bestCombo ? `${f.record.bestCombo} coups` : '—'}</td></tr>`)
      .join('');
  $('#results').classList.remove('hidden');
  $('#ticker').classList.remove('hidden');
}

function backToLobby() {
  phase = 'lobby';
  game = null;
  for (const p of players.filter((q) => q.type === 'phone' && !q.connected)) {
    kick(p.id);
    dropPlayer(p.id);
  }
  for (const p of players) {
    p.ready = p.type === 'cpu';
    p.done = false;
  }
  for (const q of queue) if (!seat(q)) kick(q.id, 'Bureau complet.');
  queue = [];
  $('#results').classList.add('hidden');
  $('#pause').classList.add('hidden');
  $('#lobby').classList.remove('hidden');
  $('#ticker').classList.remove('hidden');
  refreshLobby();
  syncAll();
}

// ---------------------------------------------------------------- lobby (DOM)

function refreshLobby() {
  for (let s = 0; s < MAX_PLAYERS; s++) {
    const el = slotEls[s];
    const p = players.find((q) => q.slot === s);
    el.card.classList.toggle('empty', !p);
    el.card.classList.toggle('ready', !!p?.ready);
    el.card.classList.toggle('offline', !!p && p.type === 'phone' && !p.connected);
    el.name.textContent = p ? p.name : 'Candidature vacante';
    const src = p ? charOf(p).portraitUrl : '';
    if (el.portrait.dataset.src !== src) {
      el.portrait.dataset.src = src;
      if (src) el.portrait.src = src;
      else el.portrait.removeAttribute('src');
    }
    el.type.textContent = p ? TYPE_LABEL[p.type] : '';
    el.char.textContent = p ? [charOf(p).name, charOf(p).class].filter(Boolean).join(' · ') : 'Scanne le QR code pour te présenter';
    el.slogan.textContent = p ? `« ${charOf(p).slogan || ''} »` : '';
    el.status.textContent = !p ? '' : p.ready ? 'Prêt à débattre' : p.type === 'keyboard' ? '← → puis Entrée' : 'En pleine réflexion…';
    el.card.classList.toggle('clickable', canPickHere(p));
  }
  for (const tile of document.querySelectorAll('#roster .tile')) {
    const on = players.filter((p) => p.charId === tile.dataset.id);
    tile.classList.toggle('picked', on.length > 0);
    tile.style.setProperty('--c', on.length ? SLOT_COLORS[on[0].slot] : 'transparent');
    tile.querySelector('.marks').innerHTML = on.map((p) => `<i style="background:${SLOT_COLORS[p.slot]}">P${p.slot + 1}</i>`).join('');
  }
  const n = players.length;
  $('#lobby-msg').textContent =
    n < MAX_PLAYERS ? `Quorum non atteint (${n}/${MAX_PLAYERS})` : players.every((p) => p.ready) ? 'Ouverture des urnes…' : 'En attente des dernières candidatures…';
}

let msgTimer = null;
function flashMsg(text) {
  $('#lobby-msg').textContent = text;
  clearTimeout(msgTimer);
  msgTimer = setTimeout(refreshLobby, 1600);
}

function drawPreview(cv, sprite, anim, t, scale, flag) {
  const c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, cv.width, cv.height);
  if (flag) {
    // drapeau du perso en fond de l'affiche
    c.globalAlpha = 0.32;
    drawFlag(c, flag, cv.width * 0.12, cv.height * 0.1, cv.width * 0.76, cv.width * 0.5, t, { pole: false, wave: 1.4 });
    c.globalAlpha = 1;
  }
  const fr = sprite.get(anim, t);
  const k = Math.min(scale, (cv.height - 12) / (fr.sh * (fr.scale || 1))); // le perso tient toujours dans le cadre
  c.translate(cv.width / 2, cv.height - 4);
  c.scale(k, k);
  drawFrame(c, fr);
}

function drawSlotPreviews(t) {
  const same = players.length === 2 && players[0].charId === players[1].charId;
  for (let s = 0; s < MAX_PLAYERS; s++) {
    const p = players.find((q) => q.slot === s);
    const cv = slotEls[s].cv;
    if (!p) {
      cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
      continue;
    }
    const ch = charOf(p);
    if (same && s === 1 && !ch.gfxAlt) ch.loadAlt();
    drawPreview(cv, same && s === 1 && ch.gfxAlt ? ch.gfxAlt : ch.gfx, p.ready ? 'victory' : 'idle', t, 5, null);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function toast(sel, text) {
  const el = $(sel);
  el.textContent = text;
  el.classList.toggle('hidden', !text);
}

// ---------------------------------------------------------------- clavier & son

function unlockAudio() {
  sfx.unlock();
  $('#sound-hint').classList.add('hidden');
}

addEventListener('pointerdown', unlockAudio);
addEventListener('keydown', (e) => {
  unlockAudio();
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  keyboard.keys.add(e.code);
  if (e.code === 'KeyF') toggleFullscreen();
  if (phase === 'lobby') {
    const kb = players.find((p) => p.type === 'keyboard');
    switch (e.code) {
      case 'KeyK': addLocal('keyboard'); break;
      case 'KeyC': addLocal('cpu'); break;
      case 'Delete':
      case 'Backspace': removeLocal(); break;
      case 'ArrowLeft':
      case 'ArrowRight':
        if (kb && !kb.ready) cycleChar(kb, e.code === 'ArrowRight' ? 1 : -1);
        break;
      case 'Enter':
      case 'NumpadEnter':
        if (kb) {
          kb.ready = !kb.ready;
          sfx.ui();
          refreshLobby();
          syncAll();
          checkStart();
        }
        break;
    }
  } else if (phase === 'fight' && e.code === 'Escape') backToLobby();
  else if (phase === 'results' && (e.code === 'Enter' || e.code === 'NumpadEnter')) backToLobby();
});
addEventListener('keyup', (e) => keyboard.keys.delete(e.code));
addEventListener('blur', () => keyboard.keys.clear());

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}

// ---------------------------------------------------------------- boucle

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
  if (w !== W || h !== H) {
    W = canvas.width = w;
    H = canvas.height = h;
    ctx.imageSmoothingEnabled = false;
  }
}

let last = performance.now();
let acc = 0;
function loop(now) {
  resize();
  acc += Math.min(250, now - last);
  last = now;
  if (game) {
    const missing = phase === 'fight' ? players.filter((p) => p.type === 'phone' && !p.connected) : [];
    game.paused = missing.length > 0;
    $('#pause').classList.toggle('hidden', !game.paused);
    if (game.paused) $('#pause-text').textContent = `${missing.map((p) => p.name).join(', ')} a quitté l’hémicycle. On attend son retour…`;

    const kb = players.find((p) => p.type === 'keyboard');
    while (acc >= STEP) {
      acc -= STEP;
      if (kb) keyboard.apply(kb.input);
      if (!game.paused) game.tick();
    }
    game.render(ctx, W, H);
  } else {
    acc = 0;
    idleT++;
    STAGE.update(idleT);
    renderScenery(ctx, W, H, idleCam, Math.min(W / 480, H / 270), idleT);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  const t = Math.floor(now / STEP);
  if (phase === 'lobby') drawSlotPreviews(t);
  if (phase === 'results' && game) {
    const w = game.fighters.find((f) => f.id === lastWinner);
    if (w) drawPreview($('#win-canvas'), w.sprite, 'victory', t, 5, null);
  }
  requestAnimationFrame(loop);
}

async function boot() {
  try {
    fillTicker($('#ticker-text'));
    await Promise.race([
      Promise.all([document.fonts.load('40px Anton'), document.fonts.load('700 16px "Barlow Condensed"'), document.fonts.load('16px "Press Start 2P"')]),
      new Promise((r) => setTimeout(r, 1500)),
    ]);
  } catch {}
  try {
    roster = await loadRoster();
  } catch (e) {
    $('#lobby-msg').textContent = e.message;
    throw e;
  }
  buildRosterUI();
  refreshLobby();
  connect();
  requestAnimationFrame(loop);
}

// Accès depuis la console du navigateur pour déboguer (ex : fightclub.game.fighters[0].percent = 150)
window.fightclub = {
  get game() {
    return game;
  },
  get players() {
    return players;
  },
};

boot();
