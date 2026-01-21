/**
 * Member Authentication & Profile Management
 * Shared module for member system
 */

const MemberAuth = (() => {
  // Configuration
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api/auth'
    : 'https://isrs-python-backend.onrender.com/api/auth';

  const SESSION_KEY = 'isrs_session_token';
  const REFRESH_KEY = 'isrs_refresh_token';
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
    localStorage.removeItem(REFRESH_KEY);
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
        console.error('=== API ERROR DETAILS ===');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Full Response Data:', JSON.stringify(data, null, 2));
        console.error('Error Detail:', data.detail);
        console.error('Error Message:', data.error);
        console.error('========================');

        const errorMsg = typeof data.detail === 'string'
          ? data.detail
          : (data.error || JSON.stringify(data.detail) || 'Request failed');
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication API Calls

  /**
   * Register a new member account
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email address
   * @param {string} userData.first_name - First name
   * @param {string} userData.last_name - Last name
   * @param {string} [userData.organization_name] - Organization name (optional)
   * @param {string} [userData.country] - Country (optional)
   * @returns {Promise} API response
   */
  async function register(userData) {
    return apiCall('/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

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
    const response = await apiCall('/verify-token', {
      method: 'POST',
      body: JSON.stringify({ token })
    });

    if (response.success) {
      // Store both session and refresh tokens
      if (response.session_token) {
        setSessionToken(response.session_token);
      }
      if (response.refresh_token) {
        localStorage.setItem(REFRESH_KEY, response.refresh_token);
      }
      if (response.user) {
        setUserData(response.user);
      }
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

    return apiCall('/me', {
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });
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
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify(updates)
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
    const sessionToken = getSessionToken();
    if (!sessionToken) {
      throw new Error('Not authenticated - no session token provided');
    }

    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.country) params.append('country', filters.country);
    if (filters.expertise) params.append('expertise', filters.expertise);
    if (filters.conference) params.append('conference', filters.conference);

    const queryString = params.toString();
    const endpoint = queryString ? `/directory?${queryString}` : '/directory';

    return apiCall(endpoint, {
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });
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
    register,
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
