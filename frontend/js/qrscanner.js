// ==============================================
// QR Code Scanner pour marquer la présence
// ==============================================
let qrCodeStream = null;
let qrScanInterval = null;

// Ouvre le scanner QR dans un modal
async function openQRScanner() {
    if (document.getElementById('qrModal')) return; // éviter doublons

    const modal = document.createElement('div');
    modal.id = 'qrModal';
    modal.style.cssText = `
        position: fixed; top:0; left:0; width:100%; height:100%;
        background: rgba(0,0,0,0.9); display:flex;
        justify-content:center; align-items:center; z-index:1000;
    `;
    modal.innerHTML = `
        <div style="background:white; border-radius:12px; padding:24px; max-width:500px; width:90%;">
            <h2 style="margin-top:0; color:#111827;">Scanner le QR Code</h2>
            <p style="color:#6b7280; margin-bottom:20px;">Pointez la caméra vers le code QR du professeur</p>
            <div id="qr-video-container" style="margin-bottom:20px; background:#000; border-radius:8px; overflow:hidden; position:relative;">
                <video id="qr-video" style="width:100%; height:300px; display:block; object-fit:cover;"></video>
                <canvas id="qr-canvas" style="display:none;"></canvas>
            </div>
            <div style="margin-bottom:20px;">
                <label style="display:block; margin-bottom:8px; font-weight:600; color:#111827;">Ou entrez le code manuellement:</label>
                <input type="text" id="qr-input" placeholder="Ex: Python, Web, BD..." style="width:100%; padding:10px; border:1px solid #e5e7eb; border-radius:8px; font-size:14px;">
            </div>
            <div style="display:flex; gap:10px;">
                <button onclick="submitQRCode()" style="flex:1; padding:10px; background:linear-gradient(135deg,#0066cc,#1a7fe5); color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Valider</button>
                <button onclick="closeQRScanner()" style="flex:1; padding:10px; background:#f3f4f6; color:#111827; border:1px solid #e5e7eb; border-radius:8px; font-weight:600; cursor:pointer;">Fermer</button>
            </div>
            <div id="qr-message" style="margin-top:16px; padding:12px; border-radius:8px; display:none; font-size:12px;"></div>
        </div>
    `;
    document.body.appendChild(modal);

    setTimeout(initQRCamera, 100); // attendre que le DOM soit prêt
}

// Initialise la caméra
async function initQRCamera() {
    const video = document.getElementById('qr-video');
    const canvas = document.getElementById('qr-canvas');
    if (!video || !canvas) return showQRMessage('Éléments vidéo manquants', 'error');

    if (!navigator.mediaDevices?.getUserMedia) {
        return showQRMessage("Caméra non disponible. Utilisez HTTPS sur mobile ou localhost sur PC. Vous pouvez entrer le code manuellement.", 'error');
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                     || window.innerWidth <= 768;

    try {
        let stream;
        if (isMobile) {
            video.style.transform = 'none'; // caméra arrière normale
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { exact: 'environment' }, width:{ideal:1280}, height:{ideal:720} }
                });
            } catch {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const backCam = devices.filter(d=>d.kind==='videoinput').find(d=>/back|rear|environment/i.test(d.label)) || devices[0];
                stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId:{ exact: backCam.deviceId } } });
            }
        } else {
            video.style.transform = 'none'; // webcam PC normale, pas de miroir
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'user', width:{ideal:1280}, height:{ideal:720} } });
        }

        if (qrCodeStream) qrCodeStream.getTracks().forEach(t=>t.stop());
        qrCodeStream = stream;
        video.srcObject = stream;

        video.onloadedmetadata = () => video.play().then(()=>startQRScanning(video, canvas))
                                           .catch(err=>showQRMessage('Erreur vidéo: '+err.message, 'error'));
    } catch(err) {
        const msgMap = {
            NotAllowedError: "Accès à la caméra refusé.",
            NotFoundError: "Aucune caméra trouvée.",
            NotReadableError: "Caméra utilisée par une autre application.",
            OverconstrainedError: "Caméra demandée non disponible.",
            SecurityError: "HTTPS requis sur mobile."
        };
        showQRMessage(msgMap[err.name] || 'Erreur caméra: '+err.message, 'error');
        console.error('Erreur caméra détaillée:', err);
    }
}

// Démarre le scan QR
function startQRScanning(video, canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    loadJsQR(() => {
        qrScanInterval = setInterval(() => {
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
        }, 500);
    });
}

// Charge la librairie jsQR
function loadJsQR(callback) {
    if (window.jsQR) return callback();
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    script.onload = callback;
    script.onerror = ()=>showQRMessage("Impossible de charger la librairie QR", 'error');
    document.head.appendChild(script);
}

// Soumet le QR code
async function submitQRCode() {
    const qrCode = document.getElementById('qr-input').value.trim();
    if (!qrCode) return showQRMessage('Veuillez entrer un code ou scanner un QR', 'error');

    const course = qrCode.includes(':') ? qrCode.split(':')[1]?.trim() : qrCode;
    if (!course) return showQRMessage('Code invalide', 'error');

    const baseUrl = (window.location.port==='8000') ? `${window.location.protocol}//${window.location.hostname}:5000` : window.location.origin;

    try {
        const res = await fetch(`${baseUrl}/api/mark-attendance`, {
            method:'POST',
            headers: {'Content-Type':'application/json','Authorization':`Bearer ${API.getToken()}`},
            body: JSON.stringify({ course, qr_data: qrCode })
        });
        const data = await res.json();
        if (res.ok) {
            showQRMessage(`✓ Présence marquée pour ${course}!`, 'success');
            setTimeout(closeQRScanner, 2000);
            if (window.loadAttendance) loadAttendance();
        } else {
            showQRMessage(data.error || 'Erreur lors du marquage', 'error');
        }
    } catch(err) {
        showQRMessage('Erreur de connexion: '+err.message, 'error');
    }
}

// Affiche les messages
function showQRMessage(msg, type) {
    const el = document.getElementById('qr-message');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.style.background = type==='success'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)';
    el.style.color = type==='success'?'#10b981':'#ef4444';
    el.style.borderLeft = `4px solid ${type==='success'?'#10b981':'#ef4444'}`;
}

// Ferme le scanner
function closeQRScanner() {
    if (qrScanInterval) clearInterval(qrScanInterval);
    if (qrCodeStream) qrCodeStream.getTracks().forEach(t=>t.stop());
    qrCodeStream = null;
    const modal = document.getElementById('qrModal');
    if (modal) modal.remove();
}
