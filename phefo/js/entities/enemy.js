window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;

  /**
   * One AI for every enemy in the game. Types differ only by the config block
   * they are constructed with, so "add a bomber" means writing data plus a small
   * attack function — never a new state machine.
   *
   * States: idle -> chase -> telegraph -> attack -> recover -> chase
   *
   * The telegraph state exists on purpose. A visible wind-up before every attack
   * is the difference between a fight that feels fair and one that feels random,
   * and it is the only reason a crowd of four is readable at all.
   */
  function Enemy(x, y, cfg) {
    P.Entity.call(this, x, y);
    this.cfg = cfg;
    this.type = cfg.type;
    this.faction = 'enemy';

    this.scale = cfg.scale || 1;
    this.h = 52 * this.scale;
    this.w = 19;

    this.hp = this.hpMax = cfg.hp;
    this.knockScale = cfg.knockScale == null ? 1 : cfg.knockScale;

    this.state = 'idle';
    this.stateT = 0;
    this.fired = 0;
    this.aim = 0;
    this.recoil = 0;
    this.stride = 0;
    this.alerted = false;
    this.strafeT = U.rand(0, 1.5);
    this.strafeDir = U.chance(0.5) ? 1 : -1;
    this.jitter = U.rand(0.85, 1.15);
    this.facing = -1;
  }

  Enemy.prototype = Object.create(P.Entity.prototype);
  Enemy.prototype.constructor = Enemy;

  Enemy.prototype.weapon = function () { return P.Weapons.get(this.cfg.weapon); };

  Enemy.prototype.setState = function (s) {
    this.state = s;
    this.stateT = 0;
    this.fired = 0;
  };

  Enemy.prototype.update = function (dt, world) {
    this.tickCommon(dt);
    var cfg = this.cfg;

    if (this.dead) {
      this.deathT += dt;
      this.vx -= this.vx * Math.min(1, dt * 4);
      P.Physics.moveAndCollide(this, world.solids, dt);
      if (this.deathT > 4.2) this.remove = true;
      return;
    }

    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * 7);
    this.separate(world, dt);

    // Being hit interrupts everything, including a wind-up.
    if (this.stagger > 0 || this.blockStun > 0) {
      if (this.state === 'telegraph') this.setState('recover');
      this.vx -= this.vx * Math.min(1, dt * 3);
      this.blocking = this.blockStun > 0;
      P.Physics.moveAndCollide(this, world.solids, dt);
      return;
    }

    var pl = world.player;
    var d = pl.x - this.x;
    var ad = Math.abs(d);
    var dir = d >= 0 ? 1 : -1;
    var canSee = !pl.dead && Math.abs(pl.y - this.y) < 120 && ad < cfg.aggro;

    if (canSee) this.alerted = true;
    // Once alerted, keep pursuing a bit past the aggro range so enemies don't
    // switch off the instant you step back.
    var engaged = this.alerted && !pl.dead && ad < cfg.aggro * 1.4;

    this.blocking = false;
    this.stateT += dt;

    switch (this.state) {
      case 'idle':
        this.vx -= this.vx * Math.min(1, dt * 6);
        if (engaged) this.setState('chase');
        break;

      case 'chase':
        if (!engaged) { this.setState('idle'); break; }
        this.facing = dir;
        this.chase(dt, world, ad, dir);
        break;

      case 'telegraph':
        this.facing = dir;
        this.vx -= this.vx * Math.min(1, dt * 8);
        if (cfg.blocks) this.blocking = true;
        if (this.stateT >= cfg.telegraph * this.jitter) this.setState('attack');
        break;

      case 'attack':
        this.facing = dir;
        this.vx -= this.vx * Math.min(1, dt * 2.5);
        this.runAttack(world);
        if (this.stateT >= cfg.attackDur) this.setState('recover');
        break;

      case 'recover':
        this.vx -= this.vx * Math.min(1, dt * 5);
        if (cfg.blocks && this.stateT > cfg.recover * 0.4) this.blocking = true;
        if (this.stateT >= cfg.recover * this.jitter) this.setState(engaged ? 'chase' : 'idle');
        break;
    }

    P.Physics.moveAndCollide(this, world.solids, dt);

    if (this.onGround && Math.abs(this.vx) > 10) {
      this.stride += Math.abs(this.vx) * dt * 0.058;
    }
  };

  /** Close to, or back away to, the range this type wants to fight at. */
  Enemy.prototype.chase = function (dt, world, ad, dir) {
    var cfg = this.cfg;
    var want = cfg.ranged ? cfg.preferred : this.weapon().reach * 0.82;

    if (cfg.ranged) {
      if (ad > cfg.preferred + 40) {
        this.walk(dt, world, dir);
      } else if (ad < cfg.minRange) {
        this.walk(dt, world, -dir);          // kite backwards
      } else {
        // Hold the pocket, drifting sideways so shots aren't trivial to dodge.
        this.strafeT -= dt;
        if (this.strafeT <= 0) {
          this.strafeT = U.rand(0.6, 1.5);
          this.strafeDir = U.chance(0.5) ? 1 : -1;
        }
        this.walk(dt, world, this.strafeDir, 0.45);
        if (this.stateT > 0.15) this.setState('telegraph');
      }
    } else {
      if (ad > want) {
        this.walk(dt, world, dir);
      } else {
        this.vx -= this.vx * Math.min(1, dt * 8);
        this.setState('telegraph');
      }
    }
  };

  /** Walk, but refuse to step off a ledge or grind into a wall. */
  Enemy.prototype.walk = function (dt, world, dir, speedScale) {
    var sp = this.cfg.speed * (speedScale || 1);
    var probeX = this.x + dir * (this.w * 0.5 + 7);
    var ground = P.Physics.groundBelow(probeX, this.y + 2, world.solids, 12);
    if (!ground || this.hitWall === dir) {
      this.vx -= this.vx * Math.min(1, dt * 8);
      return;
    }
    this.vx = U.approach(this.vx, dir * sp, 1500 * dt);
  };

  /** Fire or swing at the scheduled moments inside the attack state. */
  Enemy.prototype.runAttack = function (world) {
    var cfg = this.cfg;
    var times = cfg.shotTimes || [cfg.hitAt == null ? cfg.attackDur * 0.35 : cfg.hitAt];
    while (this.fired < times.length && this.stateT >= times[this.fired]) {
      cfg.attack(this, world, this.fired);
      this.fired++;
    }
  };

  /** Gentle mutual push so a pack doesn't stack into one silhouette. */
  Enemy.prototype.separate = function (world, dt) {
    var list = world.enemies;
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      if (o === this || o.dead) continue;
      var dx = o.x - this.x;
      if (Math.abs(dx) > 20 || Math.abs(o.y - this.y) > 34) continue;
      var push = (dx >= 0 ? -1 : 1) * 260 * dt;
      this.vx += push;
    }
  };

  Enemy.prototype.aimAtPlayer = function (world) {
    var o = P.Combat.origin(this);
    var c = P.Combat.centre(world.player);
    return Math.atan2(c.y - o.y, c.x - o.x);
  };

  Enemy.prototype.onDeath = function (opts) {
    P.Audio.play('die');
    P.FX.blood(this.x, this.y - this.h * 0.5, this.lastHitDir);
    if (opts && opts.world) opts.world.onEnemyKilled(this);
  };

  Enemy.prototype.pose = function (world) {
    var Po = P.Poses;
    var cfg = this.cfg;

    if (this.dead) return Po.death(U.clamp(this.deathT / 0.85, 0, 1));
    if (this.stagger > 0) return Po.stagger(1 - this.stagger / 0.24);
    if (this.blocking) return Po.block();
    if (this.state === 'telegraph') {
      return Po.telegraph(U.clamp(this.stateT / (cfg.telegraph * this.jitter), 0, 1), cfg.ranged);
    }
    if (this.state === 'attack') {
      if (cfg.ranged) return Po.shoot(this.recoil);
      return Po.slash(U.clamp(this.stateT / cfg.attackDur, 0, 1));
    }
    if (!this.onGround) return Po.air(this.vy);
    if (Math.abs(this.vx) > 12) return Po.walk(this.stride);
    return Po.idle(this.animT + this.jitter * 3);
  };

  Enemy.prototype.draw = function (ctx, world) {
    var cfg = this.cfg;
    var pose = this.pose(world);

    // Warm tint on the back half of a wind-up: the "here it comes" cue.
    var color = cfg.color;
    if (this.state === 'telegraph' && this.stateT / (cfg.telegraph * this.jitter) > 0.45) {
      color = cfg.warnColor || '#e0a45c';
    }

    var opts = {
      facing: this.facing,
      scale: this.scale,
      color: color,
      lineWidth: 3.0,
      groundLock: this.onGround && !this.dead,
      weapon: cfg.weapon,
      flash: this.flash
    };

    if (this.dead) opts.alpha = U.clamp((4.2 - this.deathT) / 1.1, 0, 1);

    // Ranged types track the player with the weapon arm, same rig as Phefo.
    if (cfg.ranged && !this.dead && this.stagger <= 0 &&
        (this.state === 'telegraph' || this.state === 'attack' || this.state === 'chase')) {
      var aim = this.aimAtPlayer(world);
      var armAbs = P.Stick.aimToShoulder(aim, this.facing, 0) - this.recoil * 0.28;
      pose.shoulderN = armAbs - pose.torso;
      pose.elbowN = -0.06;
      opts.weaponAngle = armAbs;
      opts.weaponState = this.state === 'telegraph' ? 1 : 0;
    }

    if (this.onGround && !this.dead) P.Stick.shadow(ctx, this.x, this.y, 12 * this.scale, 0.26);
    P.Stick.draw(ctx, this.x, this.y, pose, opts);

    if (!this.dead && this.hp < this.hpMax) this.drawHealth(ctx);
  };

  Enemy.prototype.drawHealth = function (ctx) {
    var w = 24 * this.scale;
    var x = this.x - w / 2;
    var y = this.y - this.h - 11;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(x - 1, y - 1, w + 2, 4);
    ctx.fillStyle = this.cfg.warnColor || '#d0603f';
    ctx.fillRect(x, y, w * U.clamp(this.hp / this.hpMax, 0, 1), 2);
    ctx.restore();
  };

  P.Enemy = Enemy;
  P.Enemies = { registry: {} };

  P.Enemies.define = function (cfg) { P.Enemies.registry[cfg.type] = cfg; };

  P.Enemies.spawn = function (type, x, y) {
    var cfg = P.Enemies.registry[type];
    if (!cfg) throw new Error('Unknown enemy type: ' + type);
    // A type may name its own constructor when it needs behaviour the shared
    // state machine cannot express. Types that do not are built as before.
    var Ctor = cfg.ctor || P.Enemy;
    return new Ctor(x, y, cfg);
  };
})(window.Phefo);
