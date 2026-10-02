// Procedural lo-fi loop + soft office sounds, synthesised with WebAudio — no audio files, nothing to license.
// Both are off by default; the toggles persist per browser.

const PROG = [ // Fmaj7, Em7, Dm7, Cmaj7 (Hz)
  [174.6, 220.0, 261.6, 329.6], [164.8, 196.0, 246.9, 293.7], [146.8, 174.6, 220.0, 261.6], [130.8, 164.8, 196.0, 246.9],
];
const BPM = 72;

export class Audio {
  constructor() { this.ctx = null; this.music = false; this.sfx = false; this.nextBar = 0; this.bar = 0; }

  ensure() {
    if (this.ctx) return;
    const C = window.AudioContext || window.webkitAudioContext;
    this.ctx = new C();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.5; this.master.connect(this.ctx.destination);
    this.musicBus = this.ctx.createGain(); this.musicBus.gain.value = 0;
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
    this.musicBus.connect(lp); lp.connect(this.master);
    this.sfxBus = this.ctx.createGain(); this.sfxBus.gain.value = 0; this.sfxBus.connect(this.master);
    // vinyl crackle
    const len = this.ctx.sampleRate * 2, buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() < 0.0008 ? (Math.random() * 2 - 1) * 0.6 : (Math.random() * 2 - 1) * 0.012;
    const n = this.ctx.createBufferSource(); n.buffer = buf; n.loop = true; n.connect(this.musicBus); n.start();
    this.timer = setInterval(() => this.schedule(), 200);
  }

  setMusic(on) { this.ensure(); this.music = on; this.ctx.resume(); this.musicBus.gain.setTargetAtTime(on ? 0.55 : 0, this.ctx.currentTime, 0.4); }
  setSfx(on) { this.ensure(); this.sfx = on; this.ctx.resume(); this.sfxBus.gain.setTargetAtTime(on ? 0.6 : 0, this.ctx.currentTime, 0.1); }

  schedule() {
    if (!this.music) return;
    const t0 = this.ctx.currentTime, beat = 60 / BPM;
    if (this.nextBar < t0) this.nextBar = t0 + 0.05;
    while (this.nextBar < t0 + 1.2) {
      const chord = PROG[this.bar % PROG.length];
      chord.forEach((f, i) => this.pad(f, this.nextBar + i * 0.03, beat * 4));
      for (let b = 0; b < 4; b++) {
        const t = this.nextBar + b * beat;
        if (b % 2 === 0) this.kick(t); else this.snare(t);
        this.hat(t + beat / 2);
        if ((this.bar + b) % 3 === 0) this.pluck(chord[(b + this.bar) % 4] * 2, t + beat * 0.5);
      }
      this.nextBar += beat * 4; this.bar++;
    }
  }

  env(node, t, a, peak, d) {
    node.gain.setValueAtTime(0.0001, t); node.gain.exponentialRampToValueAtTime(peak, t + a); node.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  pad(f, t, dur) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'triangle'; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 12;
    this.env(g, t, 0.4, 0.06, dur); o.connect(g); g.connect(this.musicBus); o.start(t); o.stop(t + dur + 0.6);
  }
  pluck(f, t) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine'; o.frequency.value = f; this.env(g, t, 0.01, 0.07, 0.6);
    o.connect(g); g.connect(this.musicBus); o.start(t); o.stop(t + 0.8);
  }
  kick(t) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    this.env(g, t, 0.005, 0.5, 0.25); o.connect(g); g.connect(this.musicBus); o.start(t); o.stop(t + 0.35);
  }
  noise(t, dur, freq, peak, bus) {
    const len = Math.floor(this.ctx.sampleRate * dur), buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = this.ctx.createBufferSource(); s.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = freq;
    const g = this.ctx.createGain(); this.env(g, t, 0.003, peak, dur);
    s.connect(f); f.connect(g); g.connect(bus); s.start(t);
  }
  snare(t) { this.noise(t, 0.16, 1800, 0.12, this.musicBus); }
  hat(t) { this.noise(t, 0.04, 7000, 0.04, this.musicBus); }

  /** Occasional office sound: a few key taps or the café bell. */
  office(kind) {
    if (!this.sfx || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (kind === 'bell') {
      for (const [f, dt] of [[1318, 0], [1760, 0.12]]) {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.frequency.value = f; this.env(g, t + dt, 0.005, 0.08, 0.9); o.connect(g); g.connect(this.sfxBus); o.start(t + dt); o.stop(t + dt + 1);
      }
    } else {
      for (let i = 0; i < 5; i++) this.noise(t + i * 0.09 + Math.random() * 0.04, 0.03, 3000, 0.05, this.sfxBus);
    }
  }
}
