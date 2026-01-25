// Mobile Navigation - Menu Burger
// Gestion de la sidebar responsive

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && overlay) {
        const isActive = sidebar.classList.contains('active');
        
        if (isActive) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
}

function openSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        // Empêcher le scroll du body seulement sur mobile
        if (window.innerWidth <= 992) {
            document.body.style.overflow = 'hidden';
        }
    }
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        // Restaurer le scroll
        document.body.style.overflow = '';
    }
}

// Fermer la sidebar lors d'un clic sur un nav-item (mobile)
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Sur mobile, fermer la sidebar après un clic
            if (window.innerWidth <= 992) {
                closeSidebar();
            }
        });
    });
    
    // Fermer la sidebar si on redimensionne la fenêtre au-dessus de 992px
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            closeSidebar();
        }
    });
    
    // Gérer les touches du clavier
    document.addEventListener('keydown', function(e) {
        // ESC pour fermer la sidebar
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
});

// Support pour le swipe sur mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    const swipeThreshold = 50;
    const diff = touchEndX - touchStartX;
    
    // Swipe vers la droite (ouvrir)
    if (diff > swipeThreshold && touchStartX < 50 && !sidebar.classList.contains('active')) {
        openSidebar();
    }
    
    // Swipe vers la gauche (fermer)
    if (diff < -swipeThreshold && sidebar.classList.contains('active')) {
        closeSidebar();
    }
}

console.log('📱 Mobile Navigation chargé - Swipe supporté');
