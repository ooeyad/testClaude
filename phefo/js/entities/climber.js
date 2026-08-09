window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  /**
   * The only enemy that can use a ladder.
   *
   * Everything about fighting on the ground — chasing, telegraphing, attacking,
   * staggering, dying, drawing — is the parent's, unchanged. This subclass owns
   * exactly one thing the shared state machine cannot express: moving between
   * elevations. When it is not doing that it delegates, which is why a climber
   * on the ground is indistinguishable from a knifeman.
   *
   * Subclassing rather than adding states to Enemy.prototype.update is the whole
   * point: the four types that came before, and the brute, run code this file
   * never touches.
   */
  var LEVEL_TOL   = 24;    // two surfaces this close count as the same plane
  var PLANE_DWELL = 0.20;  // grounded time before a plane change is believed

  function Climber(x, y, cfg) {
    P.Enemy.call(this, x, y, cfg);

    // Elevation tracking. See observePlayerPlane.
    this.observedSupport = null;
    this.candidateSupport = null;
    this.candidateT = 0;
  }

  Climber.prototype = Object.create(P.Enemy.prototype);
  Climber.prototype.constructor = Climber;

  /**
   * Elevation is the surface you last stood on, never your raw y.
   *
   * Physics records `groundRef` on every landing and never clears it, for solid
   * ground and one-way platforms alike, so an airborne entity still carries the
   * plane it came from. That is what stops a player's jump from reading as a
   * change of level — which would otherwise send a climber up a ladder every
   * time you hopped on the spot.
   *
   * `groundRef` alone still flips the instant you clip a platform corner, so the
   * climber keeps its own view of it and only believes a change once the player
   * has stood there for PLANE_DWELL. Kept here rather than on the player,
   * because nothing about the player should have to know this type exists.
   */
  Climber.prototype.observePlayerPlane = function (dt, world) {
    var pl = world.player;
    if (!pl.onGround) return;          // airborne: hold the last believed plane

    var s = pl.groundRef;
    if (!s) return;                    // never landed yet

    if (s !== this.candidateSupport) {
      this.candidateSupport = s;
      this.candidateT = 0;
      return;
    }

    this.candidateT += dt;
    if (this.candidateT >= PLANE_DWELL) this.observedSupport = s;
  };

  /** True when the climber and the player's believed plane are the same level. */
  Climber.prototype.onPlayerPlane = function () {
    var mine = this.groundRef;
    var theirs = this.observedSupport;
    if (!mine || !theirs) return true;              // unknown: behave as ground
    if (mine === theirs) return true;
    return Math.abs(mine.y - theirs.y) <= LEVEL_TOL;
  };

  Climber.prototype.update = function (dt, world) {
    // Observation runs in every mode, so the decision taken on arrival is
    // current rather than stale.
    this.observePlayerPlane(dt, world);
    P.Enemy.prototype.update.call(this, dt, world);
  };

  Climber.LEVEL_TOL = LEVEL_TOL;
  Climber.PLANE_DWELL = PLANE_DWELL;
  P.Climber = Climber;
})(window.Phefo);
