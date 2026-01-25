from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from models import STUDENTS
import jwt
import datetime
from config import Config

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = data.get('username')
    password = data.get('password')
    
    if user not in STUDENTS:
        return jsonify({'error': 'Utilisateur non trouvé'}), 401
    
    if not check_password_hash(STUDENTS[user]['password'], password):
        return jsonify({'error': 'Mot de passe incorrect'}), 401
    
    token = jwt.encode({
        'user': user,
        'name': STUDENTS[user]['name'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, Config.SECRET_KEY, algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': user,
        'name': STUDENTS[user]['name']
    }), 200