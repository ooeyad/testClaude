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
   * `scale` is capped by its own sword. Swings originate at chest height, which
   * at this size is 64 px up while a standing player's centre is 26 px, so the
   * blade arrives steeply and the band where it actually connects narrows as the
   * body grows. At 2.15 that band closes to under a pixel at the range the AI
   * chooses to stop at, and the beast swings through you. 2.00 keeps ~4 px of
   * margin and is still half again the brute.
   *
   * `ctor` routes construction through the Beast subclass, which owns the
   * window. Read at define time, so `js/entities/beast.js` must load first.
   */
  var SLAM_ABOVE  = 40;   // px the player must be raised before a swing is hopeless
  var SLAM_BEYOND = 18;   // px past sword reach before the ground is the better bet

  // The high walkway sits 196 px up and explode measures to a target's centre,
  // another ~26 px, so a radius under about 225 leaves the top of the level
  // untouchable. Falloff does the rest: reaching you up there costs it most of
  // the damage.
  var SLAM_RADIUS          = 230;  // px
  var SLAM_RADIUS_WOUNDED  = 275;  // px
  var SLAM_DAMAGE          = 26;   // at the centre, before falloff
  var SLAM_DAMAGE_WOUNDED  = 34;

  P.Enemies.define({
    type: 'beast',
    ctor: P.Beast,

    weapon: 'sword',
    hp: 420,
    speed: 66,          // px/s — slower than the brute's 78. It never wins a race
    aggro: 900,         // px — commits from across the segment
    sight: 240,         // px vertical — clears the 196 px walkway overhead
    scale: 2.00,        // 104 px tall against the brute's 64
    lineWidth: 4.6,     // px — a body this size drawn at 3.0 reads as wire
    knockScale: 0.05,

    telegraph: 0.80,    // s — the longest wind-up in the game
    attackDur: 0.55,    // s
    recover: 0.95,      // s — the window
    hitAt: 0.22,        // s into the swing


    /**
     * The most distorted body in the game: knuckles near the ground, head almost
     * lost between its shoulders. It already stands 104 px - this is what makes
     * that height frightening rather than merely large.
     */
    build: { torso: 1.25, arm: 1.30, forearm: 1.15, leg: 0.75, head: 0.70, width: 1.15 },
    features: ['horns', 'jaw', 'hunch', 'spines'],
    unrest: 1.5,   // idle amplitude; 1 is calm
    color: '#6b4a3a',
    warnColor: '#e08a3a',

    attack: function (e, world) {
      var pl = world.player;
      var w = e.weapon();

      // A sword cannot answer someone standing on a fire escape, and the beast
      // does not climb — so when it cannot reach you it hits the ground instead
      // and lets the road do it. Radial with falloff and no line-of-sight test,
      // which is exactly why the walkway overhead is the weakest place to stand
      // rather than a safe one.
      var above = (e.y - pl.y) > SLAM_ABOVE;
      var beyond = Math.abs(pl.x - e.x) > w.reach + SLAM_BEYOND;

      if (above || beyond) {
        P.Combat.explode(
          e.x, e.y,
          e.wounded ? SLAM_RADIUS_WOUNDED : SLAM_RADIUS,
          e.wounded ? SLAM_DAMAGE_WOUNDED : SLAM_DAMAGE,
          e.faction, world
        );
        return;
      }

      var o = P.Combat.origin(e);
      var c = P.Combat.centre(pl);
      var angle = Math.atan2(c.y - o.y, c.x - o.x);

      P.Audio.play(w.sound || 'slash');
      var hits = P.Combat.meleeSweep(e, [pl], w, angle, world);
      if (hits.length) world.camera.addShake(14);

      // Carries its whole weight through the swing, which is half the reason it
      // takes so long to get its feet back under it.
      e.vx += e.facing * 90;
    }
  });
})(window.Phefo);
