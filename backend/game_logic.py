import random

SYMBOLS = {
    0: {'name': 'cherry',  'weight': 30, 'payout': 2},
    1: {'name': 'lemon',   'weight': 25, 'payout': 3},
    2: {'name': 'orange',  'weight': 20, 'payout': 4},
    3: {'name': 'grape',   'weight': 15, 'payout': 5},
    4: {'name': 'bell',    'weight': 10, 'payout': 10},
    5: {'name': 'diamond', 'weight': 7,  'payout': 20},
    6: {'name': 'seven',   'weight': 3,  'payout': 50}
}

TOTAL_WEIGHT = sum(s['weight'] for s in SYMBOLS.values())

# Voittolinjat (5 linjaa, 5x3 ruudukko)
WIN_LINES = [
    [(0,1), (1,1), (2,1), (3,1), (4,1)],  # Keskilinja
    [(0,0), (1,0), (2,0), (3,0), (4,0)],  # Ylälinja
    [(0,2), (1,2), (2,2), (3,2), (4,2)],  # Alalinja
    [(0,0), (1,1), (2,2), (3,1), (4,0)],  # V-muoto
    [(0,2), (1,1), (2,0), (3,1), (4,2)]   # Käänteinen V
]

def get_random_symbol():
    """Palauttaa satunnaisen symbolin ID:n painotuksen mukaan"""
    r = random.random() * TOTAL_WEIGHT
    for symbol_id, data in SYMBOLS.items():
        r -= data['weight']
        if r <= 0:
            return symbol_id
    return 0

def generate_reels():
    """Generoi 5 rullaa, joissa jokaisessa 3 symbolia"""
    reels = []
    for _ in range(5):
        reel = [get_random_symbol() for _ in range(3)]
        reels.append(reel)
    return reels

def check_wins(reels, bet):
    """Tarkistaa voitot ja palauttaa voittotiedot"""
    wins = []
    total_win = 0
    
    for line_index, line in enumerate(WIN_LINES):
        # Kerää symbolit linjalta
        symbols_on_line = [reels[pos[0]][pos[1]] for pos in line]
        
        # Laske peräkkäiset samat symbolit vasemmalta
        first_symbol = symbols_on_line[0]
        count = 1
        
        for i in range(1, 5):
            if symbols_on_line[i] == first_symbol:
                count += 1
            else:
                break
        
        # Voitto vaatii vähintään 3 samaa
        if count >= 3:
            symbol_data = SYMBOLS[first_symbol]
            
            # Kerroin riippuu symbolien määrästä
            if count == 3:
                multiplier = symbol_data['payout']
            elif count == 4:
                multiplier = symbol_data['payout'] * 3
            else:  # 5
                multiplier = symbol_data['payout'] * 10
            
            win_amount = bet * multiplier
            total_win += win_amount
            
            wins.append({
                'line': line_index,
                'symbol': first_symbol,
                'symbol_name': symbol_data['name'],
                'count': count,
                'multiplier': multiplier,
                'amount': win_amount,
                'positions': line[:count]
            })
    
    return wins, total_win

def spin_reels(bet):
    """Suorittaa yhden pyöräytyksen"""
    reels = generate_reels()
    wins, total_win = check_wins(reels, bet)
    
    return {
        'reels': reels,
        'wins': wins,
        'win_amount': total_win,
        'bet': bet
    }

def get_paytable():
    """Palauttaa maksutaulukon"""
    return {
        'symbols': [
            {
                'id': symbol_id,
                'name': data['name'],
                'payout_3': data['payout'],
                'payout_4': data['payout'] * 3,
                'payout_5': data['payout'] * 10
            }
            for symbol_id, data in SYMBOLS.items()
        ],
        'lines': len(WIN_LINES)
    }
