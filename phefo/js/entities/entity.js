window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  /**
   * Shared base for everything that lives in the world and can be hit.
   * Position convention matches Physics: x = horizontal centre, y = feet.
   */
  function Entity(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.w = 20;
    this.h = 52;

    this.facing = 1;
    this.onGround = false;
    this.gravityScale = 1;
    this.dropThrough = 0;
    this.hitWall = 0;

    this.hp = 100;
    this.hpMax = 100;
    this.faction = 'neutral';

    this.dead = false;
    this.remove = false;
    this.deathT = 0;

    this.flash = 0;
    this.stagger = 0;
    this.invuln = 0;
    this.blocking = false;
    this.blockStun = 0;
    this.knockScale = 1;
    this.lastHitDir = 1;

    this.animT = 0;
    this.stride = 0;
  }

  Entity.prototype.box = function () { return P.Physics.box(this); };

  Entity.prototype.centre = function () {
    return { x: this.x, y: this.y - this.h * 0.5 };
  };

  /** Timers that every entity ticks the same way. */
  Entity.prototype.tickCommon = function (dt) {
    this.animT += dt;
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 6);
    if (this.stagger > 0) this.stagger = Math.max(0, this.stagger - dt);
    if (this.invuln > 0) this.invuln = Math.max(0, this.invuln - dt);
    if (this.blockStun > 0) this.blockStun = Math.max(0, this.blockStun - dt);
    this.hitWall = 0;
  };

  Entity.prototype.update = function () {};
  Entity.prototype.draw = function () {};

  P.Entity = Entity;
})(window.Phefo);
