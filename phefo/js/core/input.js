window.Phefo = window.Phefo || {};

(function (P) {
  'use strict';

  /**
   * Keyboard + mouse state.
   *
   * `down` is level-triggered (held). `pressed` is edge-triggered and is cleared
   * at the end of every logic step, so a fixed-timestep loop never sees the same
   * press twice and never drops one that happened between steps.
   */
  var Input = {
    down: Object.create(null),
    _pressed: Object.create(null),
    _released: Object.create(null),
    mouse: { x: 0, y: 0, down: false, pressed: false, released: false },
    _canvas: null,
    _viewW: 960,
    _viewH: 540,
    onFirstGesture: null,
    _gestureDone: false,

    attach: function (canvas, viewW, viewH) {
      this._canvas = canvas;
      this._viewW = viewW;
      this._viewH = viewH;
      var self = this;

      window.addEventListener('keydown', function (e) {
        // Stop space/arrows from scrolling the page under the canvas.
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].indexOf(e.code) >= 0) {
          e.preventDefault();
        }
        if (e.code === 'F1') e.preventDefault();
        self._gesture();
        if (e.repeat) return;
        self.down[e.code] = true;
        self._pressed[e.code] = true;
      });

      window.addEventListener('keyup', function (e) {
        self.down[e.code] = false;
        self._released[e.code] = true;
      });

      canvas.addEventListener('mousemove', function (e) { self._track(e); });

      canvas.addEventListener('mousedown', function (e) {
        self._gesture();
        self._track(e);
        if (e.button === 0) {
          self.mouse.down = true;
          self.mouse.pressed = true;
        }
        e.preventDefault();
      });

      window.addEventListener('mouseup', function (e) {
        if (e.button === 0) {
          self.mouse.down = false;
          self.mouse.released = true;
        }
      });

      canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

      // Losing focus mid-key would otherwise leave Phefo sprinting forever.
      window.addEventListener('blur', function () { self.reset(); });
    },

    _gesture: function () {
      if (this._gestureDone) return;
      this._gestureDone = true;
      if (this.onFirstGesture) this.onFirstGesture();
    },

    _track: function (e) {
      var r = this._canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      this.mouse.x = (e.clientX - r.left) / r.width * this._viewW;
      this.mouse.y = (e.clientY - r.top) / r.height * this._viewH;
    },

    isDown: function () {
      for (var i = 0; i < arguments.length; i++) {
        if (this.down[arguments[i]]) return true;
      }
      return false;
    },

    wasPressed: function () {
      for (var i = 0; i < arguments.length; i++) {
        if (this._pressed[arguments[i]]) return true;
      }
      return false;
    },

    wasReleased: function () {
      for (var i = 0; i < arguments.length; i++) {
        if (this._released[arguments[i]]) return true;
      }
      return false;
    },

    /** Call once at the end of each logic step. */
    endStep: function () {
      this._pressed = Object.create(null);
      this._released = Object.create(null);
      this.mouse.pressed = false;
      this.mouse.released = false;
    },

    reset: function () {
      this.down = Object.create(null);
      this._pressed = Object.create(null);
      this._released = Object.create(null);
      this.mouse.down = false;
      this.mouse.pressed = false;
    }
  };

  // Named bindings, so remapping later means editing one table.
  Input.LEFT    = ['KeyA', 'ArrowLeft'];
  Input.RIGHT   = ['KeyD', 'ArrowRight'];
  Input.UP      = ['KeyW', 'ArrowUp'];
  Input.DOWN    = ['KeyS', 'ArrowDown'];
  Input.JUMP    = ['Space', 'KeyW', 'ArrowUp'];
  Input.ATTACK  = ['KeyJ'];
  Input.SWAP    = ['KeyQ'];
  Input.RELOAD  = ['KeyR'];
  Input.PAUSE   = ['Escape', 'KeyP'];
  Input.CONFIRM = ['Enter', 'Space'];

  Input.axisX = function () {
    var x = 0;
    if (this.isDown.apply(this, this.LEFT)) x -= 1;
    if (this.isDown.apply(this, this.RIGHT)) x += 1;
    return x;
  };

  Input.attackHeld = function () {
    return this.mouse.down || this.isDown.apply(this, this.ATTACK);
  };

  Input.attackPressed = function () {
    return this.mouse.pressed || this.wasPressed.apply(this, this.ATTACK);
  };

  Input.jumpPressed = function () { return this.wasPressed.apply(this, this.JUMP); };
  Input.jumpHeld = function () { return this.isDown.apply(this, this.JUMP); };

  P.Input = Input;
})(window.Phefo);
