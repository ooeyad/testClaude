window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var TAU = Math.PI * 2;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sign(v) { return v < 0 ? -1 : v > 0 ? 1 : 0; }

  /** Frame-rate independent exponential smoothing. rate ~ "how fast", dt in seconds. */
  function damp(a, b, rate, dt) { return lerp(a, b, 1 - Math.exp(-rate * dt)); }

  /** Step `cur` toward `target` by at most `delta`. */
  function approach(cur, target, delta) {
    if (cur < target) return Math.min(cur + delta, target);
    if (cur > target) return Math.max(cur - delta, target);
    return target;
  }

  function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
  function randInt(lo, hi) { return Math.floor(lo + Math.random() * (hi - lo + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function chance(p) { return Math.random() < p; }

  function dist(ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function dist2(ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay;
    return dx * dx + dy * dy;
  }

  /** Smallest signed angle from a to b, in (-PI, PI]. */
  function angleDelta(a, b) {
    var d = (b - a) % TAU;
    if (d > Math.PI) d -= TAU;
    if (d <= -Math.PI) d += TAU;
    return d;
  }

  function easeOut(t) { return 1 - (1 - t) * (1 - t); }
  function easeIn(t) { return t * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /**
   * Deterministic PRNG. The backdrop uses this so the skyline is identical
   * on every run instead of reshuffling each time the level loads.
   */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Rotate a bone of `len` by `a`, where a = 0 points straight DOWN (screen y grows down). */
  function boneDown(len, a) { return { x: Math.sin(a) * len, y: Math.cos(a) * len }; }

  /** Rotate a bone of `len` by `a`, where a = 0 points straight UP. */
  function boneUp(len, a) { return { x: Math.sin(a) * len, y: -Math.cos(a) * len }; }

  P.util = {
    TAU: TAU,
    clamp: clamp, lerp: lerp, sign: sign, damp: damp, approach: approach,
    rand: rand, randInt: randInt, pick: pick, chance: chance,
    dist: dist, dist2: dist2, angleDelta: angleDelta,
    easeIn: easeIn, easeOut: easeOut, easeInOut: easeInOut,
    mulberry32: mulberry32,
    boneDown: boneDown, boneUp: boneUp
  };
})(window.Phefo);
