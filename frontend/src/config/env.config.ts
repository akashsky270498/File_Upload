const rawBaseUrl: string = import.meta.env.VITE_API_BASE_URL || '';

// Normalize URL: remove trailing slash and optional /api or /api/v1 suffix
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '').replace(/\/api(\/v1)?$/, '');

export const API_BASE_URL: string = cleanBaseUrl ? `${cleanBaseUrl}/api/v1` : '/api/v1';
export const GRAPHQL_URL: string = cleanBaseUrl ? `${cleanBaseUrl}/graphql` : '/graphql';
export const SOCKET_URL: string = cleanBaseUrl || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000` : 'http://localhost:5000');
