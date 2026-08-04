window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  /**
   * Entities are positioned by (x = horizontal centre, y = feet). Their AABB is
   * therefore [x - w/2, y - h] to [x + w/2, y]. Keeping y at the feet makes
   * ground snapping and stick-figure drawing (which builds upward from the
   * pelvis) use the same anchor.
   *
   * Solids are plain rects {x, y, w, h, oneWay?} in world space.
   */
  var Physics = {
    GRAVITY: 2000,
    MAX_FALL: 1250,

    box: function (e) {
      return { l: e.x - e.w / 2, r: e.x + e.w / 2, t: e.y - e.h, b: e.y };
    },

    overlaps: function (b, s) {
      return b.l < s.x + s.w && b.r > s.x && b.t < s.y + s.h && b.b > s.y;
    },

    rectsOverlap: function (a, b) {
      return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
    },

    pointInRect: function (px, py, s) {
      return px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h;
    },

    /** Is there solid ground within `depth` px below this point? */
    groundBelow: function (px, py, solids, depth) {
      depth = depth || 8;
      for (var i = 0; i < solids.length; i++) {
        var s = solids[i];
        if (px >= s.x && px <= s.x + s.w && py >= s.y - 2 && py <= s.y + depth) return s;
      }
      return null;
    },

    /**
     * Integrate velocity and resolve against solids, axis at a time (X then Y).
     * Resolving separately is what stops an entity from snagging on the seam
     * between two flush floor tiles.
     */
    moveAndCollide: function (e, solids, dt) {
      var wasBottom = e.y;
      e.onGround = false;

      e.x += e.vx * dt;
      var b = this.box(e);
      for (var i = 0; i < solids.length; i++) {
        var s = solids[i];
        if (s.oneWay) continue;
        if (!this.overlaps(b, s)) continue;
        if (e.vx > 0) { e.x = s.x - e.w / 2; e.hitWall = 1; }
        else if (e.vx < 0) { e.x = s.x + s.w + e.w / 2; e.hitWall = -1; }
        else continue;
        e.vx = 0;
        b = this.box(e);
      }

      e.vy = Math.min(e.vy + this.GRAVITY * dt * (e.gravityScale == null ? 1 : e.gravityScale), this.MAX_FALL);
      e.y += e.vy * dt;
      b = this.box(e);

      for (var j = 0; j < solids.length; j++) {
        var t = solids[j];
        if (!this.overlaps(b, t)) continue;

        if (t.oneWay) {
          // Only land on a platform when falling onto it from above.
          if (e.vy < 0) continue;
          if (wasBottom > t.y + 1) continue;
          if (e.dropThrough > 0) continue;
        }

        if (e.vy > 0) {
          e.y = t.y;
          e.vy = 0;
          e.onGround = true;
          e.groundRef = t;
        } else if (e.vy < 0) {
          e.y = t.y + t.h + e.h;
          e.vy = 0;
        }
        b = this.box(e);
      }

      if (e.dropThrough > 0) e.dropThrough -= dt;
    }
  };

  P.Physics = Physics;
})(window.Phefo);
