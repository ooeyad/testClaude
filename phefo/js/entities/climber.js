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
  var MOUNT_TOL   = 8;     // how close to a ladder's centre before mounting
  var PLANE_DWELL = 0.20;  // grounded time before a plane change is believed

  function Climber(x, y, cfg) {
    P.Enemy.call(this, x, y, cfg);

    // ground | approach | climb | dismount. Only `climb` is attached, and only
    // `climb` suppresses physics.
    this.mode = 'ground';
    this.target = null;      // ladder being walked toward
    this.ladder = null;      // ladder currently attached to
    this.climbDir = 0;       // -1 up, +1 down (y grows downward)
    this.climbPhase = 0;     // animation clock, advances only while attached

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

  /**
   * The nearest ladder that actually joins this climber's plane to the player's.
   *
   * Both ends are checked. A ladder whose top lands somewhere other than where
   * the player is standing is no use, and mounting it would strand the climber
   * on the wrong roof.
   */
  Climber.prototype.pickLadder = function (world) {
    var mine = this.groundRef, theirs = this.observedSupport;
    if (!mine || !theirs) return null;

    var list = world.ladders;
    var range = this.cfg.ladderRange;
    var best = null, bestD = Infinity;

    for (var i = 0; i < list.length; i++) {
      var l = list[i];
      var d = Math.abs(l.x - this.x);
      if (d > range) continue;                       // only a ladder near me

      var up = Math.abs(l.bottom - mine.y) <= LEVEL_TOL &&
               Math.abs(l.top - theirs.y) <= LEVEL_TOL;
      var down = Math.abs(l.top - mine.y) <= LEVEL_TOL &&
                 Math.abs(l.bottom - theirs.y) <= LEVEL_TOL;
      if (!up && !down) continue;

      if (d < bestD) { bestD = d; best = l; }
    }
    return best;
  };

  /** Walk toward the chosen ladder. Abandonable — only the climb is committed. */
  Climber.prototype.updateApproach = function (dt, world) {
    var l = this.target;

    if (!l || world.player.dead || !this.onGround || this.onPlayerPlane() ||
        this.pickLadder(world) !== l) {
      this.mode = 'ground';
      this.target = null;
      P.Physics.moveAndCollide(this, world.solids, dt);
      return;
    }

    this.separate(world, dt);

    var dx = l.x - this.x;
    if (Math.abs(dx) <= MOUNT_TOL) { this.mount(l); return; }

    this.facing = dx >= 0 ? 1 : -1;
    this.walk(dt, world, this.facing);
    P.Physics.moveAndCollide(this, world.solids, dt);

    if (this.onGround && Math.abs(this.vx) > 10) {
      this.stride += Math.abs(this.vx) * dt * 0.058;
    }
  };

  /**
   * Attach. `x` is snapped rather than eased, so an approach cannot oscillate
   * around the ladder without ever satisfying the tolerance.
   */
  Climber.prototype.mount = function (l) {
    this.x = l.x;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.dropThrough = 0;
    this.ladder = l;
    this.climbDir = Math.abs(this.y - l.bottom) < Math.abs(this.y - l.top) ? -1 : 1;
    this.climbPhase = 0;
    this.mode = 'climb';
    this.target = null;
  };

  /**
   * Kinematic while attached: physics is not run at all. Zeroing gravity would
   * not be enough — collision resolution would still snap the climber onto the
   * first one-way platform whose plane it crosses, and those are exactly the
   * surfaces a ladder has to pass through.
   *
   * Committed: nothing here reconsiders the player's position. A climb that has
   * started always finishes.
   */
  Climber.prototype.updateClimb = function (dt, world) {
    var l = this.ladder;

    this.x = l.x;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.climbPhase += dt * 7;
    this.y += this.climbDir * this.cfg.climbSpeed * dt;

    var arrived = this.climbDir < 0 ? this.y <= l.top : this.y >= l.bottom;
    if (!arrived) return;

    // Exit contract, in this order. Clamping must precede the physics pass:
    // moveAndCollide captures wasBottom on entry and uses it in the one-way
    // guard, so landing exactly on the surface is what makes the platform
    // accept the landing. Resuming physics first would leave wasBottom
    // mid-ladder and drop the climber straight back down.
    this.y = this.climbDir < 0 ? l.top : l.bottom;
    this.ladder = null;
    this.climbDir = 0;
    this.mode = 'dismount';

    P.Physics.moveAndCollide(this, world.solids, dt);

    // Diagnostic only — if there is nothing underfoot the climber is already
    // dynamic and simply falls, which is recoverable rather than stuck.
    P.Physics.groundBelow(this.x, this.y + 2, world.solids, 12);

    this.setState('chase');
    this.alerted = true;      // it climbed because it saw you; engage on arrival
    this.mode = 'ground';
  };

  Climber.prototype.update = function (dt, world) {
    // Death has one owner: detach, then let the parent run its dead branch,
    // which damps vx and calls moveAndCollide so the body falls.
    if (this.dead) {
      this.ladder = null;
      this.climbDir = 0;
      this.mode = 'ground';
      P.Enemy.prototype.update.call(this, dt, world);
      return;
    }

    // Observation runs in every mode, so the decision taken on arrival is
    // current rather than stale.
    this.observePlayerPlane(dt, world);

    if (this.mode === 'ground') {
      if (this.onGround && this.stagger <= 0 && this.blockStun <= 0 &&
          !world.player.dead && !this.onPlayerPlane()) {
        var l = this.pickLadder(world);
        if (l) { this.target = l; this.mode = 'approach'; }
      }
      if (this.mode === 'ground') {
        P.Enemy.prototype.update.call(this, dt, world);
        return;
      }
    }

    // Detached from the parent's update, so its per-step housekeeping has to be
    // done here or status timers silently freeze. Exactly once, before any mode
    // is dispatched, so a step that crosses CLIMB into DISMOUNT neither skips it
    // nor does it twice.
    this.tickCommon(dt);
    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * 7);
    this.blocking = false;    // never guards while off the ground

    if (this.mode === 'approach') this.updateApproach(dt, world);
    else if (this.mode === 'climb') this.updateClimb(dt, world);
  };

  /**
   * Climbing has its own pose; everything else is the parent's, so a climber on
   * the ground looks exactly like what it fights like.
   */
  Climber.prototype.pose = function (world) {
    if (this.ladder) return P.Poses.climb(this.climbPhase);
    return P.Enemy.prototype.pose.call(this, world);
  };

  Climber.LEVEL_TOL = LEVEL_TOL;
  Climber.PLANE_DWELL = PLANE_DWELL;
  P.Climber = Climber;
})(window.Phefo);
