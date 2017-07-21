# FlyCoins · 飞金币动画

是一个自由度极高的飞金币组件，可以支持同时飞多组金币动画，并且内部会收集和缓存对象避免浏览器的`major GC`，具备非常好的性能。

### 用法

用法非常简单，只需要引入`FlyCoins`组件，进行简单的配置就可以完成一个高性能的飞金币动画～

```js
'use strict';
const { h, Component } = require('preact');
const { FlyCoins } = require('@ali/fourier').FlyCoins; // 引入FlyCoins组件，FlyCoins 包含{ FlyCoins, CONFIG }
require('./page_fly.styl');

class PageFly extends Component {
  fly() {
    this.flyCoins.flying({
      start: {
        x: Math.random() * 640,
        y: 200 + Math.random() * 200,
      },
    });
  }
  render() {
    return (
      <div className="cmp-page-flycoins" onClick={this.fly.bind(this)}>
        <FlyCoins
          className="fly-coins"
          width="640"
          height="640"
          coins={{
            texture: require('../images/coin.png'),
          }}
          blinks={{
            count: 8,
            radius: 8,
            range: 60,
            color: '#FFD44F',
          }}
          end={{ x: 320, y: 500 }}
          ref={flyCoins => { this.flyCoins = flyCoins; }}
        />
      </div>
    );
  }
}

module.exports = PageFly;
```

## 完整配置

#### `FlyCoins`组件配置

| 属性                | 值类型                        | 描述                                       |
| ----------------- | -------------------------- | ---------------------------------------- |
| `className`       | `required` : `string`类型    | 传递给`canvas`标签的样式                         |
| `width`           | `required` : `number`类型    | `canvas`的画板宽                             |
| `height`          | `required` : `number`类型    | `canvas`的画板高                             |
| `resolution`      | `required` : `number`类型    | `canvas`的分辨率                             |
| `coins`           | `required` : `object`类型    | 金币的配置参数                                  |
| `coins.texture`   | `required` : `url|image`类型 | 金币的图片素材                                  |
| `[coins.pivot]`   | `object`类型                 | 金币的变换中心点，默认是图片的中心点。可以修改，例如： {x: 25, y: 25} |
| `blinks`          | `required` : `object`类型    | 金币目标点爆开动画配置                              |
| `[blinks.count]`  | `required` : `number`类型    | 粒子数量，会自动在圆上细分                            |
| `[blinks.radius]` | `required` : `number`类型    | 粒子半径                                     |
| `[blinks.range]`  | `required` : `number`类型    | 粒子扩散的半径                                  |
| `[blinks.color]`  | `required` : `color`类型     | 颜色，支持`css`颜色                             |
| `end`             | `object`类型                 | 金币的默认目标点                                 |



#### 方法调用

```javascript
this.flyCoins.flying({
  start: {
    x: Math.random() * 640,
    y: 200 + Math.random() * 200,
  },
  end: {    // 可选配置，可覆盖组件上的配置
    x: 320,
    y: 320,
  },
  blinks: { // 可选配置，可覆盖组件上的配置
    count: 8,
    radius: 8,
    range: 60,
    color: '#FFD44F',
  },
  coins: {  // 可选配置，可覆盖组件上的配置
    ......
  }
});
```

