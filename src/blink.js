'use strict';

import {JC} from './jc';
import {CONFIG} from './config';

/**
 *
 * @param {Object} options
 */
function Cricle(options) {
  options = options || {};
  this.radius = options.radius || 8;
  this.color = options.color || '#FFD44F';
}

Cricle.prototype.render = function(ctx) {
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
    color: options.color,
  }));
  this.doc.scale = 0;
}

Blink.prototype.boom = function({endBase, end, wait, duration}) {
  if (this.alive) return;
  const This = this;
  const sx = endBase.x;
  const sy = endBase.y;
  const x = end.x;
  const y = end.y;
  const ex = sx + x;
  const ey = sy + y;
  const timeline = CONFIG.TIMELINE.blinks;

  this.alive = true;
  this.doc.runners({
    runners: [
      {
        from: {x: sx, y: sy, scale: 0},
        to: {x: ex, y: ey, scale: 1},
        duration: timeline[0] * duration,
        ease: JC.Tween.Linear.None,
      },
      {
        to: {x: sx + x * 1.1, y: sy + y * 1.1},
        duration: timeline[1] * duration,
        ease: JC.Tween.Linear.None,
      },
      {
        to: {scale: 0},
        duration: timeline[2] * duration,
        ease: JC.Tween.Linear.None,
      },
    ],
    wait,
    onCompelete() {
      This.alive = false;
    },
  }, true);
};

export {Blink};
