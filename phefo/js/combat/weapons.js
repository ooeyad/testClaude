window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  /**
   * Every weapon in the game is one row in this table. Adding a shotgun or an
   * RPG later costs an entry here plus a shape in Stick.drawWeapon — no new
   * systems. That is the point of keeping weapons as pure data.
   *
   *   type      'melee' | 'ranged'
   *   damage    per hit / per projectile
   *   rate      seconds between attacks
   *   arc       melee: full sweep angle in radians
   *   reach     melee: pixels from the chest
   *   knock     knockback impulse applied to whatever it hits
   *   mag       ranged: rounds per magazine (null = infinite)
   *   reload    ranged: seconds to reload
   *   spread    ranged: random angle jitter in radians
   *   windup    seconds of wind-up before the hit lands (also the anim length)
   */
  var TABLE = {
    fist: {
      key: 'fist', name: 'Fists', type: 'melee',
      damage: 9, rate: 0.34, arc: 1.25, reach: 30, knock: 130,
      windup: 0.13, anim: 0.30, sound: 'slash'
    },

    knife: {
      key: 'knife', name: 'Knife', type: 'melee',
      damage: 17, rate: 0.30, arc: 1.15, reach: 36, knock: 150,
      windup: 0.11, anim: 0.26, sound: 'slash'
    },

    sword: {
      key: 'sword', name: 'Sword', type: 'melee',
      damage: 34, rate: 0.46, arc: 1.75, reach: 54, knock: 240,
      windup: 0.16, anim: 0.42, sound: 'slash'
    },

    pistol: {
      key: 'pistol', name: 'Pistol', type: 'ranged',
      damage: 18, rate: 0.26, mag: 12, reload: 1.6,
      spread: 0.035, speed: 920, projectile: 'bullet',
      knock: 90, sound: 'shoot'
    },

    bow: {
      key: 'bow', name: 'Bow', type: 'ranged',
      damage: 30, rate: 0.9, mag: 1, reload: 1.0,
      spread: 0.02, speed: 660, projectile: 'arrow',
      knock: 130, sound: 'arrow'
    }
  };

  var Weapons = {
    table: TABLE,

    get: function (key) { return TABLE[key] || TABLE.fist; },

    isRanged: function (key) { return this.get(key).type === 'ranged'; },

    /** Display ammo as "7/12", or an infinity dash for melee. */
    ammoLabel: function (key, ammo) {
      var w = this.get(key);
      if (w.type !== 'ranged') return '—';
      return ammo + '/' + w.mag;
    }
  };

  P.Weapons = Weapons;
})(window.Phefo);
