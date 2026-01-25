// Cache Buster Utility
// Utilisez ce fichier pour gérer le cache du navigateur

// Version actuelle de l'application
const APP_VERSION = '1.0.3';

// Vider complètement le cache du navigateur
function clearAllCache() {
    // Vider le localStorage
    const authData = {
        token: localStorage.getItem('token'),
        name: localStorage.getItem('name'),
        theme: localStorage.getItem('theme')
    };
    
    localStorage.clear();
    
    // Restaurer les données d'authentification
    if (authData.token) localStorage.setItem('token', authData.token);
    if (authData.name) localStorage.setItem('name', authData.name);
    if (authData.theme) localStorage.setItem('theme', authData.theme);
    
    // Vider le sessionStorage
    sessionStorage.clear();
    
    // Désenregistrer et vider le service worker cache
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
                registration.unregister();
            });
        });
        
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }).then(() => {
            console.log('✅ Cache vidé avec succès');
        });
    }
    
    console.log('🔄 Cache cleared! Rechargement de la page...');
    
    // Recharger la page avec un timestamp pour éviter le cache
    setTimeout(() => {
        window.location.href = window.location.pathname + '?v=' + Date.now();
    }, 500);
}

// Vérifier si la version de l'app a changé
function checkAppVersion() {
    const storedVersion = localStorage.getItem('app_version');
    
    if (storedVersion !== APP_VERSION) {
        console.log(`🔄 Nouvelle version détectée: ${APP_VERSION} (ancienne: ${storedVersion})`);
        localStorage.setItem('app_version', APP_VERSION);
        
        // Vider le cache automatiquement
        clearAllCache();
        return true;
    }
    
    return false;
}

// Forcer le rechargement sans cache
function hardReload() {
    window.location.reload(true); // true = recharger depuis le serveur
}

// Exposer les fonctions globalement
window.clearAllCache = clearAllCache;
window.hardReload = hardReload;
window.checkAppVersion = checkAppVersion;

// Vérifier automatiquement la version au chargement
// Décommenter si vous voulez une vérification automatique
// checkAppVersion();

console.log('💾 Cache Buster chargé - Version:', APP_VERSION);
console.log('📝 Commandes disponibles:');
console.log('  - clearAllCache() : Vider tout le cache');
console.log('  - hardReload() : Recharger la page depuis le serveur');
console.log('  - checkAppVersion() : Vérifier la version');
