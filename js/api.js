
const API_BASE = "https://logist-backend.onrender.com";

async function apiRequest(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (!response.ok) throw new Error('Server error: ' + response.status);
        return await response.json();
    } catch (e) {
        console.error("API Error:", e);
        return null;
    }
}
