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
    this.balanceText = new PIXI.Text('', { fontSize: 24, fill: 'white' });
    this.balanceText.position.set(10, 40);
    this.app.stage.addChild(this.balanceText);
    this.updateBalanceDisplay();
  }

  init() {
    for(let c=0; c<this.cols; c++) {
      const reel = new Reel(this.symbols, this.rows);
      reel.container.x = c * 120;
      reel.container.y = 150;
      this.app.stage.addChild(reel.container);
      this.reels.push(reel);
    }
  }

  async spin() {
    if(this.isSpinning || this.bet > this.balance) return;
    this.isSpinning = true;
    this.balance -= this.bet;
    this.updateBalanceDisplay();

    const response = await fetch('http://localhost:5000/api/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ bet: this.bet }),
    });
    const data = await response.json();

    for(let i=0; i<this.cols; i++) {
      await this.reels[i].spin(data.result[i]);
    }

    this.balance += data.win;
    this.updateBalanceDisplay();
    this.isSpinning = false;
  }

  updateBalanceDisplay() {
    this.balanceText.text = `Saldo: ${this.balance}€`;
  }
}
