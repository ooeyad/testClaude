window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;
  var FONT = '"Segoe UI", system-ui, sans-serif';

  var CONTROLS = [
    ['A / D', 'move'],
    ['SPACE', 'jump — hold for height'],
    ['S + SPACE', 'drop through a platform'],
    ['MOUSE / J', 'attack — aim with the cursor'],
    ['Q or 1-4', 'switch weapon'],
    ['R', 'reload'],
    ['ESC', 'pause']
  ];

  function text(ctx, s, x, y, size, color, align, weight) {
    ctx.font = (weight || '600') + ' ' + size + 'px ' + FONT;
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color;
    ctx.fillText(s, x, y);
  }

  function scrim(ctx, viewW, viewH, alpha) {
    ctx.fillStyle = 'rgba(6,9,12,' + alpha + ')';
    ctx.fillRect(0, 0, viewW, viewH);
  }

  /** Slow pulse on the "press enter" line — the only animated thing on a menu. */
  function prompt(ctx, s, x, y, t) {
    ctx.globalAlpha = 0.55 + Math.sin(t * 3.2) * 0.28;
    text(ctx, s, x, y, 14, '#e8d8b0');
    ctx.globalAlpha = 1;
  }

  function rule(ctx, cx, y, w) {
    ctx.fillStyle = 'rgba(232,226,216,0.18)';
    ctx.fillRect(cx - w / 2, y, w, 1);
  }

  var Menus = {

    title: function (ctx, viewW, viewH, t, levelName) {
      var cx = viewW / 2;
      scrim(ctx, viewW, viewH, 0.62);

      text(ctx, 'PHEFO', cx, viewH * 0.30, 76, '#e8e2d8', 'center', '700');
      text(ctx, levelName || '', cx, viewH * 0.30 + 26, 13, 'rgba(232,226,216,0.45)');
      rule(ctx, cx, viewH * 0.30 + 44, 220);

      // Two columns: key on the right of the gutter, meaning on the left.
      var y = viewH * 0.30 + 78;
      for (var i = 0; i < CONTROLS.length; i++) {
        text(ctx, CONTROLS[i][0], cx - 14, y, 12.5, 'rgba(232,226,216,0.8)', 'right');
        text(ctx, CONTROLS[i][1], cx + 14, y, 12.5, 'rgba(232,226,216,0.45)', 'left');
        y += 19;
      }

      prompt(ctx, 'PRESS ENTER', cx, y + 26, t);
    },

    paused: function (ctx, viewW, viewH, t) {
      var cx = viewW / 2;
      scrim(ctx, viewW, viewH, 0.55);
      text(ctx, 'PAUSED', cx, viewH * 0.46, 40, '#e8e2d8');
      rule(ctx, cx, viewH * 0.46 + 18, 160);
      prompt(ctx, 'ESC TO RESUME', cx, viewH * 0.46 + 46, t);
    },

    gameOver: function (ctx, viewW, viewH, t, world) {
      var cx = viewW / 2;
      scrim(ctx, viewW, viewH, 0.68);

      text(ctx, 'PHEFO IS DOWN', cx, viewH * 0.40, 44, '#c8523f');
      rule(ctx, cx, viewH * 0.40 + 20, 240);

      text(ctx, 'REACHED WAVE ' + Math.min(world.waveIndex + 1, world.waves.length) +
                ' OF ' + world.waves.length, cx, viewH * 0.40 + 48, 14, 'rgba(232,226,216,0.6)');
      text(ctx, world.player.kills + ' TAKEN DOWN', cx, viewH * 0.40 + 70, 14, 'rgba(232,226,216,0.6)');

      prompt(ctx, 'ENTER TO TRY AGAIN', cx, viewH * 0.40 + 108, t);
    },

    victory: function (ctx, viewW, viewH, t, world) {
      var cx = viewW / 2;
      scrim(ctx, viewW, viewH, 0.62);

      text(ctx, 'STREET CLEARED', cx, viewH * 0.40, 44, '#e8d8b0');
      rule(ctx, cx, viewH * 0.40 + 20, 260);

      text(ctx, 'ALL ' + world.waves.length + ' WAVES', cx, viewH * 0.40 + 48, 14, 'rgba(232,226,216,0.6)');
      text(ctx, world.player.kills + ' TAKEN DOWN  ·  ' + Math.ceil(world.player.hp) + ' HP LEFT',
           cx, viewH * 0.40 + 70, 14, 'rgba(232,226,216,0.6)');

      prompt(ctx, 'ENTER TO GO AGAIN', cx, viewH * 0.40 + 108, t);
    },

    /** Between-wave banner, drawn over live gameplay rather than pausing it. */
    waveBanner: function (ctx, viewW, viewH, world, fade) {
      var next = world.waveIndex + 1;
      if (next >= world.waves.length) return;
      ctx.globalAlpha = U.clamp(fade, 0, 1);
      text(ctx, 'WAVE ' + (next + 1) + ' INCOMING', viewW / 2, viewH * 0.22, 22, '#e8d8b0');
      ctx.globalAlpha = 1;
    }
  };

  P.Menus = Menus;
})(window.Phefo);
