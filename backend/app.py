from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# Globaalit RTP-seurantaan
total_bets = 0
total_wins = 0

symbol_weights = {
    '🍒': 28, '🍋': 25, '🍉': 20, '⭐': 10, '💎': 3,
    '🍇': 12, '🔔': 12, '7️⃣': 2, '🍊': 10, '🍍': 1
}

symbol_payouts = {
    '🍒': 1.8, '🍋': 2.5, '🍉': 4.0, '⭐': 8.0, '💎': 18.0,
    '🍇': 5.0, '🔔': 7.0, '7️⃣': 22.0, '🍊': 3.5, '🍍': 12.0
}

def weighted_random_symbol():
    total_weight = sum(symbol_weights.values())
    r = random.uniform(0, total_weight)
    upto = 0
    for sym, weight in symbol_weights.items():
        if upto + weight >= r:
            return sym
        upto += weight

def simulate_spin(bet, reels=5, rows=3):
    result = []
    total_win = 0
    winning_lines = []

    for row in range(rows):
        line = [weighted_random_symbol() for _ in range(reels)]
        result.append(line)

        # Tarkista 5, 4, 3 samaa (parempi RTP)
        sym_count = {}
        for sym in line:
            sym_count[sym] = sym_count.get(sym, 0) + 1
        
        max_count = max(sym_count.values())
        best_sym = max(sym_count, key=sym_count.get)
        
        if max_count >= 5:
            line_win = bet * symbol_payouts[best_sym] * 5
        elif max_count >= 4:
            line_win = bet * symbol_payouts[best_sym] * 2.5
        elif max_count >= 3:
            line_win = bet * symbol_payouts[best_sym] * 0.8
        else:
            line_win = 0

        if line_win > 0:
            total_win += line_win
            winning_lines.append({
                "rowIndex": row,
                "symbol": best_sym,
                "count": max_count,
                "win": line_win,
            })

    # Scatter-voitot (3+ missä tahansa)
    for sym in symbol_payouts:
        count = sum(1 for row in result for s in row if s == sym)
        if count >= 3:
            scatter_win = bet * symbol_payouts[sym] * 0.5
            total_win += scatter_win
            winning_lines.append({
                "type": "scatter",
                "symbol": sym,
                "count": count,
                "win": scatter_win
            })

    return result, total_win, winning_lines

@app.route('/api/spin', methods=['POST'])
def spin():
    global total_bets, total_wins
    data = request.json or {}
    bet = data.get('bet', 1)
    reels = data.get('reels', 5)
    rows = data.get('rows', 3)
    
    total_bets += bet
    result, win, winning_lines = simulate_spin(bet, reels, rows)
    total_wins += win
    
    # Näytä reaaliaikainen RTP
    if total_bets > 0:
        rtp = (total_wins / total_bets) * 100
        print(f"RTP: {rtp:.1f}% (panokset: {total_bets}, voitot: {total_wins})")
    
    return jsonify({
        "result": result,
        "win": win,
        "winningLines": winning_lines,
        "status": "success",
    })

@app.route('/favicon.ico')
def favicon():
    return '', 204

if __name__ == '__main__':
    app.run(debug=True, port=5000)
