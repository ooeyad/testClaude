window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;

  /**
   * One flat particle pool for every effect in the game. Particles never collide
   * with anything except the ground plane they were told about, which keeps this
   * cheap enough to spray thousands per second.
   */
  var FX = {
    parts: [],
    MAX: 900,

    clear: function () { this.parts.length = 0; },

    push: function (p) {
      if (this.parts.length >= this.MAX) this.parts.shift();
      p.age = 0;
      p.drag = p.drag == null ? 0.6 : p.drag;
      p.grav = p.grav == null ? 900 : p.grav;
      p.size = p.size == null ? 2 : p.size;
      p.type = p.type || 'dot';
      this.parts.push(p);
      return p;
    },

    /** Generic cone burst. `spread` is the half-angle in radians. */
    burst: function (x, y, angle, opts) {
      opts = opts || {};
      var n = opts.count || 8;
      var spread = opts.spread == null ? 0.9 : opts.spread;
      for (var i = 0; i < n; i++) {
        var a = angle + U.rand(-spread, spread);
        var sp = U.rand(opts.speedMin || 60, opts.speedMax || 220);
        this.push({
          x: x, y: y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: U.rand(opts.lifeMin || 0.18, opts.lifeMax || 0.5),
          size: U.rand(opts.sizeMin || 1.2, opts.sizeMax || 2.6),
          color: opts.color || '#d9dee0',
          grav: opts.grav == null ? 900 : opts.grav,
          drag: opts.drag == null ? 0.5 : opts.drag,
          type: opts.type || 'dot'
        });
      }
    },

    blood: function (x, y, dirX) {
      this.burst(x, y, dirX >= 0 ? -0.35 : Math.PI + 0.35, {
        count: 9, spread: 1.0,
        speedMin: 70, speedMax: 260,
        lifeMin: 0.3, lifeMax: 0.75,
        sizeMin: 1.2, sizeMax: 3.0,
        color: '#a3312a', grav: 1300, drag: 0.35, type: 'streak'
      });
    },

    sparks: function (x, y, angle) {
      this.burst(x, y, angle, {
        count: 7, spread: 0.7,
        speedMin: 120, speedMax: 380,
        lifeMin: 0.1, lifeMax: 0.28,
        sizeMin: 0.9, sizeMax: 1.9,
        color: '#ffd79a', grav: 500, drag: 0.2, type: 'streak'
      });
    },

    /** Short bright cone at the barrel plus a one-frame flash sprite. */
    muzzle: function (x, y, angle) {
      this.push({
        x: x, y: y, vx: 0, vy: 0,
        life: 0.055, size: 9, color: '#ffe2a8',
        grav: 0, drag: 0, type: 'flash', angle: angle
      });
      this.burst(x, y, angle, {
        count: 5, spread: 0.28,
        speedMin: 180, speedMax: 420,
        lifeMin: 0.05, lifeMax: 0.16,
        sizeMin: 0.9, sizeMax: 1.8,
        color: '#ffcf87', grav: 120, drag: 0.1, type: 'streak'
      });
    },

    impact: function (x, y, angle, color) {
      this.burst(x, y, angle + Math.PI, {
        count: 6, spread: 1.1,
        speedMin: 60, speedMax: 190,
        lifeMin: 0.1, lifeMax: 0.3,
        sizeMin: 0.8, sizeMax: 1.7,
        color: color || '#c9cfd2', grav: 700, drag: 0.4, type: 'dot'
      });
    },

    dust: function (x, y, count) {
      for (var i = 0; i < (count || 5); i++) {
        this.push({
          x: x + U.rand(-6, 6), y: y,
          vx: U.rand(-45, 45), vy: U.rand(-40, -6),
          life: U.rand(0.25, 0.6), size: U.rand(1.6, 3.4),
          color: '#6d6f6a', grav: 90, drag: 1.4, type: 'dot'
        });
      }
    },

    explosion: function (x, y, radius) {
      this.push({
        x: x, y: y, vx: 0, vy: 0,
        life: 0.34, size: radius, color: '#ffb35c',
        grav: 0, drag: 0, type: 'ring'
      });
      this.burst(x, y, 0, {
        count: 26, spread: Math.PI,
        speedMin: 90, speedMax: 460,
        lifeMin: 0.22, lifeMax: 0.65,
        sizeMin: 1.5, sizeMax: 4,
        color: '#ff9a3c', grav: 500, drag: 0.55, type: 'streak'
      });
      for (var i = 0; i < 12; i++) {
        this.push({
          x: x + U.rand(-14, 14), y: y + U.rand(-14, 14),
          vx: U.rand(-40, 40), vy: U.rand(-70, -18),
          life: U.rand(0.5, 1.1), size: U.rand(4, 10),
          color: '#3b3733', grav: -30, drag: 1.3, type: 'smoke'
        });
      }
    },

    /** Trail dot behind a rocket or arrow. */
    trail: function (x, y, color) {
      this.push({
        x: x, y: y, vx: U.rand(-12, 12), vy: U.rand(-12, 12),
        life: 0.22, size: U.rand(1, 2.2),
        color: color || '#8b9196', grav: 0, drag: 2, type: 'dot'
      });
    },

    update: function (dt, groundY) {
      for (var i = this.parts.length - 1; i >= 0; i--) {
        var p = this.parts[i];
        p.age += dt;
        if (p.age >= p.life) { this.parts.splice(i, 1); continue; }

        if (p.type !== 'ring' && p.type !== 'flash') {
          p.vx -= p.vx * p.drag * dt * 6;
          p.vy -= p.vy * p.drag * dt * 6;
          p.vy += p.grav * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Settle on the road rather than raining through it.
          if (groundY != null && p.y > groundY && p.vy > 0) {
            p.y = groundY;
            p.vy *= -0.25;
            p.vx *= 0.55;
            if (Math.abs(p.vy) < 30) p.vy = 0;
          }
        }
      }
    },

    draw: function (ctx) {
      ctx.save();
      ctx.lineCap = 'round';
      for (var i = 0; i < this.parts.length; i++) {
        var p = this.parts[i];
        var t = p.age / p.life;
        var fade = 1 - t;

        if (p.type === 'ring') {
          ctx.globalAlpha = fade * 0.75;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 3 * fade + 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * U.easeOut(t), 0, U.TAU);
          ctx.stroke();

        } else if (p.type === 'flash') {
          ctx.globalAlpha = fade;
          ctx.fillStyle = p.color;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle || 0);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(p.size * 2.2, -p.size * 0.5);
          ctx.lineTo(p.size * 2.8, 0);
          ctx.lineTo(p.size * 2.2, p.size * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.6, 0, U.TAU);
          ctx.fill();
          ctx.restore();

        } else if (p.type === 'streak') {
          ctx.globalAlpha = fade;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          var len = U.clamp(Math.sqrt(p.vx * p.vx + p.vy * p.vy) * 0.022, 1, 12);
          var m = Math.max(1, Math.sqrt(p.vx * p.vx + p.vy * p.vy));
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - (p.vx / m) * len, p.y - (p.vy / m) * len);
          ctx.stroke();

        } else if (p.type === 'smoke') {
          ctx.globalAlpha = fade * 0.45;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.6 + t * 1.4), 0, U.TAU);
          ctx.fill();

        } else {
          ctx.globalAlpha = fade;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
      }
      ctx.restore();
    }
  };

  P.FX = FX;
})(window.Phefo);
