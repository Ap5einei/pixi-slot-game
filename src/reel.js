import * as PIXI from 'pixi.js';
import { secureRandomInt } from './rng.js';

export class Reel {
  constructor(symbols, app) {
    this.symbols = symbols;
    this.app = app;
    this.container = new PIXI.Container();
    this.tiles = [];
    this.rows = 5;
    this.tileHeight = 100;

    const mask = new PIXI.Graphics()
      .beginFill(0xffffff)
      .drawRect(0, 0, 120, this.tileHeight * this.rows)
      .endFill();

    this.container.mask = mask;
    this.container.addChild(mask);

    for (let i = 0; i < this.rows + 1; i++) {
      const txt = new PIXI.Text({
        text: this.symbols[secureRandomInt(this.symbols.length)],
        style: new PIXI.TextStyle({
          fontSize: 72,
          fill: '#ffff00',
          fontWeight: 'bold',
        }),
      });
      txt.y = i * this.tileHeight;
      this.container.addChild(txt);
      this.tiles.push(txt);
    }
  }

  spin(finalSymbols) {
    return new Promise((resolve) => {
      let velocity = 0;
      let acceleration = 0.5;
      let position = 0;
      const totalSymbols = this.rows + 1;

      const animate = () => {
        velocity += acceleration;
        position += velocity;

        if (position >= this.tileHeight) {
          position -= this.tileHeight;
          this.tiles.unshift(this.tiles.pop());
        }

        this.tiles.forEach((tile, i) => {
          let y = i * this.tileHeight - position;
          if (y < -this.tileHeight) y += this.tileHeight * totalSymbols;
          tile.y = y;
        });

        if (velocity >= 30) acceleration = -0.7;

        if (velocity <= 0.1 && acceleration < 0) {
          velocity = 0;
          acceleration = 0;
          for (let i = 0; i < this.rows; i++) {
            this.tiles[i].text = finalSymbols[i];
            this.tiles[i].y = i * this.tileHeight;
          }
          resolve(finalSymbols);
          return;
        }

        requestAnimationFrame(animate);
      };

      animate();
    });
  }

  highlight(symbol) {
    this.tiles.forEach((tile) => {
      if (tile.text === symbol) {
        tile.alpha = 0.5;
        setTimeout(() => (tile.alpha = 1), 600);
      }
    });
  }
}
