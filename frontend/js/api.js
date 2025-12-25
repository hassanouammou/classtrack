const API_URL = 'http://localhost:5000';

class API {
    static getToken() { 
        return localStorage.getItem('token'); 
    }
    
    static setToken(token) { 
        localStorage.setItem('token', token); 
    }
    
    static async login(username, password) {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return res.json();
        } catch (err) {
            return { error: 'Erreur de connexion au serveur' };
        }
    }

    static async getStats() {
        try {
            const res = await fetch(`${API_URL}/api/stats`, {
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });
            return res.json();
        } catch (err) {
            return { error: 'Erreur lors du chargement des stats' };
        }
    }

    static async getAttendance() {
        try {
            const res = await fetch(`${API_URL}/api/attendance`, {
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });
            return res.json();
        } catch (err) {
            return { error: 'Erreur lors du chargement des présences' };
        }
    }

    static logout() {
        localStorage.clear();
        window.location.href = '/login.html';
    }

    // Ajoute cette fonction à la classe API
    static async clearCache() {
        try {
            const res = await fetch('http://localhost:5000/api/cache/clear', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });
            return res.json();
        } catch (err) {
            console.error('Erreur cache:', err);
        }
    }
}