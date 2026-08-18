window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  /**
   * The anvil. Enormous, slow, and almost impossible to knock off you — the only
   * enemy that keeps walking while you land hits on it.
   *
   * The swordsman punishes attacking into him; the brute punishes standing near
   * him. It carries no guard on purpose, so the counter is not timing a block
   * window but leaving: back off, let the 0.70s recovery open, hit it, back off
   * again. `knockScale` is the whole character — 0.28 against the knifeman's 1.15
   * is why staggering it into a corner does not work.
   */
  P.Enemies.define({
    type: 'brute',
    weapon: 'sword',
    hp: 150,
    speed: 78,
    aggro: 380,
    scale: 1.24,
    knockScale: 0.28,

    telegraph: 0.58,
    attackDur: 0.50,
    recover: 0.70,
    hitAt: 0.20,


    /**
     * Dread. A huge torso on short legs with a head too small for either, which
     * is the strongest thing available without art. The horns are the least of it.
     */
    build: { torso: 1.20, arm: 1.15, leg: 0.80, head: 0.75, width: 1.25 },
    features: ['hunch', 'horns'],
    unrest: 1.3,   // idle amplitude; 1 is calm
    color: '#7f8a93',
    warnColor: '#f0663a',

    attack: function (e, world) {
      var w = e.weapon();
      var o = P.Combat.origin(e);
      var c = P.Combat.centre(world.player);
      var angle = Math.atan2(c.y - o.y, c.x - o.x);

      P.Audio.play(w.sound || 'slash');
      var hits = P.Combat.meleeSweep(e, [world.player], w, angle, world);
      if (hits.length) world.camera.addShake(9);

      // Leans its whole weight into the swing, which is also what makes the
      // recovery so long.
      e.vx += e.facing * 130;
    }
  });
})(window.Phefo);
