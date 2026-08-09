window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  /**
   * Fast, fragile, and the only thing in the game that will follow you up a
   * ladder. On the ground it fights exactly like a knifeman — the difference is
   * entirely in how it arrives, which is why it is a smaller, paler silhouette:
   * the player has to be able to tell the two apart before the climb explains
   * itself.
   *
   * `ctor` is what routes construction through the Climber subclass. No other
   * enemy type names one.
   */
  P.Enemies.define({
    type: 'climber',
    ctor: P.Climber,

    weapon: 'knife',
    hp: 34,
    speed: 132,
    aggro: 430,
    scale: 0.90,
    knockScale: 1.2,

    // Climbing. Slower than its own ground speed on purpose — the climb is a
    // committed, punishable moment, not a shortcut.
    climbSpeed: 92,
    ladderRange: 240,

    telegraph: 0.24,
    attackDur: 0.26,
    recover: 0.32,
    hitAt: 0.08,

    color: '#8fb3bd',
    warnColor: '#e0a45c',

    attack: function (e, world) {
      var w = e.weapon();
      var o = P.Combat.origin(e);
      var c = P.Combat.centre(world.player);
      var angle = Math.atan2(c.y - o.y, c.x - o.x);

      P.Audio.play(w.sound || 'slash');
      var hits = P.Combat.meleeSweep(e, [world.player], w, angle, world);
      if (hits.length) world.camera.addShake(3.5);

      e.vx += e.facing * 70;
    }
  });
})(window.Phefo);
