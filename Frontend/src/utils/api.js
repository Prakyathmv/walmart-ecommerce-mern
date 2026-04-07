// Central API base URL — reads from environment variable
// Set VITE_API_URL in .env for production (Render URL)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default API_BASE;
