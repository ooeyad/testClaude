window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  /**
   * Enormous, slow, and worth hitting for less than a second at a time.
   *
   * The numbers only make sense together. 420 hp would be a grind on its own;
   * behind `armor` it is six or seven clean windows, which is a fight rather
   * than a chore. The 0.80s wind-up is the longest in the game because at this
   * size an unreadable attack is not hard, only unfair — and the same wind-up is
   * what makes the 0.95s recovery worth waiting through.
   *
   * `knockScale` 0.05 is the character, the way 0.28 is the brute's: it does not
   * flinch, it does not slide, and there is no corner to stagger it into.
   *
   * `ctor` routes construction through the Beast subclass, which owns the
   * window. Read at define time, so `js/entities/beast.js` must load first.
   */
  P.Enemies.define({
    type: 'beast',
    ctor: P.Beast,

    weapon: 'sword',
    hp: 420,
    speed: 66,          // px/s — slower than the brute's 78. It never wins a race
    aggro: 900,         // px — commits from across the segment
    sight: 240,         // px vertical — clears the 196 px walkway overhead
    scale: 2.15,        // 112 px tall against the brute's 64
    lineWidth: 4.6,     // px — a body this size drawn at 3.0 reads as wire
    knockScale: 0.05,

    telegraph: 0.80,    // s — the longest wind-up in the game
    attackDur: 0.55,    // s
    recover: 0.95,      // s — the window
    hitAt: 0.22,        // s into the swing

    color: '#6b4a3a',
    warnColor: '#e08a3a',

    attack: function (e, world) {
      var w = e.weapon();
      var o = P.Combat.origin(e);
      var c = P.Combat.centre(world.player);
      var angle = Math.atan2(c.y - o.y, c.x - o.x);

      P.Audio.play(w.sound || 'slash');
      var hits = P.Combat.meleeSweep(e, [world.player], w, angle, world);
      if (hits.length) world.camera.addShake(14);

      // Carries its whole weight through the swing, which is half the reason it
      // takes so long to get its feet back under it.
      e.vx += e.facing * 90;
    }
  });
})(window.Phefo);
