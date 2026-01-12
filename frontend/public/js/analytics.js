/**
 * ISRS Analytics Configuration
 * Supports Google Analytics 4
 */

// Google Analytics 4 Configuration
const GA4_MEASUREMENT_ID = 'G-87NFJGXVT1'; // ISRS Website Analytics

// Initialize Google Analytics 4
function initGoogleAnalytics() {
  if (!GA4_MEASUREMENT_ID || GA4_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    // Analytics disabled - no warning in production
    return;
  }

  // Load Google Analytics script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', GA4_MEASUREMENT_ID, {
    'page_title': document.title,
    'page_location': window.location.href,
    'page_path': window.location.pathname
  });

  console.log('✅ Google Analytics initialized:', GA4_MEASUREMENT_ID);
}

// Track custom events
function trackEvent(eventName, eventParams = {}) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, eventParams);
  }
}

// Track page views (for SPA navigation)
function trackPageView(pagePath, pageTitle) {
  if (typeof gtag === 'function') {
    gtag('config', GA4_MEASUREMENT_ID, {
      'page_path': pagePath,
      'page_title': pageTitle
    });
  }
}

// Track outbound links
function trackOutboundLink(url, linkText) {
  trackEvent('click', {
    'event_category': 'outbound',
    'event_label': url,
    'link_text': linkText
  });
}

// Track downloads
function trackDownload(fileName) {
  trackEvent('file_download', {
    'file_name': fileName
  });
}

// Track form submissions
function trackFormSubmission(formName) {
  trackEvent('form_submit', {
    'form_name': formName
  });
}

// Track donate button clicks
function trackDonation(amount = null) {
  trackEvent('donate_click', {
    'event_category': 'engagement',
    'amount': amount
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoogleAnalytics);
} else {
  initGoogleAnalytics();
}

// Export functions for use in other scripts
window.ISRSAnalytics = {
  trackEvent,
  trackPageView,
  trackOutboundLink,
  trackDownload,
  trackFormSubmission,
  trackDonation
};
