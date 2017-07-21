'use strict';

import {Coin} from './coin';
import {Blink} from './blink';
import {Utils} from './utils';

const PMARK = 'cp';
const OFFSETS = [
  {x: -8, y: -8},
  {x: 14, y: -2},
  {x: -5, y: 11},
];
const STORE = {
  aliveCoins: [],
  idelCoins: [],
  aliveBlinks: [],
  idelBlinks: [],
  criclrPoint: {},
};
const STAGE_OPTION = {
  dom: 'flycoins-stage',
  interactive: false,
  enableFPS: false,
  width: 320,
  height: 320,
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

FlyCoins.prototype.init = function() {
  this.stage = new JC.Stage(this.stageOpts);
  this.coins = new JC.Container();
  this.blinks = new JC.Container();
  this.stage.adds(this.blinks, this.coins);
};

FlyCoins.prototype._getTarget = function(count, range) {
  if (range <= 0 || count <= 0) {
    console.error('you must insure count and range > 0');
  }
  const mark = PMARK + count + 'N' + range;
  const target = STORE.criclrPoint[mark] = STORE.criclrPoint[mark] || [];
  if (target.length === count) return target;
  for (let i = 0; i < count; i++) {
    const rad = Math.PI * 2 * i / count;
    const p = new JC.Point(Math.cos(rad) * range, Math.sin(rad) * range);
    target.push(p);
  }
  return target;
};

FlyCoins.prototype._checkAlive = function(alive, idel) {
  for (let i = alive.length - 1; i >= 0; i--) {
    const coin = alive[i];
    if (!coin.alive) {
      idel.push(alive.splice(i, 1)[0]);
    }
  }
};

FlyCoins.prototype._shipCoins = function(coins) {
  this._checkAlive(STORE.aliveCoins, STORE.idelCoins);
  const offsets = coins.offsets || OFFSETS;
  const count = offsets.length;
  const num = count - STORE.idelCoins.length;
  if (num > 0) {
    for (let i = 0; i < num; i++) {
      STORE.idelCoins.push(new Coin(coins));
    }
  }
  const emitCoins = STORE.idelCoins.splice(0, count);
  offsets.forEach((it, idx) => {
    const coin = emitCoins[idx];
    coin.offset = new JC.Point(it.x, it.y);
    this.coins.adds(coin.doc);
  });
  return emitCoins;
};

FlyCoins.prototype._emitCoins = function(coinsobj, {end, duration, start}) {
  end = end || this.end;
  duration = duration || this.duration;
  const last = coinsobj.length - 1;
  for (let i = last; i >= 0; i--) {
    const coin = coinsobj[i];
    coin.fly({
      start,
      end,
      wait: (last - i) * duration * 0.1,
      duration,
    });
    STORE.aliveCoins.push(coin);
  }
};

FlyCoins.prototype.flying = function({coins, blinks, start, end}) {
  const cCoins = Utils.merge(this.coinsOpts, coins);
  const cBlinks = Utils.merge(this.blinksOpts, blinks);

  const coinsobj = this._shipCoins(cCoins);
  this._emitCoins(coinsobj, {
    start,
    end,
  });

  this._shipAndEmitBlinks(cBlinks, end);
};

FlyCoins.prototype._shipAndEmitBlinks = function(
  {count, range, color, radius},
  endBase
) {
  this._checkAlive(STORE.aliveBlinks, STORE.idelBlinks);

  const targetPoints = this._getTarget(count, range);

  const num = count - STORE.idelBlinks.length;
  if (num > 0) {
    for (let i = 0; i < num; i++) {
      STORE.idelBlinks.push(new Blink({
        color,
        radius,
      }));
    }
  }
  const emitBlinks = STORE.idelBlinks.splice(0, count);
  // TODO: add update blink color and radius

  endBase = endBase || this.end;
  const duration = this.duration;
  const length = emitBlinks.length;
  for (let i = 0; i < length; i++) {
    const blink = emitBlinks[i];
    const end = targetPoints[i];
    this.blinks.adds(blink.doc);
    blink.boom({
      endBase,
      end,
      wait: duration,
      duration,
    });
    STORE.aliveBlinks.push(blink);
  }
};

FlyCoins.prototype.start = function() {
  this.stage.startEngine();
};

FlyCoins.prototype.stop = function() {
  this.stage.stopEngine();
};

export {FlyCoins};
