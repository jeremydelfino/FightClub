// FightClub — serveur local.
// Sert les fichiers statiques et relaie les messages entre l'écran (qui fait tourner le jeu)
// et les téléphones (manettes) via WebSocket.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT) || 3000;
const MAX_PLAYERS = 2;
const RECONNECT_GRACE_MS = 45_000; // un téléphone qui se met en veille garde sa place
const ROOM_TTL_MS = 120_000;       // une room sans écran est fermée après ce délai

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.md': 'text/plain; charset=utf-8',
};

function lanAddress() {
  const found = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const n of list || []) {
      if (n.family === 'IPv4' && !n.internal) found.push({ name, address: n.address });
    }
  }
  const best =
    found.find((c) => c.name === 'en0') ||
    found.find((c) => /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(c.address)) ||
    found[0];
  return best ? best.address : 'localhost';
}

// ---------------------------------------------------------------- HTTP

// Appareils du réseau qui ont réussi à joindre ce serveur (sert à diagnostiquer le Wi-Fi).
const devices = new Set();

function noteDevice(socket) {
  const ip = String(socket.remoteAddress || '').replace(/^::ffff:/, '');
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === lanAddress() || devices.has(ip)) return;
  devices.add(ip);
  console.log(`  📱 Nouvel appareil sur le réseau : ${ip}`);
  for (const room of rooms.values()) send(room.screen, { type: 'devices', count: devices.size });
}

const server = http.createServer((req, res) => {
  noteDevice(req.socket);
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname);
  } catch {
    res.writeHead(400);
    return res.end();
  }
  if (pathname === '/') pathname = '/index.html';
  if (pathname === '/screen') pathname = '/screen.html';

  const file = path.normalize(path.join(PUBLIC, pathname));
  if (!file.startsWith(PUBLIC + path.sep)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Introuvable');
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

// ---------------------------------------------------------------- Rooms

/** code -> { code, screen: ws|null, players: Map<clientId, {name, ws, graceTimer}>, dropTimer } */
const rooms = new Map();
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sans I ni O pour éviter les confusions

function newCode() {
  let code;
  do {
    code = Array.from({ length: 4 }, () => CODE_CHARS[(Math.random() * CODE_CHARS.length) | 0]).join('');
  } while (rooms.has(code));
  return code;
}

function send(ws, msg) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
}

async function host(ws, msg) {
  let room = msg.code ? rooms.get(String(msg.code)) : null;
  // La room existe déjà avec un écran actif : on en crée une nouvelle.
  if (room && room.screen && room.screen !== ws && room.screen.readyState === 1) room = null;
  if (!room) {
    room = { code: newCode(), screen: null, players: new Map(), dropTimer: null };
    rooms.set(room.code, room);
  }
  clearTimeout(room.dropTimer);
  room.screen = ws;
  ws.role = 'screen';
  ws.room = room;

  const address = `${lanAddress()}:${PORT}`;
  const joinUrl = `http://${address}/?room=${room.code}`;
  let qr = '';
  try {
    qr = await QRCode.toString(joinUrl, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#ffffffff', light: '#00000000' },
    });
  } catch (e) {
    console.warn('QR code impossible :', e.message);
  }
  send(ws, { type: 'hosted', code: room.code, joinUrl, address, qr, devices: devices.size });

  // Écran rechargé : on lui renvoie les joueurs déjà présents.
  for (const [id, p] of room.players) {
    send(ws, { type: 'player-join', id, name: p.name });
    if (!p.ws) send(ws, { type: 'player-leave', id });
    send(p.ws, { type: 'host-back' });
  }
}

function join(ws, msg) {
  const code = String(msg.code || '').toUpperCase().trim();
  const room = rooms.get(code);
  if (!room) return send(ws, { type: 'error', msg: 'Bureau de vote introuvable. Vérifie le n° affiché sur l’écran.' });

  const id = String(msg.clientId || '').slice(0, 64) || Math.random().toString(36).slice(2);
  const name = String(msg.name || '').trim().slice(0, 12) || 'Joueur';

  let p = room.players.get(id);
  if (!p) {
    if (room.players.size >= MAX_PLAYERS) return send(ws, { type: 'error', msg: `Bureau complet (${MAX_PLAYERS} candidats max).` });
    p = { name, ws: null, graceTimer: null };
    room.players.set(id, p);
  } else {
    clearTimeout(p.graceTimer);
    if (p.ws && p.ws !== ws) {
      p.ws.room = null; // l'ancienne connexion ne doit pas déclencher de départ
      p.ws.close();
    }
    p.name = name;
  }
  p.ws = ws;
  ws.role = 'player';
  ws.room = room;
  ws.pid = id;

  send(ws, { type: 'joined', code: room.code, id, hostOnline: !!room.screen });
  send(room.screen, { type: 'player-join', id, name });
}

function removePlayer(room, id, reason) {
  const p = room.players.get(id);
  if (!p) return;
  clearTimeout(p.graceTimer);
  room.players.delete(id);
  if (p.ws) {
    send(p.ws, { type: 'kicked', msg: reason || 'Ta candidature a été retirée.' });
    p.ws.room = null;
    p.ws.close();
  }
  send(room.screen, { type: 'player-remove', id });
}

function onClose(ws) {
  const room = ws.room;
  if (!room) return;
  if (ws.role === 'screen') {
    if (room.screen !== ws) return;
    room.screen = null;
    for (const p of room.players.values()) send(p.ws, { type: 'host-lost' });
    room.dropTimer = setTimeout(() => {
      for (const p of room.players.values()) {
        send(p.ws, { type: 'room-closed' });
        if (p.ws) p.ws.room = null;
      }
      rooms.delete(room.code);
    }, ROOM_TTL_MS);
  } else if (ws.role === 'player') {
    const p = room.players.get(ws.pid);
    if (!p || p.ws !== ws) return;
    p.ws = null;
    send(room.screen, { type: 'player-leave', id: ws.pid });
    p.graceTimer = setTimeout(() => removePlayer(room, ws.pid), RECONNECT_GRACE_MS);
  }
}

function handle(ws, msg) {
  const room = ws.room;
  switch (msg.type) {
    case 'host':
      return host(ws, msg);
    case 'join':
      return join(ws, msg);
    case 'm': // manette -> écran
      if (ws.role === 'player' && room) send(room.screen, { type: 'm', id: ws.pid, d: msg.d });
      return;
    case 'to': // écran -> une manette
      if (ws.role === 'screen' && room) send(room.players.get(msg.id)?.ws, { type: 'm', d: msg.d });
      return;
    case 'all': // écran -> toutes les manettes
      if (ws.role === 'screen' && room) for (const p of room.players.values()) send(p.ws, { type: 'm', d: msg.d });
      return;
    case 'kick':
      if (ws.role === 'screen' && room) removePlayer(room, msg.id, msg.reason);
      return;
  }
}

// ---------------------------------------------------------------- WebSocket

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  noteDevice(req.socket);
  ws.isAlive = true;
  ws.on('pong', () => (ws.isAlive = true));
  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    if (msg && typeof msg === 'object') handle(ws, msg);
  });
  ws.on('close', () => onClose(ws));
  ws.on('error', () => {});
});

// Détecte les téléphones partis en veille sans fermer proprement la connexion.
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
}, 5000);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  Le port ${PORT} est déjà utilisé. Lance avec un autre port :  PORT=3001 npm start\n`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = lanAddress();
  console.log(`
  ███ FIGHTCLUB ███  serveur prêt

  Écran (sur ce Mac)  →  http://localhost:${PORT}/screen
  Téléphones          →  http://${ip}:${PORT}
                         (ou scanne le QR code affiché sur l'écran)

  Les téléphones doivent être sur le même Wi-Fi que ce Mac.
  Une ligne « 📱 Nouvel appareil » s'affiche ici dès qu'un téléphone atteint le serveur.
  Si rien ne s'affiche, le Wi-Fi empêche les appareils de se parler : passe par un partage de connexion.
  Ctrl+C pour arrêter.
`);
});
