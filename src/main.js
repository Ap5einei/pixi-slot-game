import * as PIXI from 'pixi.js';
import { SlotGame } from './slotGame.js';

async function startGame() {
  const app = new PIXI.Application({
    width: 700,
    height: 700,
    backgroundColor: 0x1a1a1a,
  });

  document.body.appendChild(app.view);

  const symbols = ['🍒', '🍋', '🍉', '⭐', '💎', '🍇', '🔔', '7️⃣', '🍊', '🍍'];

  const game = new SlotGame(app, symbols);
  game.init();

  const spinBtn = document.getElementById('spin-btn');
  const betInput = document.getElementById('bet-input');

  spinBtn.addEventListener('click', () => {
    const betVal = parseFloat(betInput.value);
    game.setBet(betVal);
    game.spin();
  });
}

startGame();
