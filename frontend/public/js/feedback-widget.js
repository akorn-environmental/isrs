/**
 * ISRS Feedback Widget
 * Floating feedback button styled like SAFMC Interview System
 * Can be included in any page - public site or admin portal
 *
 * Usage:
 *   <script src="/js/feedback-widget.js"></script>
 *   <script>initFeedbackWidget({ isAdminPortal: false });</script>
 */

(function() {
  'use strict';

  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://isrs-database-backend.onrender.com';

  let feedbackConfig = {
    isAdminPortal: false,
    userEmail: null,
    userName: null,
    userId: null
  };

  /**
   * Initialize the feedback widget
   */
  window.initFeedbackWidget = function(config = {}) {
    feedbackConfig = { ...feedbackConfig, ...config };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createFeedbackButton);
    } else {
      createFeedbackButton();
    }
  };

  /**
   * Create the floating feedback button
   */
  function createFeedbackButton() {
    // Don't add twice
    if (document.getElementById('isrs-feedback-widget')) return;

    // Create button
    const button = document.createElement('button');
    button.id = 'isrs-feedback-widget';
    button.setAttribute('aria-label', 'Open feedback form');
    button.setAttribute('type', 'button');
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>Feedback</span>
    `;
    button.onclick = openFeedbackModal;

    // Add styles
    injectStyles();

    // Add button to page
    document.body.appendChild(button);

    // Create modal (hidden)
    createFeedbackModal();
  }

  /**
   * Inject CSS styles
   */
  function injectStyles() {
    if (document.getElementById('isrs-feedback-styles')) return;

    const style = document.createElement('style');
    style.id = 'isrs-feedback-styles';
    style.textContent = `
      /* Feedback Button */
      #isrs-feedback-widget {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10001;
        background: linear-gradient(135deg, #2E5A8A 0%, #5BC0BE 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        font-family: 'PT Serif', Georgia, serif;
        box-shadow: 0 4px 12px rgba(46, 90, 138, 0.3);
        transition: all 0.3s ease;
        display: flex !important;
        align-items: center;
        gap: 8px;
        letter-spacing: 0.3px;
        white-space: nowrap;
      }

      #isrs-feedback-widget:hover {
        background: linear-gradient(135deg, #5BC0BE 0%, #2E5A8A 100%);
        box-shadow: 0 6px 16px rgba(46, 90, 138, 0.4);
        transform: translateY(-2px);
      }

      #isrs-feedback-widget:focus {
        outline: 3px solid #FFC107;
        outline-offset: 2px;
      }

      #isrs-feedback-widget svg {
        width: 18px;
        height: 18px;
      }

      /* Modal Overlay */
      .isrs-feedback-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .isrs-feedback-modal-overlay.active {
        display: flex;
      }

      /* Modal */
      .isrs-feedback-modal {
        background: white;
        border-radius: 8px;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }

      .isrs-feedback-modal-header {
        background: linear-gradient(135deg, #2E5A8A 0%, #5BC0BE 100%);
        color: white;
        padding: 24px 32px;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .isrs-feedback-modal-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        font-family: 'PT Serif', Georgia, serif;
      }

      .isrs-feedback-modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        padding: 4px 8px;
        line-height: 1;
        transition: all 0.2s;
        border-radius: 4px;
      }

      .isrs-feedback-modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .isrs-feedback-modal-close:focus {
        outline: 3px solid #FFC107;
        outline-offset: 2px;
      }

      .isrs-feedback-modal-body {
        padding: 32px;
      }

      .isrs-feedback-form-group {
        margin-bottom: 20px;
      }

      .isrs-feedback-form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #1a1a1a;
        font-size: 14px;
        font-family: 'PT Serif', Georgia, serif;
      }

      .isrs-feedback-form-group input,
      .isrs-feedback-form-group select,
      .isrs-feedback-form-group textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid #d0d0d0;
        border-radius: 6px;
        font-size: 14px;
        font-family: 'PT Serif', Georgia, serif;
        transition: all 0.2s;
        box-sizing: border-box;
        background: white;
        color: #1a1a1a;
      }

      .isrs-feedback-form-group input:focus,
      .isrs-feedback-form-group select:focus,
      .isrs-feedback-form-group textarea:focus {
        outline: 3px solid #2E5A8A;
        outline-offset: 2px;
        border-color: #2E5A8A;
      }

      .isrs-feedback-form-group textarea {
        min-height: 120px;
        resize: vertical;
      }

      .isrs-feedback-form-group small {
        display: block;
        margin-top: 4px;
        color: #4a4a4a;
        font-size: 12px;
      }

      .isrs-feedback-modal-footer {
        padding: 0 32px 32px;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      .isrs-feedback-btn {
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        font-family: 'PT Serif', Georgia, serif;
      }

      .isrs-feedback-btn:focus {
        outline: 3px solid #FFC107;
        outline-offset: 2px;
      }

      .isrs-feedback-btn-primary {
        background: linear-gradient(135deg, #2E5A8A 0%, #5BC0BE 100%);
        color: white;
      }

      .isrs-feedback-btn-primary:hover:not(:disabled) {
        background: linear-gradient(135deg, #5BC0BE 0%, #2E5A8A 100%);
        box-shadow: 0 4px 12px rgba(46, 90, 138, 0.3);
      }

      .isrs-feedback-btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .isrs-feedback-btn-secondary {
        background: #f0f0f0;
        color: #1a1a1a;
        border: 2px solid #d0d0d0;
      }

      .isrs-feedback-btn-secondary:hover {
        background: #e0e0e0;
        border-color: #b0b0b0;
      }

      .isrs-feedback-success {
        text-align: center;
        padding: 40px;
      }

      .isrs-feedback-success-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }

      .isrs-feedback-success h3 {
        margin: 0 0 12px;
        color: #2E5A8A;
        font-size: 24px;
        font-family: 'PT Serif', Georgia, serif;
      }

      .isrs-feedback-success p {
        margin: 0;
        color: #4a4a4a;
        font-size: 16px;
        font-family: 'PT Serif', Georgia, serif;
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        #isrs-feedback-widget span {
          display: none;
        }

        .isrs-feedback-modal {
          max-width: 100%;
          margin: 0;
          border-radius: 0;
        }

        .isrs-feedback-modal-header,
        .isrs-feedback-modal-body,
        .isrs-feedback-modal-footer {
          padding-left: 20px;
          padding-right: 20px;
        }
      }

      /* High Contrast Mode Support */
      @media (prefers-contrast: high) {
        .isrs-feedback-form-group input,
        .isrs-feedback-form-group select,
        .isrs-feedback-form-group textarea {
          border-width: 3px;
        }

        .isrs-feedback-btn {
          border: 3px solid currentColor;
        }
      }

      /* Reduced Motion Support */
      @media (prefers-reduced-motion: reduce) {
        #isrs-feedback-widget,
        .isrs-feedback-btn,
        .isrs-feedback-modal-close,
        .isrs-feedback-form-group input,
        .isrs-feedback-form-group select,
        .isrs-feedback-form-group textarea {
          transition: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Create the feedback modal
   */
  function createFeedbackModal() {
    if (document.getElementById('isrs-feedback-modal')) return;

    const modal = document.createElement('div');
    modal.className = 'isrs-feedback-modal-overlay';
    modal.id = 'isrs-feedback-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'feedback-modal-title');
    modal.innerHTML = `
      <div class="isrs-feedback-modal" onclick="event.stopPropagation()">
        <div class="isrs-feedback-modal-header">
          <h2 id="feedback-modal-title">📝 Send Feedback</h2>
          <button
            class="isrs-feedback-modal-close"
            onclick="window.closeFeedbackModal()"
            aria-label="Close feedback form"
            type="button"
          >&times;</button>
        </div>
        <div class="isrs-feedback-modal-body">
          <form id="isrs-feedback-form">
            <div class="isrs-feedback-form-group">
              <label for="feedback-name">Your Name (optional)</label>
              <input
                type="text"
                id="feedback-name"
                name="name"
                placeholder="John Doe"
                autocomplete="name"
              >
            </div>

            <div class="isrs-feedback-form-group">
              <label for="feedback-email">Email (optional)</label>
              <input
                type="email"
                id="feedback-email"
                name="email"
                placeholder="you@example.com"
                autocomplete="email"
                aria-describedby="email-help"
              >
              <small id="email-help">We'll only use this to follow up on your feedback if needed</small>
            </div>

            <div class="isrs-feedback-form-group">
              <label for="feedback-component">What page is this about?</label>
              <input
                type="text"
                id="feedback-component"
                name="component"
                placeholder="Page will be auto-populated"
                readonly
                style="background-color: #f5f5f5;"
              >
            </div>

            <div class="isrs-feedback-form-group">
              <label for="feedback-type">Feedback Type</label>
              <select id="feedback-type" name="type" required>
                <option value="general">General Feedback</option>
                <option value="bug">🐛 Bug Report</option>
                <option value="feature_request">✨ Feature Request</option>
                <option value="improvement">📈 Improvement Suggestion</option>
              </select>
            </div>

            <div class="isrs-feedback-form-group">
              <label for="feedback-message">Your Feedback <span aria-label="required">*</span></label>
              <textarea
                id="feedback-message"
                name="message"
                required
                placeholder="Tell us what's on your mind..."
                aria-required="true"
              ></textarea>
            </div>
          </form>
        </div>
        <div class="isrs-feedback-modal-footer">
          <button
            type="button"
            class="isrs-feedback-btn isrs-feedback-btn-secondary"
            onclick="window.closeFeedbackModal()"
          >Cancel</button>
          <button
            type="submit"
            form="isrs-feedback-form"
            class="isrs-feedback-btn isrs-feedback-btn-primary"
            id="feedback-submit-btn"
          >Send Feedback</button>
        </div>
      </div>
    `;

    // Click overlay to close
    modal.onclick = window.closeFeedbackModal;

    document.body.appendChild(modal);

    // Setup form submission
    document.getElementById('isrs-feedback-form').onsubmit = handleFeedbackSubmit;
  }

  let previouslyFocusedElement = null;

  /**
   * Open feedback modal with focus management
   */
  function openFeedbackModal() {
    const modal = document.getElementById('isrs-feedback-modal');

    // Store currently focused element
    previouslyFocusedElement = document.activeElement;

    modal.classList.add('active');

    // Pre-fill user info if available
    // Priority: 1) feedbackConfig (passed in), 2) localStorage (logged in), 3) sessionStorage (previously entered)
    let userName = feedbackConfig.userName;
    let userEmail = feedbackConfig.userEmail;

    // Check localStorage for logged-in user
    if (!userName || !userEmail) {
      try {
        const userData = localStorage.getItem('isrs_user_data');
        if (userData) {
          const user = JSON.parse(userData);
          userName = userName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
          userEmail = userEmail || user.email;
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    // Check sessionStorage for previously entered info
    if (!userName) {
      userName = userName || sessionStorage.getItem('isrs_user_name') || '';
    }
    if (!userEmail) {
      userEmail = userEmail || sessionStorage.getItem('isrs_user_email') || '';
    }

    // Set the form values
    if (userName) {
      document.getElementById('feedback-name').value = userName;
    }
    if (userEmail) {
      document.getElementById('feedback-email').value = userEmail;
    }

    // Auto-populate page/component name
    const pageName = document.title || window.location.pathname;
    document.getElementById('feedback-component').value = pageName;

    // Focus first form field (or feedback type if user is logged in)
    setTimeout(() => {
      if (userName && userEmail) {
        document.getElementById('feedback-type').focus();
      } else {
        document.getElementById('feedback-name').focus();
      }
    }, 100);

    // Add keyboard event listener for ESC key
    document.addEventListener('keydown', handleModalKeydown);

    // Trap focus within modal
    trapFocus(modal);
  }

  /**
   * Close feedback modal and restore focus
   */
  window.closeFeedbackModal = function() {
    const modal = document.getElementById('isrs-feedback-modal');
    if (modal) {
      modal.classList.remove('active');
    }

    // Reset form
    const form = document.getElementById('isrs-feedback-form');
    if (form) {
      form.reset();
    }

    // Remove keyboard event listener
    document.removeEventListener('keydown', handleModalKeydown);

    // Restore focus to previously focused element
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
      previouslyFocusedElement = null;
    }
  };

  /**
   * Handle modal keyboard events (ESC to close)
   */
  function handleModalKeydown(e) {
    if (e.key === 'Escape') {
      window.closeFeedbackModal();
    }
  }

  /**
   * Trap focus within modal
   */
  function trapFocus(modalElement) {
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modalElement.addEventListener('keydown', function(e) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  /**
   * Handle feedback submission
   */
  async function handleFeedbackSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('feedback-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      // Collect browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      };

      const formData = {
        user_name: document.getElementById('feedback-name').value || null,
        user_email: document.getElementById('feedback-email').value || null,
        user_id: feedbackConfig.userId,
        session_id: getSessionId(),
        page_url: window.location.href,
        page_title: document.title,
        component_name: document.getElementById('feedback-component').value || null,
        feedback_type: document.getElementById('feedback-type').value,
        rating: null,
        message: document.getElementById('feedback-message').value,
        browser_info: browserInfo,
        is_admin_portal: feedbackConfig.isAdminPortal
      };

      const response = await fetch(`${API_BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // Save user info to sessionStorage for next time
        const name = document.getElementById('feedback-name').value;
        const email = document.getElementById('feedback-email').value;

        if (name) {
          sessionStorage.setItem('isrs_user_name', name);
        }
        if (email) {
          sessionStorage.setItem('isrs_user_email', email);
        }

        showSuccessMessage();
      } else {
        throw new Error(result.error || 'Failed to submit feedback');
      }

    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Sorry, there was an error submitting your feedback. Please try again or contact support.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Feedback';
    }
  }

  /**
   * Show success message
   */
  function showSuccessMessage() {
    const modalBody = document.querySelector('.isrs-feedback-modal-body');
    const modalFooter = document.querySelector('.isrs-feedback-modal-footer');

    modalBody.innerHTML = `
      <div class="isrs-feedback-success">
        <div class="isrs-feedback-success-icon">✅</div>
        <h3>Thank You!</h3>
        <p>Your feedback has been received and will help us improve the ISRS platform.</p>
      </div>
    `;

    modalFooter.innerHTML = `
      <button type="button" class="isrs-feedback-btn isrs-feedback-btn-primary" onclick="window.closeFeedbackModal()">Close</button>
    `;

    // Auto-close after 3 seconds
    setTimeout(() => {
      window.closeFeedbackModal();
      // Reset modal content
      setTimeout(() => {
        createFeedbackModal();
      }, 300);
    }, 3000);
  }

  /**
   * Get or create session ID
   */
  function getSessionId() {
    let sessionId = sessionStorage.getItem('isrs-feedback-session');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      sessionStorage.setItem('isrs-feedback-session', sessionId);
    }
    return sessionId;
  }

})();
