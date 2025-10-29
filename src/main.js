import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';

const symbols = ['🍒', '🍋', '🍉', '⭐', '💎', '🍇', '🔔', '7️⃣', '🍊', '🍍'];
const ROWS = 3;
const COLS = 5;
const TILE_SIZE = 110;

let balance = 1000;
let stats = { winnings: 0, wagered: 0, RTP: 0, spins: 0 };
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
  dropShadowAngle: Math.PI/6,
  dropShadowDistance: 5,
});

async function start() {
  const pixiContainer = document.getElementById('pixi-container');
  const app = new Application();
  await app.init({ width: COLS * TILE_SIZE + 40, height: ROWS * TILE_SIZE + 80, backgroundColor: 0x181818 });
  pixiContainer.appendChild(app.canvas);

  // Luodaan kelat ja symbolipaikat
  const reels = [];
  for (let c = 0; c < COLS; c++) {
    const reel = new Container();
    reel.x = 20 + c * TILE_SIZE;
    reel.y = 30;
    app.stage.addChild(reel);

    // Maski
    const mask = new Graphics().rect(0, 0, TILE_SIZE, ROWS * TILE_SIZE).fill(0xffffff);
    reel.addChild(mask);
    reel.mask = mask;

    // Symbolipaikat + 1 varalle animaatiota, tallennetaan tekstikomponentit arrayhin
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

  // Panosnapit
  const betInput = document.getElementById('bet-input');
  const betMin = 1;
  const betMax = 100;
  document.getElementById('bet-inc').addEventListener('click', () => {
    let current = parseInt(betInput.value);
    if (current + 10 <= betMax) betInput.value = current + 10;
  });
  document.getElementById('bet-dec').addEventListener('click', () => {
    let current = parseInt(betInput.value);
    if (current - 10 >= betMin) betInput.value = current - 10;
  });

  function updateUI() {
    document.getElementById('balance-label').textContent = `Saldo: ${balance}€`;
    let rtp = stats.wagered ? (stats.winnings / stats.wagered * 100).toFixed(2) : 0;
    document.getElementById('rtp-label').textContent = `RTP: ${rtp}%`;
  }

  // Kaikki kelat pyörivät SAMAAN AIKAAN ja päättyvät samaan aikaan
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
          // Stopataan paikoilleen: siirretään symbolit tarkasti oikeille kohdille
          for (let c = 0; c < COLS; c++) {
            for (let r = 0; r <= ROWS; r++) {
              reels[c][r].y = r * TILE_SIZE;
              // Lopuksi päällimmäiset paikat satunnaisilla symboleilla
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
    const bet = parseInt(betInput.value);
    if (bet > balance) {
      alert('Ei tarpeeksi saldoa!');
      return;
    }
    isSpinning = true;
    balance -= bet;
    stats.spins++;
    stats.wagered += bet;
    updateUI();

    // Kaikki kelat pyörivät yhtäaikaa
    await spinAllReels(1800);

    // Voittolaskenta: vertaa vain näkyvät rivit r=1,2,3 (r=1 koska r=0 on animaatiovarapaikka)
    let win = 0;
    for (let row = 1; row <= ROWS; row++) {
      const line = reels.map(reel => reel[row].text);
      if (line.every(s => s === line[0])) win += bet * 10;
    }

    balance += win;
    stats.winnings += win;
    updateUI();
    isSpinning = false;
  });

  updateUI();
}

start();
