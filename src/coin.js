'use strict';
/* eslint no-bitwise: 0 */

const FRONT = new JC.Point(0, 0, 10);
import {CONFIG} from './config';

/**
 *
 * @param {Object} options
 */
function Coin(options) {
  const texture = new JC.Texture(options.texture);
  this.doc = new JC.Sprite({
    texture,
  });
  this.doc.scale = 0;
  if (options.pivot) {
    this.doc.pivotX = options.pivot.x;
    this.doc.pivotY = options.pivot.y;
  } else {
    if (texture.loaded) {
      this._center();
    } else {
      texture.on('load', () => {
        this._center();
      });
    }
  }
}

Coin.prototype._center = function() {
  this.doc.pivotX = this.doc.width >> 1;
  this.doc.pivotY = this.doc.height >> 1;
};

Coin.prototype.fly = function({start, end, wait, duration}) {
  if (this.alive) return;
  const This = this;
  const sp = new JC.Point(start.x, start.y).add(this.offset);
  const ep = new JC.Point(end.x, end.y);
  const cp = this._findCP(sp, ep);
  const path = new JC.BezierCurve([sp, cp, ep]);
  const timeline = CONFIG.TIMELINE.stars;

  this.alive = true;
  this.doc.runners({
    runners: [
      {
        from: {scale: 0, x: sp.x, y: sp.y},
        to: {scale: 1.2, x: sp.x, y: sp.y},
        duration: timeline[0] * duration,
      },
      {
        to: {scale: 1},
        duration: timeline[1] * duration,
      },
      {
        path,
        wait: timeline[2] * duration,
        duration: timeline[3] * duration,
        ease: JC.Tween.Back.In,
      },
      {
        to: {scale: 0},
        duration: timeline[4] * duration,
        ease: JC.Tween.Linear.None,
      },
    ],
    wait,
    onCompelete() {
      This.alive = false;
    },
  }, true);
};

Coin.prototype._findCP = function(sp, ep) {
  const center = new JC.Point().addVectors(ep, sp).divideScalar(2);
  const direction = new JC.Point().subVectors(ep, sp);
  const symbolX = ep.x > sp.x ? -1 : 1;
  const symbolY = ep.y > sp.y ? 1 : -1;
  const symbol = symbolX * symbolY;
  const perpendicular = new JC.Point()
  .crossVectors(FRONT, direction)
  .normalize();

  const length = direction.length();
  const rawSlope = direction.y !== 0 ?
  Math.abs(direction.x / direction.y) :
  CONFIG.MAX_SLOPE;
  const slope = Math.sqrt(Math.min(CONFIG.MAX_SLOPE, Math.abs(rawSlope)));
  const weight = slope * length;

  const scalar = perpendicular
  .multiplyScalar(symbol * weight * CONFIG.GLOBAL_WEIGHT);

  return center.add(scalar);
};

export {Coin};
