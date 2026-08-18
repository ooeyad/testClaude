window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  /**
   * The thing at the end of the street.
   *
   * The brute is beaten by patience: back off, wait out its recovery, take one
   * hit, back off again. The beast cannot be beaten that way, because patience
   * alone does not get through its hide — outside one window, a sword leaves a
   * mark and almost nothing else. That window is its own recovery, the moment it
   * has committed everything to a swing and has nothing left to hold up.
   *
   * So the fight is the brute's inverted. Against the brute you wait for a safe
   * moment to hit. Against the beast the only moment that counts is the one
   * immediately after it has tried to kill you, and you have to be standing
   * close enough to use it.
   *
   * Everything else — chasing, telegraphing, attacking, dying, drawing — is the
   * parent's, unchanged. This subclass owns one thing the shared state machine
   * cannot express: when the body is worth hitting.
   */

  var ARMOR_WHOLE   = 0.18;  // damage multiplier outside the window; 1 = unprotected
  var ARMOR_WOUNDED = 0.10;
  var JITTER_WOUNDED = 0.72; // multiplies telegraph and recover — see the turn
  var WOUNDED_AT    = 0.5;   // fraction of max hp
  var WOUNDED_COLOR = '#8a3b2c';

  /**
   * The registry hands **one** config object to every spawn of a type, so
   * `this.cfg` is shared state and writing to it retunes every beast alive and
   * every one that spawns afterwards, for the rest of the session. The beast is
   * the only type that changes mid-fight, so it takes a copy and owns it.
   */
  function ownCfg(cfg) {
    var out = {}, k;
    for (k in cfg) {
      if (Object.prototype.hasOwnProperty.call(cfg, k)) out[k] = cfg[k];
    }
    return out;
  }

  function Beast(x, y, cfg) {
    P.Enemy.call(this, x, y, cfg);
    this.cfg = ownCfg(cfg);

    // Armoured from the first frame. `update` recomputes it every step, but a
    // hit can land before this type's first update ever runs.
    this.armorBase = ARMOR_WHOLE;
    this.armor = ARMOR_WHOLE;

    // The parent randomises jitter per spawn for variety. The beast is fought
    // once and its timings are the fight, so it starts at exactly what the
    // config says and the turn is the only thing that moves them.
    this.jitter = 1;
    this.wounded = false;
  }

  Beast.prototype = Object.create(P.Enemy.prototype);
  Beast.prototype.constructor = Beast;

  /**
   * Set the window, then delegate. Delegating rather than reimplementing is what
   * keeps the status timers ticking exactly once a step — a subclass that
   * bypasses the parent has to run them itself, and forgetting freezes i-frames,
   * stagger and flash without any visible error.
   *
   * Order matters twice here. The armour value is read by the damage funnel
   * between steps, so it has to describe the state the beast is *in*, not the
   * one it is about to enter. And the stagger has to be cleared before the
   * parent sees it, because the parent freezes the whole entity for a step on
   * `stagger > 0` — which is exactly the stun-lock a body this size must not be
   * vulnerable to.
   */
  Beast.prototype.update = function (dt, world) {
    var open = this.state === 'recover';

    this.armor = open ? 1 : this.armorBase;

    // Hits outside the window move nothing. Inside it they stagger, and because
    // the parent's stagger branch returns before advancing `stateT`, landing
    // them also holds the window open a little longer. Hitting the right moment
    // is meant to buy you the next one.
    if (!open) this.stagger = 0;

    P.Enemy.prototype.update.call(this, dt, world);
  };

  /**
   * The turn. Half its health gone and it stops treating you as an irritation.
   *
   * It is announced by being *given* something: the hit that crosses the line
   * drops it straight into its recovery, so the player's reward for reaching
   * halfway is one free window, and the roar happens while they are taking it.
   * Everything that gets worse — thinner hide, faster wind-up, tighter window —
   * lands on the cycle after, which is what makes this a warning rather than an
   * ambush.
   *
   * Forcing an existing state rather than adding one is deliberate: a stage
   * state would live in the shared machine, where six other types would run past
   * it every frame.
   */
  Beast.prototype.onHurt = function (amount, opts) {
    if (this.wounded || this.dead) return;
    if (this.hp > this.hpMax * WOUNDED_AT) return;

    this.wounded = true;
    this.armorBase = ARMOR_WOUNDED;
    this.jitter = JITTER_WOUNDED;
    this.cfg.color = WOUNDED_COLOR;

    this.setState('recover');

    // Opened here rather than left to the next step. `update` would do it 8 ms
    // later anyway, but the free window is the whole announcement — it should be
    // open from the instant the hit that earned it lands.
    this.armor = 1;

    P.Audio.play('explode');
    if (opts && opts.world) {
      opts.world.camera.addShake(16);
      opts.world.hitstop = Math.max(opts.world.hitstop, 0.12);
    }
  };

  P.Beast = Beast;
})(window.Phefo);
