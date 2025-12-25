-- Créer la base de données
CREATE DATABASE IF NOT EXISTS classtrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE classtrack;

-- Table des utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    class VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des présences (avec l'heure)
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    course VARCHAR(100) NOT NULL,
    status ENUM('Présent', 'Absent') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_date (date),
    INDEX idx_user_status (user_id, status),
    INDEX idx_user_date (user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer les utilisateurs de test
-- Hashs générés avec: from werkzeug.security import generate_password_hash
INSERT INTO users (username, password, full_name, email, class) VALUES
('student1', 'pass123', 'Ali Ahmed', 'ali@example.com', '1A'),
('student2', 'pass123', 'Fatima Hassan', 'fatima@example.com', '1A');

-- Insérer les données de présence de test (avec l'heure)
INSERT INTO attendance (user_id, date, start_time, end_time, course, status) VALUES
(1, '2025-01-10', '08:30:00', '10:30:00', 'Python', 'Présent'),
(1, '2025-01-12', '08:30:00', '10:30:00', 'Python', 'Absent'),
(1, '2025-01-15', '08:30:00', '10:30:00', 'Web', 'Présent'),
(1, '2025-01-17', '10:30:00', '12:30:00', 'Web', 'Présent'),
(1, '2025-01-20', '08:30:00', '10:30:00', 'BD', 'Présent'),
(1, '2025-01-22', '10:30:00', '12:30:00', 'Python', 'Présent'),
(1, '2025-01-24', '10:30:00', '12:30:00', 'Web', 'Absent'),
(1, '2025-01-27', '14:30:00', '16:30:00', 'BD', 'Présent'),
(2, '2025-01-10', '14:30:00', '16:30:00', 'Python', 'Présent'),
(2, '2025-01-12', '16:30:00', '18:30:00', 'Python', 'Présent'),
(2, '2025-01-15', '08:30:00', '10:30:00', 'Web', 'Absent'),
(2, '2025-01-17', '10:30:00', '12:30:00', 'Web', 'Présent'),
(2, '2025-01-20', '08:30:00', '10:30:00', 'BD', 'Absent'),
(2, '2025-01-22', '10:30:00', '12:30:00', 'Python', 'Présent'),
(2, '2025-01-24', '16:30:00', '18:30:00', 'Web', 'Présent'),
(2, '2025-01-27', '16:30:00', '18:30:00', 'BD', 'Présent');