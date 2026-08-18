window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;

  var Combat = {

    /** Roughly chest height — where swings originate and shots leave from. */
    origin: function (e) {
      return { x: e.x, y: e.y - e.h * 0.62 };
    },

    centre: function (e) {
      return { x: e.x, y: e.y - e.h * 0.5 };
    },

    /**
     * Resolve a melee swing as a cone: within `reach` of the chest AND within
     * `arc` of the swing direction. A cone rather than a box is what lets a
     * downward slash miss someone standing right behind you.
     *
     * Returns the list of things it connected with.
     */
    meleeSweep: function (attacker, targets, weapon, angle, world) {
      var o = this.origin(attacker);
      var hits = [];

      for (var i = 0; i < targets.length; i++) {
        var t = targets[i];
        if (t === attacker || t.dead || t.remove) continue;
        if (t.faction === attacker.faction) continue;

        var c = this.centre(t);
        var dx = c.x - o.x, dy = c.y - o.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > weapon.reach + t.w * 0.45) continue;

        var a = Math.atan2(dy, dx);
        if (Math.abs(U.angleDelta(angle, a)) > weapon.arc / 2) continue;

        var dir = dx >= 0 ? 1 : -1;
        this.applyDamage(t, weapon.damage, {
          knock: weapon.knock,
          dirX: dir,
          source: attacker,
          world: world,
          melee: true,
          at: { x: o.x + Math.cos(a) * Math.min(d, weapon.reach), y: o.y + Math.sin(a) * Math.min(d, weapon.reach) }
        });
        hits.push(t);
      }

      return hits;
    },

    /**
     * Central damage entry point. Handles blocking, i-frames, knockback,
     * particles, hitstop and death, so nothing else in the game needs to.
     */
    applyDamage: function (target, amount, opts) {
      opts = opts || {};
      var world = opts.world;
      var at = opts.at || this.centre(target);

      if (target.dead || target.remove) return false;
      if (target.invuln > 0) return false;

      // Armour scales the hit before the guard branch, so a blocking armoured
      // target takes 15% of an already-reduced number rather than instead of it.
      // Nothing downstream changes: blood, flash, hitstop, sound and the return
      // value are what tell the player a hit landed and was shrugged off, and a
      // hit that produced none of them would read as a broken hitbox.
      if (target.armor != null) amount *= target.armor;

      // A raised guard eats most of a frontal hit and sprays sparks instead.
      // The remaining 15% still lands: chip damage is what keeps a guard from
      // being an infinite wall, and it is the reason trading into a swordsman's
      // block is a losing exchange rather than a stalemate.
      if (target.blocking && opts.dirX && opts.dirX === -target.facing) {
        amount *= 0.15;
        target.blockStun = 0.28;
        P.FX.sparks(at.x, at.y, opts.dirX > 0 ? Math.PI : 0);
        P.Audio.play('block');
        if (world) world.hitstop = Math.max(world.hitstop, 0.035);
        target.vx += (opts.knock || 0) * 0.25 * opts.dirX;

        target.hp -= amount;
        target.lastHitDir = opts.dirX;
        if (target.hp <= 0) this.kill(target, opts);
        // Still false: the caller uses this to pick spark-coloured impact FX
        // over blood, and a guarded hit should read as deflected.
        return false;
      }

      target.hp -= amount;
      target.flash = 1;
      target.lastHitDir = opts.dirX || 1;

      if (opts.knock) {
        target.vx += opts.knock * (opts.dirX || 1) * (target.knockScale == null ? 1 : target.knockScale);
        if (opts.melee && target.onGround) target.vy = -110;
      }

      if (target.onHurt) target.onHurt(amount, opts);

      P.FX.blood(at.x, at.y, opts.dirX || 1);
      if (world) world.hitstop = Math.max(world.hitstop, opts.melee ? 0.055 : 0.03);

      if (target.hp <= 0) {
        this.kill(target, opts);
      } else {
        target.stagger = Math.max(target.stagger || 0, opts.melee ? 0.24 : 0.14);
        P.Audio.play(target.isPlayer ? 'hurt' : 'hit');
      }

      return true;
    },

    /**
     * Single place that flips an entity to dead. Chip damage through a guard can
     * finish someone off too, so this cannot live inline in the main damage path.
     */
    kill: function (target, opts) {
      target.hp = 0;
      if (target.dead) return;
      target.dead = true;
      target.deathT = 0;
      if (target.onDeath) target.onDeath(opts);
    },

    /**
     * Radial damage with falloff — used by grenades and rockets. Written now so
     * the bomber and RPG soldier drop straight into a finished system.
     */
    explode: function (x, y, radius, damage, faction, world) {
      P.FX.explosion(x, y, radius);
      P.Audio.play('explode');
      if (world && world.camera) world.camera.addShake(11);

      var list = world.allCharacters();
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (t.dead || t.remove) continue;
        if (t.faction === faction) continue;
        var c = this.centre(t);
        var d = U.dist(x, y, c.x, c.y);
        if (d > radius) continue;
        var falloff = 1 - (d / radius) * 0.65;
        this.applyDamage(t, damage * falloff, {
          knock: 300 * falloff,
          dirX: c.x >= x ? 1 : -1,
          world: world,
          at: c
        });
      }
    }
  };

  P.Combat = Combat;
})(window.Phefo);
