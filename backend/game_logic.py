import secrets


SYMBOLS = {
    0: {'name': 'cherry',  'weight': 30, 'payout': 1.5},  #27,3%
    1: {'name': 'lemon',   'weight': 25, 'payout': 2.1},  #22.7%
    2: {'name': 'orange',  'weight': 20, 'payout': 4},  #18.2%
    3: {'name': 'grape',   'weight': 15, 'payout': 6},  #13.6%
    4: {'name': 'bell',    'weight': 10, 'payout': 10}, #9.1%
    5: {'name': 'diamond', 'weight': 7,  'payout': 20}, #6.4%
    6: {'name': 'seven',   'weight': 3,  'payout': 600}  #2.7%
}


TOTAL_WEIGHT = sum(s['weight'] for s in SYMBOLS.values())  # = 110


# Voittolinjat (5 linjaa, 5x3 ruudukko)
WIN_LINES = [
    [(0,1), (1,1), (2,1), (3,1), (4,1)],  # Keskilinja
    [(0,0), (1,0), (2,0), (3,0), (4,0)],  # Ylälinja
    [(0,2), (1,2), (2,2), (3,2), (4,2)],  # Alalinja
    [(0,0), (1,1), (2,2), (3,1), (4,0)],  # V-muoto
    [(0,2), (1,1), (2,0), (3,1), (4,2)]   # Käänteinen V
]


def get_random_symbol():
    r = secrets.randbelow(TOTAL_WEIGHT)  # 0 .. TOTAL_WEIGHT-1
    for symbol_id, data in SYMBOLS.items():
        if r < data['weight']:
            return symbol_id
        r -= data['weight']
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
# RTP-SIMULAATIO 96.8% OPARILLE
if __name__ == "__main__":
    import time
    start = time.time()

    spins = 100000  # esim. 10 000
    bet = 1.0

    total_bet = 0.0
    total_win = 0.0

    for _ in range(spins):
        result = spin_reels(bet)
        total_bet += bet
        total_win += result['win_amount']

    duration = time.time() - start
    rtp = (total_win / total_bet) * 100 if total_bet > 0 else 0

    print(f"\n{'='*60}")
    print(f"{'RTP-SIMULAATIO':^60}")
    print(f"{'='*60}")
    print(f"Pyöräytykset: {spins:,}")
    print(f"Kokonauspanos: €{total_bet:,.0f}")
    print(f"Kokonaisvoitot: €{total_win:.2f}")
    print(f"SIMULOITU RTP: {rtp:.2f}%")
    print(f"House edge: {100-rtp:.2f}%")
    print(f"Aika: {duration:.2f}s")
    print(f"{'='*60}")

