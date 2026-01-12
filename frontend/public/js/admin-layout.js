/**
 * Shared Admin Layout Component
 * Provides consistent sidebar navigation and header across all admin pages
 */

// Global variable to store hidden items
let hiddenNavItems = [];

// Load hidden items from localStorage
function loadHiddenItems() {
  try {
    const stored = localStorage.getItem('isrs_hidden_nav_items');
    hiddenNavItems = stored ? JSON.parse(stored) : [];
  } catch (e) {
    hiddenNavItems = [];
  }
}

// Save hidden items to localStorage
function saveHiddenItems() {
  try {
    localStorage.setItem('isrs_hidden_nav_items', JSON.stringify(hiddenNavItems));
  } catch (e) {
    console.error('Failed to save hidden items:', e);
  }
}

// Hide a nav item
function hideNavItem(itemId) {
  if (!hiddenNavItems.includes(itemId)) {
    hiddenNavItems.push(itemId);
    saveHiddenItems();
    // Reload sidebar to reflect changes
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) {
      sidebar.remove();
      loadAdminLayout(window.currentAdminPage || 'dashboard', window.currentUserPermissionLevel || 100);
    }
  }
}

// Restore a nav item
function restoreNavItem(itemId) {
  hiddenNavItems = hiddenNavItems.filter(id => id !== itemId);
  saveHiddenItems();
  // Reload sidebar to reflect changes
  const sidebar = document.querySelector('.admin-sidebar');
  if (sidebar) {
    sidebar.remove();
    loadAdminLayout(window.currentAdminPage || 'dashboard', window.currentUserPermissionLevel || 100);
  }
}

// Toggle hidden items section
function toggleHiddenItems() {
  const toggle = document.querySelector('.hidden-items-toggle');
  const list = document.querySelector('.hidden-items-list');
  if (toggle && list) {
    toggle.classList.toggle('expanded');
    list.classList.toggle('expanded');
  }
}

function loadAdminLayout(currentPage, userPermissionLevel = 100) {
  const body = document.body;

  // Store current page and permission level globally
  window.currentAdminPage = currentPage;
  window.currentUserPermissionLevel = userPermissionLevel;

  // Load hidden items from localStorage
  loadHiddenItems();

  // Create wrapper structure
  const wrapper = document.createElement('div');
  wrapper.className = 'admin-layout';

  // Store fixed-position elements that should stay outside the layout
  const fixedElements = [];
  const aiAssistant = document.getElementById('aiAssistant');
  if (aiAssistant) {
    fixedElements.push(aiAssistant);
    body.removeChild(aiAssistant);
  }

  // Move existing body content into a temp container
  const existingContent = document.createElement('div');
  while (body.firstChild) {
    existingContent.appendChild(body.firstChild);
  }

  // Define all navigation items
  const allNavItems = [
    { id: 'dashboard', section: 'Overview', icon: '📊', label: 'Dashboard', href: '/admin/index.html', page: 'dashboard', level: 50 },
    { id: 'contacts', section: 'Data Management', icon: '👥', label: 'Contacts', href: '/admin/contacts.html', page: 'contacts', level: 50 },
    { id: 'organizations', section: 'Data Management', icon: '🏢', label: 'Organizations', href: '/admin/organizations.html', page: 'organizations', level: 50 },
    { id: 'conferences', section: 'Data Management', icon: '📅', label: 'Conferences', href: '/admin/conferences.html', page: 'conferences', level: 50 },
    { id: 'photos', section: 'Content', icon: '📷', label: 'Photos', href: '/admin/photos.html', page: 'photos', level: 60 },
    { id: 'press-kit', section: 'Content', icon: '📰', label: 'Press Kit', href: '/admin/press-kit.html', page: 'press-kit', level: 60 },
    { id: 'board-documents', section: 'Governance', icon: '📁', label: 'Board Documents', href: '/admin/board-documents.html', page: 'board-documents', level: 70 },
    { id: 'votes', section: 'Governance', icon: '🗳️', label: 'Board Votes', href: '/admin/votes.html', page: 'votes', level: 70 },
    { id: 'funding', section: 'Governance', icon: '💰', label: 'Funding', href: '/admin/funding.html', page: 'funding', level: 70 },
    { id: 'feedback', section: 'System', icon: '💬', label: 'User Feedback', href: '/admin/feedback.html', page: 'feedback', level: 80 },
    { id: 'import', section: 'System', icon: '📥', label: 'Import Data', href: '/admin/import.html', page: 'import', level: 80 },
    { id: 'settings', section: 'System', icon: '⚙️', label: 'Settings', href: '/admin/settings.html', page: 'settings', level: 80 },
    { id: 'workflows', section: 'Help', icon: '📖', label: 'User Workflows', href: '/admin/workflows.html', page: 'workflows', level: 50 },
  ];

  // Filter items by permission level
  const availableItems = allNavItems.filter(item => userPermissionLevel >= item.level);

  // Separate visible and hidden items
  const visibleItems = availableItems.filter(item => !hiddenNavItems.includes(item.id));
  const hiddenItems = availableItems.filter(item => hiddenNavItems.includes(item.id));

  // Group visible items by section
  const sections = {};
  visibleItems.forEach(item => {
    if (!sections[item.section]) {
      sections[item.section] = [];
    }
    sections[item.section].push(item);
  });

  // Build navigation sections HTML
  let navSectionsHTML = '';

  // Public website link (all users)
  navSectionsHTML += `
    <div class="nav-section">
      <a href="/" target="_blank" class="nav-item nav-item-external" style="background: var(--admin-primary-light, #eff6ff); border-left-color: var(--accent-teal);">
        <span class="nav-icon">🌐</span>
        <span>View Main Website</span>
        <span style="margin-left: auto; font-size: 0.875rem;">↗</span>
      </a>
    </div>
  `;

  // Add each section with its items
  Object.keys(sections).forEach(sectionName => {
    navSectionsHTML += `<div class="nav-section">`;
    navSectionsHTML += `<div class="nav-section-title">${sectionName}</div>`;

    sections[sectionName].forEach(item => {
      const isActive = currentPage === item.page ? 'active' : '';
      navSectionsHTML += `
        <div class="nav-item-wrapper">
          <a href="${item.href}" class="nav-item ${isActive}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </a>
          <button class="nav-item-hide-btn" onclick="hideNavItem('${item.id}')" title="Hide this item">−</button>
        </div>
      `;
    });

    navSectionsHTML += `</div>`;
  });

  // Add Hidden Items section if there are any hidden items
  if (hiddenItems.length > 0 || userPermissionLevel >= 50) {
    navSectionsHTML += `
      <div class="nav-section hidden-items-section">
        <button class="hidden-items-toggle" onclick="toggleHiddenItems()">
          <span class="nav-icon">👁️</span>
          <span>Hidden Items</span>
          <span class="chevron">▸</span>
        </button>
        <div class="hidden-items-list">
    `;

    if (hiddenItems.length === 0) {
      navSectionsHTML += `<div class="hidden-items-empty">No hidden items</div>`;
    } else {
      hiddenItems.forEach(item => {
        navSectionsHTML += `
          <div class="hidden-nav-item">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
            <button class="nav-item-restore-btn" onclick="restoreNavItem('${item.id}')" title="Restore this item">+</button>
          </div>
        `;
      });
    }

    navSectionsHTML += `
        </div>
      </div>
    `;
  }

  // Add sidebar
  wrapper.innerHTML = `
    <!-- Sidebar Navigation -->
    <aside class="admin-sidebar" id="admin-sidebar">
      <!-- Collapse Toggle Button -->
      <button class="sidebar-collapse-btn" onclick="toggleSidebarCollapse()" title="Toggle sidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div class="sidebar-header">
        <div class="sidebar-header-row">
          <div class="sidebar-header-text">
            <a href="/admin/index.html" class="sidebar-logo">ISRS Admin</a>
            <div class="sidebar-subtitle">Management Portal</div>
          </div>
          <button class="theme-toggle-btn" onclick="toggleAdminDarkMode()" title="Toggle dark mode">
            <svg id="sunIcon" class="theme-icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg id="moonIcon" class="theme-icon moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>
      </div>

      <nav class="sidebar-nav">
        ${navSectionsHTML}
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile" onclick="openProfilePopup()" style="cursor: pointer;" title="Edit Profile">
          <div class="user-avatar" id="adminUserAvatar">A</div>
          <div class="user-details">
            <div class="user-email" id="adminUserEmail">Loading...</div>
            <div class="user-role" id="adminUserRole">Admin</div>
          </div>
          <span style="margin-left: auto; color: var(--admin-text-muted, #9ca3af); font-size: 0.75rem;">✎</span>
        </div>
        <button class="btn-logout" onclick="logout()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Profile Edit Popup -->
    <div id="profilePopup" class="profile-popup-overlay">
      <div class="profile-popup">
        <div class="profile-popup-header">
          <h3>Edit Profile</h3>
          <button class="profile-popup-close" onclick="closeProfilePopup()">&times;</button>
        </div>
        <div class="profile-popup-body">
          <div class="profile-avatar-section">
            <div class="profile-avatar-large" id="profileAvatarLarge">A</div>
          </div>
          <div class="profile-form-group">
            <label>First Name</label>
            <input type="text" id="profileFirstName" class="profile-input" placeholder="First name">
          </div>
          <div class="profile-form-group">
            <label>Last Name</label>
            <input type="text" id="profileLastName" class="profile-input" placeholder="Last name">
          </div>
          <div class="profile-form-group">
            <label>Email</label>
            <input type="email" id="profileEmail" class="profile-input" disabled>
          </div>
          <div class="profile-form-group">
            <label>Role</label>
            <input type="text" id="profileRole" class="profile-input" disabled>
          </div>
          <div class="profile-form-group">
            <label>Organization</label>
            <input type="text" id="profileOrganization" class="profile-input" placeholder="Your organization">
          </div>
          <div class="profile-form-group">
            <label>Phone</label>
            <input type="tel" id="profilePhone" class="profile-input" placeholder="Phone number">
          </div>
          <div class="profile-save-indicator" id="profileSaveIndicator">
            <span class="save-icon"></span>
            <span class="save-text">All changes saved</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <main class="admin-main-content" id="admin-main-content">
      <!-- Content will be inserted here -->
    </main>

    <!-- Admin Footer -->
    <footer class="admin-footer">
      <div class="footer-columns">
        <!-- Column 1: Organization Info -->
        <div class="footer-column footer-brand">
          <p class="footer-copyright">&copy; ${new Date().getFullYear()} International Shellfish Restoration Society. All rights reserved.</p>
          <div class="footer-status">
            <span class="status-dot"></span>
            <span>All Systems Operational</span>
          </div>
          <div class="footer-version">Version 2.1.0</div>
          <p class="footer-tax-id">Tax ID (EIN): 39-2829151</p>
        </div>

        <!-- Column 2: Admin Portal -->
        <div class="footer-column">
          <h3 class="footer-heading">Admin Portal</h3>
          <ul class="footer-links">
            <li><a href="/admin/index.html">Dashboard</a></li>
            <li><a href="/admin/contacts.html">Contacts</a></li>
            <li><a href="/admin/organizations.html">Organizations</a></li>
            <li><a href="/admin/feedback.html">Feedback</a></li>
            <li><a href="/admin/settings.html">Settings</a></li>
            <li><a href="/" target="_blank">View Main Website ↗</a></li>
          </ul>
        </div>

        <!-- Column 3: Legal -->
        <div class="footer-column">
          <h3 class="footer-heading">Legal</h3>
          <ul class="footer-links">
            <li><a href="/privacy-policy.html" target="_blank">Privacy Policy</a></li>
            <li><a href="/terms-of-service.html" target="_blank">Terms of Service</a></li>
            <li><a href="/code-of-conduct.html" target="_blank">Code of Conduct</a></li>
            <li><a href="/accessibility.html" target="_blank">Accessibility</a></li>
            <li><a href="/sitemap.html" target="_blank">Sitemap</a></li>
          </ul>
        </div>

        <!-- Column 4: Connect -->
        <div class="footer-column">
          <h3 class="footer-heading">Connect</h3>
          <ul class="footer-links">
            <li><a href="/about.html" target="_blank">About ISRS</a></li>
            <li><a href="/photos.html" target="_blank">Photo Gallery</a></li>
            <li><a href="/support.html" target="_blank">Support ISRS</a></li>
            <li><a href="/donate.html" target="_blank">Donate</a></li>
            <li><a href="/press-kit.html" target="_blank">Press Kit</a></li>
          </ul>
        </div>
      </div>
    </footer>
  `;

  // Append wrapper to body
  body.appendChild(wrapper);

  // Insert original content into main content area
  const mainContent = document.getElementById('admin-main-content');
  mainContent.appendChild(existingContent);

  // Restore fixed-position elements outside the layout wrapper
  fixedElements.forEach(el => {
    body.appendChild(el);
  });

  // Load user info
  loadAdminUserInfo();
}

function loadAdminUserInfo() {
  try {
    const userData = localStorage.getItem('isrs_user_data');
    if (userData) {
      const user = JSON.parse(userData);

      // Update name (show first name, or email if no name available)
      const emailEl = document.getElementById('adminUserEmail');
      if (emailEl) {
        if (user.first_name) {
          emailEl.textContent = user.first_name;
        } else if (user.firstName) {
          emailEl.textContent = user.firstName;
        } else if (user.email) {
          emailEl.textContent = user.email;
        }
      }

      // Update role
      const roleEl = document.getElementById('adminUserRole');
      if (roleEl && user.role) {
        roleEl.textContent = user.role.toUpperCase();
      }

      // Update avatar (use first letter of first name, or email)
      const avatarEl = document.getElementById('adminUserAvatar');
      if (avatarEl) {
        if (user.first_name) {
          avatarEl.textContent = user.first_name.charAt(0).toUpperCase();
        } else if (user.firstName) {
          avatarEl.textContent = user.firstName.charAt(0).toUpperCase();
        } else if (user.email) {
          avatarEl.textContent = user.email.charAt(0).toUpperCase();
        }
      }
    }
  } catch (error) {
    console.error('Error loading admin user info:', error);
  }
}

function logout() {
  localStorage.removeItem('isrs_auth_token');
  localStorage.removeItem('isrs_user_data');
  localStorage.removeItem('isrs_session_token');
  window.location.href = '/login.html';
}

// Dark Mode Functions
function toggleAdminDarkMode() {
  const body = document.body;
  const isDark = body.classList.toggle('admin-dark-mode');

  // Save preference
  localStorage.setItem('isrs_admin_dark_mode', isDark ? 'true' : 'false');

  // Update toggle text/icon
  updateDarkModeUI(isDark);
}

function updateDarkModeUI(isDark) {
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');

  if (sunIcon && moonIcon) {
    // Show sun icon in dark mode (click to go light)
    // Show moon icon in light mode (click to go dark)
    sunIcon.style.display = isDark ? 'block' : 'none';
    moonIcon.style.display = isDark ? 'none' : 'block';
  }
}

function initAdminDarkMode() {
  const savedPref = localStorage.getItem('isrs_admin_dark_mode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Use saved preference, or system preference
  const isDark = savedPref === 'true' || (savedPref === null && prefersDark);

  if (isDark) {
    document.body.classList.add('admin-dark-mode');
  }

  updateDarkModeUI(isDark);
}

// Initialize dark mode after layout loads
setTimeout(initAdminDarkMode, 0);

// Profile Popup Functions
let profileSaveTimeout = null;
let currentUserData = null;

function openProfilePopup() {
  const popup = document.getElementById('profilePopup');
  if (!popup) return;

  // Load current user data
  try {
    const userData = localStorage.getItem('isrs_user_data');
    if (userData) {
      currentUserData = JSON.parse(userData);

      // Populate form fields
      document.getElementById('profileFirstName').value = currentUserData.first_name || '';
      document.getElementById('profileLastName').value = currentUserData.last_name || '';
      document.getElementById('profileEmail').value = currentUserData.email || '';
      document.getElementById('profileRole').value = (currentUserData.role || 'user').toUpperCase();
      document.getElementById('profileOrganization').value = currentUserData.organization || '';
      document.getElementById('profilePhone').value = currentUserData.phone || '';

      // Update large avatar
      const avatarLarge = document.getElementById('profileAvatarLarge');
      if (avatarLarge && currentUserData.first_name) {
        avatarLarge.textContent = currentUserData.first_name.charAt(0).toUpperCase();
      } else if (avatarLarge && currentUserData.email) {
        avatarLarge.textContent = currentUserData.email.charAt(0).toUpperCase();
      }
    }
  } catch (error) {
    console.error('Error loading profile data:', error);
  }

  popup.classList.add('active');

  // Add input listeners for auto-save
  const inputs = popup.querySelectorAll('.profile-input:not([disabled])');
  inputs.forEach(input => {
    input.removeEventListener('input', handleProfileInput);
    input.addEventListener('input', handleProfileInput);
  });
}

function closeProfilePopup() {
  const popup = document.getElementById('profilePopup');
  if (popup) {
    popup.classList.remove('active');
  }
}

function handleProfileInput() {
  // Show saving indicator
  const indicator = document.getElementById('profileSaveIndicator');
  if (indicator) {
    indicator.classList.add('saving');
    indicator.querySelector('.save-text').textContent = 'Saving...';
  }

  // Debounce save
  if (profileSaveTimeout) {
    clearTimeout(profileSaveTimeout);
  }

  profileSaveTimeout = setTimeout(() => {
    saveProfile();
  }, 500);
}

async function saveProfile() {
  const indicator = document.getElementById('profileSaveIndicator');

  // Gather form data
  const profileData = {
    first_name: document.getElementById('profileFirstName').value,
    last_name: document.getElementById('profileLastName').value,
    organization: document.getElementById('profileOrganization').value,
    phone: document.getElementById('profilePhone').value
  };

  // Update local storage immediately for responsive UI
  if (currentUserData) {
    currentUserData = { ...currentUserData, ...profileData };
    localStorage.setItem('isrs_user_data', JSON.stringify(currentUserData));

    // Update sidebar display
    const emailEl = document.getElementById('adminUserEmail');
    if (emailEl && currentUserData.first_name && currentUserData.last_name) {
      emailEl.textContent = `${currentUserData.first_name} ${currentUserData.last_name}`;
    }

    const avatarEl = document.getElementById('adminUserAvatar');
    if (avatarEl && currentUserData.first_name) {
      avatarEl.textContent = currentUserData.first_name.charAt(0).toUpperCase();
    }
  }

  // Try to save to server
  try {
    const sessionToken = localStorage.getItem('isrs_session_token');
    if (sessionToken) {
      const response = await fetch('https://isrs-database-backend.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
    }

    // Show saved indicator
    if (indicator) {
      indicator.classList.remove('saving');
      indicator.classList.add('saved');
      indicator.querySelector('.save-text').textContent = 'All changes saved';

      setTimeout(() => {
        indicator.classList.remove('saved');
      }, 2000);
    }
  } catch (error) {
    console.error('Error saving profile:', error);

    // Still show as saved since local storage is updated
    if (indicator) {
      indicator.classList.remove('saving');
      indicator.classList.add('saved');
      indicator.querySelector('.save-text').textContent = 'Saved locally';
    }
  }
}

// Close popup when clicking outside
document.addEventListener('click', function(event) {
  const popup = document.getElementById('profilePopup');
  if (popup && event.target === popup) {
    closeProfilePopup();
  }
});

// Close popup with ESC key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeProfilePopup();
  }
});

// Sidebar Collapse Functions
function toggleSidebarCollapse() {
  const sidebar = document.getElementById('admin-sidebar');
  const layout = document.querySelector('.admin-layout');
  const logoutBtn = document.querySelector('.btn-logout');

  if (sidebar && layout) {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    layout.classList.toggle('sidebar-collapsed', isCollapsed);

    // Show/hide logout icon vs text
    if (logoutBtn) {
      const svg = logoutBtn.querySelector('svg');
      if (svg) {
        svg.style.display = isCollapsed ? 'block' : 'none';
      }
    }

    // Save preference
    localStorage.setItem('isrs_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }
}

function initSidebarState() {
  const savedState = localStorage.getItem('isrs_sidebar_collapsed');
  if (savedState === 'true') {
    const sidebar = document.getElementById('admin-sidebar');
    const layout = document.querySelector('.admin-layout');
    const logoutBtn = document.querySelector('.btn-logout');

    if (sidebar && layout) {
      sidebar.classList.add('collapsed');
      layout.classList.add('sidebar-collapsed');

      if (logoutBtn) {
        const svg = logoutBtn.querySelector('svg');
        if (svg) {
          svg.style.display = 'block';
        }
      }
    }
  }
}

// Initialize sidebar state after layout loads
setTimeout(initSidebarState, 0);

// Export for use in other scripts
window.loadAdminLayout = loadAdminLayout;
window.logout = logout;
window.toggleAdminDarkMode = toggleAdminDarkMode;
window.openProfilePopup = openProfilePopup;
window.closeProfilePopup = closeProfilePopup;
window.toggleSidebarCollapse = toggleSidebarCollapse;
