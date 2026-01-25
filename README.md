# 📚 ClassTrack - Système de Gestion de Présences

Application web moderne pour le suivi des présences étudiantes avec tableaux de bord interactifs, visualisations graphiques et support PWA.

![ClassTrack](https://img.shields.io/badge/Version-1.0.0-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![Flask](https://img.shields.io/badge/Flask-3.0.0-red)

## ✨ Fonctionnalités

- 🔐 **Authentification JWT** - Connexion sécurisée
- 📊 **Tableaux de bord interactifs** - Statistiques en temps réel
- 📈 **Visualisations graphiques** - Charts.js pour analyses visuelles
- 📱 **Progressive Web App (PWA)** - Fonctionne hors ligne
- 🎨 **Thème personnalisable** - Mode clair/sombre
- 📲 **Scanner QR** - Pour prise de présence rapide
- 💾 **Système de cache** - Performance optimisée
- 🌍 **Accès mobile** - Design responsive

## 🛠️ Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Python 3.8+** - [Télécharger Python](https://www.python.org/downloads/)
- **XAMPP** - [Télécharger XAMPP](https://www.apachefriends.org/fr/index.html) (inclut MySQL/MariaDB et phpMyAdmin)
- **Navigateur web moderne** (Chrome, Firefox, Edge)
- **Git** (optionnel) - [Télécharger Git](https://git-scm.com/)

## 📦 Installation

### 1. Cloner ou télécharger le projet

```bash
git clone <votre-repo>
cd ClassTrack
```

### 2. Créer l'environnement virtuel Python

#### Windows (PowerShell)
```powershell
# Créer l'environnement virtuel
python -m venv .venv

# Activer l'environnement virtuel
.venv\Scripts\Activate.ps1
```

#### Windows (CMD)
```cmd
# Créer l'environnement virtuel
python -m venv .venv

# Activer l'environnement virtuel
.venv\Scripts\activate.bat
```

#### Mac/Linux
```bash
# Créer l'environnement virtuel
python3 -m venv .venv

# Activer l'environnement virtuel
source .venv/bin/activate
```

> 💡 **Note** : Vous verrez `(.venv)` apparaître dans votre terminal une fois activé.

### 3. Installer les dépendances Python

```bash
cd backend
pip install -r requirements.txt
```

Les packages suivants seront installés :
- Flask 3.0.0
- Flask-CORS 4.0.0
- Flask-Compress 1.15
- Werkzeug 3.0.0
- PyJWT 2.10.1
- PyMySQL 1.1.0

### 4. Configurer la base de données avec XAMPP

#### a) Démarrer XAMPP

1. Lancez **XAMPP Control Panel**
2. Démarrez les modules **Apache** et **MySQL**

![XAMPP](https://img.shields.io/badge/XAMPP-Active-success)

#### b) Importer le schéma de la base de données
1. Ouvrez votre navigateur et allez sur : `http://localhost/phpmyadmin`
2. Cliquez sur **"Nouveau"** dans le menu de gauche
3. Créez une base de données nommée `classtrack`
4. Sélectionnez l'interclassement : `utf8mb4_unicode_ci`
5. Cliquez sur la base `classtrack` que vous venez de créer
6. Allez dans l'onglet **"Importer"**
7. Cliquez sur **"Choisir un fichier"** et sélectionnez `backend/database.sql`
8. Cliquez sur **"Exécuter"**

✅ La base de données est maintenant configurée avec les tables et les données de test !

#### c) Configuration de la connexion (Optionnel)

Par défaut, XAMPP utilise `root` sans mot de passe. Si vous avez modifié cela, changez les paramètres dans `backend/app.py` :

```python
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root', # Votre utilisateur MySQL
    'password': '', # Votre mot de passe MySQL
    'database': 'classtrack',
    'charset': 'utf8mb4',
}
```

### 5. Configurer la clé secrète (IMPORTANT)

⚠️ **Avant de passer en production**, changez la clé secrète dans `backend/app.py` :

```python
app.config['SECRET_KEY'] = 'votre-cle-secrete-tres-longue-et-complexe'
```

## 🚀 Lancement du Projet

### Option 1 : Accès Local (Recommandé pour débuter)

#### Étape 1 : Démarrer le Backend

```powershell
# Activer l'environnement virtuel si ce n'est pas déjà fait
.venv\Scripts\Activate.ps1

# Aller dans le dossier backend
cd backend

# Lancer le serveur Flask
python app.py
```

Vous verrez :
```
🚀 Backend ClassTrack démarré!
📍 Accès local:    http://localhost:5000
📱 Accès réseau:   http://0.0.0.0:5000
```

#### Étape 2 : Servir le Frontend

**Option A - Avec Live Server (VS Code)** ⭐ Recommandé
1. Installer l'extension "Live Server" dans VS Code
2. Ouvrir `frontend/index.html`
3. Clic droit → "Open with Live Server"
4. Le navigateur s'ouvrira automatiquement

**Option B - Avec Python HTTP Server**
```powershell
# Dans un nouveau terminal
cd frontend
python -m http.server 8000
```
Puis ouvrez http://localhost:8000

### Option 2 : Accès depuis Mobile/Réseau Local

Consultez le guide détaillé : [ACCES_MOBILE.md](ACCES_MOBILE.md)

**Résumé rapide :**

1. Trouvez l'IP de votre PC :
   ```powershell
   ipconfig  # Cherchez "Adresse IPv4"
   ```

2. Démarrez le backend (déjà fait ci-dessus)

3. Accédez depuis votre mobile (même WiFi) :
   - Frontend : `http://VOTRE_IP:8000`
   - Modifiez `frontend/js/api.js` pour pointer vers `http://VOTRE_IP:5000`

## 🔐 Comptes de Test

Par défaut, deux comptes de test sont créés :

| Username  | Password | Nom           | Classe |
|-----------|----------|---------------|--------|
| student1  | pass123  | Ali Ahmed     | 1A     |
| student2  | pass123  | Fatima Hassan | 1A     |

## 📁 Structure du Projet

```
ClassTrack/
├── backend/                    # API Flask
│   ├── app.py                 # Point d'entrée principal
│   ├── config.py              # Configuration
│   ├── models.py              # Modèles de données
│   ├── database.sql           # Schéma de la base de données
│   ├── requirements.txt       # Dépendances Python
│   ├── routes/                # Routes API
│   │   ├── api.py            # Routes principales
│   │   └── auth.py           # Routes d'authentification
│   └── utils/                 # Utilitaires
│       └── helpers.py        # Fonctions helper
├── frontend/                  # Interface utilisateur
│   ├── index.html            # Page d'accueil
│   ├── login.html            # Page de connexion
│   ├── dashboard.html        # Tableau de bord
│   ├── myattendances.html    # Liste des présences
│   ├── sw.js                 # Service Worker (PWA)
│   ├── css/                  # Feuilles de style
│   │   ├── style.css
│   │   ├── dashboard.css
│   │   ├── login.css
│   │   └── variables.css
│   └── js/                   # Scripts JavaScript
│       ├── api.js            # Client API
│       ├── auth.js           # Gestion auth
│       ├── dashboard.js      # Logique dashboard
│       ├── charts.js         # Graphiques
│       ├── qrscanner.js      # Scanner QR
│       └── theme.js          # Gestion du thème
└── .venv/                    # Environnement virtuel Python
```

## 🔧 Technologies Utilisées

### Backend
- **Flask** - Framework web Python
- **PyMySQL** - Connecteur MySQL/MariaDB
- **PyJWT** - Gestion des tokens JWT
- **Flask-CORS** - Gestion CORS
- **Flask-Compress** - Compression Gzip

### Frontend
- **HTML5/CSS3** - Structure et style
- **JavaScript (Vanilla)** - Logique côté client
- **Chart.js** - Visualisations graphiques
- **Service Worker** - Support PWA
- **LocalStorage** - Stockage local

### Base de Données
- **MariaDB/MySQL** - Base de données relationnelle

## 📝 Utilisation

### 1. Connexion
- Accédez à la page de connexion
- Utilisez l'un des comptes de test
- Vous serez redirigé vers le dashboard

### 2. Dashboard
- Visualisez vos statistiques de présence
- Consultez les graphiques de tendances
- Accédez rapidement à vos présences

### 3. Mes Présences
- Liste complète de vos présences
- Filtrage par cours et statut
- Recherche par date

### 4. Scanner QR (Optionnel)
- Scannez un code QR pour marquer votre présence
- Fonctionne avec la caméra de l'appareil

## 📚 Documentation Complémentaire

- [ACCES_MOBILE.md](ACCES_MOBILE.md) - Guide d'accès mobile détaillé
- [CACHE_GUIDE.md](CACHE_GUIDE.md) - Système de cache
- [RESPONSIVE_GUIDE.md](RESPONSIVE_GUIDE.md) - Design responsive

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou proposer une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 👤 Auteur

Hassan Ouammou

## 📧 Support

Pour toute question ou problème, ouvrez une issue sur le dépôt GitHub.

---

**Bon développement ! 🚀**
