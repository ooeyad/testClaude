window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  /**
   * The wall. Slow, heavy, and the only melee type that raises a guard, so
   * trading hits with him loses — you have to attack into his recovery window.
   *
   * `blocks` makes Enemy hold a guard during telegraph and the back half of
   * recovery; Combat.applyDamage turns a frontal hit against that guard into
   * 15% damage and sparks. The opening is the moment right after his swing.
   */
  P.Enemies.define({
    type: 'swordsman',
    weapon: 'sword',
    hp: 92,
    speed: 92,
    aggro: 400,
    scale: 1.09,
    knockScale: 0.62,
    blocks: true,

    telegraph: 0.44,
    attackDur: 0.44,
    recover: 0.52,
    hitAt: 0.17,


    /**
     * Composed, and only slightly wrong. The disciplined one, so the least
     * distorted enemy in the game - something has to sit near neutral or
     * "distorted" stops meaning anything. The jaw is the only tell.
     */
    build: { torso: 1.10, arm: 1.05, leg: 1.05, head: 0.90 },
    features: ['jaw'],
    color: '#9aa4ad',
    warnColor: '#e8934a',

    attack: function (e, world) {
      var w = e.weapon();
      var o = P.Combat.origin(e);
      var c = P.Combat.centre(world.player);
      var angle = Math.atan2(c.y - o.y, c.x - o.x);

      P.Audio.play(w.sound || 'slash');
      var hits = P.Combat.meleeSweep(e, [world.player], w, angle, world);
      if (hits.length) world.camera.addShake(6);

      e.vx += e.facing * 95;
    }
  });
})(window.Phefo);
