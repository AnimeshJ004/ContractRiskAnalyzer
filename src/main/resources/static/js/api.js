const API_BASE_URL = 'http://localhost:8080';

function getAuthHeaders() {
    const token = localStorage.getItem('jwtToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: getAuthHeaders(),
        ...options
    };

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

async function login(credentials) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    if (!response.ok) {
        throw new Error('Login failed');
    }
    return await response.json();
}

async function register(userData) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    if (!response.ok) {
        throw new Error('Registration failed');
    }
    return await response.json();
}

async function getContracts() {
    return await apiRequest('/api/contracts');
}

async function getContractById(id) {
    return await apiRequest(`/api/contracts/${id}`);
}

async function uploadContract(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/contracts/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Upload failed');
    }
    return await response.json();
}

async function chatWithAI(question) {
    return await apiRequest('/api/contracts/chat', {
        method: 'POST',
        body: JSON.stringify({ question })
    });
}
