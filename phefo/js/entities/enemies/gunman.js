window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;

  /**
   * Holds the mid pocket and fires two-round bursts. Kites backwards when you
   * close, which is what turns him from a nuisance into the reason you need the
   * pistol — chasing a gunman across open road while a knifeman follows you is
   * the fight this type exists to create.
   *
   * Spread is deliberately wider than the player's pistol. The gunman should
   * threaten you at range without out-shooting you at it.
   */
  P.Enemies.define({
    type: 'gunman',
    weapon: 'pistol',
    hp: 52,
    speed: 108,
    aggro: 560,
    scale: 1,
    knockScale: 1.1,

    ranged: true,
    preferred: 250,
    minRange: 155,

    telegraph: 0.40,
    attackDur: 0.38,
    shotTimes: [0.03, 0.19],
    recover: 0.72,


    /**
     * Lean and hunched over its aim, thinner-lined than the rest.
     */
    build: { arm: 1.15, leg: 1.02, head: 0.82, width: 0.88 },
    features: ['jaw', 'spines'],
    unrest: 1.2,   // idle amplitude; 1 is calm
    color: '#96a2ad',
    warnColor: '#e5a05c',

    attack: function (e, world) {
      var w = e.weapon();
      var o = P.Combat.origin(e);
      var a = e.aimAtPlayer(world) + U.rand(-w.spread * 3.2, w.spread * 3.2);

      var mx = o.x + Math.cos(a) * 20;
      var my = o.y + Math.sin(a) * 20;

      world.spawnProjectile(new P.Projectile(mx, my, a, {
        kind: w.projectile,
        speed: w.speed,
        damage: w.damage,
        knock: w.knock,
        faction: 'enemy',
        owner: e
      }));

      e.recoil = 1;
      e.vx -= Math.cos(a) * 26;
      P.FX.muzzle(mx, my, a);
      P.Audio.play(w.sound || 'shoot');
    }
  });
})(window.Phefo);
