/**
 * Admin Authentication Helpers
 * Shared utilities for authenticated API requests in admin pages
 */

// Helper function to get auth headers with session token
function getAuthHeaders(additionalHeaders = {}) {
  const sessionToken = localStorage.getItem('isrs_session_token');
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }
  return headers;
}

// Helper function for authenticated fetch requests
async function authFetch(url, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    headers: getAuthHeaders(options.headers || {})
  };
  return fetch(url, { ...defaultOptions, ...options, headers: defaultOptions.headers });
}

// Check if user is authenticated
function isAuthenticated() {
  return !!localStorage.getItem('isrs_session_token');
}

// Redirect to login if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/member/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    return false;
  }
  return true;
}

// Export for use in admin pages
if (typeof window !== 'undefined') {
  window.getAuthHeaders = getAuthHeaders;
  window.authFetch = authFetch;
  window.isAuthenticated = isAuthenticated;
  window.requireAuth = requireAuth;
}
