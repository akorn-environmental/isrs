/**
 * API Configuration
 * Automatically detects environment and uses appropriate backend URL
 */

const API_CONFIG = {
  // Determine if we're in local development
  isLocalhost: window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('local'),

  // Get the appropriate API base URL
  get baseURL() {
    return this.isLocalhost
      ? 'http://localhost:3000'
      : 'https://isrs-database-backend.onrender.com';
  },

  // Get API base with /api suffix
  get apiBase() {
    return `${this.baseURL}/api`;
  },

  // Environment indicator
  get environment() {
    return this.isLocalhost ? 'development' : 'production';
  },

  // Helper to show current config in console
  logConfig() {
    console.log(`%c🔧 API Configuration`, 'font-weight: bold; color: #2e5a8a');
    console.log(`Environment: ${this.environment}`);
    console.log(`Base URL: ${this.baseURL}`);
    console.log(`API Base: ${this.apiBase}`);
  }
};

// For backwards compatibility - expose as constants
const API_BASE_URL = API_CONFIG.baseURL;
const API_BASE = API_CONFIG.apiBase;

// Log config on load
if (window.location.pathname.includes('/admin/')) {
  API_CONFIG.logConfig();
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_CONFIG, API_BASE_URL, API_BASE };
}
