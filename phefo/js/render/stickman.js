window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var U = P.util;
  var down = U.boneDown;
  var up = U.boneUp;

  /**
   * Bone lengths chosen so a neutral standing figure is ~52px tall at scale 1,
   * which matches the player's collision box. Every character in the game —
   * Phefo and all enemies — is this same skeleton at a different scale, colour
   * and weapon. That is the whole reason no sprite art exists in this project.
   */
  var B = {
    PELVIS_CHEST: 14,
    CHEST_NECK: 4,
    NECK_HEAD: 4,
    HEAD_R: 5.2,
    UPPER_ARM: 10,
    FOREARM: 9.5,
    THIGH: 12.5,
    SHIN: 12.5
  };

  var NOMINAL_HIP = (B.THIGH + B.SHIN) * 0.95;

  /**
   * Sole to crown of a fully extended figure — the one measure a build preserves.
   *
   * Deliberately the straight-legged height, not the bent-legged one: it is the
   * only height that is a property of the bones alone rather than of whichever
   * pose is being drawn, so normalising against it holds in every pose. Bending
   * shortens a long leg and a short leg in the same proportion.
   */
  function standingHeight(b) {
    return b.THIGH + b.SHIN + b.PELVIS_CHEST + b.CHEST_NECK +
           b.NECK_HEAD + b.HEAD_R * 2;
  }

  var NOMINAL_HEIGHT = standingHeight(B);

  /**
   * Turn a build — multipliers over the shared table — into a bone set.
   *
   * **Shape, never size.** The multipliers are applied and the whole set is then
   * rescaled to the standing height the character already had, so a creature can
   * be squat, spindly or long-armed without moving anything the game measures.
   * That matters more than it looks: the collision box is 52 x scale and is
   * computed from `scale` alone, and melee reach, the health bar and the camera
   * all derive from it. A body drawn taller than its box gets struck where it
   * does not appear to be. Size is `scale`'s job; this is only shape.
   */
  function bonesFor(spec) {
    if (!spec) return B;

    var b = {
      PELVIS_CHEST: B.PELVIS_CHEST * (spec.torso || 1),
      CHEST_NECK: B.CHEST_NECK * (spec.neck || 1),
      NECK_HEAD: B.NECK_HEAD * (spec.neck || 1),
      HEAD_R: B.HEAD_R * (spec.head || 1),
      UPPER_ARM: B.UPPER_ARM * (spec.arm || 1),
      FOREARM: B.FOREARM * (spec.arm || 1) * (spec.forearm || 1),
      THIGH: B.THIGH * (spec.leg || 1),
      SHIN: B.SHIN * (spec.leg || 1) * (spec.shin || 1)
    };

    var fit = NOMINAL_HEIGHT / standingHeight(b);
    for (var k in b) {
      if (Object.prototype.hasOwnProperty.call(b, k)) b[k] *= fit;
    }

    b.hip = (b.THIGH + b.SHIN) * 0.95;
    return b;
  }

  /**
   * Forward kinematics: angles -> points, with the pelvis at the origin.
   * `b` is the character's own bone set; omitted means the shared one, which is
   * what keeps every existing caller drawing exactly as it did.
   */
  function build(pose, b) {
    b = b || B;
    var j = {};
    var t = pose.torso;

    j.pelvis = { x: pose.lunge || 0, y: 0 };

    var chest = up(b.PELVIS_CHEST, t);
    j.chest = { x: j.pelvis.x + chest.x, y: j.pelvis.y + chest.y };

    var neck = up(b.CHEST_NECK, t);
    j.neck = { x: j.chest.x + neck.x, y: j.chest.y + neck.y };

    var hd = up(b.NECK_HEAD + b.HEAD_R, t + pose.headTilt);
    j.head = { x: j.neck.x + hd.x, y: j.neck.y + hd.y };

    // Arms hang from the chest (a stick figure has no shoulder width).
    function arm(sh, el) {
      var a1 = t + sh;
      var e = down(b.UPPER_ARM, a1);
      var elbow = { x: j.chest.x + e.x, y: j.chest.y + e.y };
      var a2 = a1 + el;
      var h = down(b.FOREARM, a2);
      return {
        elbow: elbow,
        hand: { x: elbow.x + h.x, y: elbow.y + h.y },
        angle: a2
      };
    }

    var an = arm(pose.shoulderN, pose.elbowN);
    var af = arm(pose.shoulderF, pose.elbowF);
    j.elbowN = an.elbow; j.handN = an.hand; j.armAngleN = an.angle;
    j.elbowF = af.elbow; j.handF = af.hand; j.armAngleF = af.angle;

    function leg(hip, knee) {
      var k = down(b.THIGH, hip);
      var kneePt = { x: j.pelvis.x + k.x, y: j.pelvis.y + k.y };
      var f = down(b.SHIN, hip + knee);
      return { knee: kneePt, foot: { x: kneePt.x + f.x, y: kneePt.y + f.y } };
    }

    var ln = leg(pose.hipN, pose.kneeN);
    var lf = leg(pose.hipF, pose.kneeF);
    j.kneeN = ln.knee; j.footN = ln.foot;
    j.kneeF = lf.knee; j.footF = lf.foot;

    return j;
  }

  function stroke(ctx, a, b) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  /**
   * Convert a bone angle (0 = straight down) into a canvas rotation, so a weapon
   * drawn along +x lines up with the forearm.
   */
  function boneRot(a) { return Math.atan2(Math.cos(a), Math.sin(a)); }

  var Stick = {
    B: B,
    NOMINAL_HIP: NOMINAL_HIP,
    build: build,

    /**
     * Turn a world aim angle into the shoulder angle needed to point the near
     * arm at it, accounting for the mirror applied to left-facing figures.
     */
    aimToShoulder: function (aim, facing, torso) {
      var local = facing === 1 ? aim : Math.PI - aim;
      return (Math.PI / 2 - local) - torso;
    },

    /**
     * @param opts.facing      1 or -1
     * @param opts.scale       1 = 52px tall
     * @param opts.color       ink colour
     * @param opts.groundLock  pin the lowest foot to y (use when standing)
     * @param opts.weapon      weapon key to draw in the near hand
     * @param opts.weaponAngle override the weapon's rotation (radians, bone space)
     * @param opts.flash       0..1 white hit flash
     * @param opts.build       bone multipliers — shape only, never height
     */
    draw: function (ctx, x, y, pose, opts) {
      opts = opts || {};
      var facing = opts.facing || 1;
      var scale = opts.scale || 1;
      var color = opts.color || '#e8e2d8';
      var b = bonesFor(opts.build);
      var lw = (opts.lineWidth || 3.1) * (opts.build && opts.build.width || 1);

      var j = build(pose, b);

      var shift = opts.groundLock
        ? -Math.max(j.footN.y, j.footF.y)
        : -(b.hip || NOMINAL_HIP);
      shift += (pose.rootDrop || 0);

      ctx.save();
      ctx.translate(x, y);
      if (opts.alpha != null) ctx.globalAlpha = opts.alpha;

      // Topple around the feet for the death animation.
      if (pose.rootRot) ctx.rotate(pose.rootRot * facing);

      ctx.scale(facing, 1);
      ctx.scale(scale, scale);
      ctx.translate(0, shift);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Far limbs first and dimmed, so the figure reads with depth.
      ctx.globalAlpha = (opts.alpha == null ? 1 : opts.alpha) * 0.55;
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      stroke(ctx, j.pelvis, j.kneeF);
      stroke(ctx, j.kneeF, j.footF);
      stroke(ctx, j.chest, j.elbowF);
      stroke(ctx, j.elbowF, j.handF);

      // Behind-the-body features ride the far-limb pass and inherit its dimming.
      if (opts.features) {
        for (var fb = 0; fb < opts.features.length; fb++) {
          this.drawFeature(ctx, opts.features[fb], j, b, 'back');
        }
      }

      ctx.globalAlpha = (opts.alpha == null ? 1 : opts.alpha);

      // Torso
      ctx.lineWidth = lw * 1.15;
      stroke(ctx, j.pelvis, j.neck);

      // Near leg
      ctx.lineWidth = lw;
      stroke(ctx, j.pelvis, j.kneeN);
      stroke(ctx, j.kneeN, j.footN);

      // Head
      ctx.beginPath();
      ctx.arc(j.head.x, j.head.y, b.HEAD_R, 0, U.TAU);
      ctx.fillStyle = color;
      ctx.fill();

      // Near arm, drawn over the torso
      stroke(ctx, j.chest, j.elbowN);
      stroke(ctx, j.elbowN, j.handN);

      if (opts.features) {
        ctx.fillStyle = color;
        for (var ff = 0; ff < opts.features.length; ff++) {
          this.drawFeature(ctx, opts.features[ff], j, b, 'front');
        }
      }

      // Weapon sits in the near hand, aligned with the forearm.
      if (opts.weapon && opts.weapon !== 'fist') {
        var rot = opts.weaponAngle != null ? boneRot(opts.weaponAngle) : boneRot(j.armAngleN);
        ctx.save();
        ctx.translate(j.handN.x, j.handN.y);
        ctx.rotate(rot);
        this.drawWeapon(ctx, opts.weapon, color, opts.weaponState);
        ctx.restore();
      }

      if (opts.flash) {
        ctx.globalAlpha = opts.flash * 0.85;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = lw * 1.5;
        stroke(ctx, j.pelvis, j.neck);
        stroke(ctx, j.pelvis, j.kneeN);
        stroke(ctx, j.kneeN, j.footN);
        stroke(ctx, j.chest, j.elbowN);
        stroke(ctx, j.elbowN, j.handN);
        ctx.beginPath();
        ctx.arc(j.head.x, j.head.y, b.HEAD_R, 0, U.TAU);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      ctx.restore();
      return j;
    },

    /**
     * Features are drawn in skeleton-local space, hung off a joint the builder
     * returned — never off a screen position, which is what keeps them attached
     * through every pose including death and the climb.
     *
     * Same reasoning as the weapons below: a switch and a handful of strokes.
     * They run inside the existing transform, so mirroring and scaling are free.
     * `pass` is 'back' or 'front'; a feature drawn in the back pass inherits the
     * dimmed alpha the far limbs already use and must not set its own.
     *
     * An unknown name is ignored. Type data is unvalidated everywhere else in
     * this project, and a typo should cost a missing horn, not a dead frame.
     */
    drawFeature: function (ctx, key, j, b, pass) {
      var r = b.HEAD_R;

      switch (key) {
        case 'horns':
          if (pass !== 'front') return;
          ctx.beginPath();
          ctx.moveTo(j.head.x - r * 0.7, j.head.y - r * 0.5);
          ctx.lineTo(j.head.x - r * 1.5, j.head.y - r * 2.1);
          ctx.moveTo(j.head.x + r * 0.7, j.head.y - r * 0.5);
          ctx.lineTo(j.head.x + r * 1.5, j.head.y - r * 2.1);
          ctx.stroke();
          break;

        case 'antenna':
          if (pass !== 'front') return;
          ctx.beginPath();
          ctx.moveTo(j.head.x, j.head.y - r * 0.8);
          ctx.lineTo(j.head.x + r * 0.6, j.head.y - r * 2.6);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(j.head.x + r * 0.6, j.head.y - r * 2.6, r * 0.28, 0, U.TAU);
          ctx.fill();
          break;

        case 'jaw':
          if (pass !== 'front') return;
          ctx.beginPath();
          ctx.moveTo(j.head.x + r * 0.2, j.head.y + r * 0.5);
          ctx.lineTo(j.head.x + r * 1.9, j.head.y + r * 0.9);
          ctx.lineTo(j.head.x + r * 0.2, j.head.y + r * 1.2);
          ctx.stroke();
          break;

        case 'hunch':
          if (pass !== 'front') return;
          ctx.beginPath();
          ctx.arc(j.chest.x, j.chest.y, r * 1.5, Math.PI * 1.05, Math.PI * 1.95);
          ctx.stroke();
          break;

        case 'spines':
          if (pass !== 'back') return;
          ctx.beginPath();
          for (var i = 1; i <= 3; i++) {
            var f = i / 4;
            var sx = j.pelvis.x + (j.neck.x - j.pelvis.x) * f;
            var sy = j.pelvis.y + (j.neck.y - j.pelvis.y) * f;
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - r * 1.4, sy - r * 0.5);
          }
          ctx.stroke();
          break;

        case 'tail':
          if (pass !== 'back') return;
          ctx.beginPath();
          ctx.moveTo(j.pelvis.x, j.pelvis.y);
          ctx.quadraticCurveTo(j.pelvis.x - r * 2.4, j.pelvis.y + r * 0.4,
                               j.pelvis.x - r * 2.0, j.pelvis.y - r * 1.6);
          ctx.stroke();
          break;

        case 'stub':
          if (pass !== 'back') return;
          ctx.beginPath();
          ctx.moveTo(j.chest.x, j.chest.y + r * 0.3);
          ctx.lineTo(j.chest.x + r * 1.3, j.chest.y + r * 1.1);
          ctx.lineTo(j.chest.x + r * 2.0, j.chest.y + r * 0.4);
          ctx.stroke();
          break;

        case 'belly':
          if (pass !== 'front') return;
          ctx.beginPath();
          ctx.arc(j.pelvis.x + (j.chest.x - j.pelvis.x) * 0.45,
                  j.pelvis.y + (j.chest.y - j.pelvis.y) * 0.45,
                  r * 1.35, Math.PI * 1.75, Math.PI * 0.65);
          ctx.stroke();
          break;
      }
    },

    /**
     * Weapons are drawn in hand-local space: +x runs out along the forearm.
     * Each is a handful of strokes — same reasoning as the figures themselves.
     */
    drawWeapon: function (ctx, key, color, state) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      switch (key) {
        case 'sword':
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(3, 0); ctx.stroke();   // grip
          ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.moveTo(3, -5); ctx.lineTo(3, 5); ctx.stroke();   // crossguard
          ctx.lineWidth = 2.6;
          ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(34, 0); ctx.stroke();   // blade
          ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(39, 0); ctx.lineWidth = 1.2; ctx.stroke();
          break;

        case 'knife':
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(2, 0); ctx.stroke();
          ctx.lineWidth = 2.2;
          ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(15, 0); ctx.stroke();
          ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(19, -0.5); ctx.stroke();
          break;

        case 'pistol':
          ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.moveTo(0, -1.5); ctx.lineTo(13, -1.5); ctx.stroke();  // slide
          ctx.lineWidth = 2.0;
          ctx.beginPath(); ctx.moveTo(0.5, 0); ctx.lineTo(-2.5, 5.5); ctx.stroke();  // grip
          break;

        case 'bow':
          ctx.lineWidth = 1.9;
          ctx.beginPath();
          ctx.arc(2, 0, 15, -1.15, 1.15);
          ctx.stroke();
          // String, pulled back while the shot is being drawn.
          var pull = state ? 9 : 0;
          var tipX = 2 + Math.cos(1.15) * 15, tipY = Math.sin(1.15) * 15;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(tipX, -tipY);
          ctx.lineTo(2 - pull, 0);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();
          if (state) {
            ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(2 - pull, 0); ctx.lineTo(20, 0); ctx.stroke();
          }
          break;
      }
    },

    /** Soft contact shadow — cheap, but it stops characters floating. */
    shadow: function (ctx, x, y, w, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha == null ? 0.28 : alpha;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(x, y + 1, w, w * 0.26, 0, 0, U.TAU);
      ctx.fill();
      ctx.restore();
    }
  };

  P.Stick = Stick;
})(window.Phefo);
