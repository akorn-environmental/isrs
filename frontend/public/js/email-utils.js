/**
 * Email Utilities
 * Global utility functions for email handling and validation
 */

(function() {
  'use strict';

  /**
   * Normalize email address to lowercase
   * @param {string} email - Email address to normalize
   * @returns {string} Lowercase, trimmed email
   */
  window.normalizeEmail = function(email) {
    if (!email) return '';
    return email.toString().toLowerCase().trim();
  };

  /**
   * Automatically apply email normalization to all email inputs on the page
   */
  function initEmailInputs() {
    // Find all email input fields
    const emailInputs = document.querySelectorAll('input[type="email"], input[name*="email"], input[id*="email"]');

    emailInputs.forEach(input => {
      // Normalize on blur
      input.addEventListener('blur', function() {
        this.value = normalizeEmail(this.value);
      });

      // Also normalize on form submit
      const form = input.closest('form');
      if (form && !form.hasAttribute('data-email-normalized')) {
        form.setAttribute('data-email-normalized', 'true');
        form.addEventListener('submit', function() {
          const formEmailInputs = this.querySelectorAll('input[type="email"], input[name*="email"], input[id*="email"]');
          formEmailInputs.forEach(emailInput => {
            emailInput.value = normalizeEmail(emailInput.value);
          });
        });
      }
    });
  }

  /**
   * Initialize when DOM is ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailInputs);
  } else {
    initEmailInputs();
  }

  /**
   * Re-initialize email inputs (call this after dynamically adding new inputs)
   */
  window.reinitEmailInputs = initEmailInputs;

  /**
   * Watch for dynamically added email inputs
   */
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      let shouldReinit = false;
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
              // Check if the added node is an email input or contains email inputs
              if (node.matches && node.matches('input[type="email"], input[name*="email"], input[id*="email"]')) {
                shouldReinit = true;
              } else if (node.querySelector) {
                const hasEmailInputs = node.querySelector('input[type="email"], input[name*="email"], input[id*="email"]');
                if (hasEmailInputs) {
                  shouldReinit = true;
                }
              }
            }
          });
        }
      });
      if (shouldReinit) {
        initEmailInputs();
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
