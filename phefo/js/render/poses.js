window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;

  /**
   * A pose is a bag of joint ANGLES in radians. No positions here — stickman.js
   * turns these into points via forward kinematics.
   *
   * Conventions (all in a canonical facing-RIGHT space; mirroring happens at draw):
   *   torso    0 = upright, + = leaning forward
   *   shoulder 0 = arm hanging straight down, + = swung forward
   *   elbow    additive to the shoulder angle, - = bent backward
   *   hip      0 = leg straight down, + = swung forward
   *   knee     additive to the hip, - = shin folds backward (the only way a knee bends)
   *
   * "N" is the near limb (drawn in front), "F" is the far limb (drawn behind and
   * dimmed). The near arm is the one that holds the weapon.
   */

  function base() {
    return {
      torso: 0.06,
      headTilt: 0,
      shoulderN: 0, elbowN: -0.2,
      shoulderF: 0, elbowF: -0.2,
      hipN: 0, kneeN: -0.08,
      hipF: 0, kneeF: -0.08,
      lunge: 0
    };
  }

  var Poses = {

    idle: function (t) {
      var p = base();
      var breath = Math.sin(t * 2.1);
      p.torso = 0.07 + breath * 0.022;
      p.headTilt = breath * 0.03;
      p.hipN = 0.12;  p.kneeN = -0.10;
      p.hipF = -0.11; p.kneeF = -0.15;
      p.shoulderN = 0.14 + breath * 0.05; p.elbowN = -0.32;
      p.shoulderF = -0.09 + breath * 0.05; p.elbowF = -0.26;
      return p;
    },

    /**
     * Walk cycle. `ph` advances with distance travelled, not time, so the feet
     * stay planted-looking at any speed.
     *
     * The knee only bends during the swing phase (when the leg is travelling
     * forward, i.e. cos(ph) > 0) and stays straight through stance — that single
     * rule is most of what makes a walk read as a walk.
     */
    walk: function (ph) {
      var p = base();
      p.torso = 0.11;
      p.hipN = 0.55 * Math.sin(ph);
      p.kneeN = -0.95 * Math.max(0, Math.cos(ph)) - 0.06;
      p.hipF = 0.55 * Math.sin(ph + Math.PI);
      p.kneeF = -0.95 * Math.max(0, Math.cos(ph + Math.PI)) - 0.06;
      // Arms counter-swing against the legs.
      p.shoulderN = -0.40 * Math.sin(ph);
      p.elbowN = -0.34 - 0.20 * Math.max(0, Math.cos(ph + Math.PI));
      p.shoulderF = -0.40 * Math.sin(ph + Math.PI);
      p.elbowF = -0.34 - 0.20 * Math.max(0, Math.cos(ph));
      return p;
    },

    run: function (ph) {
      var p = base();
      p.torso = 0.30;
      p.headTilt = -0.14;
      p.hipN = 0.92 * Math.sin(ph);
      p.kneeN = -1.45 * Math.max(0, Math.cos(ph)) - 0.16;
      p.hipF = 0.92 * Math.sin(ph + Math.PI);
      p.kneeF = -1.45 * Math.max(0, Math.cos(ph + Math.PI)) - 0.16;
      p.shoulderN = -0.78 * Math.sin(ph);
      p.elbowN = -0.85 - 0.25 * Math.max(0, Math.cos(ph + Math.PI));
      p.shoulderF = -0.78 * Math.sin(ph + Math.PI);
      p.elbowF = -0.85 - 0.25 * Math.max(0, Math.cos(ph));
      return p;
    },

    /** Blends between a tucked launch and a spread fall based on vertical speed. */
    air: function (vy) {
      var p = base();
      var k = U.clamp(vy / 620, -1, 1);   // -1 rising hard, +1 falling hard
      var f = (k + 1) / 2;                // 0 rising -> 1 falling

      p.torso = U.lerp(0.24, -0.05, f);
      p.hipN = U.lerp(0.72, 0.30, f);
      p.kneeN = U.lerp(-1.25, -0.30, f);
      p.hipF = U.lerp(-0.30, -0.52, f);
      p.kneeF = U.lerp(-0.62, -0.22, f);
      p.shoulderN = U.lerp(-1.05, -1.55, f);
      p.elbowN = U.lerp(-0.55, -0.25, f);
      p.shoulderF = U.lerp(-0.75, -1.30, f);
      p.elbowF = U.lerp(-0.45, -0.20, f);
      return p;
    },

    /**
     * Melee swing. Slow wind-up, fast strike, short follow-through — the
     * asymmetry is what sells the impact and gives the player a readable tell.
     */
    slash: function (prog) {
      var p = base();
      var k;
      if (prog < 0.34) {
        k = U.easeIn(prog / 0.34) * 0.22;          // wind up, barely moves
      } else if (prog < 0.55) {
        k = 0.22 + U.easeOut((prog - 0.34) / 0.21) * 0.66;  // the strike
      } else {
        k = 0.88 + U.easeOut((prog - 0.55) / 0.45) * 0.12;  // follow through
      }

      p.torso = U.lerp(-0.22, 0.40, k);
      p.headTilt = U.lerp(0.14, -0.06, k);
      p.shoulderN = U.lerp(-2.30, 1.45, k);
      p.elbowN = U.lerp(-0.95, -0.08, k);
      p.shoulderF = U.lerp(0.55, -0.62, k);
      p.elbowF = U.lerp(-0.70, -0.95, k);

      // Braced stance that leans into the swing.
      p.hipN = U.lerp(-0.18, 0.42, k);
      p.kneeN = -0.22;
      p.hipF = U.lerp(0.30, -0.34, k);
      p.kneeF = -0.34;
      p.lunge = Math.sin(k * Math.PI) * 3.5;
      return p;
    },

    /** Feet-planted shooting stance; the firing arm gets overridden by the aim. */
    shoot: function (recoil) {
      var p = base();
      p.torso = 0.10 - recoil * 0.22;
      p.headTilt = -0.05;
      p.hipN = 0.26;  p.kneeN = -0.20;
      p.hipF = -0.30; p.kneeF = -0.38;
      p.shoulderF = -0.55 + recoil * 0.2;
      p.elbowF = -1.15;
      return p;
    },

    /** Wind-up tell before an enemy attacks — deliberately exaggerated. */
    telegraph: function (prog, ranged) {
      var p = base();
      var k = U.easeOut(prog);
      p.torso = U.lerp(0.05, ranged ? 0.02 : -0.30, k);
      p.headTilt = U.lerp(0, -0.12, k);
      p.shoulderN = U.lerp(0.10, ranged ? -1.55 : -2.30, k);
      p.elbowN = U.lerp(-0.30, ranged ? -0.10 : -1.00, k);
      p.shoulderF = U.lerp(-0.10, ranged ? -1.20 : 0.55, k);
      p.elbowF = U.lerp(-0.30, -0.75, k);
      p.hipN = U.lerp(0.10, -0.22, k);
      p.kneeN = -0.20;
      p.hipF = U.lerp(-0.10, 0.34, k);
      p.kneeF = -0.36;
      return p;
    },

    /** Knocked back — arms fly up, torso folds away from the hit. */
    stagger: function (prog) {
      var p = base();
      var k = 1 - U.easeOut(prog);
      p.torso = -0.55 * k;
      p.headTilt = -0.30 * k;
      p.shoulderN = -1.30 * k + 0.1;
      p.elbowN = -0.55;
      p.shoulderF = -1.55 * k + 0.1;
      p.elbowF = -0.40;
      p.hipN = 0.34 * k + 0.1;
      p.kneeN = -0.45 * k;
      p.hipF = -0.42 * k;
      p.kneeF = -0.55 * k - 0.1;
      return p;
    },

    /** Guard up — used by the swordsman when he blocks. */
    block: function () {
      var p = base();
      p.torso = -0.10;
      p.shoulderN = -1.20; p.elbowN = -1.30;
      p.shoulderF = -0.85; p.elbowF = -1.15;
      p.hipN = 0.22;  p.kneeN = -0.35;
      p.hipF = -0.26; p.kneeF = -0.42;
      return p;
    },

    /**
     * Collapse. Returns the pose plus `rootRot` / `rootDrop`, which stickman.js
     * applies to the whole figure so the body topples rather than melting.
     */
    death: function (prog) {
      var p = base();
      var k = U.easeOut(U.clamp(prog, 0, 1));
      p.torso = U.lerp(-0.35, 0.22, k);
      p.headTilt = U.lerp(-0.2, 0.45, k);
      p.shoulderN = U.lerp(-1.6, -0.35, k);
      p.elbowN = U.lerp(-0.5, -1.1, k);
      p.shoulderF = U.lerp(-1.2, 0.55, k);
      p.elbowF = U.lerp(-0.5, -0.9, k);
      p.hipN = U.lerp(0.2, 1.15, k);
      p.kneeN = U.lerp(-0.3, -1.35, k);
      p.hipF = U.lerp(-0.2, 0.75, k);
      p.kneeF = U.lerp(-0.3, -1.05, k);
      p.rootRot = k * (Math.PI / 2) * 0.94;
      p.rootDrop = k * 3;
      return p;
    }
  };

  P.Poses = Poses;
})(window.Phefo);
