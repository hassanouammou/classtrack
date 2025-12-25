// Initialiser le thème au chargement de la page
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
}

// Basculer le thème
function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Redessiner le chart si présent
    if (window.currentChart) {
        window.currentChart.destroy();
        const data = JSON.parse(localStorage.getItem('chartData') || '{}');
        if (data.total) drawChart(data);
    }
}

// Initialiser au chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}

// Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
}