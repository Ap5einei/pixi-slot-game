from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from game_logic import spin_reels, get_paytable  # ← SUORA import backend-kansiosta

app = Flask(__name__)

CORS(app)

@app.route('/api/spin', methods=['POST'])
def spin():
    data = request.get_json()
    bet = data.get('bet', 1.0)
    result = spin_reels(bet)
    return jsonify(result)

@app.route('/api/paytable', methods=['GET'])
def paytable():
    return jsonify(get_paytable())

if __name__ == '__main__':
    app.run(debug=True, port=5000)
