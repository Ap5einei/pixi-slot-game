import * as PIXI from 'pixi.js';
import { Reel } from './reel.js';

export class SlotGame {
  constructor(app, symbols) {
    this.app = app;
    this.symbols = symbols;
    this.reels = [];
    this.balance = 1000;
    this.bet = 10;
    this.rows = 3;
    this.cols = 5;
    this.isSpinning = false;

    // UI
    this.rtpText = new PIXI.Text({
      text: 'RTP: 0%',
      style: new PIXI.TextStyle({ fontSize: 24, fill: 'white' }),
    });
    this.rtpText.position.set(10, 10);
    this.app.stage.addChild(this.rtpText);

    this.balanceText = new PIXI.Text({
      text: `Saldo: ${this.balance.toFixed(2)}€`,
      style: new PIXI.TextStyle({ fontSize: 24, fill: 'white' }),
    });
    this.balanceText.position.set(10, 40);
    this.app.stage.addChild(this.balanceText);
  }

  init() {
    for (let col = 0; col < this.cols; col++) {
      const reel = new Reel(this.symbols, this.rows, 100, 120);
      reel.container.x = col * 120;
      reel.container.y = 150;
      this.app.stage.addChild(reel.container);
      this.reels.push(reel);
    }
  }

  setBet(amount) {
    if (!this.isSpinning && amount > 0 && amount <= this.balance) {
      this.bet = amount;
    }
  }

  async spin() {
    if (this.isSpinning) return;
    if (this.bet > this.balance) {
      alert('Ei tarpeeksi saldoa!');
      return;
    }
    this.isSpinning = true;
    this.balance -= this.bet;
    this.updateBalanceDisplay();

    // Arvo lopputulokset jokaiselle kelalle
    const results = [];
    for (let i = 0; i < this.cols; i++) {
      results[i] = Array.from({ length: this.rows }, () => this.symbols[Math.floor(Math.random() * this.symbols.length)]);
    }

    await Promise.all(
      this.reels.map((reel, i) => reel.spin(results[i]))
    );

    // Palkintojen jako
    let winAmount = 0;
    const paylines = [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2],
    ];

    paylines.forEach((line) => {
      const lineSymbols = line.map((row, col) => results[col][row]);
      if (lineSymbols.every((s) => s === lineSymbols[0])) {
        winAmount += this.bet * 5;
      }
    });

    if (winAmount > 0) {
      this.balance += winAmount;
      this.updateBalanceDisplay();
    }

    this.isSpinning = false;
  }

  updateBalanceDisplay() {
    this.balanceText.text = `Saldo: ${this.balance.toFixed(2)}€`;
  }
}
