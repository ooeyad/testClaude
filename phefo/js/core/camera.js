window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;

  function Camera(viewW, viewH) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.x = 0;
    this.y = 0;
    this.shake = 0;
    this.ox = 0;
    this.oy = 0;
    this.bounds = { minX: 0, maxX: 4000, minY: -600, maxY: 400 };
  }

  Camera.prototype.setBounds = function (minX, maxX, minY, maxY) {
    this.bounds = { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
  };

  Camera.prototype.snapTo = function (target) {
    this.x = this._targetX(target);
    this.y = this._targetY(target);
    this._clamp();
  };

  Camera.prototype._targetX = function (t) {
    // Lead the camera in the direction of travel so you see what you're running into.
    var lead = U.clamp(t.vx * 0.28, -110, 110) + t.facing * 55;
    return t.x + lead - this.viewW / 2;
  };

  Camera.prototype._targetY = function (t) {
    return t.y - this.viewH * 0.62;
  };

  Camera.prototype.follow = function (target, dt) {
    this.x = U.damp(this.x, this._targetX(target), 6, dt);
    this.y = U.damp(this.y, this._targetY(target), 4.5, dt);
    this._clamp();

    if (this.shake > 0.01) {
      var s = this.shake;
      this.ox = U.rand(-s, s);
      this.oy = U.rand(-s, s);
      this.shake = U.damp(this.shake, 0, 9, dt);
    } else {
      this.shake = 0;
      this.ox = 0;
      this.oy = 0;
    }
  };

  Camera.prototype._clamp = function () {
    var b = this.bounds;
    this.x = U.clamp(this.x, b.minX, Math.max(b.minX, b.maxX - this.viewW));
    this.y = U.clamp(this.y, b.minY, Math.max(b.minY, b.maxY - this.viewH));
  };

  Camera.prototype.addShake = function (amount) {
    this.shake = Math.min(24, this.shake + amount);
  };

  /** World -> screen. */
  Camera.prototype.apply = function (ctx) {
    ctx.translate(-Math.round(this.x + this.ox), -Math.round(this.y + this.oy));
  };

  Camera.prototype.toWorld = function (sx, sy) {
    return { x: sx + this.x + this.ox, y: sy + this.y + this.oy };
  };

  /** Generous cull test — skip drawing anything well off screen. */
  Camera.prototype.visible = function (x, y, pad) {
    pad = pad || 120;
    return x > this.x - pad && x < this.x + this.viewW + pad &&
           y > this.y - pad && y < this.y + this.viewH + pad;
  };

  P.Camera = Camera;
})(window.Phefo);
