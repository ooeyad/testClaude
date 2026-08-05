window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;
  var In = P.Input;

  var FONT = '"Segoe UI", system-ui, sans-serif';

  function label(ctx, text, x, y, size, color, align) {
    ctx.font = '600 ' + size + 'px ' + FONT;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  /**
   * Everything the player needs mid-fight, drawn in screen space after the
   * camera transform is popped.
   *
   * The rule followed here: nothing animates unless it changed. A HUD that
   * pulses constantly competes with the enemy telegraphs for attention, and the
   * telegraphs have to win.
   */
  var HUD = {

    draw: function (ctx, world, viewW, viewH) {
      var pl = world.player;

      ctx.save();
      this.lowHealthVignette(ctx, pl, viewW, viewH);
      this.health(ctx, pl);
      this.weapon(ctx, pl, viewH);
      this.waveStatus(ctx, world, viewW);
      this.kills(ctx, pl, viewW);
      this.notice(ctx, world, viewW, viewH);
      this.crosshair(ctx, pl);
      ctx.restore();
    },

    health: function (ctx, pl) {
      var x = 20, y = 22, w = 216, h = 12;
      var frac = U.clamp(pl.hp / pl.hpMax, 0, 1);

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

      ctx.fillStyle = 'rgba(255,255,255,0.09)';
      ctx.fillRect(x, y, w, h);

      // Colour shifts only at the thresholds that change how you should play.
      var c = frac > 0.55 ? '#c8523f' : frac > 0.25 ? '#d8813a' : '#e8b64a';
      ctx.fillStyle = c;
      ctx.fillRect(x, y, w * frac, h);

      // Quarter ticks — reading "about a third left" beats reading a number.
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      for (var i = 1; i < 4; i++) ctx.fillRect(x + (w / 4) * i, y, 1.5, h);

      label(ctx, Math.ceil(pl.hp) + '', x + w + 10, y + h - 1, 13, 'rgba(232,226,216,0.75)');
    },

    weapon: function (ctx, pl, viewH) {
      var key = pl.weaponKey();
      var w = P.Weapons.get(key);
      var x = 20, y = viewH - 26;

      label(ctx, w.name.toUpperCase(), x, y, 15, '#e8e2d8');

      var ammo = P.Weapons.ammoLabel(key, pl.magazine());
      var low = w.type === 'ranged' && pl.magazine() <= 2;
      label(ctx, ammo, x, y + 17, 13, low ? '#e8b64a' : 'rgba(232,226,216,0.55)');

      // Reload progress, in the slot the ammo count normally occupies.
      if (pl.reloading > 0 && pl.reloadDur > 0) {
        var prog = 1 - pl.reloading / pl.reloadDur;
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.fillRect(x + 52, y + 8, 74, 5);
        ctx.fillStyle = '#e8b64a';
        ctx.fillRect(x + 52, y + 8, 74 * prog, 5);
      }

      // The rest of the loadout, dimmed, so swapping is discoverable.
      var slots = '';
      for (var i = 0; i < pl.weapons.length; i++) {
        if (i === pl.wi) continue;
        slots += (slots ? '  ' : '') + (i + 1) + ' ' + P.Weapons.get(pl.weapons[i]).name;
      }
      if (slots) label(ctx, slots.toUpperCase(), x, y - 18, 11, 'rgba(232,226,216,0.3)');
    },

    waveStatus: function (ctx, world, viewW) {
      var total = world.waves.length;
      var n = Math.min(world.waveIndex + 1, total);
      label(ctx, 'WAVE ' + n + ' / ' + total, viewW / 2, 26, 13, 'rgba(232,226,216,0.55)', 'center');

      // One pip per enemy still standing.
      var alive = world.aliveEnemies();
      var pips = Math.min(alive, 12);
      var pw = 7, gap = 5;
      var totalW = pips * pw + (pips - 1) * gap;
      var px = viewW / 2 - totalW / 2;
      ctx.fillStyle = '#c8523f';
      for (var i = 0; i < pips; i++) ctx.fillRect(px + i * (pw + gap), 34, pw, 3);
    },

    kills: function (ctx, pl, viewW) {
      label(ctx, pl.kills + ' DOWN', viewW - 20, 32, 13, 'rgba(232,226,216,0.45)', 'right');
    },

    notice: function (ctx, world, viewW, viewH) {
      var n = world.notice;
      if (!n || n.life <= 0) return;
      var fade = U.clamp(n.life / 0.6, 0, 1);
      ctx.globalAlpha = fade;
      label(ctx, n.text, viewW / 2, viewH * 0.30, 16, '#e8d8b0', 'center');
      ctx.globalAlpha = 1;
    },

    /**
     * Aiming is mouse-driven, and the OS cursor is a thin crosshair that gets
     * lost against the particles — so draw our own on top of it.
     */
    crosshair: function (ctx, pl) {
      var x = In.mouse.x, y = In.mouse.y;
      var ranged = P.Weapons.get(pl.weaponKey()).type === 'ranged';
      var r = ranged ? 9 : 6;

      ctx.save();
      ctx.strokeStyle = pl.reloading > 0 ? 'rgba(232,182,74,0.75)' : 'rgba(232,226,216,0.7)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x - r - 4, y); ctx.lineTo(x - 3, y);
      ctx.moveTo(x + 3, y);     ctx.lineTo(x + r + 4, y);
      ctx.moveTo(x, y - r - 4); ctx.lineTo(x, y - 3);
      ctx.moveTo(x, y + 3);     ctx.lineTo(x, y + r + 4);
      ctx.stroke();

      if (ranged) {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, U.TAU);
        ctx.stroke();
      }
      ctx.restore();
    },

    lowHealthVignette: function (ctx, pl, viewW, viewH) {
      var frac = pl.hp / pl.hpMax;
      if (frac > 0.35 || pl.dead) return;
      var strength = (0.35 - frac) / 0.35;
      var g = ctx.createRadialGradient(viewW / 2, viewH / 2, viewH * 0.34, viewW / 2, viewH / 2, viewH * 0.78);
      g.addColorStop(0, 'rgba(140,20,16,0)');
      g.addColorStop(1, 'rgba(140,20,16,' + (0.42 * strength).toFixed(3) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, viewW, viewH);
    }
  };

  P.HUD = HUD;
})(window.Phefo);
