/**
 * ISRS Main JavaScript
 * Handles mobile menu, forms, and analytics event tracking
 */

// Mobile Menu Toggle
function toggleMobileMenu() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.toggle('active');
  }
}

// Track Donate Button Clicks
document.addEventListener('DOMContentLoaded', () => {
  // Track all donate button clicks
  const donateButtons = document.querySelectorAll('.btn-donate, a[href*="zeffy.com"]');
  donateButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (window.ISRSAnalytics) {
        window.ISRSAnalytics.trackDonation();
      }
    });
  });

  // Track outbound links
  const outboundLinks = document.querySelectorAll('a[target="_blank"]');
  outboundLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.ISRSAnalytics) {
        window.ISRSAnalytics.trackOutboundLink(link.href, link.textContent);
      }
    });
  });

  // Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Track form submission
      if (window.ISRSAnalytics) {
        window.ISRSAnalytics.trackFormSubmission('contact_form');
      }

      const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
      };

      try {
        // Here you would send to your backend
        // For now, just show success message
        alert('Thank you for your message! We will be in touch shortly.');
        contactForm.reset();

        // Optional: Send to backend API
        // const response = await fetch('https://isrs-database-backend.onrender.com/api/contact', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData)
        // });

      } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting your message. Please try again.');
      }
    });
  }

  // Support Feedback Form Submission
  const supportFeedbackForm = document.getElementById('supportFeedbackForm');
  if (supportFeedbackForm) {
    supportFeedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Track form submission
      if (window.ISRSAnalytics) {
        window.ISRSAnalytics.trackFormSubmission('support_feedback_form');
      }

      const formData = {
        firstName: document.getElementById('feedbackFirstName').value,
        lastName: document.getElementById('feedbackLastName').value,
        email: document.getElementById('feedbackEmail').value,
        organization: document.getElementById('feedbackOrganization').value,
        inquiryType: document.getElementById('feedbackType').value,
        message: document.getElementById('feedbackMessage').value,
        formType: 'support_partnership'
      };

      try {
        // Show success message
        alert('Thank you for reaching out! We will respond to your inquiry shortly.');
        supportFeedbackForm.reset();

        // Optional: Send to backend API
        // const response = await fetch('https://isrs-database-backend.onrender.com/api/contact', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData)
        // });

      } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting your message. Please try again.');
      }
    });
  }

  // Track navigation clicks
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.ISRSAnalytics) {
        window.ISRSAnalytics.trackEvent('navigation_click', {
          'link_text': link.textContent,
          'link_url': link.href
        });
      }
    });
  });

  // Make entire card boxes clickable
  const cards = document.querySelectorAll('.card, .news-card');
  cards.forEach(card => {
    // Find the primary link/button within the card
    const link = card.querySelector('a.btn, a.btn-primary, a.btn-secondary');

    if (link) {
      // Add cursor pointer to show it's clickable
      card.style.cursor = 'pointer';

      // Add click handler to the card
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking directly on the link (prevent double navigation)
        if (e.target.tagName !== 'A' && !e.target.closest('a')) {
          // Track card click
          if (window.ISRSAnalytics) {
            window.ISRSAnalytics.trackEvent('card_click', {
              'card_title': card.querySelector('h3')?.textContent || '',
              'destination_url': link.href
            });
          }

          // Navigate to the link destination
          if (link.target === '_blank') {
            window.open(link.href, '_blank');
          } else {
            window.location.href = link.href;
          }
        }
      });
    }
  });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  const navLinks = document.getElementById('navLinks');
  const menuToggle = document.querySelector('.mobile-menu-toggle');

  if (navLinks && navLinks.classList.contains('active')) {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
      navLinks.classList.remove('active');
    }
  }
});
