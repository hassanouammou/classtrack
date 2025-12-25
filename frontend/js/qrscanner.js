// Scanner QR Code pour marquer la présence
let qrCodeStream = null;
let qrScanInterval = null;

async function openQRScanner() {
    const modal = document.createElement('div');
    modal.id = 'qrModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%;">
            <h2 style="margin-top: 0; color: #111827;">Scanner le QR Code</h2>
            <p style="color: #6b7280; margin-bottom: 20px;">Pointez la caméra vers le code QR du professeur</p>
            
            <div id="qr-video-container" style="margin-bottom: 20px; background: #000; border-radius: 8px; overflow: hidden; position: relative;">
                <video id="qr-video" style="width: 100%; height: 300px; display: block; object-fit: cover; transform: scaleX(-1);"></video>
                <canvas id="qr-canvas" style="display: none;"></canvas>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #111827;">
                    Ou entrez le code manuellement:
                </label>
                <input type="text" id="qr-input" placeholder="Ex: Python, Web, BD..." style="
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                ">
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="submitQRCode()" style="
                    flex: 1;
                    padding: 10px;
                    background: linear-gradient(135deg, #0066cc, #1a7fe5);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                ">Valider</button>
                <button onclick="closeQRScanner()" style="
                    flex: 1;
                    padding: 10px;
                    background: #f3f4f6;
                    color: #111827;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                ">Fermer</button>
            </div>
            
            <div id="qr-message" style="margin-top: 16px; padding: 12px; border-radius: 8px; display: none; font-size: 12px;"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialiser la caméra
    setTimeout(initQRCamera, 100);
}

async function initQRCamera() {
    try {
        const video = document.getElementById('qr-video');
        const canvas = document.getElementById('qr-canvas');
        
        if (!video || !canvas) {
            showQRMessage('Erreur: éléments vidéo manquants', 'error');
            return;
        }
        
        // Détecter si c'est un appareil mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                         || (window.innerWidth <= 768);
        
        // Configuration caméra : arrière pour mobile, frontale pour PC
        const constraints = {
            video: {
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 }
            }
        };
        
        // Sur mobile : forcer la caméra arrière
        // Sur PC : utiliser la caméra par défaut (webcam)
        if (isMobile) {
            constraints.video.facingMode = { ideal: 'environment' }; // Caméra arrière sur mobile
        } else {
            constraints.video.facingMode = { ideal: 'user' }; // Caméra frontale sur PC
        }
        
        // Vérifier le contexte sécurisé requis par les navigateurs mobiles
        const isLocalHost = ['localhost','127.0.0.1'].includes(window.location.hostname);
        const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || isLocalHost;
        if (!isSecureContext) {
            // Sur HTTP (IP locale), la plupart des navigateurs bloquent la caméra
            showQRMessage('La caméra est bloquée car la page n\'est pas en HTTPS. Ouvrez le site en https ou utilisez le code manuel.', 'error');
            return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        qrCodeStream = stream;
        video.srcObject = stream;
        
        // Attendre que la vidéo soit prête
        video.onloadedmetadata = () => {
            video.play().then(() => {
                startQRScanning(video, canvas);
            }).catch(err => {
                showQRMessage('Erreur de démarrage vidéo: ' + err.message, 'error');
            });
        };
        
    } catch (err) {
        let errorMsg = 'Erreur d\'accès à la caméra';
        if (err.name === 'NotAllowedError') {
            errorMsg = 'Accès à la caméra refusé. Vérifiez les permissions.';
        } else if (err.name === 'NotFoundError') {
            errorMsg = 'Aucune caméra trouvée sur cet appareil';
        } else if (err.name === 'OverconstrainedError') {
            errorMsg = 'Caméra non disponible. Utilisation de la caméra par défaut.';
        }
        showQRMessage(errorMsg, 'error');
    }
}

function startQRScanning(video, canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Utiliser jsQR pour scanner (plus léger que ZXing)
    loadJsQR(() => {
        qrScanInterval = setInterval(() => {
            try {
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    
                    if (code) {
                        document.getElementById('qr-input').value = code.data;
                        showQRMessage('✓ QR Code détecté!', 'success');
                        clearInterval(qrScanInterval);
                    }
                }
            } catch (e) {
                // Continue scanning
            }
        }, 500);
    });
}

function loadJsQR(callback) {
    if (window.jsQR) {
        callback();
        return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    script.onload = callback;
    script.onerror = () => {
        showQRMessage('Erreur: impossible de charger la librairie QR', 'error');
    };
    document.head.appendChild(script);
}

async function submitQRCode() {
    const qrCode = document.getElementById('qr-input').value.trim();
    
    if (!qrCode) {
        showQRMessage('Veuillez entrer un code ou scanner un QR', 'error');
        return;
    }
    
    // Le code peut être juste le nom du cours
    const course = qrCode.includes(':') ? qrCode.split(':')[1] : qrCode;
    
    // URL base de l'API: même logique que api.js
    const baseUrl = (window.location.port === '8000')
        ? `${window.location.protocol}//${window.location.hostname}:5000`
        : window.location.origin;
    
    try {
        const res = await fetch(`${baseUrl}/api/mark-attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API.getToken()}`
            },
            body: JSON.stringify({
                course: course,
                qr_data: qrCode
            })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            showQRMessage(`✓ Présence marquée pour ${course}!`, 'success');
            setTimeout(closeQRScanner, 2000);
            // Recharger les présences
            if (window.loadAttendance) {
                loadAttendance();
            }
        } else {
            showQRMessage(data.error || 'Erreur lors du marquage', 'error');
        }
    } catch (err) {
        showQRMessage('Erreur de connexion: ' + err.message, 'error');
    }
}

function showQRMessage(message, type) {
    const msgDiv = document.getElementById('qr-message');
    if (!msgDiv) return;
    
    msgDiv.textContent = message;
    msgDiv.style.display = 'block';
    msgDiv.style.background = type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    msgDiv.style.color = type === 'success' ? '#10b981' : '#ef4444';
    msgDiv.style.borderLeft = `4px solid ${type === 'success' ? '#10b981' : '#ef4444'}`;
}

function closeQRScanner() {
    // Arrêter le scan
    if (qrScanInterval) {
        clearInterval(qrScanInterval);
    }
    
    // Arrêter la caméra
    if (qrCodeStream) {
        qrCodeStream.getTracks().forEach(track => track.stop());
        qrCodeStream = null;
    }
    
    // Supprimer le modal
    const modal = document.getElementById('qrModal');
    if (modal) {
        modal.remove();
    }
}