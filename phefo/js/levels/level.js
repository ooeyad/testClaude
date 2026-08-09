window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;

  /**
   * A level is plain data: solids, a spawn point, camera bounds and a list of
   * waves. Nothing here knows how the game loop works, which is what lets
   * level01 be edited (or a level02 added) without touching a system file.
   *
   * Solids are the rects Physics already understands — {x, y, w, h, oneWay?} —
   * so there is no level-specific collision code anywhere.
   *
   * Ladders are a separate collection and deliberately not solids: Physics never
   * sees them, so adding one cannot change collision for anything that already
   * exists. Only climbing enemies read them.
   */

  var Levels = {
    registry: {},
    order: [],

    define: function (def) {
      this.registry[def.id] = def;
      if (this.order.indexOf(def.id) < 0) this.order.push(def.id);
      return def;
    },

    get: function (id) {
      var def = this.registry[id];
      if (!def) throw new Error('Unknown level: ' + id);
      return def;
    },

    first: function () { return this.get(this.order[0]); },

    /** Solid rect. */
    solid: function (x, y, w, h) {
      return { x: x, y: y, w: w, h: h };
    },

    /**
     * One-way platform: you land on it from above and jump up through it from
     * below. Height is nominal — Physics only ever uses the top edge for these.
     */
    platform: function (x, y, w) {
      return { x: x, y: y, w: w, h: 10, oneWay: true };
    },

    /**
     * Ladder: a vertical route between two surfaces, for climbing enemies.
     *
     * Deliberately not a solid, and never placed in `def.solids` — that array is
     * read every step by Physics for every entity and by projectiles, so a ladder
     * in it would change collision for the player and every existing enemy.
     * Ladders live in their own `def.ladders` collection.
     *
     * `top` and `bottom` are the y of the surfaces where feet rest at each end,
     * not decorative extents — a climber is clamped to them on arrival. `top` is
     * the smaller value, because y grows downward.
     *
     * Placement is governed by the level-authoring rules in the EO-001
     * architecture (§10); they are deliberately not enforced here.
     */
    ladder: function (x, top, bottom) {
      return { x: x, top: top, bottom: bottom };
    },

    /**
     * Scenery pass for the play-field geometry. Drawn inside the camera
     * transform, between the backdrop and the characters.
     *
     * Solids get a lit top edge and an unlit body — with a stick-figure cast and
     * no textures, that single highlight is what tells you where the floor is.
     */
    drawSolids: function (ctx, def, cam) {
      var solids = def.solids;
      var body = def.solidColor || '#141b21';
      var edge = def.edgeColor || '#3a4a55';

      for (var i = 0; i < solids.length; i++) {
        var s = solids[i];
        if (s.x + s.w < cam.x - 80 || s.x > cam.x + cam.viewW + 80) continue;

        if (s.oneWay) {
          // Fire escapes read as a plate on brackets rather than a slab.
          ctx.fillStyle = body;
          ctx.fillRect(s.x, s.y, s.w, 5);
          ctx.strokeStyle = edge;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y + 0.5);
          ctx.lineTo(s.x + s.w, s.y + 0.5);
          ctx.stroke();

          ctx.lineWidth = 1.4;
          ctx.globalAlpha = 0.5;
          for (var b = s.x + 10; b < s.x + s.w - 6; b += 26) {
            ctx.beginPath();
            ctx.moveTo(b, s.y + 5);
            ctx.lineTo(b + 5, s.y + 14);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          continue;
        }

        ctx.fillStyle = body;
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = edge;
        ctx.fillRect(s.x, s.y, s.w, 2.5);
      }

      if (def.decor) def.decor(ctx, cam, U);
    },

    /**
     * Ladders. Drawn after the solids and before the actors, so a climber reads
     * as being in front of the rungs rather than behind them.
     *
     * Two rails and evenly spaced rungs — enough for the shape to be
     * unmistakable at a glance, which matters because the ladder is the only
     * cue the player gets for how an enemy reached their platform.
     */
    drawLadders: function (ctx, def, cam) {
      var list = def.ladders;
      if (!list || !list.length) return;

      var HALF = 9;    // half the distance between the rails
      var RUNG = 15;   // vertical spacing

      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = def.ladderColor || '#7c8b95';

      for (var i = 0; i < list.length; i++) {
        var l = list[i];
        if (l.x + HALF < cam.x - 40 || l.x - HALF > cam.x + cam.viewW + 40) continue;

        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(l.x - HALF, l.top);
        ctx.lineTo(l.x - HALF, l.bottom);
        ctx.moveTo(l.x + HALF, l.top);
        ctx.lineTo(l.x + HALF, l.bottom);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.beginPath();
        for (var y = l.top + RUNG * 0.5; y < l.bottom; y += RUNG) {
          ctx.moveTo(l.x - HALF, y);
          ctx.lineTo(l.x + HALF, y);
        }
        ctx.stroke();
      }

      ctx.restore();
    }
  };

  P.Levels = Levels;
})(window.Phefo);
