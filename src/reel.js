import * as PIXI from 'pixi.js';
import { secureRandomInt } from './rng.js';

export class Reel {
  constructor(symbols, rows, tileHeight = 100, width = 120) {
    this.symbols = symbols;
    this.rows = rows;
    this.tileHeight = tileHeight;
    this.width = width;
    this.container = new PIXI.Container();
    this.tiles = [];
    this.totalTiles = rows + 1;

    const mask = new PIXI.Graphics().beginFill(0xffffff).drawRect(0, 0, this.width, this.tileHeight * this.rows);
    this.container.addChild(mask);
    this.container.mask = mask;

    for(let i=0; i<this.totalTiles; i++) {
      const text = new PIXI.Text(symbols[secureRandomInt(symbols.length)], { fontSize:72, fill:'#ffff00', fontWeight:'bold' });
      text.x = 10;
      text.y = i * this.tileHeight;
      this.container.addChild(text);
      this.tiles.push(text);
    }
  }

  spin(finalSymbols) {
    return new Promise(resolve => {
      // Animaatio- ja logiikkaimplementaatio symbolien pyöritykselle lopullisiin
      // symboleihin asti (käytetään requestAnimationFrame ja hidastus)
      // Lopuksi resolve(finalSymbols)
    });
  }
}
