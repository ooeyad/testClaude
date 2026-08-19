window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;
  var ARROW_GRAV = P.Projectile.KINDS.arrow.grav;

  /**
   * Longest reach in the game and the slowest draw. Because the arrow arcs, he
   * is the one enemy whose shots you dodge by moving rather than by taking cover
   * — and the one you can duck under a fire escape to defeat.
   *
   * The aim is a one-step ballistic estimate: guess the flight time from the
   * straight-line distance, then aim at where gravity says to aim for that time.
   * A full solve buys nothing here; one iteration is already accurate enough
   * that a standing target gets hit and a moving one usually does not.
   */
  function ballisticAngle(from, target, targetVX, speed) {
    var dx = target.x - from.x;
    var dy = target.y - from.y;
    var flight = Math.sqrt(dx * dx + dy * dy) / speed;

    // Lead the player a little, then lift the aim by the drop over that flight.
    var aimX = target.x + targetVX * flight * 0.55;
    var aimY = target.y - 0.5 * ARROW_GRAV * flight * flight;

    return Math.atan2(aimY - from.y, aimX - from.x);
  }

  P.Enemies.define({
    type: 'archer',
    weapon: 'bow',
    hp: 46,
    speed: 100,
    aggro: 680,
    scale: 1.02,
    knockScale: 1.2,

    ranged: true,
    preferred: 350,
    minRange: 215,

    telegraph: 0.70,
    attackDur: 0.26,
    shotTimes: [0.03],
    recover: 0.88,


    /**
     * Long and spidery, built around the draw - the tallest-reading silhouette
     * without being any taller.
     */
    build: { arm: 1.28, forearm: 1.18, leg: 1.18, head: 0.78, width: 0.78 },
    features: ['spines', 'tail'],
    unrest: 1.1,   // idle amplitude; 1 is calm
    color: '#94a08d',
    warnColor: '#d9c06a',

    attack: function (e, world) {
      var w = e.weapon();
      var o = P.Combat.origin(e);
      var pl = world.player;
      var c = P.Combat.centre(pl);

      var a = ballisticAngle(o, c, pl.vx, w.speed) + U.rand(-w.spread, w.spread);
      var mx = o.x + Math.cos(a) * 18;
      var my = o.y + Math.sin(a) * 18;

      world.spawnProjectile(new P.Projectile(mx, my, a, {
        kind: w.projectile,
        speed: w.speed,
        damage: w.damage,
        knock: w.knock,
        faction: 'enemy',
        owner: e
      }));

      e.recoil = 1;
      P.Audio.play(w.sound || 'arrow');
    }
  });
})(window.Phefo);
