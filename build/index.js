(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.JC = global.JC || {})));
}(this, (function (exports) { 'use strict';

var inModule = typeof require === 'function';
var inBrowser = typeof window !== 'undefined';
var JC = inModule && inBrowser ? require('jcc2d/build/jcc2d.light.js') : inBrowser ? window.JC : {};

var CONFIG = {
  GLOBAL_WEIGHT: 0.25,
  MAX_SLOPE: 20,
  TIMELINE: {
    stars: [0.08, 0.08, 0.28, 0.52, 0.12],
    blinks: [0.3, 0.05, 0.15]
  }
};

/* eslint no-bitwise: 0 */

var FRONT = new JC.Point(0, 0, 10);
/**
 *
 * @param {Object} options
 */
function Coin(options) {
  var _this = this;

  var texture = new JC.Texture(options.texture);
  this.doc = new JC.Sprite({
    texture: texture
  });
  this.doc.scale = 0;
  if (options.pivot) {
    this.doc.pivotX = options.pivot.x;
    this.doc.pivotY = options.pivot.y;
  } else {
    if (texture.loaded) {
      this._center();
    } else {
      texture.on('load', function () {
        _this._center();
      });
    }
  }
}

Coin.prototype._center = function () {
  this.doc.pivotX = this.doc.width >> 1;
  this.doc.pivotY = this.doc.height >> 1;
};

Coin.prototype.fly = function (_ref) {
  var start = _ref.start,
      end = _ref.end,
      wait = _ref.wait,
      duration = _ref.duration;

  if (this.alive) return;
  var This = this;
  var sp = new JC.Point(start.x, start.y).add(this.offset);
  var ep = new JC.Point(end.x, end.y);
  var cp = this._findCP(sp, ep);
  var path = new JC.BezierCurve([sp, cp, ep]);
  var timeline = CONFIG.TIMELINE.stars;

  this.alive = true;
  this.doc.runners({
    runners: [{
      from: { scale: 0, x: sp.x, y: sp.y },
      to: { scale: 1.2, x: sp.x, y: sp.y },
      duration: timeline[0] * duration
    }, {
      to: { scale: 1 },
      duration: timeline[1] * duration
    }, {
      path: path,
      wait: timeline[2] * duration,
      duration: timeline[3] * duration,
      ease: JC.Tween.Back.In
    }, {
      to: { scale: 0 },
      duration: timeline[4] * duration,
      ease: JC.Tween.Linear.None
    }],
    wait: wait,
    onCompelete: function onCompelete() {
      This.alive = false;
    }
  }, true);
};

Coin.prototype._findCP = function (sp, ep) {
  var center = new JC.Point().addVectors(ep, sp).divideScalar(2);
  var direction = new JC.Point().subVectors(ep, sp);
  var symbolX = ep.x > sp.x ? -1 : 1;
  var symbolY = ep.y > sp.y ? 1 : -1;
  var symbol = symbolX * symbolY;
  var perpendicular = new JC.Point().crossVectors(FRONT, direction).normalize();

  var length = direction.length();
  var rawSlope = direction.y !== 0 ? Math.abs(direction.x / direction.y) : CONFIG.MAX_SLOPE;
  var slope = Math.sqrt(Math.min(CONFIG.MAX_SLOPE, Math.abs(rawSlope)));
  var weight = slope * length;

  var scalar = perpendicular.multiplyScalar(symbol * weight * CONFIG.GLOBAL_WEIGHT);

  return center.add(scalar);
};

/**
 *
 * @param {Object} options
 */
function Cricle(options) {
  options = options || {};
  this.radius = options.radius || 8;
  this.color = options.color || '#FFD44F';
}

Cricle.prototype.render = function (ctx) {
  ctx.beginPath();
  ctx.fillStyle = this.color;
  ctx.arc(0, 0, this.radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
};

/**
 *
 * @param {Object} options
 */
function Blink(options) {
  options = options || {};
  this.doc = new JC.Graphics(new Cricle({
    radius: options.radius,
    color: options.color
  }));
  this.doc.scale = 0;
}

Blink.prototype.boom = function (_ref) {
  var endBase = _ref.endBase,
      end = _ref.end,
      wait = _ref.wait,
      duration = _ref.duration;

  if (this.alive) return;
  var This = this;
  var sx = endBase.x;
  var sy = endBase.y;
  var x = end.x;
  var y = end.y;
  var ex = sx + x;
  var ey = sy + y;
  var timeline = CONFIG.TIMELINE.blinks;

  this.alive = true;
  this.doc.runners({
    runners: [{
      from: { x: sx, y: sy, scale: 0 },
      to: { x: ex, y: ey, scale: 1 },
      duration: timeline[0] * duration,
      ease: JC.Tween.Linear.None
    }, {
      to: { x: sx + x * 1.1, y: sy + y * 1.1 },
      duration: timeline[1] * duration,
      ease: JC.Tween.Linear.None
    }, {
      to: { scale: 0 },
      duration: timeline[2] * duration,
      ease: JC.Tween.Linear.None
    }],
    wait: wait,
    onCompelete: function onCompelete() {
      This.alive = false;
    }
  }, true);
};

/**
 * Utils 工具箱
 *
 * @namespace JC.Utils
 */
var Utils = {
  merge: function merge(master, branch) {
    if (!branch) return master;
    for (var key in branch) {
      if (branch[key] !== undefined) {
        master[key] = branch[key];
      }
    }
    return master;
  }
};

var PMARK = 'cp';
var OFFSETS = [{ x: -8, y: -8 }, { x: 14, y: -2 }, { x: -5, y: 11 }];
var STORE = {
  aliveCoins: [],
  idelCoins: [],
  aliveBlinks: [],
  idelBlinks: [],
  criclrPoint: {}
};
var STAGE_OPTION = {
  dom: 'flycoins-stage',
  interactive: false,
  enableFPS: false,
  width: 320,
  height: 320
};

/**
 *
 * @param {Object} options 配置
 */
function FlyCoins(options) {
  options = options || {};
  this.stageOpts = Utils.merge(STAGE_OPTION, options.stage);
  this.coinsOpts = options.coins || {};
  this.blinksOpts = options.blinks || {};
  this.end = options.end || {};
  this.duration = options.duration || 1000;
  this.init();
}

FlyCoins.prototype.init = function () {
  this.stage = new JC.Stage(this.stageOpts);
  this.coins = new JC.Container();
  this.blinks = new JC.Container();
  this.stage.adds(this.blinks, this.coins);
};

FlyCoins.prototype._getTarget = function (count, range) {
  if (range <= 0 || count <= 0) {
    console.error('you must insure count and range > 0');
  }
  var mark = PMARK + count + 'N' + range;
  var target = STORE.criclrPoint[mark] = STORE.criclrPoint[mark] || [];
  if (target.length === count) return target;
  for (var i = 0; i < count; i++) {
    var rad = Math.PI * 2 * i / count;
    var p = new JC.Point(Math.cos(rad) * range, Math.sin(rad) * range);
    target.push(p);
  }
  return target;
};

FlyCoins.prototype._checkAlive = function (alive, idel) {
  for (var i = alive.length - 1; i >= 0; i--) {
    var coin = alive[i];
    if (!coin.alive) {
      idel.push(alive.splice(i, 1)[0]);
    }
  }
};

FlyCoins.prototype._shipCoins = function (coins) {
  var _this = this;

  this._checkAlive(STORE.aliveCoins, STORE.idelCoins);
  var offsets = coins.offsets || OFFSETS;
  var count = offsets.length;
  var num = count - STORE.idelCoins.length;
  if (num > 0) {
    for (var i = 0; i < num; i++) {
      STORE.idelCoins.push(new Coin(coins));
    }
  }
  var emitCoins = STORE.idelCoins.splice(0, count);
  offsets.forEach(function (it, idx) {
    var coin = emitCoins[idx];
    coin.offset = new JC.Point(it.x, it.y);
    _this.coins.adds(coin.doc);
  });
  return emitCoins;
};

FlyCoins.prototype._emitCoins = function (coinsobj, _ref) {
  var end = _ref.end,
      duration = _ref.duration,
      start = _ref.start;

  end = end || this.end;
  duration = duration || this.duration;
  var last = coinsobj.length - 1;
  for (var i = last; i >= 0; i--) {
    var coin = coinsobj[i];
    coin.fly({
      start: start,
      end: end,
      wait: (last - i) * duration * 0.1,
      duration: duration
    });
    STORE.aliveCoins.push(coin);
  }
};

FlyCoins.prototype.flying = function (_ref2) {
  var coins = _ref2.coins,
      blinks = _ref2.blinks,
      start = _ref2.start,
      end = _ref2.end;

  var cCoins = Utils.merge(this.coinsOpts, coins);
  var cBlinks = Utils.merge(this.blinksOpts, blinks);

  var coinsobj = this._shipCoins(cCoins);
  this._emitCoins(coinsobj, {
    start: start,
    end: end
  });

  this._shipAndEmitBlinks(cBlinks, end);
};

FlyCoins.prototype._shipAndEmitBlinks = function (_ref3, endBase) {
  var count = _ref3.count,
      range = _ref3.range,
      color = _ref3.color,
      radius = _ref3.radius;

  this._checkAlive(STORE.aliveBlinks, STORE.idelBlinks);

  var targetPoints = this._getTarget(count, range);

  var num = count - STORE.idelBlinks.length;
  if (num > 0) {
    for (var i = 0; i < num; i++) {
      STORE.idelBlinks.push(new Blink({
        color: color,
        radius: radius
      }));
    }
  }
  var emitBlinks = STORE.idelBlinks.splice(0, count);
  // TODO: add update blink color and radius

  endBase = endBase || this.end;
  var duration = this.duration;
  var length = emitBlinks.length;
  for (var _i = 0; _i < length; _i++) {
    var blink = emitBlinks[_i];
    var end = targetPoints[_i];
    this.blinks.adds(blink.doc);
    blink.boom({
      endBase: endBase,
      end: end,
      wait: duration,
      duration: duration
    });
    STORE.aliveBlinks.push(blink);
  }
};

FlyCoins.prototype.start = function () {
  this.stage.startEngine();
};

FlyCoins.prototype.stop = function () {
  this.stage.stopEngine();
};

exports.JC = JC;
exports.CONFIG = CONFIG;
exports.FlyCoins = FlyCoins;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
