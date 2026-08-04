window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;

  /**
   * Parallax scenery, generated once from a seeded RNG so the skyline is
   * identical every run (a reshuffling city reads as a bug, not variety).
   *
   * Layers are drawn in screen space with a manual parallax offset rather than
   * through the camera transform — that way the far layers can drift slowly
   * without needing their own camera.
   */

  var THEMES = {
    city: {
      skyTop: '#0e151c',
      skyMid: '#1e2530',
      skyLow: '#4a3b34',
      horizon: '#5d4436',
      sun: '#c8703a',
      far: '#1a222b',
      mid: '#131a21',
      near: '#0b1014',
      window: '#e8b25f',
      haze: 'rgba(90,70,60,0.16)'
    }
  };

  function Backdrop(theme, width, seed) {
    this.t = THEMES[theme] || THEMES.city;
    this.width = width;
    var rng = U.mulberry32(seed || 1337);
    this.rng = rng;
    this.far = this._skyline(rng, width, 0.18, 70, 150, 30, 70);
    this.mid = this._skyline(rng, width, 0.40, 110, 240, 44, 96);
    this.near = this._nearProps(rng, width, 0.72);
    this.stars = [];
    for (var i = 0; i < 70; i++) {
      this.stars.push({
        x: rng() * 1400,
        y: rng() * 190,
        r: rng() * 0.9 + 0.35,
        a: rng() * 0.5 + 0.2
      });
    }
  }

  Backdrop.prototype._skyline = function (rng, width, parallax, minH, maxH, minW, maxW) {
    var items = [];
    // Generated across the parallax-compressed span the camera can actually reveal.
    var span = width * parallax + 1200;
    var x = -200;
    while (x < span) {
      var w = minW + rng() * (maxW - minW);
      var h = minH + rng() * (maxH - minH);
      var b = { x: x, w: w, h: h, windows: [] };
      // Lit windows on a grid, only some switched on.
      var cols = Math.max(1, Math.floor(w / 13));
      var rows = Math.max(1, Math.floor(h / 17));
      for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
          if (rng() < 0.22) {
            b.windows.push({
              x: 5 + c * 13,
              y: 9 + r * 17,
              a: 0.25 + rng() * 0.55
            });
          }
        }
      }
      items.push(b);
      x += w + rng() * 22 + 4;
    }
    return { parallax: parallax, items: items };
  };

  Backdrop.prototype._nearProps = function (rng, width, parallax) {
    var items = [];
    var span = width * parallax + 900;
    var x = -100;
    while (x < span) {
      var kind = rng();
      if (kind < 0.45) {
        items.push({ type: 'lamp', x: x, h: 72 + rng() * 26 });
        x += 150 + rng() * 130;
      } else if (kind < 0.75) {
        items.push({ type: 'pole', x: x, h: 46 + rng() * 30 });
        x += 110 + rng() * 120;
      } else {
        items.push({ type: 'block', x: x, w: 26 + rng() * 40, h: 22 + rng() * 30 });
        x += 130 + rng() * 140;
      }
    }
    return { parallax: parallax, items: items };
  };

  Backdrop.prototype.draw = function (ctx, cam, viewW, viewH, groundY) {
    var t = this.t;

    // --- sky -------------------------------------------------------------
    var g = ctx.createLinearGradient(0, 0, 0, viewH);
    g.addColorStop(0, t.skyTop);
    g.addColorStop(0.48, t.skyMid);
    g.addColorStop(0.80, t.skyLow);
    g.addColorStop(1, t.horizon);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, viewW, viewH);

    // --- stars, only in the upper band ------------------------------------
    var sOff = -cam.x * 0.04;
    ctx.fillStyle = '#cfd8e0';
    for (var i = 0; i < this.stars.length; i++) {
      var s = this.stars[i];
      var sx = ((s.x + sOff) % 1400 + 1400) % 1400;
      if (sx > viewW) continue;
      ctx.globalAlpha = s.a;
      ctx.beginPath();
      ctx.arc(sx, s.y, s.r, 0, U.TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // --- low sun ----------------------------------------------------------
    var sunX = viewW * 0.74 - cam.x * 0.05;
    var sunY = viewH * 0.60;
    var sg = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 120);
    sg.addColorStop(0, 'rgba(226,140,72,0.55)');
    sg.addColorStop(1, 'rgba(226,140,72,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(sunX - 130, sunY - 130, 260, 260);
    ctx.fillStyle = t.sun;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 15, 0, U.TAU);
    ctx.fill();
    ctx.globalAlpha = 1;

    // --- skylines ---------------------------------------------------------
    var baseY = viewH * 0.80;
    this._drawSkyline(ctx, this.far, cam, viewW, baseY, t.far, null);
    this._drawSkyline(ctx, this.mid, cam, viewW, baseY + 22, t.mid, t.window);

    // Haze band pushes the skyline back behind the playfield.
    ctx.fillStyle = t.haze;
    ctx.fillRect(0, baseY - 40, viewW, 90);

    // --- near props, standing on the road ---------------------------------
    this._drawNear(ctx, cam, viewW, viewH, groundY, t.near);
  };

  Backdrop.prototype._drawSkyline = function (ctx, layer, cam, viewW, baseY, color, winColor) {
    var off = -cam.x * layer.parallax;
    ctx.fillStyle = color;
    for (var i = 0; i < layer.items.length; i++) {
      var b = layer.items[i];
      var x = b.x + off;
      if (x + b.w < -20 || x > viewW + 20) continue;
      ctx.fillRect(x, baseY - b.h, b.w, b.h + 60);

      if (winColor) {
        ctx.fillStyle = winColor;
        for (var w = 0; w < b.windows.length; w++) {
          var win = b.windows[w];
          if (win.y > b.h - 6) continue;
          ctx.globalAlpha = win.a * 0.5;
          ctx.fillRect(x + win.x, baseY - b.h + win.y, 4, 6);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = color;
      }
    }
  };

  Backdrop.prototype._drawNear = function (ctx, cam, viewW, viewH, groundY, color) {
    var layer = this.near;
    var off = -cam.x * layer.parallax;
    // The road line in screen space, so props sit on it at any camera height.
    var y = groundY - cam.y;
    if (y < -200 || y > viewH + 200) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = 'round';

    for (var i = 0; i < layer.items.length; i++) {
      var it = layer.items[i];
      var x = it.x + off;
      if (x < -80 || x > viewW + 80) continue;

      if (it.type === 'lamp') {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - it.h);
        ctx.quadraticCurveTo(x, y - it.h - 9, x + 13, y - it.h - 9);
        ctx.stroke();
        // Lamp glow
        ctx.save();
        var lg = ctx.createRadialGradient(x + 14, y - it.h - 7, 1, x + 14, y - it.h - 7, 60);
        lg.addColorStop(0, 'rgba(240,190,110,0.30)');
        lg.addColorStop(1, 'rgba(240,190,110,0)');
        ctx.fillStyle = lg;
        ctx.fillRect(x - 46, y - it.h - 67, 120, 120);
        ctx.restore();
        ctx.fillStyle = '#f0be6e';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x + 14, y - it.h - 7, 2.6, 0, U.TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = color;

      } else if (it.type === 'pole') {
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - it.h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 7, y - it.h);
        ctx.lineTo(x + 7, y - it.h);
        ctx.stroke();

      } else {
        ctx.fillRect(x, y - it.h, it.w, it.h);
      }
    }
  };

  P.Backdrop = Backdrop;
})(window.Phefo);
