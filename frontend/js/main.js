const app = document.getElementById('app');

function showLogin() {
    app.innerHTML = `
        <div class="login-page">
            <div class="login-box">
                <h1>🎓 ClassTrack</h1>
                <form id="loginForm">
                    <div class="form-group">
                        <label>Nom d'utilisateur</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label>Mot de passe</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit">Connexion</button>
                    <div id="error" class="error"></div>
                </form>
                <p style="margin-top: 20px; font-size: 12px; text-align: center;">
                    Test: student1 / pass123
                </p>
            </div>
        </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const res = await API.login(username, password);
        if (res.token) {
            API.setToken(res.token);
            localStorage.setItem('user', res.user);
            localStorage.setItem('name', res.name);
            showDashboard();
        } else {
            document.getElementById('error').textContent = res.error;
        }
    });
}

function showDashboard() {
    const name = localStorage.getItem('name');
    app.innerHTML = `
        <nav class="navbar">
            <div class="container">
                <div class="navbar-content">
                    <h2>🎓 ClassTrack</h2>
                    <div>
                        <span>Bienvenue, <strong>${name}</strong></span>
                        <a onclick="goToAttendance()">Mes Présences</a>
                        <a class="logout" onclick="logout()">Déconnexion</a>
                    </div>
                </div>
            </div>
        </nav>
        <div class="container dashboard">
            <h3>Statistiques de Présence</h3>
            <div class="stats" id="stats"></div>
            <div class="chart-container" id="chartContainer"></div>
        </div>
    `;

    loadStats();
}

function showAttendance() {
    const name = localStorage.getItem('name');
    app.innerHTML = `
        <nav class="navbar">
            <div class="container">
                <div class="navbar-content">
                    <h2>🎓 ClassTrack</h2>
                    <div>
                        <span>Bienvenue, <strong>${name}</strong></span>
                        <a onclick="goToDashboard()">Dashboard</a>
                        <a class="logout" onclick="logout()">Déconnexion</a>
                    </div>
                </div>
            </div>
        </nav>
        <div class="container">
            <h3>Détail des Présences</h3>
            <table id="attendanceTable"></table>
        </div>
    `;

    loadAttendance();
}

async function loadStats() {
    const data = await API.getStats();
    const statsDiv = document.getElementById('stats');
    
    statsDiv.innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Total Séances</div>
            <div class="stat-value">${data.total}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Présent</div>
            <div class="stat-value success">${data.present}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Absent</div>
            <div class="stat-value danger">${data.absent}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Taux de Présence</div>
            <div class="stat-value info">${data.rate}%</div>
        </div>
    `;

    drawChart(data);
}

async function loadAttendance() {
    const data = await API.getAttendance();
    const table = document.getElementById('attendanceTable');
    
    let html = '<tr><th>Date</th><th>Cours</th><th>Statut</th></tr>';
    data.attendance.forEach(att => {
        const statusClass = att.status === 'Présent' ? 'status-present' : 'status-absent';
        html += `<tr>
            <td>${att.date}</td>
            <td>${att.course}</td>
            <td><span class="${statusClass}">${att.status}</span></td>
        </tr>`;
    });
    
    table.innerHTML = html;
}

function goToDashboard() { showDashboard(); }
function goToAttendance() { showAttendance(); }

function logout() {
    API.logout();
    showLogin();
}

// Init
if (API.getToken()) {
    showDashboard();
} else {
    showLogin();
}