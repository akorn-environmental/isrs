/**
 * ISRS Tour Definitions - Content for portal walkthroughs
 *
 * Each tour has:
 * - id: Unique identifier (used for localStorage tracking)
 * - name: Display name
 * - steps: Array of step objects with target selector, title, text, and position
 */

const TourDefinitions = {
    // Member Portal Tour
    'member-portal': {
        id: 'member-portal',
        name: 'Member Portal Tour',
        steps: [
            {
                target: null, // No target - centered welcome
                title: 'Welcome to the ISRS Member Portal!',
                text: 'This quick tour will show you around the key features. You can navigate with arrow keys or click the buttons below.',
                position: 'center'
            },
            {
                target: '.member-nav, nav, header',
                title: 'Navigation',
                text: 'Use the navigation menu to access different sections of the member portal. You can return to the dashboard anytime by clicking "Home" or the ISRS logo.',
                position: 'bottom'
            },
            {
                target: '[href*="profile"], .profile-link, a[href*="profile.html"]',
                title: 'Your Profile',
                text: 'View and edit your member profile here. Keep your information up to date to connect with other restoration practitioners.',
                position: 'bottom'
            },
            {
                target: '[href*="directory"], .directory-link, a[href*="directory.html"]',
                title: 'Member Directory',
                text: 'Browse and search the member directory to find colleagues, collaborators, and experts in shellfish restoration from around the world.',
                position: 'bottom'
            },
            {
                target: '[href*="my-reviews"], .reviews-link, a[href*="my-reviews.html"]',
                title: 'My Reviews',
                text: 'If you\'re assigned to review conference abstracts, you\'ll find your assignments here. Complete reviews help shape the ICSR program.',
                position: 'bottom'
            },
            {
                target: null,
                title: 'You\'re All Set!',
                text: 'That\'s the basics! Explore the portal at your own pace. If you need help, check the Support page or contact us anytime.',
                position: 'center'
            }
        ]
    },

    // Admin Portal Tour
    'admin-portal': {
        id: 'admin-portal',
        name: 'Admin Portal Tour',
        steps: [
            {
                target: null,
                title: 'Welcome to the ISRS Admin Portal!',
                text: 'This tour will introduce you to the administrative features. The admin portal helps you manage contacts, conferences, content, and more.',
                position: 'center'
            },
            {
                target: '.admin-sidebar, #adminSidebar, aside',
                title: 'Sidebar Navigation',
                text: 'The sidebar provides quick access to all admin functions. Sections are organized by category: Contacts, Conferences, Content, and System settings.',
                position: 'right'
            },
            {
                target: '[href*="contacts"], .contacts-link, a[data-page="contacts"]',
                title: 'Contact Management',
                text: 'Manage your contact database here. Add new contacts, update information, track engagement, and segment your audience.',
                position: 'right'
            },
            {
                target: '[href*="conferences"], .conferences-link, a[data-page="conferences"]',
                title: 'Conference Management',
                text: 'Create and manage ICSR conferences. Handle registrations, abstract submissions, reviewer assignments, and conference schedules.',
                position: 'right'
            },
            {
                target: '[href*="analytics"], .analytics-link, a[data-page="analytics"]',
                title: 'Analytics Dashboard',
                text: 'Track website traffic, email engagement, and member activity. Use insights to improve outreach and measure impact.',
                position: 'right'
            },
            {
                target: '[href*="assets"], .assets-link, a[data-page="assets"]',
                title: 'Asset Management',
                text: 'Upload and manage images, documents, and media files. Configure asset zones to control where content appears on the site.',
                position: 'right'
            },
            {
                target: '[href*="settings"], .settings-link, a[data-page="settings"]',
                title: 'Settings',
                text: 'Configure system settings, manage user permissions, and customize the platform to your organization\'s needs.',
                position: 'right'
            },
            {
                target: null,
                title: 'Ready to Go!',
                text: 'You now know the key areas of the admin portal. Each section has its own features to explore. Need help? Check the documentation or reach out to support.',
                position: 'center'
            }
        ]
    },

    // Welcome/Onboarding Tour (for first-time profile setup)
    'member-welcome': {
        id: 'member-welcome',
        name: 'Getting Started',
        steps: [
            {
                target: null,
                title: 'Let\'s Complete Your Profile!',
                text: 'A complete profile helps you connect with the global shellfish restoration community. Let\'s walk through the key fields.',
                position: 'center'
            },
            {
                target: '#first_name, input[name="first_name"]',
                title: 'Your Name',
                text: 'Enter your name as you\'d like it displayed to other members. This helps colleagues identify you.',
                position: 'bottom'
            },
            {
                target: '#organization_name, input[name="organization_name"]',
                title: 'Organization',
                text: 'Add your organization or institution. This helps members find collaborators from specific groups.',
                position: 'bottom'
            },
            {
                target: '#country, select[name="country"]',
                title: 'Location',
                text: 'Select your country to appear in regional searches and connect with nearby practitioners.',
                position: 'bottom'
            },
            {
                target: '#bio, textarea[name="bio"]',
                title: 'Bio (Optional)',
                text: 'Share a brief bio about your work in shellfish restoration. This appears on your public profile.',
                position: 'top'
            },
            {
                target: 'button[type="submit"], .save-profile-btn',
                title: 'Save Your Profile',
                text: 'Click here to save your changes. You can always come back and update your profile later.',
                position: 'top'
            }
        ]
    }
};

// Make globally available
window.TourDefinitions = TourDefinitions;

/**
 * Auto-start tours on page load based on current portal
 * Call this function after the page has loaded
 */
function autoStartTour() {
    const path = window.location.pathname;

    // Determine which tour to show based on URL
    if (path.includes('/member/') && !path.includes('/member/welcome')) {
        // Member portal (but not welcome page which has its own flow)
        setTimeout(() => {
            if (window.TourManager) {
                window.TourManager.start('member-portal');
            }
        }, 1000); // Delay to let page render
    } else if (path.includes('/admin/')) {
        // Admin portal
        setTimeout(() => {
            if (window.TourManager) {
                window.TourManager.start('admin-portal');
            }
        }, 1000);
    } else if (path.includes('/member/welcome')) {
        // Welcome/onboarding page
        setTimeout(() => {
            if (window.TourManager) {
                window.TourManager.start('member-welcome');
            }
        }, 1500);
    }
}

// Auto-start if DOM is ready and user is authenticated
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Only auto-start if user appears to be logged in
        if (localStorage.getItem('isrs_session_token')) {
            autoStartTour();
        }
    });
} else {
    if (localStorage.getItem('isrs_session_token')) {
        autoStartTour();
    }
}
