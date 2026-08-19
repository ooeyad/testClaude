window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;
  var In = P.Input;

  var ACCEL = 2600;
  var AIR_ACCEL = 1700;
  var FRICTION = 3000;
  var MAX_SPEED = 252;
  var RUN_THRESHOLD = 155;

  /**
   * Phefo's build. Upright, clean, a little long in the leg — and the only
   * figure in the game with nothing hanging off it. That absence is the design:
   * it is what makes every other silhouette read as *other*, so resist the urge
   * to give the player a horn for balance.
   *
   * Multipliers over the shared skeleton. Shape only — the renderer normalises
   * back to standing height, so none of this moves the collision box.
   */
  var BUILD = { arm: 0.95, leg: 1.10, head: 0.98 };
  var JUMP_V = -655;
  var COYOTE = 0.10;      // grace period after walking off a ledge
  var JUMP_BUFFER = 0.12; // grace period for pressing jump just before landing

  function Player(x, y) {
    P.Entity.call(this, x, y);
    this.w = 20;
    this.h = 52;
    this.hp = 100;
    this.hpMax = 100;
    this.faction = 'player';
    this.isPlayer = true;
    this.color = '#f0e9dc';

    this.weapons = ['sword', 'pistol'];
    this.wi = 0;
    this.ammo = { pistol: 12, bow: 1 };

    this.reloading = 0;
    this.reloadDur = 0;
    this.cooldown = 0;
    this.attacking = false;
    this.attackT = 0;
    this.attackDur = 0;
    this.attackHit = false;
    this.attackAngle = 0;

    this.coyote = 0;
    this.jumpBuf = 0;
    this.aim = 0;
    this.recoil = 0;
    this.kills = 0;
    this.stride = 0;
    this.landDust = false;
  }

  Player.prototype = Object.create(P.Entity.prototype);
  Player.prototype.constructor = Player;

  Player.prototype.weapon = function () { return P.Weapons.get(this.weapons[this.wi]); };
  Player.prototype.weaponKey = function () { return this.weapons[this.wi]; };

  Player.prototype.magazine = function () {
    var k = this.weaponKey();
    return this.ammo[k] == null ? 0 : this.ammo[k];
  };

  Player.prototype.giveWeapon = function (key) {
    if (this.weapons.indexOf(key) >= 0) return false;
    this.weapons.push(key);
    var w = P.Weapons.get(key);
    if (w.type === 'ranged') this.ammo[key] = w.mag;
    this.wi = this.weapons.length - 1;   // auto-equip what you just earned
    this.cancelReload();
    return true;
  };

  Player.prototype.cancelReload = function () {
    this.reloading = 0;
    this.reloadDur = 0;
  };

  Player.prototype.update = function (dt, world) {
    this.tickCommon(dt);

    if (this.dead) {
      this.deathT += dt;
      this.vx -= this.vx * Math.min(1, dt * 5);
      P.Physics.moveAndCollide(this, world.solids, dt);
      return;
    }

    // --- aiming ----------------------------------------------------------
    var mw = world.camera.toWorld(In.mouse.x, In.mouse.y);
    var o = P.Combat.origin(this);
    this.aim = Math.atan2(mw.y - o.y, mw.x - o.x);
    var aimRight = Math.cos(this.aim) >= 0 ? 1 : -1;

    var w = this.weapon();
    var frozen = this.stagger > 0;

    // --- horizontal movement ---------------------------------------------
    var ax = frozen ? 0 : In.axisX();
    var accel = this.onGround ? ACCEL : AIR_ACCEL;
    var maxSp = MAX_SPEED;
    if (this.attacking && w.type === 'melee') { accel *= 0.45; maxSp *= 0.55; }

    if (ax !== 0) {
      this.vx = U.approach(this.vx, ax * maxSp, accel * dt);
      if (w.type === 'melee' && !this.attacking) this.facing = ax;
    } else if (this.onGround) {
      this.vx = U.approach(this.vx, 0, FRICTION * dt);
    } else {
      this.vx = U.approach(this.vx, 0, 260 * dt);
    }

    // A drawn gun points where the mouse points, and the body follows it.
    if (w.type === 'ranged') this.facing = aimRight;

    // --- jumping ----------------------------------------------------------
    var wasAir = !this.onGround;
    if (this.onGround) this.coyote = COYOTE; else this.coyote = Math.max(0, this.coyote - dt);
    if (In.jumpPressed()) this.jumpBuf = JUMP_BUFFER; else this.jumpBuf = Math.max(0, this.jumpBuf - dt);

    if (this.jumpBuf > 0 && this.coyote > 0 && !frozen) {
      this.vy = JUMP_V;
      this.onGround = false;
      this.coyote = 0;
      this.jumpBuf = 0;
      P.Audio.play('jump');
      P.FX.dust(this.x, this.y, 4);
    }
    // Variable jump height: let go early and the arc is cut short.
    if (!In.jumpHeld() && this.vy < -200) this.vy += 1500 * dt;

    // Hold Down on a one-way platform to drop through it.
    if (In.isDown.apply(In, In.DOWN) && In.jumpPressed() && this.onGround &&
        this.groundRef && this.groundRef.oneWay) {
      this.dropThrough = 0.22;
      this.vy = 30;
    }

    // --- weapons ----------------------------------------------------------
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * 7);

    if (!frozen) {
      if (In.wasPressed.apply(In, In.SWAP)) this.cycleWeapon(1);
      for (var n = 1; n <= 4 && n <= this.weapons.length; n++) {
        if (In.wasPressed('Digit' + n)) this.equip(n - 1);
      }
      if (In.wasPressed.apply(In, In.RELOAD)) this.startReload();
    }

    if (this.reloading > 0) {
      this.reloading -= dt;
      if (this.reloading <= 0) {
        this.reloading = 0;
        this.ammo[this.weaponKey()] = this.weapon().mag;
      }
    }

    if (!frozen && In.attackHeld() && this.cooldown <= 0 && !this.attacking && this.reloading <= 0) {
      this.beginAttack(world);
    }

    if (this.attacking) {
      this.attackT += dt;
      var wa = P.Weapons.get(this.attackWeaponKey);
      if (!this.attackHit && this.attackT >= wa.windup) {
        this.attackHit = true;
        this.swing(world, wa);
      }
      if (this.attackT >= this.attackDur) this.attacking = false;
    }

    // --- integrate --------------------------------------------------------
    P.Physics.moveAndCollide(this, world.solids, dt);

    if (this.onGround && wasAir) P.FX.dust(this.x, this.y, 6);

    if (this.onGround && Math.abs(this.vx) > 12) {
      this.stride += Math.abs(this.vx) * dt * 0.055;
    } else if (this.onGround) {
      this.stride = U.damp(this.stride % U.TAU, 0, 8, dt);
    }
  };

  Player.prototype.equip = function (i) {
    if (i < 0 || i >= this.weapons.length || i === this.wi) return;
    this.wi = i;
    this.cancelReload();
    this.attacking = false;
    this.cooldown = Math.max(this.cooldown, 0.12);
  };

  Player.prototype.cycleWeapon = function (dir) {
    this.equip((this.wi + dir + this.weapons.length) % this.weapons.length);
  };

  Player.prototype.startReload = function () {
    var w = this.weapon();
    if (w.type !== 'ranged') return;
    if (this.reloading > 0) return;
    if (this.magazine() >= w.mag) return;
    this.reloading = w.reload;
    this.reloadDur = w.reload;
    P.Audio.play('reload');
  };

  Player.prototype.beginAttack = function (world) {
    var w = this.weapon();
    var key = this.weaponKey();

    if (w.type === 'ranged') {
      if (this.magazine() <= 0) {
        P.Audio.play('empty');
        this.startReload();
        this.cooldown = 0.25;
        return;
      }
      this.fire(world, w, key);
      this.cooldown = w.rate;
      return;
    }

    this.attacking = true;
    this.attackT = 0;
    this.attackDur = w.anim;
    this.attackHit = false;
    this.attackWeaponKey = key;
    this.attackAngle = this.aim;
    this.facing = Math.cos(this.aim) >= 0 ? 1 : -1;
    this.cooldown = w.rate;
    P.Audio.play(w.sound || 'slash');
  };

  Player.prototype.swing = function (world, w) {
    var hits = P.Combat.meleeSweep(this, world.enemies, w, this.attackAngle, world);
    if (hits.length) {
      world.camera.addShake(3 + hits.length);
      // Small lunge on a connecting hit — makes the sword feel like it bites.
      this.vx += this.facing * 60;
    }
  };

  Player.prototype.fire = function (world, w, key) {
    var o = P.Combat.origin(this);
    var a = this.aim + U.rand(-w.spread, w.spread);
    var mx = o.x + Math.cos(a) * 22;
    var my = o.y + Math.sin(a) * 22;

    world.spawnProjectile(new P.Projectile(mx, my, a, {
      kind: w.projectile,
      speed: w.speed,
      damage: w.damage,
      knock: w.knock,
      faction: 'player',
      owner: this
    }));

    this.ammo[key] = this.magazine() - 1;
    this.recoil = 1;
    this.vx -= Math.cos(a) * 42;
    P.FX.muzzle(mx, my, a);
    world.camera.addShake(2.2);
    P.Audio.play(w.sound || 'shoot');

    if (this.ammo[key] <= 0) this.startReload();
  };

  Player.prototype.onHurt = function () {
    this.invuln = 0.65;
    this.cancelReload();
    this.attacking = false;
  };

  Player.prototype.onDeath = function () {
    P.Audio.play('die');
    this.attacking = false;
    this.cancelReload();
  };

  Player.prototype.pose = function () {
    var Po = P.Poses;
    if (this.dead) return Po.death(U.clamp(this.deathT / 0.85, 0, 1));
    if (this.stagger > 0) return Po.stagger(1 - this.stagger / 0.24);

    var w = this.weapon();
    if (this.attacking && w.type === 'melee') {
      return Po.slash(U.clamp(this.attackT / this.attackDur, 0, 1));
    }
    if (!this.onGround) return Po.air(this.vy);
    if (Math.abs(this.vx) > RUN_THRESHOLD) return Po.run(this.stride);
    if (Math.abs(this.vx) > 12) return Po.walk(this.stride);
    if (w.type === 'ranged') return Po.shoot(this.recoil);
    return Po.idle(this.animT);
  };

  Player.prototype.draw = function (ctx) {
    var w = this.weapon();
    var pose = this.pose();
    var opts = {
      facing: this.facing,
      scale: 1,
      color: this.color,
      lineWidth: 3.2,
      groundLock: this.onGround && !this.dead,
      weapon: this.weaponKey(),
      flash: this.flash,
      build: BUILD
    };

    // A drawn gun tracks the cursor regardless of what the legs are doing.
    var ranged = w.type === 'ranged' && !this.dead && this.stagger <= 0;
    if (ranged) {
      var kick = this.recoil * 0.30;
      var armAbs = P.Stick.aimToShoulder(this.aim, this.facing, 0) - kick;
      pose.shoulderN = armAbs - pose.torso;
      pose.elbowN = -0.06;
      opts.weaponAngle = armAbs;
      opts.weaponState = this.reloading > 0 ? 0 : 1;
    }

    // Blink while invulnerable so the i-frames are legible.
    if (this.invuln > 0 && Math.floor(this.invuln * 22) % 2 === 0) opts.alpha = 0.35;

    if (this.onGround && !this.dead) P.Stick.shadow(ctx, this.x, this.y, 13, 0.3);
    P.Stick.draw(ctx, this.x, this.y, pose, opts);
  };

  P.Player = Player;
})(window.Phefo);
