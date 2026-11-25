// Bruitages chiptune synthétisés avec WebAudio (aucun fichier son nécessaire).

export class SFX {
  constructor() {
    this.ac = null;
    this.master = null;
    this.noiseBuf = null;
  }

  unlock() {
    if (!this.ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ac = new AC();
      this.master = this.ac.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ac.destination);
      const len = this.ac.sampleRate;
      this.noiseBuf = this.ac.createBuffer(1, len, this.ac.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ac.state === 'suspended') this.ac.resume();
  }

  get ready() {
    return !!this.ac && this.ac.state === 'running';
  }

  tone(freq, dur, { type = 'square', vol = 0.1, slide = 0, delay = 0 } = {}) {
    if (!this.ready) return;
    const t = this.ac.currentTime + delay;
    const o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  noise(dur, { vol = 0.2, freq = 1500, q = 0.8, delay = 0, type = 'lowpass' } = {}) {
    if (!this.ready) return;
    const t = this.ac.currentTime + delay;
    const s = this.ac.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = this.ac.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.ac.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(this.master);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.02);
  }

  hit(s) {
    const k = Math.min(1, s / 12);
    this.noise(0.08 + k * 0.18, { vol: 0.25 + k * 0.35, freq: 2600 - k * 1800 });
    this.tone(180 - k * 80, 0.08 + k * 0.12, { vol: 0.12 + k * 0.1, slide: -60 });
  }
  jump(p = 1) { this.tone(260 * p, 0.09, { vol: 0.05, slide: 260 * p }); }
  land() { this.noise(0.05, { vol: 0.08, freq: 500 }); }
  whoosh() { this.noise(0.07, { vol: 0.06, freq: 3500, type: 'bandpass', q: 1.2 }); }
  shield() { this.tone(1200, 0.06, { type: 'triangle', vol: 0.08, slide: -400 }); }
  shieldBreak() {
    this.tone(900, 0.4, { type: 'sawtooth', vol: 0.1, slide: -700 });
    this.noise(0.3, { vol: 0.2, freq: 3000 });
  }
  shoot() { this.tone(700, 0.12, { vol: 0.06, slide: -450 }); }
  ko() {
    this.noise(0.9, { vol: 0.5, freq: 700 });
    this.tone(90, 0.7, { type: 'sawtooth', vol: 0.18, slide: -50 });
    this.tone(1400, 0.25, { vol: 0.05, slide: -1100, delay: 0.02 });
  }
  beep(hi) {
    this.tone(hi ? 880 : 440, hi ? 0.35 : 0.14, { vol: 0.1 });
    if (hi) this.tone(1320, 0.35, { vol: 0.06, delay: 0.05 });
  }
  gameSet() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.25, { vol: 0.08, delay: i * 0.09 })); }
  ui() { this.tone(660, 0.05, { vol: 0.05 }); }
  deny() { this.tone(180, 0.09, { type: 'triangle', vol: 0.07, slide: -60 }); }
  combo(n) { this.tone(520 + Math.min(8, n) * 90, 0.07, { type: 'triangle', vol: 0.06, slide: 120 }); }
}
