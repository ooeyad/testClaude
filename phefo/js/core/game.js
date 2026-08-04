window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  var In = P.Input;

  var VIEW_W = 960;
  var VIEW_H = 540;

  /**
   * Logic runs at a fixed 120 Hz regardless of display refresh. Melee windows
   * here are as short as 90 ms, so tying them to a variable frame time would
   * make the same swing land on a 144 Hz monitor and whiff on a 60 Hz one.
   */
  var STEP = 1 / 120;
  var MAX_FRAME = 0.25;   // after a tab-out, drop the backlog instead of catching up

  // ---------------------------------------------------------------------------
  // World — everything that exists inside the level.
  // ---------------------------------------------------------------------------

  function World(def) {
    this.def = def;
    this.solids = def.solids;
    this.bounds = def.bounds;
    this.groundY = def.groundY;
    this.waves = def.waves;

    this.camera = new P.Camera(VIEW_W, VIEW_H);
    this.camera.setBounds(def.bounds.minX, def.bounds.maxX, def.bounds.minY, def.bounds.maxY);
    this.backdrop = new P.Backdrop(def.theme, def.bounds.maxX - def.bounds.minX, def.seed);

    this._chars = [];
    this.notice = { text: '', life: 0 };
    this.reset();
  }

  World.prototype.reset = function () {
    var def = this.def;

    this.player = new P.Player(def.playerStart.x, def.playerStart.y);
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];

    for (var i = 0; i < (def.pickups || []).length; i++) {
      var p = def.pickups[i];
      this.pickups.push(new P.Pickup(p.x, p.y, p.kind));
    }

    this.waveIndex = 0;
    this.phase = 'fighting';
    this.waveTimer = 0;
    this.doneT = 0;
    this.deadT = 0;
    this.hitstop = 0;
    this.notice.text = '';
    this.notice.life = 0;

    P.FX.clear();
    this.camera.snapTo(this.player);
    this.spawnWave(0);
  };

  World.prototype.spawnWave = function (i) {
    var wave = this.waves[i];
    if (!wave) return;
    for (var n = 0; n < wave.length; n++) {
      var s = wave[n];
      var e = P.Enemies.spawn(s.type, s.x, s.y == null ? this.groundY : s.y);
      // Face the way they will actually be fighting, so wave one isn't a row of backs.
      e.facing = s.x >= this.player.x ? -1 : 1;
      this.enemies.push(e);
    }
  };

  World.prototype.aliveEnemies = function () {
    var n = 0;
    for (var i = 0; i < this.enemies.length; i++) if (!this.enemies[i].dead) n++;
    return n;
  };

  /**
   * Rebuilt once per step, before anything reads it. Projectiles call this on
   * every collision substep, and allocating a fresh array each time is the kind
   * of garbage that shows up as stutter once a firefight gets busy.
   */
  World.prototype.refreshCharacters = function () {
    var out = this._chars;
    out.length = 0;
    out.push(this.player);
    for (var i = 0; i < this.enemies.length; i++) out.push(this.enemies[i]);
  };

  World.prototype.allCharacters = function () { return this._chars; };

  World.prototype.spawnProjectile = function (p) { this.projectiles.push(p); };

  World.prototype.notify = function (text) {
    this.notice.text = text;
    this.notice.life = 1.5;
  };

  World.prototype.onEnemyKilled = function () {
    this.player.kills++;
    this.camera.addShake(2.5);
  };

  World.prototype.step = function (dt) {
    // Hitstop: freeze the whole world for a few frames so a connecting hit reads
    // as impact rather than as the target simply losing health.
    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }

    this.refreshCharacters();

    if (this.notice.life > 0) this.notice.life -= dt;
    if (this.player.dead) this.deadT += dt;

    this.player.update(dt, this);

    var i;
    for (i = 0; i < this.enemies.length; i++) this.enemies[i].update(dt, this);
    for (i = 0; i < this.projectiles.length; i++) this.projectiles[i].update(dt, this);
    for (i = 0; i < this.pickups.length; i++) this.pickups[i].update(dt, this);

    prune(this.enemies);
    prune(this.projectiles);
    prune(this.pickups);

    P.FX.update(dt, this.groundY);
    this.camera.follow(this.player, dt);

    this.tickWaves(dt);
  };

  World.prototype.tickWaves = function (dt) {
    if (this.phase === 'done') { this.doneT += dt; return; }
    if (this.player.dead) return;

    if (this.phase === 'fighting') {
      if (this.aliveEnemies() > 0) return;

      if (this.waveIndex + 1 >= this.waves.length) {
        this.phase = 'done';
        this.notify('STREET CLEARED');
        return;
      }

      this.phase = 'clear';
      this.waveTimer = this.def.waveDelay;
      this.dropReward();

    } else if (this.phase === 'clear') {
      this.waveTimer -= dt;
      if (this.waveTimer > 0) return;
      this.waveIndex++;
      this.spawnWave(this.waveIndex);
      this.phase = 'fighting';
    }
  };

  /** A medkit between waves — the pacing valve that keeps wave five winnable. */
  World.prototype.dropReward = function () {
    var pl = this.player;
    this.pickups.push(new P.Pickup(pl.x + 34, pl.y - 46, 'health'));
  };

  World.prototype.draw = function (ctx) {
    var cam = this.camera;
    var i;

    this.backdrop.draw(ctx, cam, VIEW_W, VIEW_H, this.groundY);

    ctx.save();
    cam.apply(ctx);

    P.Levels.drawSolids(ctx, this.def, cam);

    for (i = 0; i < this.pickups.length; i++) {
      if (cam.visible(this.pickups[i].x, this.pickups[i].y, 60)) this.pickups[i].draw(ctx);
    }

    // Corpses behind the living, so a pile of bodies never hides an active enemy.
    for (i = 0; i < this.enemies.length; i++) {
      var d = this.enemies[i];
      if (d.dead && cam.visible(d.x, d.y, 140)) d.draw(ctx, this);
    }
    for (i = 0; i < this.enemies.length; i++) {
      var e = this.enemies[i];
      if (!e.dead && cam.visible(e.x, e.y, 140)) e.draw(ctx, this);
    }

    this.player.draw(ctx);

    for (i = 0; i < this.projectiles.length; i++) {
      var p = this.projectiles[i];
      if (cam.visible(p.x, p.y, 60)) p.draw(ctx);
    }

    P.FX.draw(ctx);

    ctx.restore();
  };

  /** Compact an array in place, dropping anything flagged for removal. */
  function prune(list) {
    var w = 0;
    for (var i = 0; i < list.length; i++) {
      if (!list[i].remove) list[w++] = list[i];
    }
    list.length = w;
  }

  // ---------------------------------------------------------------------------
  // Game — canvas, timing, and the screen the player is looking at.
  // ---------------------------------------------------------------------------

  var Game = {
    canvas: null,
    ctx: null,
    dpr: 1,
    world: null,
    state: 'title',
    t: 0,
    acc: 0,
    last: 0,

    boot: function () {
      var canvas = document.getElementById('screen');
      if (!canvas) throw new Error('phefo: #screen canvas not found');

      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.resize();

      In.attach(canvas, VIEW_W, VIEW_H);
      // Browsers will not start an AudioContext before a real gesture.
      In.onFirstGesture = function () { P.Audio.init(); };

      this.world = new World(P.Levels.first());

      var self = this;
      window.addEventListener('resize', function () { self.resize(); });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden && self.state === 'playing') self.state = 'paused';
      });

      this.last = performance.now() / 1000;
      requestAnimationFrame(function (ts) { self.frame(ts); });
    },

    /**
     * The canvas is a fixed 960x540 play-field scaled by CSS. Backing store is
     * multiplied by devicePixelRatio so the 1px strokes this game is made of
     * stay crisp on a high-DPI screen, while all game code keeps working in
     * view-space coordinates.
     */
    resize: function () {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      if (dpr === this.dpr && this.canvas.width) return;
      this.dpr = dpr;
      this.canvas.width = Math.round(VIEW_W * dpr);
      this.canvas.height = Math.round(VIEW_H * dpr);
    },

    frame: function (ts) {
      var self = this;
      var now = ts / 1000;
      var elapsed = Math.min(MAX_FRAME, Math.max(0, now - this.last));
      this.last = now;
      this.t += elapsed;

      this.acc += elapsed;
      while (this.acc >= STEP) {
        this.step(STEP);
        this.acc -= STEP;
      }

      this.render();
      requestAnimationFrame(function (t2) { self.frame(t2); });
    },

    /**
     * All input is polled here rather than in the render frame, because
     * Input.endStep clears edge-triggered presses per logic step — checking a
     * press anywhere else would either miss it or see it twice.
     */
    step: function (dt) {
      var w = this.world;

      switch (this.state) {
        case 'title':
          if (In.wasPressed.apply(In, In.CONFIRM)) this.startGame();
          break;

        case 'playing':
          if (In.wasPressed.apply(In, In.PAUSE)) { this.state = 'paused'; break; }
          w.step(dt);
          if (w.player.dead && w.deadT > 1.5) this.state = 'gameover';
          else if (w.phase === 'done' && w.doneT > 1.4) this.state = 'victory';
          break;

        case 'paused':
          if (In.wasPressed.apply(In, In.PAUSE) || In.wasPressed.apply(In, In.CONFIRM)) {
            this.state = 'playing';
          }
          break;

        case 'gameover':
        case 'victory':
          if (In.wasPressed.apply(In, In.CONFIRM)) this.startGame();
          break;
      }

      In.endStep();
    },

    startGame: function () {
      this.world.reset();
      this.state = 'playing';
    },

    render: function () {
      var ctx = this.ctx;
      var w = this.world;

      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, VIEW_W, VIEW_H);

      w.draw(ctx);

      if (this.state === 'playing' || this.state === 'paused') {
        P.HUD.draw(ctx, w, VIEW_W, VIEW_H);
        if (w.phase === 'clear') {
          // Fade the banner in as the timer runs down toward the next wave.
          P.Menus.waveBanner(ctx, VIEW_W, VIEW_H, w,
            Math.min(1, (w.def.waveDelay - w.waveTimer) / 0.4, w.waveTimer / 0.5));
        }
      }

      switch (this.state) {
        case 'title':    P.Menus.title(ctx, VIEW_W, VIEW_H, this.t, w.def.name); break;
        case 'paused':   P.Menus.paused(ctx, VIEW_W, VIEW_H, this.t); break;
        case 'gameover': P.Menus.gameOver(ctx, VIEW_W, VIEW_H, this.t, w); break;
        case 'victory':  P.Menus.victory(ctx, VIEW_W, VIEW_H, this.t, w); break;
      }
    }
  };

  P.World = World;
  P.Game = Game;

  Game.boot();
})(window.Phefo);
