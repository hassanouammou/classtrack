from flask import Blueprint, request, jsonify
from models import ATTENDANCE
from utils.helpers import token_required

api_bp = Blueprint('api', __name__)

@api_bp.route('/stats', methods=['GET'])
@token_required
def get_stats(user):
    attendance = ATTENDANCE.get(user, [])
    total = len(attendance)
    present = len([a for a in attendance if a['status'] == 'Présent'])
    absent = total - present
    rate = round((present / total * 100), 1) if total > 0 else 0
    
    return jsonify({
        'total': total,
        'present': present,
        'absent': absent,
        'rate': rate
    }), 200

@api_bp.route('/attendance', methods=['GET'])
@token_required
def get_attendance(user):
    attendance = ATTENDANCE.get(user, [])
    return jsonify({'attendance': attendance}), 200