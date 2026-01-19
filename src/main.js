import { Application, Container, Graphics } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { loadSymbolTextures, SYMBOL_LIST } from './symbols.js';
import { Reel } from './reel.js';
import { audioManager } from './audio.js';

const REEL_COUNT = 5;
const SYMBOL_SIZE = 120;
const REEL_GAP = 10;

let app;
let reels = [];
let balance = 1000;
let betAmount = 1;
let isSpinning = false;

const BET_LEVELS = [0.50, 1, 2, 5, 10, 20];
let currentBetIndex = 1;

async function init() {
    // Luo Pixi-sovellus
    app = new Application();
    await app.init({
        width: REEL_COUNT * (SYMBOL_SIZE + REEL_GAP) - REEL_GAP,
        height: SYMBOL_SIZE * 3,
        backgroundColor: 0x1a1a2e,
        antialias: true
    });
    
    document.getElementById('game-container').appendChild(app.canvas);
    
    // Lataa tekstuurit
    const textures = await loadSymbolTextures(PIXI);
    
    // Luo rullakontti maskilla
    const reelContainer = new Container();
    app.stage.addChild(reelContainer);
    
    // Maski näkyvälle alueelle
    const mask = new Graphics();
    mask.rect(0, 0, app.screen.width, SYMBOL_SIZE * 3);
    mask.fill(0xffffff);
    reelContainer.mask = mask;
    reelContainer.addChild(mask);
    
    // Luo rullat
    for (let i = 0; i < REEL_COUNT; i++) {
        const reel = new Reel(textures, SYMBOL_SIZE);
        reel.container.x = i * (SYMBOL_SIZE + REEL_GAP);
        reelContainer.addChild(reel.container);
        reels.push(reel);
    }
    
    // Lataa äänet
    loadSounds();
    
    // Tapahtumakuuntelijat
    setupEventListeners();
    
    updateUI();
}

function loadSounds() {
    audioManager.load('spin', '/assets/sounds/spin.mp3');
    audioManager.load('stop', '/assets/sounds/stop.mp3');
    audioManager.load('click', '/assets/sounds/click.mp3');
    audioManager.load('win', '/assets/sounds/win.mp3');
    audioManager.load('bigwin', '/assets/sounds/bigwin.mp3');
    audioManager.load('coin', '/assets/sounds/coin.mp3');
}

function setupEventListeners() {
    document.getElementById('spin-btn').addEventListener('click', handleSpin);
    
    document.getElementById('bet-up').addEventListener('click', () => {
        audioManager.play('click');
        if (currentBetIndex < BET_LEVELS.length - 1) {
            currentBetIndex++;
            betAmount = BET_LEVELS[currentBetIndex];
            updateUI();
        }
    });
    
    document.getElementById('bet-down').addEventListener('click', () => {
        audioManager.play('click');
        if (currentBetIndex > 0) {
            currentBetIndex--;
            betAmount = BET_LEVELS[currentBetIndex];
            updateUI();
        }
    });
    
    document.getElementById('mute-btn').addEventListener('click', () => {
        const muted = audioManager.toggleMute();
        document.getElementById('mute-btn').textContent = muted ? '🔇' : '🔊';
    });
    
    // Kaikki napit soittavat click-äänen
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mousedown', () => audioManager.play('click'));
    });
}

async function handleSpin() {
    if (isSpinning) return;
    if (balance < betAmount) {
        alert('Saldo ei riitä!');
        return;
    }
    
    isSpinning = true;
    balance -= betAmount;
    updateUI();
    
    document.getElementById('spin-btn').disabled = true;
    document.getElementById('win-display').textContent = '';
    
    audioManager.play('click');
    audioManager.playLoop('spin');
    
    try {
        // Hae tulos backendistä
        const response = await fetch('/api/spin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bet: betAmount })
        });
        
        const result = await response.json();
        
        // Pyöritä rullat
        const spinPromises = reels.map((reel, i) => 
            reel.spin(result.reels[i], i * 200)
        );
        
        await Promise.all(spinPromises);
        
        audioManager.stop('spin');
        audioManager.play('stop');
        
        // Käsittele voitto
        if (result.win_amount > 0) {
            balance += result.win_amount;
            
            if (result.win_amount >= betAmount * 20) {
                audioManager.play('bigwin');
            } else {
                audioManager.play('win');
            }
            
            setTimeout(() => audioManager.play('coin'), 300);
            
            document.getElementById('win-display').textContent = 
                `VOITTO: ${result.win_amount.toFixed(2)} €`;
        }
        
        updateUI();
        
    } catch (error) {
        console.error('Spin error:', error);
        audioManager.stop('spin');
    }
    
    isSpinning = false;
    document.getElementById('spin-btn').disabled = false;
}

function updateUI() {
    document.getElementById('balance').textContent = balance.toFixed(2);
    document.getElementById('bet').textContent = betAmount.toFixed(2);
}

// Käynnistä peli
init();
