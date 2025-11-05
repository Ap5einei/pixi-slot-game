from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

symbol_weights = {
    '🍒': 20, '🍋': 18, '🍉': 15, '⭐': 10,
    '💎': 5, '🍇': 8, '🔔': 12, '7️⃣': 4,
    '🍊': 5, '🍍': 3,
}

symbol_payouts = {
    '🍒': 2, '🍋': 3, '🍉': 5, '⭐': 10,
    '💎': 20, '🍇': 6, '🔔': 8, '7️⃣': 25,
    '🍊': 4, '🍍': 15,
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
    for _ in range(rows):
        line = [weighted_random_symbol() for _ in range(reels)]
        result.append(line)
        if len(set(line)) == 1:
            total_win += bet * symbol_payouts[line[0]]
    return result, total_win

@app.route('/api/spin', methods=['POST'])
def spin():
    data = request.json
    bet = data.get('bet', 1)
    reels = data.get('reels', 5)
    rows = data.get('rows', 3)

    result, win = simulate_spin(bet, reels, rows)

    return jsonify({
        'result': result,
        'win': win,
        'status': 'success'
    })

if __name__ == '__main__':
    app.run(debug=True)
