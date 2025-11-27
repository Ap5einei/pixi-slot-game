import * as PIXI from 'pixi.js';
import { secureRandomInt } from './rng.js';

const COLS = 5;
const ROWS = 3;
const TILE_SIZE = 110;

const symbols = ['🍒','🍋','🍉','⭐','💎','🍇','🔔','7️⃣','🍊','🍍'];

let balance = 1000;
let bet = 10;
let isSpinning = false;
let reels = [];
let app;
let winLinesContainer;

const symbolStyle = new PIXI.TextStyle({
  fontSize: 82,
  fill: '#fff534',
  fontWeight: 'bold',
  stroke: { color: '#1a1a1a', width: 6 },
  dropShadow: true,
  dropShadowColor: '#301e00',
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 5,
});

async function start() {
  const pixiContainer = document.getElementById('pixi-container');
  app = new PIXI.Application();
  await app.init({
    width: COLS * TILE_SIZE + 200,
    height: ROWS * TILE_SIZE + 120,
    backgroundColor: 0x181818,
  });
  pixiContainer.appendChild(app.canvas);

  winLinesContainer = new PIXI.Container();
  winLinesContainer.zIndex = 100;
  app.stage.addChild(winLinesContainer);

  const reelsTotalWidth = COLS * TILE_SIZE;
  const offsetX = (app.renderer.width - reelsTotalWidth) / 2 + 40;
  const offsetY = 30;

  for (let c = 0; c < COLS; c++) {
    const reelContainer = new PIXI.Container();
    reelContainer.x = offsetX + c * TILE_SIZE;
    reelContainer.y = offsetY;
    app.stage.addChild(reelContainer);

    const mask = new PIXI.Graphics()
      .rect(0, 0, TILE_SIZE, ROWS * TILE_SIZE)
      .fill(0xffffff);
    reelContainer.addChild(mask);
    reelContainer.mask = mask;

    const column = [];
    for (let i = 0; i < ROWS + 1; i++) {
      const text = new PIXI.Text({
        text: symbols[secureRandomInt(symbols.length)],
        style: symbolStyle,
      });
      text.anchor.set(0.5, 0);
      text.x = TILE_SIZE / 2;
      text.y = i * TILE_SIZE;
      reelContainer.addChild(text);
      column.push(text);
    }
    reels.push(column);
  }

  document.getElementById('spin-btn').addEventListener('click', spin);
  document.getElementById('bet-dec').addEventListener('click', () => {
    if (bet > 1) { bet--; updateUI(); }
  });
  document.getElementById('bet-inc').addEventListener('click', () => {
    if ((bet + 1) * 10 <= balance) { bet++; updateUI(); }
  });

  updateUI();
}

function spin() {
  if (isSpinning || bet > balance) return;

  isSpinning = true;
  balance -= bet;
  updateUI();

  const spinDuration = 1500;
  const speed = 60;
  const startTime = performance.now();

  function animateSpin(now) {
    const elapsed = now - startTime;

    for (let c = 0; c < COLS; c++) {
      for (let i = 0; i < ROWS + 1; i++) {
        const tile = reels[c][i];
        tile.y += speed;
        if (tile.y >= ROWS * TILE_SIZE) {
          tile.y -= (ROWS + 1) * TILE_SIZE;
          tile.text = symbols[secureRandomInt(symbols.length)];
        }
      }
    }

    if (elapsed < spinDuration) {
      requestAnimationFrame(animateSpin);
      return;
    }

    stopSpin();
  }

  async function stopSpin() {
    try {
      const response = await fetch('http://localhost:5000/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet, reels: COLS, rows: ROWS }),
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);

      const data = await response.json();
      console.log('BACKEND TULOS:', data);

      for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS; row++) {
          const tile = reels[col][row];
          tile.y = row * TILE_SIZE;
          tile.text = data.result[row][col];
        }
        const last = reels[col][ROWS];
        last.y = ROWS * TILE_SIZE;
        last.text = symbols[secureRandomInt(symbols.length)];
      }

      balance += data.win;
      drawWinLines(data.winningLines || []);
      updateUI();
    } catch (err) {
      console.error('Backend error:', err);
      balance += bet;
      updateUI();
    }

    isSpinning = false;
  }

  requestAnimationFrame(animateSpin);
}

function drawWinLines(winningLines) {
  if (!winLinesContainer) return;
  winLinesContainer.removeChildren();

  console.log('Piirrän voittolinjat:', winningLines);

  winningLines.forEach((line, index) => {
    if (line.rowIndex !== undefined) {
      const g = new PIXI.Graphics();
      
      // PIXIJS V8: TÄMÄ TOIMII
      const y = line.rowIndex * TILE_SIZE + TILE_SIZE / 2 + 30;
      g.moveTo(10, y);
      g.lineTo(app.renderer.width - 30, y);
      g.stroke({ width: 10, color: 0xffff00, alpha: 1.0 });  // ← PUUTTI TÄMÄ!
      
      winLinesContainer.addChild(g);
      console.log(`✅ Piirretty viiva rivi ${line.rowIndex}`);
    }
  });
}

function updateUI() {
  document.getElementById('balance-label').textContent = `Saldo: ${balance}€`;
  document.getElementById('bet-input').value = bet;
  const rtpLabel = document.getElementById('rtp-label');
  if (rtpLabel) rtpLabel.textContent = 'RTP: 96%';
}

start();
