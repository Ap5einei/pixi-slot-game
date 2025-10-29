import * as PIXI from 'pixi.js';
import { secureRandomInt } from './rng.js';

// Reel näyttää aina rows symbolia
export class Reel {
  constructor(symbols, rows, tileHeight = 100, width = 120) {
    this.symbols = symbols;
    this.rows = rows;
    this.tileHeight = tileHeight;
    this.width = width;

    this.container = new PIXI.Container();
    this.tiles = [];
    this.totalTiles = rows + 1; // yksi lisää kiertoon

    // Luo maski kelalle, näkymän korkeus = rows * tileHeight
    const mask = new PIXI.Graphics()
      .rect(0, 0, this.width, this.tileHeight * this.rows)
      .fill(0xffffff);
    this.container.mask = mask;
    this.container.addChild(mask);

    // Luo symbolit tasaisille paikoille
    for (let i = 0; i < this.totalTiles; i++) {
      const txt = new PIXI.Text({
        text: this.symbols[secureRandomInt(this.symbols.length)],
        style: new PIXI.TextStyle({ fontSize: 72, fill: '#ffff00', fontWeight: 'bold' }),
      });
      txt.x = 10;
      txt.y = i * this.tileHeight;
      this.container.addChild(txt);
      this.tiles.push(txt);
    }
  }

  // Loopin pyöritysanimaatio, ei päällekkäisyyttä!
  spin(finalSymbols) {
    return new Promise(resolve => {
      let velocity = 0;
      let acceleration = 1;
      let position = 0;
      const steps = this.tileHeight * this.rows * 2; // pyöritä ainakin täydet pari kierrosta

      let frame = 0;
      const animate = () => {
        velocity += acceleration;
        position += velocity;

        // kierrätä ylimmäinen symboli alas kun täysi "askel" tulee täyteen
        if (position >= this.tileHeight) {
          position -= this.tileHeight;
          this.tiles.unshift(this.tiles.pop());
        }

        // Päivitä symbolien sijainnit
        this.tiles.forEach((tile, i) => {
          let y = i * this.tileHeight - position;
          if (y < -this.tileHeight) y += this.tileHeight * this.totalTiles;
          tile.y = y;
        });

        // Anna animaation hidastua lopussa
        if (frame > steps) acceleration = -1.5;
        if (velocity <= 0 && acceleration < 0) {
          // Aseta lopulliset symbolit näkyville paikoille
          for (let i = 0; i < this.rows; i++) {
            this.tiles[i].text = finalSymbols[i];
            this.tiles[i].y = i * this.tileHeight;
          }
          resolve(finalSymbols);
          return;
        }
        frame++;
        requestAnimationFrame(animate);
      };

      animate();
    });
  }
}
