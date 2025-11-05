import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';

const COLS = 5;
const ROWS = 3;
const TILE_SIZE = 110;

const symbols = ['🍒', '🍋', '🍉', '⭐', '💎', '🍇', '🔔', '7️⃣', '🍊', '🍍'];

let balance = 1000;
let isSpinning = false;

const symbolStyle = new TextStyle({
  fontSize: 82,
  fill: '#fff534',
  fontWeight: 'bold',
  padding: 22,
  stroke: { color: '#1a1a1a', width: 6 },
  dropShadow: true,
  dropShadowColor: '#301e00',
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 5,
});

async function start() {
  const pixiContainer = document.getElementById('pixi-container');
  const app = new Application();

  await app.init({
    width: COLS * TILE_SIZE + 40,
    height: ROWS * TILE_SIZE + 80,
    backgroundColor: 0x181818,
  });

  pixiContainer.appendChild(app.canvas);

  const reels = [];
  for (let c = 0; c < COLS; c++) {
    const reel = new Container();
    reel.x = 20 + c * TILE_SIZE;
    reel.y = 30;
    app.stage.addChild(reel);

    // Korjattu maski: käytetään rect...fill eikä beginFill eikä drawRect
    const mask = new Graphics()
      .rect(0, 0, TILE_SIZE, ROWS * TILE_SIZE)
      .fill(0xffffff);
    reel.addChild(mask);
    reel.mask = mask;

    const symbolsArr = [];
    for (let r = 0; r <= ROWS; r++) {
      const text = new Text({ text: symbols[Math.floor(Math.random() * symbols.length)], style: symbolStyle });
      text.x = 10;
      text.y = r * TILE_SIZE;
      reel.addChild(text);
      symbolsArr.push(text);
    }
    reels.push(symbolsArr);
  }

  function updateUI() {
    document.getElementById('balance-label').textContent = `Saldo: ${balance}€`;
  }

  function spinAllReels(syncDuration) {
    return new Promise((resolve) => {
      let start = null;
      const totalHeight = TILE_SIZE * (ROWS + 1);
      const speed = 24;

      function animate(time) {
        if (!start) start = time;
        const elapsed = time - start;

        for (let c = 0; c < COLS; c++) {
          for (let r = 0; r <= ROWS; r++) {
            const symbol = reels[c][r];
            symbol.y += speed;
            if (symbol.y >= totalHeight) {
              symbol.y -= totalHeight;
              symbol.text = symbols[Math.floor(Math.random() * symbols.length)];
            }
          }
        }

        if (elapsed < syncDuration) {
          requestAnimationFrame(animate);
        } else {
          for (let c = 0; c < COLS; c++) {
            for (let r = 0; r <= ROWS; r++) {
              reels[c][r].y = r * TILE_SIZE;
              reels[c][r].text = symbols[Math.floor(Math.random() * symbols.length)];
            }
          }
          resolve();
        }
      }
      requestAnimationFrame(animate);
    });
  }

  document.getElementById('spin-btn').addEventListener('click', async () => {
    if (isSpinning) return;
    const bet = parseInt(document.getElementById('bet-input').value);
    if (bet > balance) {
      alert('Ei tarpeeksi saldoa!');
      return;
    }
    isSpinning = true;
    balance -= bet;
    updateUI();

    await spinAllReels(1800);

    let win = 0;
    for (let row = 1; row <= ROWS; row++) {
      const line = reels.map(reel => reel[row].text);
      if (line.every(s => s === line[0])) win += bet * 10;
    }

    balance += win;
    updateUI();
    isSpinning = false;
  });

  updateUI();
}

start();
