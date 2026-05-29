import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true, // Crucial for session cookies to work across origins
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;