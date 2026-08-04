window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  /**
   * Everything is synthesized with WebAudio at runtime — the game ships with no
   * audio files at all, which keeps it a pure double-click-to-play folder.
   *
   * Browsers refuse to start an AudioContext without a user gesture, so init()
   * is deferred until the first key or click (see Input.onFirstGesture).
   */
  var Audio = {
    ctx: null,
    master: null,
    noiseBuf: null,
    enabled: true,

    init: function () {
      if (this.ctx) return;
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) { this.enabled = false; return; }
      try {
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        this.master.connect(this.ctx.destination);
        this._buildNoise();
      } catch (e) {
        this.enabled = false;
      }
    },

    _buildNoise: function () {
      var len = Math.floor(this.ctx.sampleRate * 0.5);
      var buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
    },

    _ready: function () {
      if (!this.enabled || !this.ctx) return false;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return true;
    },

    /** A pitched blip, optionally sweeping from `freq` to `to`. */
    tone: function (freq, dur, opts) {
      if (!this._ready()) return;
      opts = opts || {};
      var t = this.ctx.currentTime;
      var osc = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      osc.type = opts.type || 'square';
      osc.frequency.setValueAtTime(freq, t);
      if (opts.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.to), t + dur);
      var vol = opts.vol == null ? 0.25 : opts.vol;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g).connect(this.master);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    },

    /** A filtered noise burst — impacts, swooshes, explosions. */
    noise: function (dur, opts) {
      if (!this._ready()) return;
      opts = opts || {};
      var t = this.ctx.currentTime;
      var src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      var filt = this.ctx.createBiquadFilter();
      filt.type = opts.filter || 'bandpass';
      filt.frequency.setValueAtTime(opts.freq || 1200, t);
      if (opts.to) filt.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to), t + dur);
      filt.Q.value = opts.q == null ? 1 : opts.q;
      var g = this.ctx.createGain();
      var vol = opts.vol == null ? 0.25 : opts.vol;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(filt).connect(g).connect(this.master);
      src.start(t);
      src.stop(t + dur + 0.02);
    },

    play: function (name) {
      if (!this.enabled) return;
      this.init();
      switch (name) {
        case 'shoot':
          this.tone(760, 0.09, { type: 'square', to: 180, vol: 0.16 });
          this.noise(0.07, { freq: 2600, to: 700, vol: 0.2 });
          break;
        case 'slash':
          this.noise(0.16, { filter: 'bandpass', freq: 3000, to: 900, q: 1.6, vol: 0.17 });
          break;
        case 'hit':
          this.tone(160, 0.09, { type: 'triangle', to: 60, vol: 0.22 });
          this.noise(0.06, { freq: 900, to: 200, vol: 0.14 });
          break;
        case 'hurt':
          this.tone(330, 0.2, { type: 'sawtooth', to: 90, vol: 0.2 });
          break;
        case 'explode':
          this.noise(0.5, { filter: 'lowpass', freq: 1400, to: 60, vol: 0.4 });
          this.tone(90, 0.4, { type: 'sine', to: 30, vol: 0.3 });
          break;
        case 'pickup':
          this.tone(660, 0.08, { type: 'square', vol: 0.16 });
          var self = this;
          setTimeout(function () { self.tone(990, 0.11, { type: 'square', vol: 0.16 }); }, 70);
          break;
        case 'jump':
          this.tone(300, 0.1, { type: 'square', to: 620, vol: 0.12 });
          break;
        case 'reload':
          this.noise(0.04, { filter: 'bandpass', freq: 2200, q: 3, vol: 0.16 });
          var s2 = this;
          setTimeout(function () { s2.noise(0.05, { filter: 'bandpass', freq: 1500, q: 3, vol: 0.18 }); }, 150);
          break;
        case 'empty':
          this.noise(0.03, { filter: 'bandpass', freq: 3000, q: 5, vol: 0.12 });
          break;
        case 'die':
          this.tone(280, 0.5, { type: 'sawtooth', to: 50, vol: 0.2 });
          break;
        case 'arrow':
          this.noise(0.12, { filter: 'bandpass', freq: 2000, to: 3200, q: 2, vol: 0.12 });
          break;
        case 'block':
          this.tone(1200, 0.07, { type: 'square', to: 700, vol: 0.14 });
          this.noise(0.08, { freq: 4000, to: 1500, vol: 0.14 });
          break;
      }
    }
  };

  P.Audio = Audio;
})(window.Phefo);
