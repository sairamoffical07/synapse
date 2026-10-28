const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  return '/api';
};

const BASE_URL = getBaseUrl();

// Relative /api only works with the Vite dev proxy; a deployed build needs VITE_API_URL.
const API_URL_MISSING = import.meta.env.PROD && BASE_URL === '/api';
if (API_URL_MISSING) {
  console.error('Synapse: VITE_API_URL is not set for this build, so API requests cannot reach the backend.');
}

export const TOKEN_KEY = 'synapse_token';
export const USER_KEY = 'synapse_user';

const NOTICE_KEY = 'synapse_session_notice';

// Pass an optional reason to show once on the sign-in page.
export const clearSession = (notice) => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (notice) {
    try { sessionStorage.setItem(NOTICE_KEY, notice); } catch { /* storage unavailable */ }
  }
};

export const takeSessionNotice = () => {
  try {
    const notice = sessionStorage.getItem(NOTICE_KEY);
    sessionStorage.removeItem(NOTICE_KEY);
    return notice;
  } catch {
    return null;
  }
};

// Error carrying the HTTP status so callers can tell auth failures from other problems.
export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const fallbackMessage = (status) => {
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'That item could not be found. It may have been deleted.';
  if (status === 413) return 'That file is too large. PDFs must be 50 MB or smaller.';
  if (status === 429) return 'Too many requests right now. Please wait a moment and try again.';
  if (status >= 500) return 'The server ran into a problem. Please try again shortly.';
  return `Request failed (status ${status}).`;
};

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    ...options.headers,
  };

  const isAuthEndpoint = endpoint.startsWith('/auth/');
  const sentToken = Boolean(token && !isAuthEndpoint);
  if (sentToken) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  } catch {
    // fetch only rejects when no HTTP response was readable: offline, DNS/TLS failure,
    // the server being down, or the browser blocking the response for CORS.
    throw new ApiError(
      API_URL_MISSING
        ? 'This site is not connected to its server (VITE_API_URL is missing). Please contact the site owner.'
        : 'Could not reach the Synapse server. Check your connection and try again; if it keeps happening, the server may be down or not accepting requests from this address.',
      0,
    );
  }

  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : null;

  // A 401 on a request that carried our token means the session is no longer valid.
  // A 401 from login itself is just wrong credentials and must not look like an expired session.
  if (response.status === 401 && sentToken) {
    const message = data?.message || 'Your session has expired. Please sign in again.';
    clearSession(message);
    window.dispatchEvent(new Event('synapse_auth_expired'));
    throw new ApiError(message, 401);
  }

  if (!response.ok) {
    throw new ApiError(data?.message || fallbackMessage(response.status), response.status);
  }

  if (!isJson || data === null) {
    // e.g. the SPA's index.html came back because requests are hitting the frontend host
    throw new ApiError('The server sent an unexpected response. Please try again later.', response.status);
  }

  return data;
};
