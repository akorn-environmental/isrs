/**
 * Authentication Token Auto-Refresh Module
 *
 * Automatically refreshes access tokens before they expire to maintain
 * seamless user sessions without requiring re-authentication.
 *
 * Features:
 * - Checks token expiration every 5 minutes
 * - Auto-refreshes when <10 minutes remaining
 * - Handles refresh failures gracefully
 * - Supports both localStorage and cookie storage
 */

const AuthRefresh = {
    // Configuration
    CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
    REFRESH_THRESHOLD: 10 * 60 * 1000, // 10 minutes before expiration
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://isrs-python-backend.onrender.com',
    SESSION_KEY: 'isrs_session_token',
    REFRESH_KEY: 'isrs_refresh_token',
    USER_KEY: 'isrs_user_data',

    // State
    checkInterval: null,
    isRefreshing: false,

    /**
     * Initialize auto-refresh mechanism
     */
    init() {
        console.log('[AuthRefresh] Initializing token auto-refresh');

        // Start periodic checks
        this.startPeriodicCheck();

        // Check immediately on init
        this.checkAndRefresh();

        // Listen for storage events (multi-tab support)
        window.addEventListener('storage', (e) => {
            if (e.key === this.SESSION_KEY || e.key === this.REFRESH_KEY) {
                console.log('[AuthRefresh] Token updated in another tab');
                this.checkAndRefresh();
            }
        });
    },

    /**
     * Start periodic token expiration checks
     */
    startPeriodicCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        this.checkInterval = setInterval(() => {
            this.checkAndRefresh();
        }, this.CHECK_INTERVAL);

        console.log(`[AuthRefresh] Started periodic checks every ${this.CHECK_INTERVAL / 60000} minutes`);
    },

    /**
     * Stop periodic checks
     */
    stopPeriodicCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('[AuthRefresh] Stopped periodic checks');
        }
    },

    /**
     * Get session token from storage
     */
    getSessionToken() {
        // Try localStorage first (current implementation)
        let token = localStorage.getItem(this.SESSION_KEY);

        // Fall back to cookie if needed
        if (!token) {
            token = this.getCookie(this.SESSION_KEY);
        }

        return token;
    },

    /**
     * Get refresh token from storage
     */
    getRefreshToken() {
        // Try localStorage first
        let token = localStorage.getItem(this.REFRESH_KEY);

        // Fall back to cookie if needed
        if (!token) {
            token = this.getCookie(this.REFRESH_KEY);
        }

        return token;
    },

    /**
     * Get cookie value by name
     */
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    },

    /**
     * Decode JWT token to get payload
     */
    decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('[AuthRefresh] Failed to decode JWT:', error);
            return null;
        }
    },

    /**
     * Check if token needs refresh and refresh if necessary
     */
    async checkAndRefresh() {
        // Skip if already refreshing
        if (this.isRefreshing) {
            console.log('[AuthRefresh] Refresh already in progress, skipping');
            return;
        }

        const sessionToken = this.getSessionToken();
        const refreshToken = this.getRefreshToken();

        // No tokens = user not logged in
        if (!sessionToken && !refreshToken) {
            console.log('[AuthRefresh] No tokens found, user not logged in');
            return;
        }

        // If we have a session token, check if it needs refresh
        if (sessionToken) {
            const payload = this.decodeJWT(sessionToken);

            if (!payload || !payload.exp) {
                console.warn('[AuthRefresh] Invalid session token format');
                return;
            }

            const expiresAt = payload.exp * 1000; // Convert to milliseconds
            const timeUntilExpiry = expiresAt - Date.now();

            console.log(`[AuthRefresh] Token expires in ${Math.round(timeUntilExpiry / 60000)} minutes`);

            // If token expires in less than threshold, refresh it
            if (timeUntilExpiry < this.REFRESH_THRESHOLD) {
                console.log('[AuthRefresh] Token expiring soon, refreshing...');
                await this.refreshTokens();
            }
        } else if (refreshToken) {
            // We have refresh token but no session token - refresh immediately
            console.log('[AuthRefresh] No session token but have refresh token, refreshing...');
            await this.refreshTokens();
        }
    },

    /**
     * Refresh tokens using refresh token
     */
    async refreshTokens() {
        if (this.isRefreshing) {
            console.log('[AuthRefresh] Already refreshing tokens');
            return false;
        }

        this.isRefreshing = true;

        try {
            const refreshToken = this.getRefreshToken();

            if (!refreshToken) {
                console.warn('[AuthRefresh] No refresh token available');
                this.handleRefreshFailure();
                return false;
            }

            console.log('[AuthRefresh] Calling refresh endpoint...');

            const response = await fetch(`${this.API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${refreshToken}`
                },
                credentials: 'include' // Include cookies
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[AuthRefresh] Refresh failed:', errorData);
                this.handleRefreshFailure();
                return false;
            }

            const data = await response.json();

            if (data.success && data.access_token && data.refresh_token) {
                // Store new tokens
                localStorage.setItem(this.SESSION_KEY, data.access_token);
                localStorage.setItem(this.REFRESH_KEY, data.refresh_token);

                console.log('[AuthRefresh] Tokens refreshed successfully');

                // Dispatch event for other components
                window.dispatchEvent(new CustomEvent('tokens-refreshed', {
                    detail: {
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token
                    }
                }));

                return true;
            } else {
                console.error('[AuthRefresh] Invalid refresh response:', data);
                this.handleRefreshFailure();
                return false;
            }

        } catch (error) {
            console.error('[AuthRefresh] Refresh error:', error);
            this.handleRefreshFailure();
            return false;
        } finally {
            this.isRefreshing = false;
        }
    },

    /**
     * Handle refresh failure - logout user
     */
    handleRefreshFailure() {
        console.warn('[AuthRefresh] Token refresh failed, logging out user');

        // Clear tokens
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.REFRESH_KEY);
        localStorage.removeItem(this.USER_KEY);

        // Stop periodic checks
        this.stopPeriodicCheck();

        // Dispatch logout event
        window.dispatchEvent(new Event('auth-refresh-failed'));

        // Redirect to login page after short delay
        setTimeout(() => {
            if (window.location.pathname !== '/member/login.html') {
                window.location.href = '/member/login.html?message=session_expired';
            }
        }, 1000);
    },

    /**
     * Manually trigger token refresh (can be called by app)
     */
    async manualRefresh() {
        console.log('[AuthRefresh] Manual refresh triggered');
        return await this.refreshTokens();
    },

    /**
     * Cleanup on logout
     */
    cleanup() {
        console.log('[AuthRefresh] Cleaning up');
        this.stopPeriodicCheck();
        this.isRefreshing = false;
    }
};

// Auto-initialize if user is logged in
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Check if user has tokens
        const hasTokens = localStorage.getItem(AuthRefresh.SESSION_KEY) || localStorage.getItem(AuthRefresh.REFRESH_KEY);
        if (hasTokens) {
            AuthRefresh.init();
        }
    });
} else {
    // DOM already loaded
    const hasTokens = localStorage.getItem(AuthRefresh.SESSION_KEY) || localStorage.getItem(AuthRefresh.REFRESH_KEY);
    if (hasTokens) {
        AuthRefresh.init();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthRefresh;
}

// Also expose globally
window.AuthRefresh = AuthRefresh;
