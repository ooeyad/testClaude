window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var L = P.Levels;
  var solid = L.solid, platform = L.platform, ladder = L.ladder;

  /**
   * One long street at sundown. The layout alternates open road (where gunmen
   * and archers own the space) with cover and climbable ledges (where you own
   * it), so every wave has somewhere to fight from and somewhere to fall back to.
   *
   * Camera bounds pin the road low on the screen — maxY is picked so the clamp
   * bites while Phefo is standing, which lines the road up with the base of the
   * skyline instead of floating it in the middle of the sky.
   */
  L.define({
    id: 'city01',
    name: 'SUNDOWN STREET',
    theme: 'city',
    seed: 90210,

    groundY: 0,
    bounds: { minX: 0, maxX: 2700, minY: -640, maxY: 110 },
    playerStart: { x: 120, y: 0 },
    waveDelay: 2.4,

    solidColor: '#141b21',
    edgeColor: '#3d4d58',

    solids: [
      solid(-400, 0, 3300, 260),        // the road
      solid(-100, -760, 100, 1020),     // alley wall, west
      solid(2700, -760, 100, 1020),     // alley wall, east

      solid(430, -46, 58, 46),          // crates
      solid(488, -84, 46, 84),

      platform(700, -152, 200),         // fire escape

      solid(980, -104, 128, 104),       // concrete block

      platform(1170, -186, 176),
      platform(1420, -128, 156),

      solid(1660, -62, 96, 62),

      platform(1850, -196, 210),        // high walkway — archer perch

      solid(2140, -118, 140, 118),
      solid(2320, -52, 60, 52)
    ],

    /**
     * Ladders from the road up to three of the fire escapes. Each is inset well
     * clear of its platform's edges — an enemy walking to a ladder flush with an
     * edge would stop short, because Enemy.walk refuses to step where its probe
     * finds no ground, and descent would never trigger.
     *
     * None crosses a solid block: a climber passes through geometry while
     * attached, so a ladder over a crate would let it climb through the crate.
     */
    ladders: [
      ladder(740, -152, 0),    // fire escape at 700..900
      ladder(1450, -128, 0),   // fire escape at 1420..1576
      ladder(1880, -196, 0)    // high walkway at 1850..2060
    ],

    pickups: [
      { kind: 'bow', x: 800, y: -152 },
      { kind: 'health', x: 1712, y: -62 }
    ],

    waves: [
      [
        { type: 'knifeman', x: 700 },
        { type: 'knifeman', x: 900 }
      ],
      [
        { type: 'knifeman', x: 640 },
        { type: 'knifeman', x: 1050 },
        { type: 'gunman',   x: 1360 }
      ],
      [
        { type: 'brute',     x: 380 },
        { type: 'swordsman', x: 900 },
        { type: 'knifeman',  x: 1180 },
        { type: 'archer',    x: 1700 }
      ],
      [
        { type: 'gunman',   x: 820 },
        { type: 'knifeman', x: 1120 },
        { type: 'knifeman', x: 1260 },
        { type: 'gunman',   x: 1520 }
      ],
      [
        { type: 'swordsman', x: 1000 },
        { type: 'swordsman', x: 1620 },
        { type: 'brute',     x: 1790 },
        // Kept on the road: Enemy only acquires a target within 120px of its own
        // height, so an archer parked on the walkway would never open fire.
        { type: 'archer',    x: 1950 },
        { type: 'gunman',    x: 2260 }
      ]
    ],

    /** Road surface. Drawn under the characters, inside the camera transform. */
    decor: function (ctx, cam) {
      var x0 = Math.floor((cam.x - 100) / 90) * 90;
      var x1 = cam.x + cam.viewW + 100;

      ctx.save();

      // Kerb highlight just under the lit top edge of the road.
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(cam.x - 100, 3, cam.viewW + 200, 5);

      // Centre line.
      ctx.fillStyle = 'rgba(190,160,110,0.13)';
      for (var x = x0; x < x1; x += 90) ctx.fillRect(x, 30, 44, 3);

      // A few drain covers, spaced off the dash rhythm so they read as separate.
      ctx.fillStyle = 'rgba(255,255,255,0.045)';
      for (var d = Math.floor((cam.x - 200) / 420) * 420; d < x1; d += 420) {
        ctx.fillRect(d + 60, 16, 26, 8);
      }

      ctx.restore();
    }
  });
})(window.Phefo);
