export const SYMBOLS = {
    CHERRY:  { id: 0, name: 'cherry',  image: '/assets/symbols/cherry.png',  weight: 30, payout: 2 },
    LEMON:   { id: 1, name: 'lemon',   image: '/assets/symbols/lemon.png',   weight: 25, payout: 3 },
    ORANGE:  { id: 2, name: 'orange',  image: '/assets/symbols/orange.png',  weight: 20, payout: 4 },
    GRAPE:   { id: 3, name: 'grape',   image: '/assets/symbols/grape.png',   weight: 15, payout: 5 },
    BELL:    { id: 4, name: 'bell',    image: '/assets/symbols/bell.png',    weight: 10, payout: 10 },
    DIAMOND: { id: 5, name: 'diamond', image: '/assets/symbols/diamond.png', weight: 7,  payout: 20 },
    SEVEN:   { id: 6, name: 'seven',   image: '/assets/symbols/seven.png',   weight: 3,  payout: 50 }
};

export const SYMBOL_LIST = Object.values(SYMBOLS);
export const TOTAL_WEIGHT = SYMBOL_LIST.reduce((sum, s) => sum + s.weight, 0);

export async function loadSymbolTextures(PIXI) {
    const textures = {};
    
    for (const symbol of SYMBOL_LIST) {
        textures[symbol.id] = await PIXI.Assets.load(symbol.image);
    }
    
    return textures;
}

export function getSymbolById(id) {
    return SYMBOL_LIST.find(s => s.id === id);
}

export function getRandomSymbolId() {
    let random = Math.random() * TOTAL_WEIGHT;
    
    for (const symbol of SYMBOL_LIST) {
        random -= symbol.weight;
        if (random <= 0) {
            return symbol.id;
        }
    }
    
    return SYMBOL_LIST[0].id;
}
