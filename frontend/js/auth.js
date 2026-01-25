// Vérifier si l'utilisateur est déjà connecté
function checkAuth() {
    if (API.getToken()) {
        window.location.href = '/dashboard.html';
    }
}

// Initialiser la page login
function initLogin() {
    checkAuth();
    
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error');
        const btn = e.target.querySelector('button');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion en cours...';

        const res = await API.login(username, password);
        
        if (res.token) {
            API.setToken(res.token);
            localStorage.setItem('user', res.user);
            localStorage.setItem('name', res.name);
            window.location.href = '/dashboard.html';
        } else {
            errorDiv.textContent = res.error;
            errorDiv.classList.add('show');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
            setTimeout(() => errorDiv.classList.remove('show'), 4000);
        }
    });
}

// Lancer au chargement
document.addEventListener('DOMContentLoaded', initLogin);