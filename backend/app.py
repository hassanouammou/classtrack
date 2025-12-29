from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_compress import Compress
import jwt
import datetime
import os
from functools import wraps
import pymysql
from pymysql.cursors import DictCursor
from time import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'

# Compression Gzip
Compress(app)

# Configuration MariaDB
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'classtrack',
    'charset': 'utf8mb4',
    'cursorclass': DictCursor
}

def get_db_connection():
    return pymysql.connect(**MYSQL_CONFIG)

CORS(app)

# ==================== CACHE ====================
CACHE_STATS = {}
CACHE_ATTENDANCE = {}
CACHE_TIMEOUT = 300

def get_cached_stats(user_id):
    current_time = time()
    if user_id in CACHE_STATS:
        cached_data, timestamp = CACHE_STATS[user_id]
        if current_time - timestamp < CACHE_TIMEOUT:
            return cached_data
    return None

def set_cached_stats(user_id, data):
    CACHE_STATS[user_id] = (data, time())

def get_cached_attendance(user_id):
    current_time = time()
    if user_id in CACHE_ATTENDANCE:
        cached_data, timestamp = CACHE_ATTENDANCE[user_id]
        if current_time - timestamp < CACHE_TIMEOUT:
            return cached_data
    return None

def set_cached_attendance(user_id, data):
    CACHE_ATTENDANCE[user_id] = (data, time())

def clear_user_cache(user_id):
    if user_id in CACHE_STATS:
        del CACHE_STATS[user_id]
    if user_id in CACHE_ATTENDANCE:
        del CACHE_ATTENDANCE[user_id]

# ==================== DECORATOR ====================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token manquant'}), 401

        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            return f(data['user_id'], *args, **kwargs)
        except Exception:
            return jsonify({'error': 'Token invalide'}), 401

    return decorated

@app.after_request
def add_cache_headers(response):
    # Désactiver le cache pour les API
    if request.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    # Pour les fichiers statiques (CSS, JS), permettre le cache mais valider
    elif request.path.endswith(('.css', '.js', '.html')):
        response.headers['Cache-Control'] = 'no-cache, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
    return response


FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))

@app.route('/', methods=['GET'])
def home():
    # Servir la page d'accueil du frontend
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_frontend(path):
    # Servir fichiers statiques du frontend (html, css, js, assets)
    return send_from_directory(FRONTEND_DIR, path)

# ==================== AUTH ====================
@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = %s', (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 401

        if user['password'] != password:
            return jsonify({'error': 'Mot de passe incorrect'}), 401

        token = jwt.encode({
            'user_id': user['id'],
            'username': user['username'],
            # Utiliser une date/heure consciente du fuseau (UTC) pour l'expiration
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'token': token,
            'user': user['username'],
            'name': user['full_name']
        }), 200

    except Exception as e:
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500

# ==================== STATS ====================
@app.route('/api/stats', methods=['GET'])
@token_required
def get_stats(user_id):
    try:
        cached = get_cached_stats(user_id)
        if cached:
            return jsonify(cached), 200

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN status = "Présent" THEN 1 ELSE 0 END) AS present
            FROM attendance 
            WHERE user_id = %s
        ''', (user_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        total = result['total'] or 0
        present = result['present'] or 0
        absent = total - present
        rate = round((present / total * 100), 1) if total > 0 else 0

        data = {
            'total': total,
            'present': present,
            'absent': absent,
            'rate': rate
        }

        set_cached_stats(user_id, data)
        return jsonify(data), 200

    except Exception as e:
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500

# ==================== ATTENDANCE (CORRIGÉ) ====================
def format_time(t):
    if t is None:
        return '--:--'
    # t est un datetime.timedelta
    total_seconds = int(t.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

@app.route('/api/attendance', methods=['GET'])
@token_required
def get_attendance(user_id):
    try:
        # Vérifier le cache d'abord
        cached = get_cached_attendance(user_id)
        if cached:
            return jsonify({'attendance': cached}), 200
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                course,
                date,
                start_time,
                end_time,
                status
            FROM attendance
            WHERE user_id = %s
            ORDER BY date DESC, start_time DESC
        ''', (user_id,))

        attendance = cursor.fetchall()

        for att in attendance:
            att['date'] = att['date'].strftime('%Y-%m-%d') if att['date'] else '--:--'
            att['start_time'] = format_time(att['start_time'])
            att['end_time'] = format_time(att['end_time'])


        cursor.close()
        conn.close()
        
        # Mettre en cache les données
        set_cached_attendance(user_id, attendance)

        return jsonify({'attendance': attendance}), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())  # <-- Ceci te montrera l'erreur exacte dans la console
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500


# ==================== MARK ATTENDANCE ====================
@app.route('/api/mark-attendance', methods=['POST'])
@token_required
def mark_attendance(user_id):
    try:
        data = request.json
        course = data.get('course')
        qr_data = data.get('qr_data')

        if not course or not qr_data:
            return jsonify({'error': 'Données manquantes'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        from datetime import datetime, timedelta
        now = datetime.now()
        today = now.strftime('%Y-%m-%d')
        start_time = now.strftime('%H:%M:%S')
        end_time = (now + timedelta(hours=2)).strftime('%H:%M:%S')

        # Toujours insérer une nouvelle présence (permet plusieurs séances par jour)
        cursor.execute('''
            INSERT INTO attendance (user_id, date, start_time, end_time, course, status)
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (user_id, today, start_time, end_time, course, 'Présent'))

        conn.commit()
        cursor.close()
        conn.close()

        clear_user_cache(user_id)

        return jsonify({
            'message': 'Présence marquée avec succès!',
            'date': today,
            'start_time': start_time,
            'end_time': end_time,
            'course': course
        }), 201

    except Exception as e:
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500

# ==================== HEALTH ====================
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    # Vérifier si HTTPS est demandé via variable d'environnement
    app.run(debug=True, host='0.0.0.0', port=5000, ssl_context='adhoc')

