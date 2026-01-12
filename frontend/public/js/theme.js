/**
 * Theme and Text Size Management for ISRS Website
 */

// Initialize theme from localStorage or default to 'light'
let currentTheme = localStorage.getItem('isrs_theme') || 'light';
let currentTextSize = localStorage.getItem('isrs_textSize') || 'medium';

// Apply theme to document
function applyTheme() {
  const root = document.documentElement;

  if (currentTheme === 'dark') {
    root.classList.add('dark-mode');
  } else {
    root.classList.remove('dark-mode');
  }

  localStorage.setItem('isrs_theme', currentTheme);
  updateThemeButton();
  updateHeaderLogo();
}

// Update header logo based on theme
function updateHeaderLogo() {
  const headerLogo = document.getElementById('header-logo');
  if (!headerLogo) return;

  if (currentTheme === 'dark') {
    headerLogo.src = '/images/logo-wide-white.svg';
  } else {
    headerLogo.src = '/images/logo-wide-blue.png';
  }
}

// Apply text size to document
function applyTextSize() {
  const root = document.documentElement;

  // Remove all size classes
  root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');

  // Add current size class
  root.classList.add(`text-size-${currentTextSize}`);

  localStorage.setItem('isrs_textSize', currentTextSize);
  updateTextSizeButton();
}

// Toggle between light and dark themes
function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme();
}

// Cycle through text sizes: small → medium → large → small
function cycleTextSize() {
  if (currentTextSize === 'small') {
    currentTextSize = 'medium';
  } else if (currentTextSize === 'medium') {
    currentTextSize = 'large';
  } else {
    currentTextSize = 'small';
  }
  applyTextSize();
}

// Update theme button icon and aria-label
function updateThemeButton() {
  const themeBtn = document.getElementById('theme-toggle');
  if (!themeBtn) return;

  const icon = themeBtn.querySelector('.theme-icon');
  const isDark = currentTheme === 'dark';

  icon.textContent = isDark ? '☀️' : '🌙';
  themeBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  themeBtn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

// Update text size button aria-label
function updateTextSizeButton() {
  const textSizeBtn = document.getElementById('text-size-toggle');
  if (!textSizeBtn) return;

  const sizeLabel = currentTextSize.charAt(0).toUpperCase() + currentTextSize.slice(1);
  textSizeBtn.setAttribute('aria-label', `Text size: ${sizeLabel} (click to cycle)`);
  textSizeBtn.setAttribute('title', `Text size: ${sizeLabel} (click to cycle)`);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  applyTextSize();
});

// Make functions globally available
window.toggleTheme = toggleTheme;
window.cycleTextSize = cycleTextSize;
