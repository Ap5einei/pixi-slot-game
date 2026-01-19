import { Container, Sprite } from 'pixi.js';
import { SYMBOL_LIST, getRandomSymbolId } from './symbols.js';

export class Reel {
    constructor(textures, symbolSize = 120) {
        this.container = new Container();
        this.textures = textures;
        this.symbolSize = symbolSize;
        this.symbols = [];
        this.spinning = false;
        
        // Luo 4 symbolia (3 näkyvää + 1 animaatiota varten)
        for (let i = 0; i < 4; i++) {
            const sprite = new Sprite(this.getRandomTexture());
            sprite.width = symbolSize;
            sprite.height = symbolSize;
            sprite.x = 0;
            sprite.y = i * symbolSize;
            this.symbols.push(sprite);
            this.container.addChild(sprite);
        }
    }
    
    getRandomTexture() {
        const randomId = getRandomSymbolId();
        return this.textures[randomId];
    }
    
    setSymbols(symbolIds) {
        for (let i = 0; i < 3; i++) {
            if (symbolIds[i] !== undefined) {
                this.symbols[i].texture = this.textures[symbolIds[i]];
                this.symbols[i].y = i * this.symbolSize;
            }
        }
    }
    
    async spin(finalSymbolIds, delay = 0) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.spinning = true;
                
                const spinDuration = 2000;
                const spinSpeed = 25;
                const startTime = Date.now();
                
                const easeOut = (t) => 1 - Math.pow(1 - t, 3);
                
                const animate = () => {
                    if (!this.spinning) {
                        resolve();
                        return;
                    }
                    
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / spinDuration, 1);
                    
                    // Hidasta loppua kohti
                    const speedMultiplier = progress < 0.7 ? 1 : (1 - easeOut((progress - 0.7) / 0.3));
                    const currentSpeed = spinSpeed * speedMultiplier;
                    
                    // Liikuta symboleja alaspäin
                    for (const sprite of this.symbols) {
                        sprite.y += currentSpeed;
                        
                        // Kun symboli menee näkyvän alueen ulkopuolelle
                        if (sprite.y >= this.symbolSize * 3) {
                            sprite.y -= this.symbolSize * 4;
                            
                            // Vaihda satunnainen tekstuuri pyörityksen aikana
                            if (progress < 0.8) {
                                sprite.texture = this.getRandomTexture();
                            }
                        }
                    }
                    
                    if (progress >= 1) {
                        this.spinning = false;
                        this.setFinalSymbols(finalSymbolIds);
                        resolve();
                    } else {
                        requestAnimationFrame(animate);
                    }
                };
                
                animate();
            }, delay);
        });
    }
    
    setFinalSymbols(symbolIds) {
        // Järjestä symbolit oikeille paikoille
        this.symbols.sort((a, b) => a.y - b.y);
        
        for (let i = 0; i < 3; i++) {
            this.symbols[i].texture = this.textures[symbolIds[i]];
            this.symbols[i].y = i * this.symbolSize;
        }
        
        // Piilota neljäs symboli
        if (this.symbols[3]) {
            this.symbols[3].y = -this.symbolSize;
        }
    }
}
