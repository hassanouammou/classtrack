# 📱 Guide d'Accès Mobile - ClassTrack

## 🎯 Comment Accéder à ClassTrack depuis Votre Téléphone

### Étape 1️⃣ : Trouver l'IP de Votre PC

#### **Windows** (PowerShell) :
```powershell
ipconfig
```
Cherchez **"Adresse IPv4"** sous votre connexion WiFi/Ethernet.  
Exemple : `192.168.1.10`

#### **Mac/Linux** (Terminal) :
```bash
ifconfig
```
Cherchez l'adresse IP sous votre interface réseau.

### Étape 2️⃣ : Démarrer le Serveur Backend

```powershell
cd backend
python app.py
```

Vous verrez :
```
🚀 Backend ClassTrack démarré!
📍 Accès local:    http://localhost:5000
📱 Accès réseau:   http://0.0.0.0:5000
```

### Étape 3️⃣ : Servir le Frontend

#### **Option A - Live Server (VS Code)**
1. Installer l'extension "Live Server"
2. Clic droit sur `index.html` → "Open with Live Server"
3. Note l'URL (ex: `http://127.0.0.1:5500`)

#### **Option B - Python HTTP Server**
```powershell
cd frontend
python -m http.server 8000
```

### Étape 4️⃣ : Accéder depuis le Mobile

1. **Assurez-vous que votre téléphone et PC sont sur le même WiFi**

2. **Ouvrez le navigateur mobile et allez à** :
   ```
   http://VOTRE_IP:PORT
   ```
   
   Exemples :
   - Live Server : `http://192.168.1.10:5500`
   - Python Server : `http://192.168.1.10:8000`

3. **Remplacez** `VOTRE_IP` par l'IP trouvée à l'étape 1

## 🔧 Configuration Automatique de l'API

Le fichier `api.js` détecte automatiquement :
- **Sur PC** (localhost) : Utilise `http://localhost:5000`
- **Sur Mobile** : Utilise `http://VOTRE_IP:5000`

## ✅ Vérifications

### Backend Accessible ?
Testez depuis votre téléphone :
```
http://VOTRE_IP:5000/health
```
Devrait retourner : `{"status":"ok"}`

### Frontend Accessible ?
Ouvrez simplement l'URL du frontend dans le navigateur mobile.

## 🚨 Problèmes Courants

### "Erreur de connexion au serveur"
✅ **Solutions** :
1. Vérifiez que backend et frontend tournent
2. Vérifiez que vous êtes sur le même WiFi
3. Désactivez temporairement le pare-feu :
   ```powershell
   # Windows (en administrateur)
   netsh advfirewall set allprofiles state off
   ```
4. Vérifiez l'IP est correcte

### "Connexion refusée"
- Le backend n'est pas démarré → Lancez `python app.py`
- Port bloqué → Changez le port dans `app.py` (ex: 5001)

### "CORS Error"
- Déjà configuré dans `app.py` avec `CORS(app)`
- Si problème persiste, redémarrez le backend

## 🔒 Sécurité

⚠️ **Important** : 
- N'exposez PAS ce serveur sur Internet sans sécurité
- Utilisez uniquement sur réseau local de confiance
- Changez la `SECRET_KEY` dans `app.py` en production

## 📝 Exemple Complet

**IP de votre PC** : `192.168.1.50`

**URLs à utiliser** :
- Backend : `http://192.168.1.50:5000`
- Frontend : `http://192.168.1.50:5500` (Live Server)
- Frontend : `http://192.168.1.50:8000` (Python)

**Sur mobile, accédez à** :
```
http://192.168.1.50:5500/login.html
```

## 🎉 C'est tout !

Une fois connecté, toutes les fonctionnalités fonctionnent :
- ✅ Login
- ✅ Dashboard
- ✅ Statistiques
- ✅ Scanner QR (caméra arrière automatique)
- ✅ Menu burger responsive

---

**Besoin d'aide ?**  
Vérifiez la console du navigateur (F12) pour voir les erreurs détaillées.
