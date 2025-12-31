// Vérifier l'authentification
function checkAuth() {
    if (!API.getToken()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Navigation
function goToDashboard() {
    window.location.href = '/dashboard.html';
}

function goToAttendance() {
    window.location.href = '/myattendances.html';
}

function logout() {
    API.logout();
}

// ==================== CACHE MANAGEMENT ====================
async function refreshAllData() {
    try {
        // Recharger les données fraîches
        await loadAttendance();
    } catch (err) {
        console.error('Erreur refresh:', err);
        await loadAttendance();
    }
}

// Load Attendance
async function loadAttendance() {
    const data = await API.getAttendance();
    if (data.error) {
        console.error(data.error);
        return;
    }
    
    const table = document.getElementById('attendanceTable');
    
    let html = '<tr><th>Date</th><th>Heure de début</th><th>Heure de fin</th><th>Cours</th><th>Statut</th></tr>';
    data.attendance.forEach(att => {
        const statusClass = att.status === 'Présent' ? 'status-present' : 'status-absent';
        const icon = att.status === 'Présent' ? 'fas fa-check-circle' : 'fas fa-times-circle';
        let startTime = '--:--';
        let endTime = '--:--';
        if (att.start_time) {
            const parts = att.start_time.split(':');
            startTime = parts[0].padStart(2, '0') + ':' + parts[1].padStart(2, '0');
        }
        if (att.end_time) {
            const parts = att.end_time.split(':');
            endTime = parts[0].padStart(2, '0') + ':' + parts[1].padStart(2, '0');
        }
        html += `<tr>
            <td>${att.date}</td>
            <td>${startTime}</td>
            <td>${endTime}</td>
            <td><strong>${att.course}</strong></td>
            <td><span class="status-badge ${statusClass}"><i class="fas ${icon}"></i> ${att.status}</span></td>
        </tr>`;
    });
    
    table.innerHTML = html;
}

// Initialize
function init() {
    if (!checkAuth()) return;
    
    const name = localStorage.getItem('name');
    const initial = name.charAt(0).toUpperCase();
    
    document.getElementById('userAvatar').textContent = initial;
    document.getElementById('userName').textContent = name;
    
    refreshAllData();
}

document.addEventListener('DOMContentLoaded', init);
