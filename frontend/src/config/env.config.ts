const rawBaseUrl: string = import.meta.env.VITE_API_BASE_URL || '';

// Normalize URL: remove trailing slash and optional /api suffix
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '');

export const API_BASE_URL: string = cleanBaseUrl ? `${cleanBaseUrl}/api` : '/api';
export const SOCKET_URL: string = cleanBaseUrl || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000` : 'http://localhost:5000');
