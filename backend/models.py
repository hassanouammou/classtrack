from werkzeug.security import generate_password_hash, check_password_hash

STUDENTS = {
    'student1': {'password': generate_password_hash('pass123'), 'name': 'Ali Ahmed'},
    'student2': {'password': generate_password_hash('pass123'), 'name': 'Fatima Hassan'},
}

ATTENDANCE = {
    'student1': [
        {'date': '2025-01-10', 'course': 'Python', 'status': 'Présent'},
        {'date': '2025-01-12', 'course': 'Python', 'status': 'Absent'},
        {'date': '2025-01-15', 'course': 'Web', 'status': 'Présent'},
        {'date': '2025-01-17', 'course': 'Web', 'status': 'Présent'},
        {'date': '2025-01-20', 'course': 'BD', 'status': 'Présent'},
    ],
    'student2': [
        {'date': '2025-01-10', 'course': 'Python', 'status': 'Présent'},
        {'date': '2025-01-12', 'course': 'Python', 'status': 'Présent'},
        {'date': '2025-01-15', 'course': 'Web', 'status': 'Absent'},
        {'date': '2025-01-17', 'course': 'Web', 'status': 'Présent'},
        {'date': '2025-01-20', 'course': 'BD', 'status': 'Absent'},
    ]
}