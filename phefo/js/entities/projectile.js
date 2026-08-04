window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;

  /**
   * Projectile kinds. `grav` of 0 gives a flat bullet; anything above arcs, and
   * arcing is what makes the archer a genuinely different threat from the gunman
   * even though they share all this code.
   */
  var KINDS = {
    bullet: { speed: 920, grav: 0,    life: 1.5, color: '#ffd9a0', len: 10, wide: 2.0, rotates: false, trail: false },
    arrow:  { speed: 660, grav: 900,  life: 3.5, color: '#d8c49a', len: 20, wide: 1.8, rotates: true,  trail: false },
    grenade:{ speed: 420, grav: 1250, life: 1.6, color: '#8f9a72', len: 0,  wide: 4.0, rotates: true,  trail: true,
              bounce: 0.42, fuse: 1.6, blast: { r: 78, dmg: 46 } },
    rocket: { speed: 400, grav: 130,  life: 4.0, color: '#e2704a', len: 14, wide: 3.2, rotates: true,  trail: true,
              accel: 620, blast: { r: 92, dmg: 58 } }
  };

  function Projectile(x, y, angle, opts) {
    P.Entity.call(this, x, y);
    var k = KINDS[opts.kind] || KINDS.bullet;
    this.kind = opts.kind || 'bullet';
    this.def = k;

    this.w = 4;
    this.h = 4;
    var speed = opts.speed || k.speed;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.angle = angle;

    this.damage = opts.damage == null ? 10 : opts.damage;
    this.knock = opts.knock == null ? 80 : opts.knock;
    this.faction = opts.faction || 'enemy';
    this.owner = opts.owner || null;
    this.life = k.life;
    this.fuse = k.fuse || 0;
    this.trailT = 0;
  }

  Projectile.prototype = Object.create(P.Entity.prototype);
  Projectile.prototype.constructor = Projectile;

  Projectile.prototype.update = function (dt, world) {
    this.life -= dt;
    if (this.life <= 0) { this.expire(world); return; }

    if (this.def.accel) {
      var m = Math.max(1, Math.sqrt(this.vx * this.vx + this.vy * this.vy));
      this.vx += (this.vx / m) * this.def.accel * dt;
      this.vy += (this.vy / m) * this.def.accel * dt;
    }
    this.vy += this.def.grav * dt;

    if (this.def.rotates) this.angle = Math.atan2(this.vy, this.vx);

    if (this.def.trail) {
      this.trailT -= dt;
      if (this.trailT <= 0) {
        this.trailT = 0.02;
        P.FX.trail(this.x, this.y, this.kind === 'rocket' ? '#c8783f' : '#7b8268');
      }
    }

    // Substep so a fast bullet cannot skip through a body or a wall.
    var travel = Math.sqrt(this.vx * this.vx + this.vy * this.vy) * dt;
    var steps = Math.max(1, Math.ceil(travel / 6));
    var sdt = dt / steps;

    for (var s = 0; s < steps; s++) {
      this.x += this.vx * sdt;
      this.y += this.vy * sdt;

      if (this.hitSolids(world)) return;
      if (this.hitCharacters(world)) return;
    }

    if (this.fuse > 0) {
      this.fuse -= dt;
      if (this.fuse <= 0) { this.expire(world); return; }
    }

    if (this.x < world.bounds.minX - 300 || this.x > world.bounds.maxX + 300 || this.y > world.bounds.maxY + 400) {
      this.remove = true;
    }
  };

  Projectile.prototype.hitSolids = function (world) {
    var solids = world.solids;
    for (var i = 0; i < solids.length; i++) {
      var s = solids[i];
      if (s.oneWay) continue;
      if (!P.Physics.pointInRect(this.x, this.y, s)) continue;

      if (this.def.bounce) {
        // Crude but readable bounce: reflect off whichever face is nearer.
        var penL = Math.abs(this.x - s.x), penR = Math.abs(s.x + s.w - this.x);
        var penT = Math.abs(this.y - s.y), penB = Math.abs(s.y + s.h - this.y);
        var m = Math.min(penL, penR, penT, penB);
        if (m === penT || m === penB) {
          this.y = m === penT ? s.y - 1 : s.y + s.h + 1;
          this.vy = -this.vy * this.def.bounce;
          this.vx *= 0.7;
        } else {
          this.x = m === penL ? s.x - 1 : s.x + s.w + 1;
          this.vx = -this.vx * this.def.bounce;
        }
        return false;
      }

      this.expire(world, true);
      return true;
    }
    return false;
  };

  Projectile.prototype.hitCharacters = function (world) {
    var list = world.allCharacters();
    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      if (t.dead || t.remove) continue;
      if (t.faction === this.faction) continue;
      var b = P.Physics.box(t);
      if (this.x < b.l || this.x > b.r || this.y < b.t || this.y > b.b) continue;

      if (this.def.blast) { this.expire(world, true); return true; }

      var applied = P.Combat.applyDamage(t, this.damage, {
        knock: this.knock,
        dirX: this.vx >= 0 ? 1 : -1,
        world: world,
        at: { x: this.x, y: this.y }
      });
      // A blocked shot stops here rather than punching through the guard.
      P.FX.impact(this.x, this.y, this.angle, applied ? '#e0b39a' : '#ffe1ab');
      this.remove = true;
      return true;
    }
    return false;
  };

  Projectile.prototype.expire = function (world, struck) {
    this.remove = true;
    if (this.def.blast) {
      P.Combat.explode(this.x, this.y, this.def.blast.r, this.def.blast.dmg, this.faction, world);
    } else if (struck) {
      P.FX.impact(this.x, this.y, this.angle, '#c9cfd2');
      P.FX.sparks(this.x, this.y, this.angle + Math.PI);
    }
  };

  Projectile.prototype.draw = function (ctx) {
    var d = this.def;
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.kind === 'grenade') {
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(0, 0, d.wide, 0, U.TAU);
      ctx.fill();
      // Fuse blinks faster as it runs out.
      if (Math.sin(this.animT * 40 * (1 + (1 - this.fuse))) > 0) {
        ctx.fillStyle = '#ff6a3c';
        ctx.beginPath();
        ctx.arc(0, -d.wide, 1.4, 0, U.TAU);
        ctx.fill();
      }
    } else {
      ctx.rotate(this.angle);
      ctx.strokeStyle = d.color;
      ctx.lineCap = 'round';
      ctx.lineWidth = d.wide;
      ctx.beginPath();
      ctx.moveTo(-d.len, 0);
      ctx.lineTo(d.len * 0.28, 0);
      ctx.stroke();

      if (this.kind === 'arrow') {
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-d.len, -2.5); ctx.lineTo(-d.len + 5, 0);
        ctx.moveTo(-d.len, 2.5);  ctx.lineTo(-d.len + 5, 0);
        ctx.stroke();
      } else if (this.kind === 'bullet') {
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = d.wide * 2.4;
        ctx.beginPath();
        ctx.moveTo(-d.len * 0.7, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  Projectile.KINDS = KINDS;
  P.Projectile = Projectile;
})(window.Phefo);
