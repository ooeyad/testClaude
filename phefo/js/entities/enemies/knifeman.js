window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  /**
   * The baseline threat: fast, fragile, closes to knife range and jabs.
   *
   * Short telegraph and short recovery, which makes a single knifeman easy and a
   * pack of three genuinely dangerous — the pressure comes from overlapping
   * wind-ups, not from any one of them being strong.
   */
  P.Enemies.define({
    type: 'knifeman',
    weapon: 'knife',
    hp: 42,
    speed: 124,
    aggro: 430,
    scale: 0.97,
    knockScale: 1.15,

    telegraph: 0.26,
    attackDur: 0.28,
    recover: 0.34,
    hitAt: 0.09,

    color: '#8c9aa6',
    warnColor: '#e0a45c',

    attack: function (e, world) {
      var w = e.weapon();
      var o = P.Combat.origin(e);
      var c = P.Combat.centre(world.player);
      var angle = Math.atan2(c.y - o.y, c.x - o.x);

      P.Audio.play(w.sound || 'slash');
      var hits = P.Combat.meleeSweep(e, [world.player], w, angle, world);
      if (hits.length) world.camera.addShake(3.5);

      // Small committed step into the jab.
      e.vx += e.facing * 70;
    }
  });
})(window.Phefo);
