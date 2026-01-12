// ISRS API Client

const API_BASE_URL = 'https://isrs-database-backend.onrender.com';

/**
 * Make API request
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * GET request
 */
async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Admin API functions
 */
const AdminAPI = {
  async getStats() {
    return apiGet('/api/admin/stats');
  },

  async testConnection() {
    return apiGet('/api/admin/test-connection');
  },

  async getICSRData() {
    return apiGet('/api/admin/icsr-data');
  },

  async getBoardMembers() {
    return apiGet('/api/admin/board-members');
  },

  async getRegistrationStats() {
    return apiGet('/api/admin/registration-stats');
  },

  async runEnhancement() {
    return apiPost('/api/admin/enhance', {});
  },

  async performCleanup() {
    return apiPost('/api/admin/cleanup', {});
  },

  async prepareExport() {
    return apiGet('/api/admin/export');
  }
};

/**
 * Vote API functions
 */
const VoteAPI = {
  async processVote(voteData) {
    return apiPost('/api/votes/process', voteData);
  },

  async getHistory(limit = 50) {
    return apiGet(`/api/votes/history?limit=${limit}`);
  },

  async getDetails(voteId) {
    return apiGet(`/api/votes/details?voteId=${voteId}`);
  },

  async exportCSV() {
    return apiGet('/api/votes/export');
  }
};

/**
 * User API functions
 */
const UserAPI = {
  async checkPermissions(email) {
    return apiGet(`/api/users/permissions?email=${encodeURIComponent(email)}`);
  }
};

/**
 * Helper to show loading state
 */
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '<div class="loading">Loading...</div>';
  }
}

/**
 * Helper to show error
 */
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    // Use textContent to prevent XSS attacks from malicious error messages
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    element.innerHTML = ''; // Clear existing content
    element.appendChild(errorDiv);
  }
}

/**
 * Helper to format date
 */
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Helper to format number
 */
function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Helper to format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
}
