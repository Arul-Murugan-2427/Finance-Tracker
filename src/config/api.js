const rawUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

// Normalize the API base URL:
// Accepts both VITE_API_URL and VITE_API_BASE_URL.
// Automatically ensures the /api suffix is present on remote URLs without doubling it.
export const API_BASE_URL = (() => {
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    const trimmed = rawUrl.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
})();

export default API_BASE_URL;
