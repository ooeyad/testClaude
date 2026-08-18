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

  var ARMOR = 0.18;   // damage multiplier outside the window; 1 = unprotected

  function Beast(x, y, cfg) {
    P.Enemy.call(this, x, y, cfg);

    // Armoured from the first frame. `update` recomputes it every step, but a
    // hit can land before this type's first update ever runs.
    this.armor = ARMOR;
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

    this.armor = open ? 1 : ARMOR;

    // Hits outside the window move nothing. Inside it they stagger, and because
    // the parent's stagger branch returns before advancing `stateT`, landing
    // them also holds the window open a little longer. Hitting the right moment
    // is meant to buy you the next one.
    if (!open) this.stagger = 0;

    P.Enemy.prototype.update.call(this, dt, world);
  };

  P.Beast = Beast;
})(window.Phefo);
