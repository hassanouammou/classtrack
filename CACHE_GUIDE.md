# 🔄 Guide de Gestion du Cache - ClassTrack

## Problème de Cache Résolu ! ✅

Le système de cache a été complètement reconfiguré pour éviter les problèmes de mise en cache.

## Solutions Mises en Place

### 1. **Versioning des Fichiers** (v=1.0.1)
Tous les fichiers CSS et JS ont maintenant un paramètre de version :
```html
<link rel="stylesheet" href="css/style.css?v=1.0.1">
<script src="js/dashboard.js?v=1.0.1"></script>
```

**Comment mettre à jour :**
- Changez simplement le numéro de version dans les fichiers HTML
- Le navigateur téléchargera automatiquement la nouvelle version

### 2. **Service Worker Mis à Jour**
Le cache du Service Worker a été incrémenté à `v1.0.1`

### 3. **Headers HTTP**
Le serveur Flask envoie maintenant des en-têtes pour contrôler le cache :
- API : `no-store, no-cache` (jamais mis en cache)
- CSS/JS/HTML : `no-cache, must-revalidate` (vérifie toujours avec le serveur)

### 4. **Utilitaire Cache Buster** 🆕
Un nouvel outil JavaScript pour gérer le cache manuellement.

## Comment Utiliser

### Méthode 1 : Vider le Cache Manuellement
Ouvrez la console du navigateur (F12) et tapez :
```javascript
clearAllCache()
```
Cela va :
- ✅ Vider le cache du navigateur
- ✅ Vider le Service Worker
- ✅ Recharger la page avec les nouveaux fichiers

### Méthode 2 : Recharger Depuis le Serveur
Dans la console :
```javascript
hardReload()
```

### Méthode 3 : Vérifier la Version
```javascript
checkAppVersion()
```

### Méthode 4 : Vider le Cache Navigateur (Manuel)

#### Chrome/Edge :
1. `Ctrl + Shift + Delete`
2. Sélectionner "Images et fichiers en cache"
3. Cliquer "Effacer les données"

#### Firefox :
1. `Ctrl + Shift + Delete`
2. Cocher "Cache"
3. Cliquer "Effacer maintenant"

#### Ou pour une page spécifique :
- `Ctrl + Shift + R` (Windows/Linux)
- `Cmd + Shift + R` (Mac)

## Quand Mettre à Jour la Version ?

Changez le numéro de version (`v=1.0.X`) dans les fichiers HTML quand vous :
- ✏️ Modifiez un fichier CSS
- ✏️ Modifiez un fichier JavaScript
- ✏️ Voulez forcer tous les utilisateurs à télécharger la nouvelle version

## Fichiers à Mettre à Jour

Quand vous changez la version, mettez à jour ces fichiers :
- `frontend/dashboard.html`
- `frontend/myattendances.html`
- `frontend/login.html`
- `frontend/sw.js` (CACHE_NAME)
- `frontend/js/cache-buster.js` (APP_VERSION)

## Commandes Rapides

### Développement
```bash
# Désactiver le cache pendant le développement (DevTools)
# Chrome: F12 > Network > Disable cache ✓
```

### Production
```javascript
// Dans la console pour dépanner un utilisateur
clearAllCache()
```

## Problèmes Courants

### "Les changements ne s'affichent pas"
1. Ouvrir la console (F12)
2. Taper : `clearAllCache()`
3. Attendre le rechargement automatique

### "Service Worker bloque les mises à jour"
1. Chrome DevTools > Application > Service Workers
2. Cliquer "Unregister"
3. Recharger la page

### "Je veux désactiver complètement le cache"
Ajouter dans les pages HTML :
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

## Notes

- 📌 Le cache buster vérifie automatiquement les versions au chargement
- 📌 Les données d'authentification sont préservées lors du nettoyage
- 📌 Le serveur Flask contrôle maintenant le cache via les headers HTTP

---

**Version actuelle : 1.0.1**
*Dernière mise à jour : 25 décembre 2025*
