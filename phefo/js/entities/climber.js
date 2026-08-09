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
  function Climber(x, y, cfg) {
    P.Enemy.call(this, x, y, cfg);
  }

  Climber.prototype = Object.create(P.Enemy.prototype);
  Climber.prototype.constructor = Climber;

  P.Climber = Climber;
})(window.Phefo);
