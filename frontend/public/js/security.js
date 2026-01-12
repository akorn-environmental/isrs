/**
 * ISRS Frontend Security Utilities
 * Provides HTML sanitization and XSS protection
 */

// DOMPurify-style sanitizer for safe HTML rendering
// This is a lightweight implementation for basic XSS protection
const ISRSSecurity = {
  // Allowed HTML tags (safe for display)
  ALLOWED_TAGS: new Set([
    'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
    'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'pre', 'code', 'hr'
  ]),

  // Allowed attributes per tag
  ALLOWED_ATTRS: {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'table': ['class'],
    'th': ['colspan', 'rowspan'],
    'td': ['colspan', 'rowspan'],
    '*': ['class', 'id', 'style']  // Universal attributes
  },

  // Dangerous protocols to block in URLs
  DANGEROUS_PROTOCOLS: ['javascript:', 'data:', 'vbscript:'],

  /**
   * Sanitize HTML string to prevent XSS attacks
   * @param {string} dirty - Untrusted HTML string
   * @param {Object} options - Sanitization options
   * @returns {string} - Sanitized HTML string
   */
  sanitize(dirty, options = {}) {
    if (!dirty || typeof dirty !== 'string') return '';

    // Create a temporary DOM element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = dirty;

    // Recursively clean the DOM tree
    this._cleanNode(temp, options);

    return temp.innerHTML;
  },

  /**
   * Recursively clean a DOM node and its children
   * @private
   */
  _cleanNode(node, options) {
    const allowedTags = options.ALLOWED_TAGS || this.ALLOWED_TAGS;
    const allowedAttrs = options.ALLOWED_ATTRS || this.ALLOWED_ATTRS;

    // Process child nodes in reverse order (for safe removal)
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = child.tagName.toLowerCase();

        // Remove disallowed tags
        if (!allowedTags.has(tagName)) {
          // Keep text content, remove the tag
          const text = document.createTextNode(child.textContent);
          node.replaceChild(text, child);
          continue;
        }

        // Clean attributes
        const attrs = Array.from(child.attributes);
        for (const attr of attrs) {
          const attrName = attr.name.toLowerCase();
          const tagAllowed = allowedAttrs[tagName] || [];
          const universalAllowed = allowedAttrs['*'] || [];

          if (!tagAllowed.includes(attrName) && !universalAllowed.includes(attrName)) {
            child.removeAttribute(attr.name);
            continue;
          }

          // Check for dangerous URLs
          if (['href', 'src', 'action'].includes(attrName)) {
            const value = attr.value.toLowerCase().trim();
            if (this.DANGEROUS_PROTOCOLS.some(p => value.startsWith(p))) {
              child.removeAttribute(attr.name);
            }
          }

          // Check for event handlers (onclick, onerror, etc.)
          if (attrName.startsWith('on')) {
            child.removeAttribute(attr.name);
          }
        }

        // Recursively clean child nodes
        this._cleanNode(child, options);
      }
    }
  },

  /**
   * Escape HTML entities to prevent injection
   * Use this when you don't want ANY HTML rendering
   * @param {string} str - String to escape
   * @returns {string} - Escaped string
   */
  escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';

    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };

    return str.replace(/[&<>"'`=\/]/g, char => escapeMap[char]);
  },

  /**
   * Safely set innerHTML with sanitization
   * @param {HTMLElement} element - Target element
   * @param {string} html - HTML to set
   * @param {Object} options - Sanitization options
   */
  setInnerHTML(element, html, options = {}) {
    if (element && typeof html === 'string') {
      element.innerHTML = this.sanitize(html, options);
    }
  },

  /**
   * Safely create element with text content (no HTML)
   * @param {string} tag - Tag name
   * @param {string} text - Text content
   * @param {Object} attrs - Attributes to set
   * @returns {HTMLElement}
   */
  createElement(tag, text, attrs = {}) {
    const el = document.createElement(tag);
    el.textContent = text;  // Safe - no HTML parsing

    for (const [key, value] of Object.entries(attrs)) {
      if (!key.startsWith('on') && key !== 'innerHTML') {
        el.setAttribute(key, value);
      }
    }

    return el;
  },

  /**
   * Validate and sanitize URL
   * @param {string} url - URL to validate
   * @returns {string|null} - Sanitized URL or null if invalid
   */
  sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return null;

    const trimmed = url.trim().toLowerCase();

    // Block dangerous protocols
    if (this.DANGEROUS_PROTOCOLS.some(p => trimmed.startsWith(p))) {
      return null;
    }

    // Allow relative URLs, http, https, mailto, tel
    if (trimmed.startsWith('/') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('mailto:') ||
        trimmed.startsWith('tel:')) {
      return url;
    }

    // Assume https for URLs without protocol
    if (trimmed.includes('.') && !trimmed.includes(':')) {
      return 'https://' + url;
    }

    return url;
  }
};

// Make available globally
window.ISRSSecurity = ISRSSecurity;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ISRSSecurity;
}
