/**
 * Member Authentication & Profile Management
 * Shared module for member system
 */

const MemberAuth = (() => {
  // Configuration
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api/profile'
    : 'https://isrs-database-backend.onrender.com/api/profile';

  const SESSION_KEY = 'isrs_session_token';
  const USER_KEY = 'isrs_user_data';

  // Session Management
  function getSessionToken() {
    return localStorage.getItem(SESSION_KEY);
  }

  function setSessionToken(token) {
    localStorage.setItem(SESSION_KEY, token);
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function isAuthenticated() {
    return !!getSessionToken();
  }

  function getUserData() {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  function setUserData(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Redirect to login if not authenticated
  function requireAuth(redirectUrl = null) {
    if (!isAuthenticated()) {
      const currentUrl = redirectUrl || window.location.pathname + window.location.search;
      window.location.href = `/member/login.html?redirect=${encodeURIComponent(currentUrl)}`;
      return false;
    }
    return true;
  }

  // API Helper
  async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication API Calls

  /**
   * Request magic link login
   * @param {string} email - User email address
   * @returns {Promise} API response
   */
  async function login(email) {
    return apiCall('/request-login', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  /**
   * Verify magic link token
   * @param {string} token - Magic link token from email
   * @returns {Promise} Session data
   */
  async function verifyMagicLink(token) {
    const response = await apiCall('/verify-magic-link', {
      method: 'POST',
      body: JSON.stringify({ token })
    });

    if (response.success && response.data) {
      setSessionToken(response.data.sessionToken);
      setUserData(response.data.user);
    }

    return response;
  }

  /**
   * Get current user profile
   * @returns {Promise} Profile data
   */
  async function getProfile() {
    const sessionToken = getSessionToken();
    if (!sessionToken) {
      throw new Error('Not authenticated');
    }

    return apiCall(`/me?sessionToken=${sessionToken}`);
  }

  /**
   * Update user profile
   * @param {Object} updates - Fields to update
   * @returns {Promise} Updated profile
   */
  async function updateProfile(updates) {
    const sessionToken = getSessionToken();
    if (!sessionToken) {
      throw new Error('Not authenticated');
    }

    return apiCall('/me', {
      method: 'PUT',
      body: JSON.stringify({
        sessionToken,
        ...updates
      })
    });
  }

  /**
   * Logout user
   * @returns {Promise} Logout response
   */
  async function logout() {
    const sessionToken = getSessionToken();

    try {
      if (sessionToken) {
        await apiCall('/logout', {
          method: 'POST',
          body: JSON.stringify({ sessionToken })
        });
      }
    } finally {
      clearSession();
      window.location.href = '/';
    }
  }

  /**
   * Get member directory
   * @param {Object} filters - Search and filter options
   * @returns {Promise} Directory results
   */
  async function getDirectory(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.country) params.append('country', filters.country);
    if (filters.expertise) params.append('expertise', filters.expertise);
    if (filters.conference) params.append('conference', filters.conference);

    const queryString = params.toString();
    const endpoint = queryString ? `/directory?${queryString}` : '/directory';

    return apiCall(endpoint);
  }

  /**
   * Request data export (GDPR)
   * @returns {Promise} Export request response
   */
  async function requestDataExport() {
    const sessionToken = getSessionToken();
    if (!sessionToken) {
      throw new Error('Not authenticated');
    }

    return apiCall('/request-data-export', {
      method: 'POST',
      body: JSON.stringify({ sessionToken })
    });
  }

  /**
   * Request account deletion (GDPR)
   * @param {string} reason - Reason for deletion
   * @returns {Promise} Deletion request response
   */
  async function requestAccountDeletion(reason = '') {
    const sessionToken = getSessionToken();
    if (!sessionToken) {
      throw new Error('Not authenticated');
    }

    return apiCall('/request-account-deletion', {
      method: 'POST',
      body: JSON.stringify({ sessionToken, reason })
    });
  }

  // Public API
  return {
    // Session management
    getSessionToken,
    setSessionToken,
    clearSession,
    isAuthenticated,
    requireAuth,
    getUserData,
    setUserData,

    // Authentication
    login,
    verifyMagicLink,
    logout,

    // Profile management
    getProfile,
    updateProfile,

    // Directory
    getDirectory,

    // Privacy & GDPR
    requestDataExport,
    requestAccountDeletion,

    // Config
    API_BASE
  };
})();

// Make available globally
window.MemberAuth = MemberAuth;
