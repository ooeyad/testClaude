window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;

  /**
   * Droppable rewards. Weapon pickups reuse Stick.drawWeapon for their icon, so
   * a new weapon never needs a new sprite here — it inherits the shape it already
   * has in hand.
   *
   * A weapon you already own refills its magazine instead of being refused,
   * which keeps a late-wave drop from feeling like a dud.
   */
  var KINDS = {
    sword:  { give: 'weapon', weapon: 'sword',  color: '#cfd6da', label: 'SWORD' },
    bow:    { give: 'weapon', weapon: 'bow',    color: '#d8c49a', label: 'BOW' },
    pistol: { give: 'weapon', weapon: 'pistol', color: '#c2c8cc', label: 'PISTOL' },
    knife:  { give: 'weapon', weapon: 'knife',  color: '#c8ced2', label: 'KNIFE' },
    health: { give: 'health', amount: 35,       color: '#d0603f', label: 'MEDKIT' }
  };

  function Pickup(x, y, kind) {
    P.Entity.call(this, x, y);
    this.kind = kind;
    this.def = KINDS[kind] || KINDS.health;
    this.w = 16;
    this.h = 16;
    this.faction = 'pickup';
    this.bob = U.rand(0, U.TAU);
    this.taken = false;
    this.life = 0;
  }

  Pickup.prototype = Object.create(P.Entity.prototype);
  Pickup.prototype.constructor = Pickup;

  Pickup.prototype.update = function (dt, world) {
    this.life += dt;
    this.bob += dt * 2.6;

    // Fall to the road, then sit there. Nothing else moves it.
    if (!this.onGround) P.Physics.moveAndCollide(this, world.solids, dt);

    var pl = world.player;
    if (pl.dead || this.taken) return;

    // Generous grab box — chasing a pickup mid-fight should not be fiddly.
    if (Math.abs(pl.x - this.x) > 26) return;
    if (Math.abs((pl.y - pl.h * 0.5) - (this.y - 8)) > 44) return;

    if (this.collect(pl, world)) {
      this.taken = true;
      this.remove = true;
      P.Audio.play('pickup');
      P.FX.burst(this.x, this.y - 8, -Math.PI / 2, {
        count: 10, spread: 1.2,
        speedMin: 40, speedMax: 150,
        lifeMin: 0.2, lifeMax: 0.45,
        color: this.def.color, grav: 320, drag: 0.6, type: 'streak'
      });
    }
  };

  /** Returns false when the pickup would do nothing, so it stays on the ground. */
  Pickup.prototype.collect = function (pl, world) {
    var d = this.def;

    if (d.give === 'health') {
      if (pl.hp >= pl.hpMax) return false;
      pl.hp = Math.min(pl.hpMax, pl.hp + d.amount);
      world.notify('+' + d.amount + ' HP');
      return true;
    }

    if (pl.giveWeapon(d.weapon)) {
      world.notify(d.label + ' ACQUIRED');
      return true;
    }

    // Already owned — top it up if it takes ammo, otherwise leave it lying there.
    var w = P.Weapons.get(d.weapon);
    if (w.type !== 'ranged') return false;
    if (pl.ammo[d.weapon] >= w.mag) return false;
    pl.ammo[d.weapon] = w.mag;
    if (pl.weaponKey() === d.weapon) pl.cancelReload();
    world.notify(d.label + ' RELOADED');
    return true;
  };

  Pickup.prototype.draw = function (ctx) {
    var d = this.def;
    var y = this.y - 12 + Math.sin(this.bob) * 2.5;

    ctx.save();

    // Halo, so a dropped item is findable in a dim street.
    var g = ctx.createRadialGradient(this.x, y, 1, this.x, y, 26);
    g.addColorStop(0, 'rgba(255,225,170,0.20)');
    g.addColorStop(1, 'rgba(255,225,170,0)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x - 28, y - 28, 56, 56);

    P.Stick.shadow(ctx, this.x, this.y, 9, 0.22);

    ctx.translate(this.x, y);

    if (d.give === 'health') {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(-8, -8, 16, 16);
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-8, -8, 16, 16);
      ctx.fillStyle = d.color;
      ctx.fillRect(-5.5, -1.6, 11, 3.2);
      ctx.fillRect(-1.6, -5.5, 3.2, 11);
    } else {
      // Reuse the in-hand artwork, stood upright.
      ctx.rotate(-Math.PI / 2 - 0.35);
      ctx.scale(0.85, 0.85);
      P.Stick.drawWeapon(ctx, d.weapon, d.color, 0);
    }

    ctx.restore();
  };

  Pickup.KINDS = KINDS;
  P.Pickup = Pickup;
})(window.Phefo);
