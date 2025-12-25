// Vérifier l'authentification
function checkAuth() {
    if (!API.getToken()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==================== CACHE MANAGEMENT ====================
async function refreshAllData() {
    try {
        // Recharger les données fraîches
        await loadStats();
    } catch (err) {
        console.error('Erreur refresh:', err);
        await loadStats();
    }
}

// Navigation
function goToDashboard() {
    // Rester sur le dashboard - pas de changement de vue nécessaire
    window.location.href = '/dashboard.html';
}

function goToAttendance() {
    // Rediriger vers la page dédiée
    window.location.href = '/myattendances.html';
}

function logout() {
    API.logout();
}

// Load Stats
async function loadStats() {
    const data = await API.getStats();
    if (data.error) {
        console.error(data.error);
        return;
    }
    
    localStorage.setItem('chartData', JSON.stringify(data));
    const statsDiv = document.getElementById('stats');
    
    statsDiv.innerHTML = `
        <div class="stat-card">
            <div class="stat-top">
                <div>
                    <div class="stat-label">Total Séances</div>
                    <div class="stat-value primary">${data.total}</div>
                </div>
                <div class="stat-icon primary">
                    <i class="fas fa-book"></i>
                </div>
            </div>
            <div class="stat-trend">
                <i class="fas fa-arrow-up"></i> Semestriel
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-top">
                <div>
                    <div class="stat-label">Présent</div>
                    <div class="stat-value success">${data.present}</div>
                </div>
                <div class="stat-icon success">
                    <i class="fas fa-check-circle"></i>
                </div>
            </div>
            <div class="stat-trend">
                <i class="fas fa-arrow-up"></i> ${Math.round(data.present/data.total*100)}%
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-top">
                <div>
                    <div class="stat-label">Absent</div>
                    <div class="stat-value danger">${data.absent}</div>
                </div>
                <div class="stat-icon danger">
                    <i class="fas fa-times-circle"></i>
                </div>
            </div>
            <div class="stat-trend">
                <i class="fas fa-arrow-down"></i> ${Math.round(data.absent/data.total*100)}%
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-top">
                <div>
                    <div class="stat-label">Taux de Présence</div>
                    <div class="stat-value primary">${data.rate}%</div>
                </div>
                <div class="stat-icon warning">
                    <i class="fas fa-percentage"></i>
                </div>
            </div>
            <div class="stat-trend">
                <i class="fas fa-arrow-up"></i> Excellent
            </div>
        </div>
    `;
    
    const summary = document.getElementById('summary');
    summary.innerHTML = `
        <div class="summary-box">
            <div class="summary-label">Présences</div>
            <div class="summary-value success">${data.present}/${data.total}</div>
        </div>
        <div class="summary-box">
            <div class="summary-label">Performance</div>
            <div class="summary-value">${data.rate}%</div>
        </div>
        <div class="summary-box">
            <div class="summary-label">Statut</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--success); margin-top: 4px;">
                <i class="fas fa-badge-check"></i> Bon
            </div>
        </div>
    `;
    
    if (document.getElementById('chart')) {
        drawChart(data);
    }
}

// Draw Chart
let chartInstance = null;

function drawChart(data) {
    const chartEl = document.getElementById('chart');
    if (!chartEl) return;
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    if (typeof Chart === 'undefined') {
        setTimeout(() => drawChart(data), 100);
        return;
    }
    
    const ctx = chartEl.getContext('2d');
    
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Présent', 'Absent'],
            datasets: [{
                data: [data.present, data.absent],
                backgroundColor: ['#10b981', '#ef4444'],
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--card'),
                borderWidth: 8,
                borderRadius: 8,
                spacing: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        padding: 20,
                        boxWidth: 15,
                        boxHeight: 15,
                        font: { size: 14, weight: '600' },
                        color: document.body.classList.contains('dark') ? '#ffffff' : getComputedStyle(document.documentElement).getPropertyValue('--text'),
                        usePointStyle: true,
                        pointStyle: 'circle',
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const meta = chart.getDatasetMeta(0);
                                    const style = meta.controller.getStyle(i);
                                    return {
                                        text: label,
                                        fillStyle: style.backgroundColor,
                                        strokeStyle: style.borderColor,
                                        lineWidth: style.borderWidth,
                                        hidden: !chart.getDataVisibility(i),
                                        index: i,
                                        // Augmenter l'espacement entre les items
                                        padding: 15
                                    };
                                });
                            }
                            return [];
                        }
                    },
                    // Augmenter l'espacement entre les légendes
                    itemMargin: {
                        horizontal: 20,
                        vertical: 10
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 16
                    },
                    formatter: (value, context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return percentage + '%';
                    }
                }
            }
        }
    });
    
    window.currentChart = chartInstance;
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