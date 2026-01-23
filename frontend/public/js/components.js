/**
 * Reusable Components for ISRS Website
 * Header, Footer, and Stay Connected sections
 */

// Language data - Comprehensive translations
const translations = {
  en: {
    // Navigation
    home: 'Home',
    about: 'About',
    icsr: 'ICSR',
    gallery: 'Gallery',
    support: 'Support',
    donate: 'DONATE',
    skipToMain: 'Skip to main content',

    // Homepage - Hero
    heroHeading: 'Building community and advancing innovation in global shellfish restoration',
    heroSubtitle: 'The International Shellfish Restoration Society (ISRS) unites scientists, practitioners, and communities worldwide to protect and restore vital shellfish ecosystems. Through knowledge sharing, collaboration, and innovative approaches, we\'re working to ensure the resilience of coastal ecosystems for generations to come.',

    // Homepage - ICSR2026 Banner
    homeBannerTitle: 'ICSR2026 • Puget Sound, Washington',
    homeBannerDates: 'October 5-8, 2026',
    homeBannerVenue: 'Little Creek Casino Resort',
    homeBannerDescription: 'Join 350+ shellfish restoration practitioners from 25+ countries for cutting-edge research, hands-on workshops, and field trips to Tribal restoration sites. Chaired by Puget Sound Restoration Fund.',
    homeBannerViewDetails: 'View Full Details',
    homeBannerBecomeSponsor: 'Become a Sponsor',
    homeBannerSponsorshipProgress: 'Sponsorship Progress',
    homeBannerGoal: 'Goal:',
    homeBannerRaised: 'raised',
    homeBannerEarlySponsors: 'Early sponsors:',

    // Homepage - Featured Initiatives
    icsrCardTitle: 'International Conference on Shellfish Restoration (ICSR)',
    icsrCardText: 'Join us in Washington\'s Puget Sound for ICSR 2026, the premier global gathering for shellfish restoration science and practice. Connect with leaders in the field, share your research, and discover innovative approaches to restoration challenges.',
    icsrCardButton: 'Learn More About ICSR 2026',

    knowledgeCardTitle: 'Global Knowledge Exchange',
    knowledgeCardText: 'Access cutting-edge research, best practices, and lessons learned from restoration projects worldwide. Our international network connects practitioners across continents to share expertise and accelerate successful restoration outcomes.',
    knowledgeCardButton: 'Explore Resources',

    communityCardTitle: 'Community Impact',
    communityCardText: 'From oyster reefs to mussel beds, shellfish restoration enhances water quality, supports biodiversity, and builds coastal resilience. Discover how our members are making a difference in coastal ecosystems around the world.',
    communityCardButton: 'View Success Stories',

    // Homepage - Latest News
    latestNews: 'Latest News',
    news1Title: 'Registration Opens Early 2026 for ICSR 2026',
    news1Text: 'Mark your calendar for the next International Conference on Shellfish Restoration in Puget Sound.',
    news1Button: 'Get Updates',

    news2Title: 'Launch of a New Global Partnership',
    news2Text: 'ISRS joins forces with the Native Oyster Restoration Alliance (NORA) and the Australasian Coastal Restoration Network to advance international restoration efforts.',
    news2Button: 'Learn More',

    news3Title: 'Student Research Spotlight',
    news3Text: 'Meet the next generation of restoration scientists and their groundbreaking work.',
    news3Button: 'Next Gen Science',

    // Homepage - Why It Matters
    whyMattersHeading: 'Why Shellfish Restoration Matters',
    whyMattersIntro: 'Shellfish ecosystems provide essential services that support both marine life and human communities:',

    benefit1Title: '💧 Water Filtration',
    benefit1Text: 'Improved water quality through natural filtration',

    benefit2Title: '🐟 Critical Habitat',
    benefit2Text: 'Essential habitat for marine species',

    benefit3Title: '🌊 Coastal Protection',
    benefit3Text: 'Natural barriers against storm surge and erosion',

    benefit4Title: '🍽️ Food Security',
    benefit4Text: 'Sustainable seafood for local communities',

    benefit5Title: '🌱 Carbon Sequestration',
    benefit5Text: 'Climate change mitigation through carbon storage',

    benefit6Title: '🎣 Sustainable Fisheries',
    benefit6Text: 'Supporting local economies and food security',

    benefit7Title: '🏛️ Cultural Heritage',
    benefit7Text: 'Preservation of traditional practices',

    // Call to Action
    ctaText: 'Together, we can restore these vital ecosystems and build more resilient coasts.',

    // Get Involved Section
    getInvolvedHeading: 'Get Involved',

    joinNetworkTitle: 'Join Our Network',
    joinNetworkText: 'Connect with restoration practitioners, scientists, and community leaders worldwide.<br>Members gain access to exclusive resources, networking opportunities, and conference discounts.',
    joinNetworkButton: 'Become a Member',

    shareKnowledgeTitle: 'Share Your Knowledge',
    shareKnowledgeText: 'Present your research, contribute to best practices guides, or mentor emerging professionals. Your expertise helps advance the field of shellfish restoration.',
    shareKnowledgeButton: 'Partner With Us',

    supportMissionTitle: 'Support Our Mission',
    supportMissionText: 'Help build a sustainable future for coastal ecosystems through membership, partnership, or charitable giving.',
    supportMissionButton: 'Make a Donation',

    donationNote: 'ISRS uses Zeffy, a 100% free fundraising platform that allows us to receive every dollar of your donation without deducting platform fees. When you donate, you\'ll see an optional contribution to support Zeffy\'s free service. This tip is completely optional - you may adjust it to any amount or $0.',

    // Support Page
    supportHeroHeading: 'Support ISRS',
    supportHeroSubtitle: 'Building Global Resilience Through Marine Ecosystem Restoration',
    supportOpportunityHeading: 'The Critical Opportunity',
    supportOpportunityText: 'Molluscan shellfish ecosystems provide some of nature\'s most powerful solutions to our most pressing challenges. A single oyster filters 50 gallons of water daily. Shellfish reefs protect coastlines from storm surge and sea level rise. These ecosystems support biodiversity, sequester carbon, and sustain coastal communities—yet we\'ve lost up to 85% of them globally.',
    supportOpportunityBoxHeading: 'ISRS exists to reverse this trend',
    supportOpportunityBoxText: 'By unifying the global restoration community, advancing scientific understanding, and scaling successful restoration approaches worldwide. Our flagship initiative is the biennial International Conference on Shellfish Restoration (ICSR)—the world\'s premier gathering for molluscan shellfish restoration since 1996.',
    supportStat1Number: '50',
    supportStat1Label: 'Gallons filtered daily per oyster',
    supportStat2Number: '85%',
    supportStat2Label: 'Global shellfish loss',
    supportStat3Number: '300+',
    supportStat3Label: 'ICSR practitioners',
    supportStat4Number: '20+',
    supportStat4Label: 'Countries represented',
    supportUrgentHeading: 'Urgent Need: Federal Funding Crisis',
    supportUrgentIntro: 'Recent federal budget changes have created unprecedented challenges for molluscan shellfish restoration:',
    supportUrgentPoint1: 'NOAA\'s Habitat Conservation budget cut by 29%',
    supportUrgentPoint2: 'Over 586 NOAA employees terminated, reducing technical support capacity',
    supportUrgentPoint3: 'Sea Grant programs at risk of elimination or severe defunding',
    supportUrgentPoint4: 'Final phase of Bipartisan Infrastructure Law restoration funding ending in 2025',
    supportUrgentConclusion: 'The molluscan shellfish restoration community has responded with remarkable resilience. ISRS strengthens this community, connecting practitioners with diverse funding sources and ensuring restoration momentum continues despite federal challenges.',
    supportPartnershipHeading: 'Partnership Opportunities',
    supportPartnershipIntro: 'ISRS welcomes partners at all levels who share our commitment to healthy marine ecosystems.',
    supportProgramsHeading: 'Programs Delivering Global Impact',
    supportFeedbackHeading: 'Share Your Feedback',
    supportFeedbackIntro: 'Have suggestions or questions about our partnership opportunities? We\'d love to hear from you.',
    supportFirstName: 'First Name <span class="required">*</span>',
    supportLastName: 'Last Name <span class="required">*</span>',
    supportEmail: 'Email <span class="required">*</span>',
    supportOrganization: 'Organization',
    supportInquiryType: 'Inquiry Type',
    supportGeneralInquiry: 'General Inquiry',
    supportFoundationPartner: 'Foundation Partnership',
    supportCorporatePartner: 'Corporate Partnership',
    supportGovernmentPartner: 'Government Partnership',
    supportAcademicPartner: 'Academic Partnership',
    supportIndividualDonation: 'Individual Donation',
    supportOther: 'Other',
    supportMessage: 'Message <span class="required">*</span>',
    supportCTAHeading: 'Join Us',
    supportCTAText: 'Together, we can build resilient coasts and healthy oceans for future generations through the power of molluscan shellfish restoration.',
    supportCTAContact: 'Contact Us About Partnership',
    supportCTAPressKit: 'View Press Kit',
    supportCTAContactInfo: 'Questions? Contact us at aaron@shellfish-society.org',

    // Why Shellfish Restoration Matters
    whyMattersHeading: 'Why Shellfish Restoration Matters',
    whyMattersIntro: 'Discover how shellfish ecosystems provide essential services—<br>from water filtration to coastal protection.',
    whyMattersButton: 'Learn More',

    // Global Network
    globalNetworkHeading: 'Our Global Network',
    globalNetworkIntro: 'Join our growing network of over 2,600 members<br>working to advance shellfish restoration worldwide.',
    globalNetworkText: 'ISRS connects restoration practitioners across six continents, fostering collaboration among:',

    stakeholder1: 'Research institutions',
    stakeholder2: 'Government agencies',
    stakeholder3: 'Conservation organizations',
    stakeholder4: 'Indigenous communities',
    stakeholder5: 'Industry partners',
    stakeholder6: 'Local stakeholders',

    // Common buttons
    learnMore: 'Learn More',
    getInvolved: 'Get Involved',
    readMore: 'Read More',

    // Footer
    stayConnected: 'Stay Connected',
    stayConnectedText: 'Interested in working together? Fill out some info and we will be in touch shortly.<br>',
    stayConnectedText2: "We can't wait to hear from you!",
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    message: 'Message',
    send: 'Send',
    required: '*',
    quickLinks: 'Quick Links',
    connect: 'Connect',
    adminPortal: 'Admin Portal',
    copyright: '© 2026 International Shellfish Restoration Society. All rights reserved.',
    taxId: 'Tax ID (EIN): 39-2829151',

    // Footer
    footerTagline: 'Building community and advancing innovation in global shellfish restoration',
    footerLegal: 'Legal',
    footerPrivacyPolicy: 'Privacy Policy',
    footerTermsOfService: 'Terms of Service',
    footerCodeOfConduct: 'Code of Conduct',
    footerAccessibility: 'Accessibility',
    footerSitemap: 'Sitemap',
    footerPhotoGallery: 'Photo Gallery',
    footerSupportISRS: 'Support ISRS',
    footerPressKit: 'Press Kit',
    footerTaxDisclaimer: 'ISRS is a 501(c)(3) nonprofit organization (pending IRS approval). Donations are tax-deductible to the extent allowed by law.',

    // Cookie Consent Banner
    cookieConsentTitle: 'We Value Your Privacy',
    cookieConsentText: 'We use cookies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from. By continuing to use our site, you consent to our use of cookies.',
    cookieConsentAccept: 'Accept All',
    cookieConsentDecline: 'Decline Non-Essential',
    cookieConsentLearnMore: 'Learn more in our Privacy Policy',

    // Member Portal - Login
    memberLogin: 'Member Login',
    loginSubtitle: 'Enter your email address and we\'ll send you a secure login link',
    emailAddress: 'Email Address',
    sendMagicLink: 'Send Magic Link',
    securePasswordlessAuth: 'Secure Passwordless Authentication',
    securePasswordlessDesc: 'No passwords to remember. We\'ll send a one-time magic link to your email that expires in 15 minutes.',
    portalAccountFeatures: 'What can you do with your portal account?',
    portalFeature1: 'Register for conferences and events',
    portalFeature2: 'Submit and manage abstracts',
    portalFeature3: 'Access member directory',
    portalFeature4: 'Manage your profile and privacy settings',
    portalFeature5: 'View conference history and presentations',
    portalFeature6: 'Board members: Access governance documents and voting',
    backToHome: 'Back to Home',
    needHelp: 'Need help? Contact us at',
    dontHaveAccount: 'Don\'t have an account yet?',
    createAccount: 'Create New Account',
    pastAttendeeNote: 'Attended a past ICSR conference? You likely already have an account! Just enter the email you used for registration above.',
    learnAboutICSR: 'Learn About ICSR2026',
    checkYourEmail: 'Check Your Email!',
    magicLinkSent: 'We\'ve sent a secure login link to',
    magicLinkSentTo: 'We\'ve sent a secure login link to',
    magicLinkInstructions: 'Click the link in the email to access your member profile. The link will expire in 15 minutes.',
    sendAnotherLink: 'Send Another Link',

    // Member Portal - Signup
    signupHeading: 'Join ISRS',
    signupSubtitle: 'Create your member account to access the directory and member benefits',
    emailAddressRequired: 'Email Address *',
    firstNameRequired: 'First Name *',
    lastNameRequired: 'Last Name *',
    organizationOptional: 'Organization',
    countryOptional: 'Country',
    alreadyHaveAccount: 'Already have an account?',
    loginHere: 'Login Here',
    welcomeToISRS: 'Welcome to ISRS!',
    verificationSent: 'We\'ve sent a verification link to',
    verificationInstructions: 'Click the link in the email to verify your account and complete registration. The link will expire in 15 minutes.',
    goToLogin: 'Go to Login',
    creatingAccount: 'Creating Account...',
    accountCreationFailed: 'Failed to create account. Please try again.',
    accountExistsError: 'An account with this email already exists. Please login instead.',

    // Member Portal - Profile
    myProfile: 'My Profile',
    loading: 'Loading...',
    editProfile: 'Edit Profile',
    viewDirectory: 'View Directory',
    profileCompletion: 'Profile Completion',
    memberSince: 'Member since',
    basicInformation: 'Basic Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    emailAddress: 'Email Address',
    emailCannotChange: 'Email cannot be changed. Contact support if needed.',
    country: 'Country',
    city: 'City',
    phone: 'Phone',
    professionalInformation: 'Professional Information',
    organization: 'Organization',
    positionTitle: 'Position/Title',
    department: 'Department',
    bioAboutMe: 'Bio / About Me',
    privacySettings: 'Privacy Settings',
    profileVisibility: 'Profile Visibility',
    showInDirectory: 'Show in Member Directory',
    privacyNote: 'Your email is always private and never shown to other members.',
    conferenceHistory: 'Conference History',
    noConferences: 'No conference history yet.',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    savingProfile: 'Saving...',
    profileSaved: 'Profile saved successfully!',
    profileSaveFailed: 'Failed to save profile. Please try again.',
    completeProfileMessage: 'Complete your profile to connect with other members!',
    almostCompleteMessage: 'Almost there! Just a few more fields to complete.',
    profileCompleteMessage: 'Your profile is complete!',

    // Member Portal - Verification
    verifyingLogin: 'Verifying Your Login',
    verifyingLoginText: 'Please wait while we securely log you in...',
    loginFailed: 'Login Failed',
    noTokenProvided: 'No login token provided in the URL.',
    requestNewLoginLink: 'Request New Login Link',
    returnToHome: 'Return to Home',
    troubleshooting: 'Troubleshooting:',
    linksExpire: 'Magic links expire after 15 minutes',
    oneTimeUse: 'Each link can only be used once',
    useLatestLink: 'Make sure you clicked the latest link sent to your email',
    verificationError: 'An unexpected error occurred during login verification.',
    verifyingMessage: 'Please wait while we securely log you in...',
    loginFailed: 'Login Failed',
    invalidLink: 'This login link is invalid or has expired.',
    troubleshooting: 'Troubleshooting:',
    linkExpires: 'Magic links expire after 15 minutes',
    linkOnceOnly: 'Each link can only be used once',
    useLatestLink: 'Make sure you clicked the latest link sent to your email',
    requestNewLink: 'Request New Login Link',
    returnToHome: 'Return to Home',

    // Member Portal - Welcome/Profile Setup
    welcomeToISRS: 'Welcome to ISRS!',
    profileCompletion: 'Profile Completion',
    completeProfileMessage: 'Complete your profile to connect with other members and unlock all features',
    basicInformation: 'Basic Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    emailCannotChange: 'Email cannot be changed',
    country: 'Country',
    city: 'City',
    phone: 'Phone',

    // Professional Information
    professionalInformation: 'Professional Information',
    organization: 'Organization',
    positionTitle: 'Position/Title',
    department: 'Department',
    bioAboutMe: 'Bio / About Me',
    bioPlaceholder: 'Tell us about your work in shellfish restoration...',
    researchAreas: 'Research Areas',
    researchAreasPlaceholder: 'E.g., oyster reef restoration, water quality, habitat assessment...',
    separateWithCommas: 'Separate multiple areas with commas',

    // Conference History
    conferenceHistory: 'Your ICSR Conference History',

    // Privacy & Directory
    privacyDirectorySettings: 'Privacy & Directory Settings',
    memberDirectory: 'Member Directory',
    memberDirectoryDescription: 'The ISRS member directory helps connect researchers, practitioners, and stakeholders working in shellfish restoration worldwide.',
    includeInDirectory: 'Include me in the public member directory',
    chooseVisibleInfo: 'Choose what information to show in the directory:',
    nameRequired: 'Name (required)',
    position: 'Position',
    bio: 'Bio',
    conferenceHistoryLabel: 'Conference History',

    // Privacy & Terms
    privacyTerms: 'Privacy & Terms',
    privacyPolicyAgree: 'I have read and agree to the',
    privacyPolicy: 'Privacy Policy',
    privacyConsentText: 'and consent to ISRS collecting and processing my personal data as described.',
    termsOfService: 'Terms of Service',
    termsAgree: 'I agree to the ISRS Terms of Service and understand that this profile will be used for networking and conference purposes.',
    yourPrivacyRights: 'Your Privacy Rights:',
    privacyRightsText: 'You can request a copy of your data, update your information, or request account deletion at any time from your profile settings. We will never sell your data to third parties.',

    // Form Actions
    completeProfileContinue: 'Complete Profile & Continue',
    fieldsRequired: 'Fields marked with',
    areRequired: 'are required',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    saving: 'Saving...',

    // Profile Page
    myProfile: 'My Profile',
    memberSince: 'Member since',
    viewDirectory: 'View Directory',
    notProvided: 'Not provided',
    emailCannotChangeContact: 'Email cannot be changed. Contact support if needed.',
    expertiseKeywords: 'Expertise Keywords',
    separateKeywordsCommas: 'Separate keywords with commas',

    // Online Presence
    onlinePresence: 'Online Presence',
    website: 'Website',
    linkedinURL: 'LinkedIn URL',
    orcid: 'ORCID',

    // Directory Visibility
    directoryPrivacySettings: 'Directory & Privacy Settings',
    visibleFieldsDirectory: 'Visible Fields in Directory:',
    email: 'Email',

    // Profile Tips
    profileTip: 'Tip:',
    profileTipMessage: 'Complete more fields to increase your profile visibility and help other members find you!',

    // Profile Completion Status
    completeProfile: 'Complete Profile',
    profileComplete: 'Your profile is complete and looking great!',
    goodProgress: 'Good progress! Add more information to help members find you.',
    completeMoreFields: 'Complete more fields to increase your profile visibility.',

    // Data Privacy & Account
    dataPrivacyAccount: 'Data Privacy & Account',
    exportYourData: 'Export Your Data',
    exportDataDescription: 'Download a copy of all your personal data',
    requestDataExport: 'Request Data Export',
    deleteAccount: 'Delete Account',
    deleteAccountDescription: 'Permanently delete your account and data',
    logout: 'Logout',

    // Data Export/Deletion Confirmations
    exportDataConfirm: 'Request a copy of all your personal data? You will receive an email with a download link within 48 hours.',
    exportDataSuccess: 'Data export requested successfully! You will receive an email within 48 hours.',
    deleteAccountConfirm: 'Are you sure you want to delete your account?',
    deleteAccountWarning: 'This will:\n• Remove you from the member directory\n• Delete all your personal data\n• Cancel any conference registrations\n\nThis action cannot be undone.',
    deleteAccountReason: 'Optional: Please tell us why you\'re leaving (helps us improve):',
    deleteAccountSuccess: 'Account deletion requested. Your account will be deleted within 7 days. You will receive a confirmation email.',

    // Alerts & Messages
    profileUpdatedSuccess: 'Profile updated successfully!',
    failedToLoadProfile: 'Failed to load your profile. Please try refreshing the page.',
    failedToSaveProfile: 'Failed to save profile:',

    // Notification Settings
    notificationSettings: 'Notification Settings',
    receiveNotifications: 'Receive Notifications',
    receiveNotificationsDesc: 'Master control - turn off to stop all notifications except critical account security alerts',
    memberDirectoryUpdates: 'Member Directory Updates',
    memberDirectoryUpdatesDesc: 'New members join, profile updates from your connections',
    conferenceAnnouncements: 'Conference Announcements (ICSR)',
    conferenceAnnouncementsDesc: 'Event news, registration opens, deadlines, important updates',
    adminAnnouncements: 'Admin Announcements',
    adminAnnouncementsDesc: 'Organization news, policy changes, important ISRS updates',
    adminOnlyNotifications: 'Admin-Only Notifications',
    newMemberRegistrations: 'New Member Registrations',
    newMemberRegistrationsDesc: 'Notified when new members sign up and need approval',
    moderationAlerts: 'Moderation Alerts',
    moderationAlertsDesc: 'Profile flags, reported content, member concerns',
    systemAlerts: 'System Alerts',
    systemAlertsDesc: 'Technical issues, deployment notifications, critical errors',
    emailDeliveryPreference: 'Email Delivery Preference',
    sendImmediately: 'Send immediately (no digest)',
    dailyDigest: 'Daily digest (once per day)',
    weeklyDigest: 'Weekly digest (once per week)',
    digestDescription: 'Digest emails combine multiple notifications into a single summary email',
    saveNotificationSettings: 'Save Notification Settings',
    savingNotifications: 'Saving...',
    notificationsSaved: 'Notification settings saved successfully!',
    notificationsSaveFailed: 'Failed to save notification settings. Please try again.',

    // Member Directory Page
    memberDirectoryTitle: 'Member Directory',
    memberDirectorySubtitle: 'Connect with researchers, practitioners, and stakeholders working in shellfish restoration worldwide',
    search: 'Search',
    searchPlaceholder: 'Search members...',
    searchFields: '(name, organization, bio, research areas)',
    allCountries: 'All Countries',
    conferenceYear: 'Conference Year',
    allYears: 'All Years',
    clearFilters: 'Clear Filters',
    loadingMembers: 'Loading members...',
    noMembersFound: 'No Members Found',
    adjustSearchCriteria: 'Try adjusting your search criteria or filters',
    membersFound: 'members found',
    memberFound: 'member found',

    // Directory CTA
    joinISRSCommunity: 'Join the ISRS Community',
    joinCommunityDescription: 'Connect with colleagues, share your research, and stay updated on shellfish restoration initiatives worldwide.',
    loginToProfile: 'Login to Your Profile',

    // Conference Registration
    conferenceRegistration: 'Conference Registration',
    registrationFor: 'Register for the International Shellfish Restoration Society Conference',
    backToConferenceInfo: 'Back to Conference Info',
    yourProfile: 'Your Profile',
    registrationDetails: 'Registration Details',
    sessionsWorkshops: 'Sessions & Workshops',
    reviewPayment: 'Review & Payment',

    // Registration Form - Profile Section
    cvResumeUpload: 'CV/Resume Upload (Optional)',
    orProvideLink: 'Or provide a link:',
    researchAreasCommaSeparated: 'Research Areas (comma-separated)',
    next: 'Next',
    back: 'Back',

    // Registration Form - Details Section
    registrationType: 'Registration Type',
    selectRegistrationType: 'Select registration type...',
    earlyBird: 'Early Bird',
    student: 'Student',
    earlyBirdPricing: 'Early Bird pricing available now! Register before March 1, 2026 to save.',
    discountCode: 'Discount Code (Optional)',
    discountCodeDescription: 'Have a promo code? Enter it here to save on your registration!',
    enterPromoCode: 'Enter promo code (e.g., EARLYBIRD2026)',
    applyCode: 'Apply Code',
    attendanceType: 'Attendance Type',
    inPerson: 'In-Person',
    virtual: 'Virtual',
    firstTimeISRS: 'This is my first ISRS conference',
    planToSubmitAbstract: 'I plan to submit an abstract for presentation',
    dietaryRestrictions: 'Dietary Restrictions',
    none: 'None',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    glutenFree: 'Gluten-Free',
    other: 'Other (specify below)',
    dietaryNotes: 'Dietary Notes',
    dietaryNotesPlaceholder: 'Please specify any allergies or dietary requirements...',
    accessibilityNeeds: 'Accessibility Needs',
    accessibilityPlaceholder: 'Please let us know if you require any accommodations...',

    // Emergency Contact
    emergencyContactName: 'Emergency Contact Name',
    emergencyContactEmail: 'Emergency Contact Email',
    emergencyContactPhone: 'Emergency Contact Phone',
    relationship: 'Relationship',
    relationshipPlaceholder: 'e.g., Spouse, Parent, Friend',
    emergencyContactAuth: 'I authorize ISRS conference administrators to contact my designated emergency contact in the event of a medical emergency or other urgent situation during the conference.',

    // Special Events
    specialEventsActivities: 'Special Events & Activities',
    selectSpecialEvents: 'Select the special events and activities you\'d like to attend. Some events may have additional fees.',
    welcomeReception: 'Welcome Reception',
    welcomeReceptionDesc: 'Join us for the opening night reception (Included in registration)',
    lowCountryBoil: 'Low Country Boil Dinner',
    lowCountryBoilDesc: 'Traditional seafood feast with colleagues (Included in registration)',
    fieldTrips: 'Field Trips',
    fieldTripsDesc: 'Select all that interest you - limited capacity, additional fees may apply',
    dolphinTours: 'Dolphin Watching Tours - Guided coastal wildlife tour',
    seaTurtleCenter: 'Sea Turtle Center Visit - Educational tour of conservation facility',
    restorationSiteTour: 'Local Restoration Site Tour - Visit active restoration projects',
    golfTournament: 'Golf Tournament',
    golfTournamentDesc: 'Networking golf tournament (Additional fee: $75)',

    // T-Shirt & Guests
    tshirtSize: 'Conference T-Shirt Size (Optional)',
    noTshirt: 'No t-shirt needed',
    bringingGuest: 'Bringing a Guest to Social Events?',
    noGuests: 'No guests',
    guestFee: 'guest',
    guestsFee: 'guests',
    guestsDescription: 'Guests may attend social events and meals (additional fee applies)',

    // Continuing Education
    requestContinuingEducation: 'Request Continuing Education Credits',
    continuingEducationDesc: 'Society for Ecological Restoration (SER) CE credits',
    licenseNumber: 'Professional License Number (if applicable)',
    licensingOrg: 'Licensing Organization',

    // Accommodation
    accommodationPreferences: 'Accommodation Preferences',
    needsAccommodation: 'I need help booking accommodation',
    interestedRoomSharing: 'I\'m interested in sharing a room to reduce costs',
    roommatePreferences: 'Roommate Preferences/Notes',
    roommatePreferencesPlaceholder: 'Any preferences for a roommate? Gender preference, quiet vs social, etc.',

    // Additional Information
    additionalInformation: 'Additional Information',
    willingToVolunteer: 'Willing to volunteer during the conference',
    firstTimeAttendee: 'This is my first ISRS/ICSR conference',
    joinMailingList: 'Join ISRS mailing list',
    receiveFutureUpdates: 'Receive updates about future conferences',

    // Session Selection
    selectSessionsWorkshops: 'Select Your Sessions & Workshops',
    sessionSelectionDescription: 'Choose the workshops and sessions you\'d like to attend. Some sessions have limited capacity and may have a waitlist.',
    sessionSelectionOptional: 'Session selection is optional',
    sessionSelectionSkip: '- you can skip this step if you\'re not interested in specific sessions.',
    loadingSessions: 'Loading available sessions...',
    noSessionsAvailable: 'No sessions are currently available for selection.',
    checkBackLater: 'Check back later or continue with your registration.',
    continueToReview: 'Continue to Review',
    available: 'Available',
    limited: 'limited',
    spotsLeft: 'spots left',
    waitlistOnly: 'Waitlist Only',
    full: 'Full',
    additionalFee: 'Additional fee:',
    selected: 'Selected',
    chair: 'Chair:',

    // Review & Payment
    reviewPaymentTitle: 'Review & Payment',
    registrationSummary: 'Registration Summary',
    name: 'Name',
    notSpecified: 'Not specified',
    attendance: 'Attendance',
    registrationFee: 'Registration Fee',
    total: 'Total',
    paymentMethod: 'Payment Method',
    selectPaymentMethod: 'Select payment method...',
    onlinePayment: 'Online Payment (Credit/Debit Card via Zeffy)',
    bankTransfer: 'Bank Transfer',

    // Zeffy Payment Info
    onlinePaymentViaZeffy: 'Online Payment via Zeffy',
    zeffyDescription: 'ISRS uses Zeffy, a 100% free payment platform for nonprofits.',
    zeffyRedirect: 'When you proceed to payment, you\'ll be redirected to Zeffy\'s secure checkout page.',
    zeffyTipInfo: 'Zeffy may ask if you\'d like to add an optional tip to help keep their platform free for nonprofits like ISRS.',
    zeffyTipOptional: 'This tip is completely optional',
    zeffyTipAmount: 'and goes to Zeffy, not ISRS. You can choose "$0" or any amount you wish.',
    registrationFeeToISRS: 'Your conference registration fee goes 100% to ISRS to support the conference and our mission.',

    // Bank Transfer Info
    bankTransferInstructions: 'Bank Transfer Instructions',
    bankTransferMessage: 'Please transfer the registration fee to the following ISRS bank account:',
    bankName: 'Bank Name:',
    accountName: 'Account Name:',
    accountNumber: 'Account Number:',
    routingNumberACH: 'Routing Number (ACH/Direct Deposit):',
    routingNumberWire: 'Routing Number (Wire Transfer):',
    swiftCode: 'SWIFT Code:',
    swiftCodeNote: '(for international wire transfers)',
    bankTransferImportant: 'Important:',
    includeRegistrationNumber: 'Include your registration number in the transfer reference',
    sendProofOfTransfer: 'Send proof of transfer to',
    confirmationTimeline: 'Your registration will be confirmed once payment is received (typically 3-5 business days)',

    // Legal Agreements
    agreeToTerms: 'I agree to the',
    termsAndConditions: 'Terms and Conditions',
    acknowledgePrivacyPolicy: 'I acknowledge the',
    agreeCodeOfConduct: 'I agree to follow the',
    codeOfConduct: 'Code of Conduct',
    completeRegistration: 'Complete Registration',
    processingRegistration: 'Processing your registration...',

    // Confirmation Page
    registrationCreated: 'Registration Created!',
    thankYouRegistration: 'Thank you for registering for the ISRS International Conference 2026',
    yourRegistrationNumber: 'Your Registration Number:',
    completeYourPayment: 'Complete Your Payment',
    registrationPendingPayment: 'Your registration is currently',
    pendingPayment: 'pending payment',
    completePaymentMessage: 'Please complete your payment to confirm your attendance.',
    amountDue: 'Amount Due:',
    aboutZeffy: 'About Zeffy:',
    zeffyConfirmationNote: 'ISRS uses Zeffy, a 100% free payment platform for nonprofits. Zeffy may ask if you\'d like to add an',
    optionalTip: 'optional tip',
    zeffyTipNote: '- you can choose $0 or any amount. This tip goes to Zeffy, not ISRS.',
    payNowWithZeffy: 'Pay Now with Zeffy',
    emailConfirmationNote: 'You will receive a confirmation email once your payment is processed.',
    transferExactAmount: 'Transfer the exact amount shown above',
    includeRegNumber: 'Include your registration number',
    inTransferReference: 'in the transfer reference',
    emailProofOfTransfer: 'Email proof of transfer to',
    confirmationAfterPayment: 'Your registration will be confirmed once payment is received (typically 3-5 business days)',

    // What's Next
    whatsNext: 'What\'s Next?',
    completePaymentButton: 'Complete your payment using the button above',
    checkEmailConfirmation: 'Check your email for registration confirmation',
    abstractSubmissionOpens: 'Abstract submission opens April 1, 2026',
    submitAbstract: 'Submit your presentation abstract (if applicable)',
    bookTravel: 'Book your travel and accommodation',
    seeYouAt: 'Join us June 15-18, 2026!',

    // Profile Dashboard Access
    yourProfileDashboard: 'Your Profile Dashboard',
    accessDashboardDescription: 'Access your personalized dashboard to view all your registrations, manage your information, and track your conference activity.',
    accessYourProfile: 'Access Your Profile',
    submitYourAbstract: 'Submit Your Abstract',
    secureAccess: 'Secure Access:',
    secureAccessDescription: 'We use magic link authentication - no passwords needed! Check your email',
    magicLinkExpiry: 'for a secure login link that expires in 15 minutes.',
    fromDashboardYouCan: 'From your dashboard you can:',
    viewAllRegistrations: 'View all your conference registrations',
    submitManageAbstracts: 'Submit and manage multiple abstracts',
    updateContactInfo: 'Update your contact information',
    trackPaymentStatus: 'Track your payment status',

    // Social Sharing
    spreadTheWord: 'Spread the Word!',
    spreadTheWordDescription: 'Help us grow the shellfish restoration community! Share this conference with colleagues, friends, and family who care about marine conservation.',
    shareOnTwitter: 'Share on X',
    shareOnLinkedIn: 'Share on LinkedIn',
    shareOnFacebook: 'Share on Facebook',
    inviteByEmail: 'Invite Colleagues by Email',
    inviteByEmailDescription: 'Enter email addresses of colleagues who might be interested in attending:',
    add: 'Add',
    sendInvitations: 'Send Invitations',
    invitationsSent: 'Invitations sent successfully!',

    // Questions & Support
    questionsContact: 'Questions? Contact us at',

    // Error Messages
    invalidRegistrationLink: 'Invalid registration link. Please check your email or contact support.',
    unableToLoadRegistration: 'Unable to load registration details. Please contact support with your registration number.',
    pleaseEnterDiscountCode: 'Please enter a discount code',
    selectRegistrationTypeFirst: 'Please select a registration type first',
    invalidDiscountCode: 'Invalid discount code',
    failedToValidateDiscount: 'Failed to validate discount code. Please try again.',
    fillRequiredFields: 'Please fill in all required fields (marked with *)',
    enterValidEmail: 'Please enter a valid email address',
    selectPaymentMethodError: 'Please select a payment method',
    registrationFailed: 'Registration failed. Please try again.',

    // Success Messages
    registrationCreatedSuccess: 'Registration created successfully! Redirecting to payment...',
    registrationCreatedInstructions: 'Registration created successfully! Redirecting to payment instructions...',

    // ========== ABOUT PAGE ==========
    // About - Hero
    aboutHeroHeading: 'About ISRS',
    aboutHeroSubtitle: 'The International Shellfish Restoration Society supports the global shellfish restoration community through collaboration, innovation, and knowledge exchange.',

    // About - Who We Are
    aboutWhoWeAre: 'Who We Are',
    aboutWhoWeAreText: 'The International Shellfish Restoration Society (ISRS) is a 501(c)(3) nonprofit organization (pending IRS approval) established in 2024 to support the global shellfish restoration community. We emerged from the International Conference on Shellfish Restoration (ICSR), which has convened the restoration community since its founding in 1996.',

    // About - Mission & Vision
    aboutMission: 'Mission',
    aboutMissionText: 'To build community, facilitate communication, and promote innovation within the shellfish restoration community worldwide.',
    aboutVision: 'Vision',
    aboutVisionText: 'A future where healthy shellfish ecosystems support resilient coasts, thriving marine life, and sustainable communities across the globe.',

    // About - Core Values
    aboutCoreValuesHeading: 'Our Core Values',
    aboutCoreValuesIntro: 'ISRS operates guided by six foundational principles that shape our work and community:',
    aboutValueScience: 'Science-Based Approach',
    aboutValueScienceDesc: 'We apply rigorous research to inform restoration practices and decision-making.',
    aboutValueCollaborative: 'Collaborative Partnerships',
    aboutValueCollaborativeDesc: 'We believe in the power of working together across sectors, disciplines, and borders.',
    aboutValueInclusive: 'Inclusive Participation',
    aboutValueInclusiveDesc: 'We welcome diverse perspectives from scientists, practitioners, Indigenous communities, policymakers, and industry.',
    aboutValueInnovation: 'Innovation',
    aboutValueInnovationDesc: 'We promote creative problem-solving and new restoration techniques and technologies.',
    aboutValueImpact: 'Impact-Driven',
    aboutValueImpactDesc: 'We focus on measurable outcomes that benefit shellfish populations, ecosystems, and communities.',
    aboutValueSustainability: 'Sustainability',
    aboutValueSustainabilityDesc: 'We champion restoration approaches that support long-term ecological health and resilience.',

    // About - What We Do
    aboutWhatWeDo: 'What We Do',
    aboutHostICR: 'Host ICSR Conference',
    aboutHostICRDesc: 'We organize the biennial International Conference on Shellfish Restoration, bringing together 300+ participants from 20+ countries to share research, best practices, and new innovations.',
    aboutFacilitateNetworking: 'Facilitate Networking',
    aboutFacilitateNetworkingDesc: 'We connect restoration practitioners worldwide through year-round communication channels, working groups, and knowledge-sharing.',
    aboutSupportRegional: 'Support Regional Networks',
    aboutSupportRegionalDesc: 'We collaborate with regional restoration networks across North America, Europe, Asia, Australia, and beyond to advance local restoration initiatives.',
    aboutPromoteKnowledge: 'Promote Knowledge Exchange',
    aboutPromoteKnowledgeDesc: 'We facilitate the sharing of restoration techniques, research findings, and lessons learned across the global community.',
    aboutEngageDiverse: 'Engage Diverse Stakeholders',
    aboutEngageDiverseDesc: 'We bring together researchers, managers, conservationists, Indigenous groups, industry partners, and policymakers for collaborative dialogue.',
    aboutAdvanceInnovation: 'Advance Innovation',
    aboutAdvanceInnovationDesc: 'We support the development and dissemination of new restoration approaches, technologies, and strategies.',

    // About - Our Community
    aboutCommunityHeading: 'Our Community',
    aboutCommunityIntro: 'ISRS brings together a diverse global community dedicated to shellfish restoration:',
    aboutCommunityScientists: 'Research Scientists',
    aboutCommunityScientistsDesc: 'Advancing restoration science and monitoring',
    aboutCommunityPractitioners: 'Restoration Practitioners',
    aboutCommunityPractitionersDesc: 'Implementing on-the-ground projects',
    aboutCommunityManagers: 'Resource Managers',
    aboutCommunityManagersDesc: 'Managing shellfish populations and habitats',
    aboutCommunityOrgs: 'Conservation Organizations',
    aboutCommunityOrgsDesc: 'Protecting coastal ecosystems',
    aboutCommunityIndigenous: 'Indigenous Communities',
    aboutCommunityIndigenousDesc: 'Stewarding traditional shellfish resources',
    aboutCommunityIndustry: 'Industry Partners',
    aboutCommunityIndustryDesc: 'Promoting sustainable aquaculture',
    aboutCommunityPolicy: 'Policymakers',
    aboutCommunityPolicyDesc: 'Developing restoration-friendly policies',
    aboutCommunityStudents: 'Students & Educators',
    aboutCommunityStudentsDesc: 'Training the next generation',

    // About - Strategic Partnerships
    aboutPartnershipsHeading: 'Strategic Partnerships',
    aboutPartnershipsIntro: 'ISRS collaborates with leading organizations to amplify our impact:',
    aboutPartnerNORA: 'Native Oyster Restoration Alliance (NORA)',
    aboutPartnerNORADesc: 'Partnership focused on advancing oyster restoration across North America through shared resources, knowledge exchange, and coordinated initiatives.',
    aboutPartnerAustralasia: 'Australasian Coastal Restoration Network',
    aboutPartnerAustralasiaDesc: 'Collaboration to connect restoration practitioners across Australia, New Zealand, and the Pacific region, sharing innovations in shellfish and coastal restoration.',

    // ========== ICSR PAGE ==========
    // ICSR - Hero
    icsrHeroHeading: 'International Conference on Shellfish Restoration',
    icsrHeroSubtitle: 'The premier global gathering for shellfish restoration science and practice since 1996',
    icsrCTA2026: 'ICSR2026 - Puget Sound',

    // ICSR - About
    icsrAboutHeading: 'About ICSR',
    icsrAboutText1: 'Since 1996, the International Conference on Shellfish Restoration has convened the global restoration community every two years. ICSR brings together 300+ participants from 20+ countries, creating unparalleled opportunities for knowledge exchange, collaboration, and innovation.',
    icsrAboutText2: 'The conference features cutting-edge research presentations, interactive workshops, field visits, panel discussions, and networking events that advance the science and practice of shellfish restoration worldwide.',

    // ICSR - Who Attends
    icsrWhoAttendsHeading: 'Who Attends ICSR',
    icsrAttendeeScientists: 'Research Scientists',
    icsrAttendeeScientistsDesc: 'Leading researchers presenting the latest findings in shellfish ecology, restoration techniques, and ecosystem services.',
    icsrAttendeePractitioners: 'Restoration Practitioners',
    icsrAttendeePractitionersDesc: 'On-the-ground experts sharing lessons learned and innovative approaches from real-world projects.',
    icsrAttendeeManagers: 'Resource Managers',
    icsrAttendeeManagersDesc: 'Government officials and natural resource managers developing restoration policies and programs.',
    icsrAttendeeOrgs: 'Conservation Organizations',
    icsrAttendeeOrgsDesc: 'NGOs and nonprofits leading restoration initiatives across coastal ecosystems.',
    icsrAttendeeIndigenous: 'Indigenous Groups',
    icsrAttendeeIndigenousDesc: 'Traditional knowledge holders and stewards of shellfish resources and coastal habitats.',
    icsrAttendeeStudents: 'Students',
    icsrAttendeeStudentsDesc: 'Graduate students and early-career researchers building the next generation of restoration expertise.',

    // ICSR - Conference Activities
    icsrActivitiesHeading: 'Conference Activities',
    icsrActivityResearch: 'Research Presentations',
    icsrActivityResearchDesc: 'Oral presentations and lightning talks showcasing the latest research on oyster population dynamics, habitat assessment, urban restoration, species interactions, and restoration monitoring.',
    icsrActivityWorkshops: 'Interactive Workshops',
    icsrActivityWorkshopsDesc: 'Hands-on sessions covering restoration techniques, monitoring protocols, data analysis, stakeholder engagement, and project planning.',
    icsrActivityFieldTrips: 'Field Trips',
    icsrActivityFieldTripsDesc: 'Site visits to active restoration projects, providing firsthand experience with local restoration approaches and challenges.',
    icsrActivityPanels: 'Panel Discussions',
    icsrActivityPanelsDesc: 'Expert panels addressing policy, funding, partnerships, climate adaptation, and emerging restoration challenges.',
    icsrActivityPosters: 'Poster Sessions',
    icsrActivityPostersDesc: 'Evening poster presentations allowing in-depth discussions of research and restoration projects.',
    icsrActivityNetworking: 'Networking Events',
    icsrActivityNetworkingDesc: 'Welcome receptions, banquets, and social activities fostering connections across the global community.',

    // ICSR - Conference History
    icsrHistoryHeading: 'Conference History',
    icsrHistoryIntro: 'ICSR has convened biannually since 1996, spanning four continents and bringing together thousands of restoration professionals over nearly three decades.',
    icsr2020s: '2020s',
    icsr2010s: '2010s',
    icsr2000s: '2000s',
    icsr1990s: '1990s',

    // ICSR - Code of Conduct
    icsrCodeOfConduct: 'Code of Conduct',
    icsrCodeIntro: 'ICSR is committed to providing a respectful, inclusive, and welcoming environment for all participants. We maintain a zero-tolerance policy for harassment and inappropriate behavior.',
    icsrCodeExpectations: 'Our Expectations',
    icsrCodeReporting: '<strong>Reporting:</strong> Participants who experience or witness harassment should contact conference organizers at <a href="mailto:info@shellfish-society.org" style="color: var(--primary-blue);">info@shellfish-society.org</a>',

    // ========== ICSR2026 PAGE ==========
    // ICSR2026 - Hero
    icsr2026SaveDateHeading: 'SAVE THE DATE!',
    icsr2026HeroHeading: 'ICSR2026',
    icsr2026HostedBy: 'Hosted by <a href="https://restorationfund.org/" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">Puget Sound Restoration Fund</a>',
    icsr2026Location: 'Puget Sound, Washington State',
    icsr2026LocationDates: 'Puget Sound, Washington State<br>October 5-8, 2026',
    icsr2026Dates: 'October 5-8, 2026',
    icsr2026DateRange: 'October 5-8, 2026',

    // ICSR2026 - Overview
    icsr2026OverviewHeading: 'Join Us in the Pacific Northwest',
    icsr2026OverviewText1: 'The 2026 International Conference on Shellfish Restoration will bring together the global restoration community for four days of cutting-edge research, practical workshops, and invaluable networking with restoration practitioners from around the world.',
    icsr2026OverviewText2: 'Set in the spectacular Puget Sound region, ICSR2026 will explore the intersection of traditional ecological knowledge, modern restoration science, and community-based conservation.',
    icsr2026OverviewText3: 'The conference will open with a <strong>Traditional Coast Salish welcome ceremony</strong>, honoring the deep cultural connections between the Squaxin Island people and shellfish resources.',
    icsr2026MailingListCTA: 'Join Mailing List for Updates',
    icsr2026JoinMailingList: 'Join Mailing List for Updates',

    // ICSR2026 - Important Dates
    icsr2026DatesHeading: 'Important Dates',
    icsr2026ConferenceDates: 'Conference Dates',
    icsr2026DownloadICS: 'Download .ics',
    icsr2026GoogleCalendar: 'Google Calendar',
    icsr2026Outlook: 'Outlook',
    icsr2026AbstractDeadline: 'Abstract Deadline',
    icsr2026ComingSoon: 'Coming Soon',
    icsr2026EarlyBird: 'Early Bird Registration',
    icsr2026Early2026: 'Early 2026',
    icsr2026HotelBooking: 'Hotel Booking',
    icsr2026InfoTBA: 'Information TBA',

    // ICSR2026 - What to Expect
    icsr2026WhatToExpect: 'What to Expect',
    icsr2026ExpectHeading: 'What to Expect',
    icsr2026ExpectResearch: 'Cutting-Edge Research',
    icsr2026ExpectResearchDesc: 'Oral presentations and lightning talks on oyster dynamics, habitat monitoring, urban restoration, species interactions, reef structures, and climate adaptation',
    icsr2026ExpectWorkshops: 'Hands-On Workshops',
    icsr2026ExpectWorkshopsDesc: 'Interactive sessions on restoration planning, monitoring protocols, community engagement, traditional knowledge, funding, and data analysis',
    icsr2026ExpectFieldTrips: 'Field Trips',
    icsr2026ExpectFieldTripsDesc: 'Site visits to Tribal restoration sites, Puget Sound oyster reefs, urban shoreline projects, Olympia oyster recovery, and geoduck restoration',
    icsr2026ExpectNetworking: 'Networking',
    icsr2026ExpectNetworkingDesc: 'Welcome reception, poster sessions, conference banquet, regional network meetings, and informal gatherings throughout the week',

    // ICSR2026 - Planned Sessions
    icsr2026SessionsHeading: 'Planned Sessions & Themes',
    icsr2026SessionsIntro: 'Conference programming is in development. Planned sessions include:',

    // ICSR2026 - Venue
    icsr2026VenueHeading: 'Conference Venue at Squaxin Island Tribe Territory',
    icsr2026VenueText1: 'ICSR2026 will be held at the <a href="https://littlecreek.com/" target="_blank" rel="noopener noreferrer">Little Creek Resort and Conference Center</a>, operated by the Squaxin Island Tribe in Shelton, Washington. The Squaxin Island people\'s ancestral territory includes much of southern Puget Sound, and they have been stewards of shellfish resources for thousands of years, maintaining deep cultural and spiritual connections to clams, oysters, and other shellfish.',
    icsr2026VenueText2: 'Today, the Tribe continues this tradition through active shellfish management, restoration programs, and aquaculture operations, integrating traditional ecological knowledge with modern conservation science. ICSR2026 will provide unique opportunities to learn from Tribal restoration practitioners and experience Indigenous approaches to shellfish stewardship.',

    // ICSR2026 - Why Puget Sound
    icsr2026WhyPugetSound: 'Why Puget Sound?',
    icsr2026WhyHeading: 'Why Puget Sound?',
    icsr2026WhyPugetSoundIntro: 'Puget Sound is a global hotspot for shellfish restoration innovation<br>with deep cultural connections to shellfish:',
    icsr2026WhyIntro: 'Puget Sound is a global hotspot for shellfish restoration innovation with deep cultural connections to shellfish:',
    icsr2026WhyDiverseSpecies: '🌊 Diverse Species',
    icsr2026WhySpecies: 'Diverse Species',
    icsr2026WhyDiverseSpeciesDesc: 'Home to native Olympia oysters, Pacific oysters, geoduck clams, Manila clams, and numerous other shellfish species.',
    icsr2026WhySpeciesDesc: 'Home to native Olympia oysters, Pacific oysters, geoduck clams, Manila clams, and numerous other shellfish species.',
    icsr2026WhyResearch: 'Research Excellence',
    icsr2026WhyResearchDesc: 'Leading universities and research institutions advancing shellfish science and restoration techniques.',
    icsr2026WhyTribal: 'Tribal Leadership',
    icsr2026WhyTribalDesc: 'Coast Salish Tribes leading innovative restoration programs rooted in traditional knowledge.',
    icsr2026WhyActiveRestoration: '🦪 Active Restoration',
    icsr2026WhyRestoration: 'Active Restoration',
    icsr2026WhyActiveRestorationDesc: 'Dozens of ongoing restoration projects addressing water quality, habitat loss, and climate change.',
    icsr2026WhyRestorationDesc: 'Dozens of ongoing restoration projects addressing water quality, habitat loss, and climate change.',
    icsr2026WhyPolicy: 'Policy Innovation',
    icsr2026WhyPolicyDesc: 'Progressive shellfish management and restoration policies serving as models for other regions.',
    icsr2026WhyEcosystem: 'Ecosystem Focus',
    icsr2026WhyEcosystemDesc: 'Holistic approaches integrating shellfish restoration with broader coastal ecosystem recovery.',

    // ICSR2026 - Expected Attendance
    icsr2026ExpectedAttendance: 'Expected Attendance',
    icsr2026AttendanceHeading: 'Expected Attendance',
    icsr2026ExpectedParticipants: '350+',
    icsr2026ExpectedCountries: '25+',
    icsr2026ExpectedPresentations: '150+',
    icsr2026ParticipantsLabel: 'Participants',
    icsr2026Participants: 'Participants',
    icsr2026CountriesLabel: 'Countries',
    icsr2026Countries: 'Countries',
    icsr2026PresentationsLabel: 'Presentations',
    icsr2026Presentations: 'Presentations',

    // ICSR2026 - Registration & Sponsorship
    icsr2026RegistrationHeading: 'Registration',
    icsr2026RegistrationText: 'Registration will open in early 2026. Sign up for updates to be notified when registration becomes available.',
    icsr2026RequestUpdates: 'Request Updates',
    icsr2026SponsorshipHeading: 'Sponsorship Opportunities',
    icsr2026SponsorshipText: 'Support ICSR2026 and connect with the global shellfish restoration community. Sponsorship opportunities include event support (field trips, reception, banquet) and student travel grants.',
    icsr2026InquireSponsorship: 'Inquire About Sponsorship',

    // ICSR2026 - Sponsors
    icsr2026SponsorsHeading: 'Conference Sponsors',
    icsr2026SponsorsIntro: 'We gratefully acknowledge our sponsors who make ICSR2026 possible through their generous support.',
    icsr2026SponsorPSRF: 'Puget Sound Restoration Fund',
    icsr2026HostOrganization: 'Host Organization',
    icsr2026SponsorTNC: 'The Nature Conservancy - California',
    icsr2026SponsorLevel: '$5,000 Sponsor',
    icsr2026SponsorTNCWA: 'The Nature Conservancy - Washington',
    icsr2026SponsorLevelWA: '$2,000 Sponsor',

    // ICSR2026 - Code of Conduct
    icsr2026CodeOfConduct: 'Code of Conduct',
    icsr2026CodeHeading: 'Code of Conduct',
    icsr2026CodeText: 'ICSR2026 is committed to providing a respectful, inclusive, and welcoming environment for all participants. We maintain a zero-tolerance policy for harassment and inappropriate behavior. All attendees are expected to treat each other with respect, welcome diverse perspectives, and refrain from unauthorized photography or recording.',
    icsr2026CodeContact: '<strong>Questions or concerns?</strong> Contact us at <a href="mailto:info@shellfish-society.org" style="color: var(--primary-blue);">info@shellfish-society.org</a>',

    // ICSR2026 - Mailing List Modal
    icsr2026ModalCloseAriaLabel: 'Close mailing list modal',
    icsr2026ModalTitle: 'Join Our Mailing List',
    icsr2026ModalSubtitle: 'Stay updated on ICSR2026 registration, abstract submissions, and conference details.',
    icsr2026ModalFirstName: 'First Name',
    icsr2026ModalLastName: 'Last Name',
    icsr2026ModalEmail: 'Email',
    icsr2026ModalOrganization: 'Organization',
    icsr2026ModalNote: 'Note (Optional)',
    icsr2026ModalNotePlaceholder: 'Add any additional information or questions about ICSR2026...',
    icsr2026ModalCancel: 'Cancel',
    icsr2026ModalSubmit: 'Join Mailing List',
    icsr2026ModalSuccess: '✓ Success!',
    icsr2026ModalSuccessText: 'Thank you for joining our mailing list. We\'ll keep you updated on ICSR2026.',
    icsr2026ModalClose: 'Close',
    icsr2026ModalErrorMessage: 'There was an error submitting your information. Please try again or contact us directly at info@shellfish-society.org',

    // ========== GALLERY PAGE ==========
    // Gallery - Header
    galleryHeading: 'Photo Gallery',
    gallerySubtitle: 'Explore photos from shellfish restoration projects, research, and events from ISRS and the global restoration community',
    galleryDescription: 'Explore photos from shellfish restoration projects, research, and events from ISRS and the global restoration community',

    // Gallery - Search & Filters
    gallerySearchFilterHeading: '🔍 Search & Filter',
    gallerySearchLabel: 'Text Search',
    gallerySearchPlaceholder: 'Caption, tags, location...',
    galleryAISearchLabel: 'AI Visual Search',
    galleryAISearchPlaceholder: 'Describe the scene...',
    galleryConferenceLabel: 'Conference/Event',
    galleryAllEvents: 'All Events',
    galleryPhotoTypeLabel: 'Photo Type',
    galleryAllTypes: 'All Types',
    galleryTypeConference: 'Conference Photos',
    galleryTypeHistoric: 'Historic Photos',
    galleryTypeHeadshots: 'Headshots/People',
    galleryTypeLogos: 'Logos',
    galleryTypeBackgrounds: 'Backgrounds',
    galleryLocationLabel: 'Location',
    galleryAllLocations: 'All Locations',
    galleryYearLabel: 'Year',
    galleryAllYears: 'All Years',
    gallerySortByLabel: 'Sort By',
    gallerySortDateNewest: 'Date (Newest First)',
    gallerySortDateOldest: 'Date (Oldest First)',
    gallerySortAlphaAZ: 'Alphabetical (A-Z)',
    gallerySortAlphaZA: 'Alphabetical (Z-A)',
    gallerySortCategory: 'Category',
    gallerySortPhotographer: 'Photographer',
    gallerySearchButton: 'Search',
    galleryClearButton: 'Clear',
    galleryShowingAll: 'Showing all photos',
    galleryDownloadButton: '📥 Download Filtered Photos',
    galleryDownloadDesc: 'Download all visible photos as ZIP',
    galleryUploadButton: '📤 Upload Photos',
    galleryUploadHeading: 'Share Your Photos',
    galleryUploadDescription: 'Upload photos from your restoration projects, field work, or events. Our AI will help analyze and tag your images.',
    galleryFeaturedHeading: '⭐ Featured',
    galleryFeaturedICSR2024: 'ICSR 2024',
    galleryFeaturedICSR2024Desc: 'Jekyll Island • 92 photos',
    galleryLegalHeading: '📄 Legal',
    galleryLegalNotice: '<strong>Copyright Notice:</strong> Photos copyright ISRS, akorn environmental, and contributors. All rights reserved.',
    galleryLegalViewTerms: 'View full terms',
    galleryKeyboardShortcuts: '⌨️ Keyboard Shortcuts',
    galleryLoading: 'Loading gallery...',

    // Gallery - Legal Notice
    galleryLegalHeading: 'Copyright Notice',
    galleryLegalText: 'Photos are copyright their respective owners (ISRS, akorn environmental, and individual contributors). All rights reserved. Unauthorized use, reproduction, or distribution is prohibited.',
    galleryViewTerms: 'View full terms',

    // Gallery - Lightbox
    galleryDownload: 'Download',
    galleryFavorite: 'Favorite',
    galleryShare: 'Share',
    galleryPhotoDetails: 'Photo Details',
    galleryRelatedPhotos: 'Related Photos',
    galleryComments: 'Comments',
    galleryAddComment: 'Add a comment...',
    galleryPostComment: 'Post Comment',
    galleryNoComments: 'No comments yet. Be the first!',

    // Gallery - Metadata Labels
    galleryFilename: 'Filename',
    galleryDateTaken: 'Date Taken',
    galleryCamera: 'Camera',
    galleryLens: 'Lens',
    galleryFocalLength: 'Focal Length',
    galleryAperture: 'Aperture',
    galleryShutterSpeed: 'Shutter Speed',
    galleryISO: 'ISO',
    galleryViews: 'Views',

    // Gallery - Messages
    galleryFavoriteSuccess: 'Added to your favorites!',
    galleryCommentSuccess: 'Comment posted!',
    galleryLoginRequired: 'Please log in to comment',
    galleryLoginFavorite: 'Please log in to save favorites',
    galleryLinkCopied: 'Link copied to clipboard!',
    galleryDownloadConfirm: 'Download {count} photos as ZIP file?',
    galleryDownloadStarted: 'Download started!',
    galleryDownloadFailed: 'Download failed. Please try again or contact support.',
    galleryNoPhotos: 'No photos to download',
    galleryLoadingMore: 'Loading more photos...',
    galleryNoMore: 'You\'ve reached the end!',

    // Gallery - Keyboard Shortcuts
    galleryShortcutsHeading: 'Keyboard Shortcuts',
    galleryShortcutHelp: 'Show/hide this help',
    galleryShortcutNext: 'Next photo',
    galleryShortcutPrev: 'Previous photo',
    galleryShortcutClose: 'Close lightbox',
    galleryShortcutZoomIn: 'Zoom in',
    galleryShortcutZoomOut: 'Zoom out',
    galleryShortcutZoomReset: 'Reset zoom',
    galleryShortcutFullscreen: 'Toggle fullscreen',
    galleryShortcutSearch: 'Focus search',

    // Gallery - Empty States
    galleryNoPhotosFound: 'No Photos Found',
    galleryNoPhotosMessage: 'No photos match your current filters. Try adjusting your search criteria.',
    galleryComingSoonHeading: 'Gallery Coming Soon',
    galleryComingSoonMessage: 'Check back later for photos from our restoration projects and events.',

    // ========== SUPPORT PAGE ==========
    // Support - Hero
    supportHeroHeading: 'Support ISRS',
    supportHeroSubtitle: 'Building Global Resilience Through Marine Ecosystem Restoration',

    // Support - Opportunity
    supportOpportunityHeading: 'The Critical Opportunity',
    supportOpportunityText: 'Molluscan shellfish ecosystems provide some of nature\'s most powerful solutions to our most pressing challenges. A single oyster filters 50 gallons of water daily. Shellfish reefs protect coastlines from storm surge and sea level rise. These ecosystems support biodiversity, sequester carbon, and sustain coastal communities—yet we\'ve lost up to 85% of them globally.',
    supportOpportunityBox: 'ISRS exists to reverse this trend',
    supportOpportunityBoxText: 'By unifying the global restoration community, advancing scientific understanding, and scaling successful restoration approaches worldwide. Our flagship initiative is the biennial International Conference on Shellfish Restoration (ICSR)—the world\'s premier gathering for molluscan shellfish restoration since 1996.',

    // Support - Stats
    support50Gallons: 'Gallons filtered daily per oyster',
    support85Loss: 'Global shellfish loss',
    support300Plus: 'ICSR practitioners',
    support20Countries: 'Countries represented',

    // Support - Urgent Need
    supportUrgentHeading: 'Urgent Need: Federal Funding Crisis',
    supportUrgentText: 'Recent federal budget changes have created unprecedented challenges for molluscan shellfish restoration:',
    supportUrgentConclusion: 'The molluscan shellfish restoration community has responded with remarkable resilience. ISRS strengthens this community, connecting practitioners with diverse funding sources and ensuring restoration momentum continues despite federal challenges.',

    // Support - Partnership Opportunities
    supportPartnerHeading: 'Partnership Opportunities',
    supportPartnerIntro: 'ISRS welcomes partners at all levels who share our commitment to healthy marine ecosystems.',

    supportFoundations: 'For Foundations',
    supportFoundationsDesc: 'Strategic investment in proven nature-based climate solutions with global impact potential.',
    supportFoundationsImpact: 'Your Impact',
    supportFoundationsLevels: 'Investment Levels:',

    supportCorporations: 'For Corporations',
    supportCorporationsDesc: 'Demonstrate environmental leadership while delivering concrete ESG benefits.',
    supportCorporationsImpact: 'Your Impact',
    supportCorporationsLevels: 'Partnership Levels:',

    supportGovernment: 'For Government',
    supportGovernmentDesc: 'Multilateral collaboration for coastal resilience and sustainable resource management.',
    supportGovernmentImpact: 'Your Impact',
    supportGovernmentLevels: 'Partnership Levels:',

    supportAcademia: 'For Academia',
    supportAcademiaDesc: 'Advance scientific understanding through global collaboration.',
    supportAcademiaImpact: 'Your Impact',
    supportAcademiaLevels: 'Partnership Levels:',

    supportIndustry: 'For Industry',
    supportIndustryDesc: 'Protect the marine resources your business depends on.',
    supportIndustryImpact: 'Your Impact',
    supportIndustryLevels: 'Partnership Levels:',

    supportIndividual: 'For Individual Donors',
    supportIndividualDesc: 'Join the global restoration movement at any level.',
    supportIndividualLevels: 'Membership Levels',

    // Support - Programs
    supportProgramsHeading: 'Programs Delivering Global Impact',
    supportProgramICR: 'Biennial ICSR Conference',
    supportProgramICRDesc: 'The world\'s premier gathering for molluscan shellfish restoration, bringing together 300+ practitioners from 20+ countries to share breakthrough science and successful restoration approaches. ICSR2026 will be held October 5-8, 2026, at the <a href="https://littlecreek.com/" target="_blank" rel="noopener noreferrer">Little Creek Resort and Conference Center</a>, operated by the Squaxin Island Tribe in Shelton, Washington.',
    supportProgramNetwork: 'Global Professional Network',
    supportProgramNetworkDesc: 'Year-round engagement connecting restoration practitioners worldwide through forums, webinars, and collaborative initiatives addressing shared challenges.',
    supportProgramResearch: 'Research & Innovation Support',
    supportProgramResearchDesc: 'Facilitating collaborative research, documenting best practices, and supporting student engagement in restoration science.',
    supportProgramPolicy: 'Policy & Advocacy',
    supportProgramPolicyDesc: 'Advancing science-based restoration policies and connecting practitioners with funding opportunities and regulatory support.',

    // Support - Feedback
    supportFeedbackHeading: 'Share Your Feedback',
    supportFeedbackIntro: 'Have suggestions or questions about our partnership opportunities? We\'d love to hear from you.',
    supportFirstName: 'First Name',
    supportLastName: 'Last Name',
    supportEmail: 'Email',
    supportOrganization: 'Organization',
    supportInquiryType: 'Inquiry Type',
    supportMessage: 'Message',
    supportSend: 'Send Message',

    // Support - Inquiry Types
    supportGeneral: 'General Inquiry',
    supportFoundationPartner: 'Foundation Partnership',
    supportCorporatePartner: 'Corporate Partnership',
    supportGovernmentPartner: 'Government Partnership',
    supportAcademicPartner: 'Academic Partnership',
    supportIndividualDonation: 'Individual Donation',
    supportOther: 'Other',

    // Support - CTA
    supportCTAHeading: 'Join Us',
    supportCTAText: 'Together, we can build resilient coasts and healthy oceans for future generations through the power of molluscan shellfish restoration.',
    supportContactPartnership: 'Contact Us About Partnership',
    supportViewPressKit: 'View Press Kit',

    // Member Portal - Welcome
    welcomeToISRS: 'Welcome to ISRS!',
    welcomeMessageExisting: 'We\'re so glad you\'re here! We have your information from ICSR %YEARS%. Please review and complete your profile below.',
    welcomeMessageNew: 'We\'re excited to have you join the ISRS community! Please complete your profile to get started.',
    profileCompletionPrompt: 'Complete your profile to connect with other members and unlock all features',
    firstNameRequired: 'First Name *',
    lastNameRequired: 'Last Name *',
    countryRequired: 'Country *',
    cityLabel: 'City',
    emailCannotBeChanged: 'Email cannot be changed',
    organizationRequired: 'Organization *',
    positionTitleLabel: 'Position/Title',
    departmentLabel: 'Department',
    bioLabel: 'Bio / About Me',
    bioPlaceholder: 'Tell us about your work in shellfish restoration...',
    researchAreasLabel: 'Research Areas',
    researchAreasPlaceholder: 'E.g., oyster reef restoration, water quality, habitat assessment...',
    separateWithCommas: 'Separate multiple areas with commas',
    yourConferenceHistory: 'Your ICSR Conference History',
    privacyDirectorySettings: 'Privacy & Directory Settings',
    memberDirectoryHeading: 'Member Directory',
    memberDirectoryDescription: 'The ISRS member directory helps connect researchers, practitioners, and stakeholders working in shellfish restoration worldwide.',
    includeInDirectory: 'Include me in the public member directory',
    chooseVisibleFields: 'Choose what information to show in the directory:',
    nameRequiredField: 'Name (required)',
    organizationField: 'Organization',
    positionField: 'Position/Title',
    countryField: 'Country',
    cityField: 'City',
    bioField: 'Bio',
    researchAreasField: 'Research Areas',
    conferenceHistoryField: 'Conference History',
    privacyTermsHeading: 'Privacy & Terms *',
    privacyConsentText: 'I have read and agree to the <a href="/privacy-policy.html" target="_blank">Privacy Policy</a> and consent to ISRS collecting and processing my personal data as described.',
    termsConsentText: 'I agree to the ISRS Terms of Service and understand that this profile will be used for networking and conference purposes.',
    yourPrivacyRights: 'Your Privacy Rights:',
    privacyRightsText: 'You can request a copy of your data, update your information, or request account deletion at any time from your profile settings. We will never sell your data to third parties.',
    completeProfileContinue: 'Complete Profile & Continue',
    fieldsMarkedRequired: 'Fields marked with * are required',
    mustAcceptTerms: 'You must accept the Privacy Policy and Terms of Service to continue.',
    savingProfile: 'Saving Profile...',
    failedToSave: 'Failed to save your profile. Please try again.',

    // Member Portal - Directory
    memberDirectory: 'Member Directory',
    directorySubtitle: 'Connect with researchers, practitioners, and stakeholders working in shellfish restoration worldwide',
    resultsCount: 'Showing %COUNT% members',
    searchLabel: 'Search',
    searchPlaceholder: 'Search members...',
    searchHint: '(name, organization, bio, research areas)',
    countryFilterLabel: 'Country',
    allCountries: 'All Countries',
    conferenceYearLabel: 'Conference Year',
    allYears: 'All Years',
    clearFiltersBtn: 'Clear Filters',
    loadingMembers: 'Loading members...',
    noMembersFound: 'No Members Found',
    tryAdjustingFilters: 'Try adjusting your search criteria or filters',
    joinISRSCommunity: 'Join the ISRS Community',
    connectColleagues: 'Connect with colleagues, share your research, and stay updated on shellfish restoration initiatives worldwide.',
    loginToProfile: 'Login to Your Profile',

    // Conference Registration
    confRegTitle: 'Conference Registration - ISRS 2026',
    confRegBackToConf: 'Back to Conference Info',
    confRegHeading: 'ISRS Conference 2026',
    confRegSubtitle: 'Register for the International Shellfish Restoration Society Conference',
    confRegDate: 'June 15-18, 2026',

    // Progress Steps
    confRegStep1: 'Your Profile',
    confRegStep2: 'Registration Details',
    confRegStep3: 'Sessions & Workshops',
    confRegStep4: 'Review & Payment',

    // Step 1: Profile
    confRegFirstName: 'First Name',
    confRegLastName: 'Last Name',
    confRegEmail: 'Email Address',
    confRegEmailHint: 'This will be your login email for accessing your registration',
    confRegOrganization: 'Organization',
    confRegPosition: 'Position/Title',
    confRegCountry: 'Country',
    confRegSelectCountry: 'Select country...',
    confRegState: 'State',
    confRegProvince: 'Province',
    confRegSelectState: 'Select state...',
    confRegSelectProvince: 'Select province...',
    confRegCity: 'City',
    confRegPhone: 'Phone Number',
    confRegBio: 'Professional Bio',
    confRegBioPlaceholder: 'Tell us about your work in shellfish restoration...',
    confRegBioHint: 'This will be visible in the attendee directory',
    confRegCV: 'CV/Resume Upload (Optional)',
    confRegCVLink: 'Or provide a link:',
    confRegResearchAreas: 'Research Areas (comma-separated)',
    confRegResearchPlaceholder: 'e.g., oyster restoration, water quality, climate adaptation',

    // Step 2: Registration Details
    confRegType: 'Registration Type',
    confRegSelectType: 'Select registration type...',
    confRegEarlyBird: 'Early Bird',
    confRegStudent: 'Student',
    confRegEarlyBirdNotice: '🎉 Early Bird pricing available now! Register before March 1, 2026 to save.',
    confRegDiscountCode: 'Discount Code (Optional)',
    confRegDiscountHint: 'Have a promo code? Enter it here to save on your registration!',
    confRegDiscountPlaceholder: 'Enter promo code (e.g., EARLYBIRD2026)',
    confRegApplyCode: 'Apply Code',
    confRegValidating: 'Validating...',
    confRegEnterCode: 'Please enter a discount code',
    confRegSelectTypeFirst: 'Please select a registration type first',
    confRegConfNotLoaded: 'Conference data not loaded. Please refresh the page.',
    confRegInvalidCode: 'Invalid discount code',
    confRegCodeFailed: 'Failed to validate discount code. Please try again.',
    confRegYouSavePercent: "You'll save %VALUE%% on your registration fee",
    confRegYouSaveAmount: "You'll save $%VALUE% on your registration fee",
    confRegRemoveCode: 'Remove discount code',

    confRegAttendanceType: 'Attendance Type',
    confRegInPerson: 'In-Person',
    confRegVirtual: 'Virtual',
    confRegFirstTime: 'This is my first ISRS conference',
    confRegPresenter: 'I plan to submit an abstract for presentation',

    confRegDietary: 'Dietary Restrictions',
    confRegDietaryNone: 'None',
    confRegVegetarian: 'Vegetarian',
    confRegVegan: 'Vegan',
    confRegGlutenFree: 'Gluten-Free',
    confRegDietaryOther: 'Other (specify below)',
    confRegDietaryNotes: 'Dietary Notes',
    confRegDietaryPlaceholder: 'Please specify any allergies or dietary requirements...',
    confRegAccessibility: 'Accessibility Needs',
    confRegAccessibilityPlaceholder: 'Please let us know if you require any accommodations...',

    confRegEmergencyName: 'Emergency Contact Name',
    confRegEmergencyEmail: 'Emergency Contact Email',
    confRegEmergencyPhone: 'Emergency Contact Phone',
    confRegEmergencyRelationship: 'Relationship',
    confRegEmergencyRelationshipPlaceholder: 'e.g., Spouse, Parent, Friend',
    confRegEmergencyAuth: 'I authorize ISRS conference administrators to contact my designated emergency contact in the event of a medical emergency or other urgent situation during the conference.',

    confRegSpecialEvents: 'Special Events & Activities',
    confRegSpecialEventsDesc: 'Select the special events and activities you\'d like to attend. Some events may have additional fees.',
    confRegWelcomeReception: 'Welcome Reception',
    confRegWelcomeReceptionDesc: 'Join us for the opening night reception (Included in registration)',
    confRegLowCountryBoil: 'Low Country Boil Dinner',
    confRegLowCountryBoilDesc: 'Traditional seafood feast with colleagues (Included in registration)',

    confRegFieldTrips: 'Field Trips',
    confRegFieldTripsDesc: 'Select all that interest you - limited capacity, additional fees may apply',
    confRegDolphinTours: 'Dolphin Watching Tours - Guided coastal wildlife tour',
    confRegSeaTurtleCenter: 'Sea Turtle Center Visit - Educational tour of conservation facility',
    confRegRestorationSiteTour: 'Local Restoration Site Tour - Visit active restoration projects',
    confRegGolfTournament: 'Golf Tournament',
    confRegGolfTournamentDesc: 'Networking golf tournament (Additional fee: $75)',

    confRegTshirtSize: 'Conference T-Shirt Size (Optional)',
    confRegNoTshirt: 'No t-shirt needed',
    confRegGuests: 'Bringing a Guest to Social Events?',
    confRegNoGuests: 'No guests',
    confRegOneGuest: '1 guest (+$150)',
    confRegTwoGuests: '2 guests (+$300)',
    confRegGuestsHint: 'Guests may attend social events and meals (additional fee applies)',

    confRegContinuingEd: 'Request Continuing Education Credits',
    confRegContinuingEdDesc: 'Society for Ecological Restoration (SER) CE credits',
    confRegLicenseNumber: 'Professional License Number (if applicable)',
    confRegLicenseNumberPlaceholder: 'e.g., PWS #12345',
    confRegLicensingOrg: 'Licensing Organization',
    confRegLicensingOrgPlaceholder: 'e.g., Society for Ecological Restoration',

    confRegAccommodation: 'Accommodation Preferences',
    confRegNeedsAccommodation: 'I need help booking accommodation',
    confRegRoomSharing: 'I\'m interested in sharing a room to reduce costs',
    confRegRoommatePrefs: 'Roommate Preferences/Notes',
    confRegRoommatePlaceholder: 'Any preferences for a roommate? Gender preference, quiet vs social, etc.',

    confRegAdditionalInfo: 'Additional Information',
    confRegWillingVolunteer: 'Willing to volunteer during the conference',
    confRegFirstTimeAttendee: 'This is my first ISRS/ICSR conference',
    confRegOptInMailing: 'Join ISRS mailing list',
    confRegOptInFuture: 'Receive updates about future conferences',

    // Step 3: Sessions
    confRegSelectSessions: 'Select Your Sessions & Workshops',
    confRegSessionsDesc: 'Choose the workshops and sessions you\'d like to attend. Some sessions have limited capacity and may have a waitlist. <strong>Session selection is optional</strong> - you can skip this step if you\'re not interested in specific sessions.',
    confRegLoadingSessions: 'Loading available sessions...',
    confRegNoSessions: 'No events are currently available for selection.',
    confRegCheckBack: 'Check back later or continue with your registration.',
    confRegSessionsError: 'Unable to load sessions',
    confRegSessionsErrorDesc: 'You can continue with registration and add sessions later, or try refreshing the page.',
    confRegContinueReview: 'Continue to Review',
    confRegDateTBD: 'Date To Be Determined',
    confRegAvailable: 'Available',
    confRegLimited: '%COUNT% spots left',
    confRegWaitlist: 'Waitlist',
    confRegFull: 'Full',
    confRegGuestsWelcome: 'Guests welcome (additional fee applies)',
    confRegFeePerPerson: 'Fee:',
    confRegSelected: 'Selected',
    confRegAlreadySignedUp: 'Already signed up',
    confRegAlreadySignedUpWaitlist: 'Already signed up (Waitlist)',

    // Step 4: Review & Payment
    confRegReviewPayment: 'Review & Payment',
    confRegSummary: 'Registration Summary',
    confRegName: 'Name:',
    confRegEmailLabel: 'Email:',
    confRegOrgLabel: 'Organization:',
    confRegNotSpecified: 'Not specified',
    confRegCountryLabel: 'Country:',
    confRegTypeLabel: 'Registration Type:',
    confRegAttendanceLabel: 'Attendance:',
    confRegSelectedSessions: 'Selected Sessions & Workshops',
    confRegDiscountApplied: 'Discount Applied',
    confRegCodeApplied: 'Discount code applied',
    confRegYouSave: 'You save:',
    confRegAdditionalFee: 'Additional fee:',

    confRegFeeSummary: 'Registration Fee',
    confRegTotal: 'Total',
    confRegPaymentMethod: 'Payment Method',
    confRegSelectPayment: 'Select payment method...',
    confRegOnlinePayment: 'Online Payment (Credit/Debit Card via Zeffy)',
    confRegBankTransfer: 'Bank Transfer',

    confRegZeffyTitle: '💳 Online Payment via Zeffy',
    confRegZeffyDesc1: 'ISRS uses Zeffy, a 100% free payment platform for nonprofits.',
    confRegZeffyDesc2: 'When you proceed to payment, you\'ll be redirected to Zeffy\'s secure checkout page.',
    confRegZeffyImportant: 'Important:',
    confRegZeffyTip: 'Zeffy may ask if you\'d like to add an optional tip to help keep their platform free for nonprofits like ISRS. <strong>This tip is completely optional</strong> and goes to Zeffy, not ISRS. You can choose "$0" or any amount you wish.',
    confRegZeffyFee: 'Your conference registration fee goes 100% to ISRS to support the conference and our mission.',

    confRegBankTitle: '🏦 Bank Transfer Instructions',
    confRegBankDesc: 'Please transfer the registration fee to the following ISRS bank account:',
    confRegBankName: 'Bank Name:',
    confRegAccountName: 'Account Name:',
    confRegAccountNumber: 'Account Number:',
    confRegRoutingACH: 'Routing Number (ACH/Direct Deposit):',
    confRegRoutingWire: 'Routing Number (Wire Transfer):',
    confRegSwiftCode: 'SWIFT Code:',
    confRegSwiftNote: '(for international wire transfers)',
    confRegBankImportant: 'Important:',
    confRegBankInstr1: 'Include your registration number in the transfer reference',
    confRegBankInstr2: 'Send proof of transfer to',
    confRegBankInstr3: 'Your registration will be confirmed once payment is received (typically 3-5 business days)',

    confRegAgreeTerms: 'I agree to the',
    confRegTermsLink: 'Terms and Conditions',
    confRegAgreePrivacy: 'I acknowledge the',
    confRegPrivacyLink: 'Privacy Policy',
    confRegAgreeCode: 'I agree to follow the',
    confRegCodeLink: 'Code of Conduct',

    confRegCompleteBtn: 'Complete Registration',
    confRegProcessing: 'Processing your registration...',
    confRegSelectPaymentError: 'Please select a payment method',
    confRegSuccess: 'Registration created successfully! Redirecting to payment...',
    confRegSuccessBank: 'Registration created successfully! Redirecting to payment instructions...',
    confRegFailed: 'Registration failed. Please try again.',

    // Validation messages
    confRegRequiredFields: 'Please fill in all required fields (marked with *)',
    confRegInvalidEmail: 'Please enter a valid email address',
    confRegSelectTypeError: 'Please select a registration type',
    confRegEventFull: 'This event is full.',
    confRegAlreadyRegistered: 'You are already signed up for this event.',

    // Welcome back message
    confRegWelcomeBack: 'Welcome back, %NAME%! We\'ve pre-filled your information. Please review and update as needed.',

    // Navigation buttons
    confRegBack: 'Back',
    confRegNext: 'Next',

    // Registration type labels
    confRegEarlyBirdLabel: 'Early Bird Registration',
    confRegStudentLabel: 'Student Registration',

    // Membership Join Page
    joinTitle: 'Join ISRS - Become a Member',
    joinHeading: 'Join the International Shellfish Restoration Society',
    joinSubtitle: 'Be part of a global community advancing shellfish restoration and marine conservation',
    joinBenefitsHeading: '🌊 Member Benefits',
    joinBenefit1: 'Access to exclusive research and publications',
    joinBenefit2: 'Discounted conference registration',
    joinBenefit3: 'Networking opportunities worldwide',
    joinBenefit4: 'Monthly newsletter and updates',
    joinBenefit5: 'Voting rights in board elections',
    joinBenefit6: 'Support global restoration efforts',

    joinSelectMembership: 'Select Your Membership',
    joinRegularMember: 'Regular Member',
    joinRegularPrice: '$50/year',
    joinRegularDesc: 'For professionals and researchers',
    joinStudentMember: 'Student Member',
    joinStudentPrice: '$25/year',
    joinStudentDesc: 'For students with valid ID',
    joinLifetimeMember: 'Lifetime Member',
    joinLifetimePrice: '$1,000',
    joinLifetimeDesc: 'One-time payment, lifetime access',
    joinCorporateMember: 'Corporate',
    joinCorporatePrice: '$500/year',
    joinCorporateDesc: 'For organizations (5 members)',

    joinPersonalInfo: 'Personal Information',
    joinProfessionalBg: 'Professional Background',
    joinResearchAreas: 'Research Areas/Interests',
    joinResearchPlaceholder: 'e.g., Oyster Restoration, Marine Ecology, Water Quality',
    joinResearchHint: 'Separate multiple areas with commas',
    joinBioLabel: 'Bio',
    joinBioPlaceholder: 'Tell us about your work and interests in shellfish restoration...',
    joinWebsite: 'Website URL',
    joinLinkedIn: 'LinkedIn Profile',

    joinDonationHeading: '💚 Support Our Mission (Optional)',
    joinDonationDesc: 'Your membership dues help us operate. An additional donation helps us grow our impact on global shellfish restoration.',
    joinNoDonation: 'No Donation',
    joinCustomAmount: 'Custom Amount:',
    joinInHonorOf: 'In Honor/Memory Of (Optional)',
    joinInHonorPlaceholder: 'Dedicate this donation',

    joinCommPrefs: 'Communication Preferences',
    joinOptInEmails: 'Send me updates about ISRS activities and opportunities',
    joinOptInNewsletter: 'Subscribe to the monthly newsletter',

    joinProceedPayment: 'Proceed to Payment',
    joinPaymentNote: '💳 Secure payment powered by Zeffy (100% free, no platform fees)',
    joinProcessing: 'Processing your membership...',
    joinWelcome: '🎉 Welcome to ISRS!',
    joinSuccess: 'Your membership has been created successfully.',
    joinCheckEmail: 'Check your email for confirmation and next steps.',
    joinSelectType: 'Please select a membership type',
    joinCompletePayment: 'Complete Your Payment',
    joinCompletedPayment: "I've Completed Payment",

    // Conference Confirmation Page
    confConfirmTitle: 'Registration Confirmation - ISRS 2026',
    confConfirmLoading: 'Loading registration details...',
    confConfirmInvalidLink: 'Invalid registration link. Please check your email or contact support.',
    confConfirmLoadError: 'Unable to load registration details. Please contact support with your registration number.',
    confConfirmHeading: 'Registration Created!',
    confConfirmThankYou: 'Thank you for registering for the ISRS International Conference 2026',
    confConfirmRegNumber: 'Your Registration Number:',
    confConfirmCompletePayment: '⚠️ Complete Your Payment',
    confConfirmPendingPayment: 'Your registration is currently <strong>pending payment</strong>. Please complete your payment to confirm your attendance.',
    confConfirmAmountDue: 'Amount Due:',
    confConfirmAboutZeffy: '<strong>About Zeffy:</strong> ISRS uses Zeffy, a 100% free payment platform for nonprofits. Zeffy may ask if you\'d like to add an <strong>optional tip</strong> - you can choose $0 or any amount. This tip goes to Zeffy, not ISRS.',
    confConfirmPayNow: 'Pay Now with Zeffy',
    confConfirmPaymentProcessed: 'You will receive a confirmation email once your payment is processed.',
    confConfirmBankTransfer: '🏦 Bank Transfer Instructions',
    confConfirmBankPending: 'Your registration is currently <strong>pending payment</strong>. Please transfer the registration fee to complete your registration.',
    confConfirmBankName: 'Bank Name:',
    confConfirmAccountName: 'Account Name:',
    confConfirmAccountNumber: 'Account Number:',
    confConfirmRoutingACH: 'Routing Number (ACH/Direct Deposit):',
    confConfirmRoutingWire: 'Routing Number (Wire Transfer):',
    confConfirmSwiftCode: 'SWIFT Code:',
    confConfirmSwiftNote: '(for international wire transfers)',
    confConfirmTransferRef: '⚠️ REQUIRED - Transfer Reference:',
    confConfirmImportantSteps: 'Important Steps:',
    confConfirmBankStep1: 'Transfer the exact amount shown above',
    confConfirmBankStep2: 'Include your registration number ({0}) in the transfer reference',
    confConfirmBankStep3: 'Email proof of transfer to',
    confConfirmBankStep4: 'Your registration will be confirmed once payment is received (typically 3-5 business days)',
    confConfirmWhatsNext: "What's Next?",
    confConfirmNext1: 'Complete your payment using the button above',
    confConfirmNext2: 'Check your email for registration confirmation',
    confConfirmNext3: 'Abstract submission opens April 1, 2026',
    confConfirmNext4: 'Submit your presentation abstract (if applicable)',
    confConfirmNext5: 'Book your travel and accommodation',
    confConfirmNext6: 'Join us June 15-18, 2026!',
    confConfirmProfileDashboard: 'Your Profile Dashboard',
    confConfirmProfileDesc: 'Access your personalized dashboard to view all your registrations, manage your information, and track your conference activity.',
    confConfirmAccessProfile: 'Access Your Profile',
    confConfirmSubmitAbstract: 'Submit Your Abstract',
    confConfirmSecureAccess: '<strong>Secure Access:</strong> We use magic link authentication - no passwords needed! Check your email ({0}) for a secure login link that expires in 15 minutes.',
    confConfirmDashboardFeatures: 'From your dashboard you can:',
    confConfirmDashboardFeature1: 'View all your conference registrations',
    confConfirmDashboardFeature2: 'Submit and manage multiple abstracts',
    confConfirmDashboardFeature3: 'Update your contact information',
    confConfirmDashboardFeature4: 'Track your payment status',
    confConfirmSpreadWord: '🎉 Spread the Word!',
    confConfirmShareText: 'Help us grow the shellfish restoration community! Share this conference with colleagues, friends, and family who care about marine conservation.',
    confConfirmShareX: 'Share on X',
    confConfirmShareLinkedIn: 'Share on LinkedIn',
    confConfirmShareFacebook: 'Share on Facebook',
    confConfirmInviteColleagues: '📧 Invite Colleagues by Email',
    confConfirmInviteDesc: 'Enter email addresses of colleagues who might be interested in attending:',
    confConfirmEmailPlaceholder: 'colleague@example.com',
    confConfirmAddEmail: 'Add',
    confConfirmSendInvites: 'Send Invitations',
    confConfirmInvitesSent: '✓ Invitations sent successfully!',
    confConfirmQuestions: 'Questions?',
    confConfirmContactUs: 'Contact us at',
    confConfirmReturnHome: 'Return to Homepage',
    confConfirmValidEmail: 'Please enter a valid email address',
    confConfirmEmailAdded: 'This email has already been added',
    confConfirmAddAtLeastOne: 'Please add at least one email address',
    confConfirmInviteFailed: 'Failed to send invitations. Please try again or contact support.',

    // Abstract Submission Page
    abstractTitle: 'Submit Abstract - ISRS 2026',
    abstractHeading: 'Submit Your Abstract',
    abstractConference: 'ISRS International Conference 2026',
    abstractLocation: 'June 15-18, 2026 | Jekyll Island, Georgia',
    abstractDeadline: '📅 Submission Deadline: March 15, 2026',
    abstractNotification: 'Notification of acceptance: April 15, 2026',
    abstractSubmitting: 'Submitting your abstract...',
    abstractSuccessHeading: '🎉 Abstract Submitted Successfully!',
    abstractSuccessNumber: 'Your submission number is:',
    abstractSuccessEmail: 'You will receive a confirmation email shortly.',
    abstractViewDashboard: 'View Your Profile Dashboard →',
    abstractBasicInfo: 'Basic Information',
    abstractTitleLabel: 'Abstract Title',
    abstractTitleMax: 'Maximum 250 characters',
    abstractTextLabel: 'Abstract Text',
    abstractTextMax: 'Maximum 3000 characters. Please do not include author names or affiliations in the abstract text.',
    abstractKeywords: 'Keywords',
    abstractKeywordPlaceholder: 'Enter a keyword',
    abstractAddKeyword: 'Add Keyword',
    abstractKeywordHint: 'Add 3-6 keywords to help categorize your abstract',
    abstractPresentationFormat: 'Presentation Format',
    abstractOral: '🎤 Oral Presentation',
    abstractOralDesc: '15-minute talk with 5 minutes Q&A',
    abstractPoster: '📊 Poster Presentation',
    abstractPosterDesc: 'Display and discuss your research',
    abstractEither: '🤷 Either Format',
    abstractEitherDesc: "You're flexible with the format",
    abstractTopicArea: 'Topic Area',
    abstractSelectTopic: 'Select topic area...',
    abstractTopicRestoration: 'Restoration Ecology',
    abstractTopicWater: 'Water Quality',
    abstractTopicHabitat: 'Habitat Restoration',
    abstractTopicOyster: 'Oyster Restoration',
    abstractTopicClam: 'Clam Restoration',
    abstractTopicMussel: 'Mussel/Freshwater Restoration',
    abstractTopicPolicy: 'Policy & Management',
    abstractTopicAquaculture: 'Aquaculture',
    abstractTopicCommunity: 'Community Engagement',
    abstractTopicClimate: 'Climate Change Impacts',
    abstractTopicMonitoring: 'Monitoring & Assessment',
    abstractTopicOther: 'Other',
    abstractPreferredSession: 'Preferred Session (Optional)',
    abstractSessionPlaceholder: 'e.g., Coastal Restoration',
    abstractSessionHint: "If you'd like to be grouped with similar topics",
    abstractPresentingAuthor: 'Presenting Author',
    abstractYourEmail: 'Your Email',
    abstractEmailHint: "We'll use this to contact you about your submission",
    abstractYourName: 'Your Name',
    abstractOrganization: 'Organization/Institution',
    abstractOrcid: 'ORCID (Optional)',
    abstractGetOrcid: 'Get your ORCID',
    abstractCoAuthors: 'Co-Authors (Optional)',
    abstractCoAuthorsDesc: 'Add any co-authors who contributed to this work. They will be listed on the program.',
    abstractAddCoAuthor: 'Add Co-Author',
    abstractRemove: 'Remove',
    abstractCoAuthorName: 'Name',
    abstractCoAuthorEmail: 'Email',
    abstractCoAuthorOrg: 'Organization',
    abstractAdditionalReq: 'Additional Requirements',
    abstractAVEquipment: 'I will need audiovisual equipment (projector/screen)',
    abstractSpecialEquip: 'Special Equipment or Requirements (Optional)',
    abstractSpecialPlaceholder: 'e.g., Need electrical outlet for display, require internet connection, etc.',
    abstractAgreeTerms: 'I agree to the',
    abstractTermsLink: 'Terms and Conditions',
    abstractAcknowledgePrivacy: 'I acknowledge the',
    abstractPrivacyLink: 'Privacy Policy',
    abstractSubmitButton: 'Submit Abstract',
    abstractSubmitNote: 'By submitting, you agree to present if accepted',
    abstractLoginRequired: 'Please log in to submit an abstract',
    abstractSessionExpired: 'Your session has expired. Please log in again.',
    abstractSelectFormat: 'Please select a presentation format',
    abstractNoConference: 'No active conference found. Please try again later.',
    abstractProfileError: 'User profile not loaded. Please refresh the page.',
    abstractMaxKeywords: 'Maximum 6 keywords allowed',
    abstractKeywordExists: 'This keyword has already been added',

    // Welcome Page
    welcomeTitle: 'Welcome to ISRS - International Society for Shellfish Restoration',
    welcomeHeading: 'Welcome to ISRS',
    welcomeSubtitle: 'International Society for Shellfish Restoration',
    welcomeAnnouncementHeading: '🎉 New Member Portal Launched!',
    welcomeAnnouncementText: 'Access your profile, explore the member directory, register for ICSR2026 in Puget Sound, and connect with the global shellfish restoration community.',
    welcomeGetStarted: 'Get Started',
    welcomeEnterEmail: 'Enter your email to check your membership status or join our community.',
    welcomeEmailPlaceholder: 'your@email.com',
    welcomeContinue: 'Continue',
    welcomeBenefit1: 'Free membership',
    welcomeBenefit2: 'Member directory access',
    welcomeBenefit3: 'Conference registration',
    welcomeBenefit4: 'Global network',
    welcomeAlreadyExploring: 'Already exploring?',
    welcomeContinueToMain: 'Continue to main site',
    welcomeLearnICRS: 'Learn about ICSR',
    welcomeICRS2026Details: 'ICSR2026 Details',
    welcomeEnterEmailError: 'Please enter your email address',
    welcomeChecking: 'Checking...',
    welcomeEmailSent: 'Email Sent!',
    welcomeCheckEmail: '✅ Check your email! We\'ve sent you a magic link to log in.',
    welcomeNoAccount: 'We don\'t have an account with that email yet. Would you like to become a member?',
    welcomeJoinNow: 'Join ISRS (Free)',
    welcomeSignupComingSoon: 'Membership signup coming soon! For now, please contact info@shellfish-society.org',
    welcomeNetworkError: 'Network error. Please check your connection and try again.',
    welcomeSomethingWrong: 'Something went wrong. Please try again.',
    // Welcome Page - Profile Preview (Step 2)
    welcomeWelcomeBack: 'Welcome Back!',
    welcomeFoundProfile: 'We found your profile in our system. Please verify this is you:',
    welcomeLocation: 'Location',
    welcomeConferenceHistory: 'Conference History',
    welcomeCurrentRoles: 'Current Roles',
    welcomeSendMagicLink: 'Yes, Send Me a Magic Link',
    welcomeNotMe: 'This Isn\'t Me',
    welcomeSending: 'Sending...',
    // Welcome Page - New User (Step 2 Alt)
    welcomeNewMember: 'Welcome, New Member!',
    welcomeNoExistingAccount: 'We don\'t have an existing account with this email address. Join our community to access the member portal, conference registration, and more.',
    welcomeTryDifferent: 'Try Different Email',
    welcomeCreating: 'Setting up...',

    // Profile Login Page
    loginTitle: 'Login to Your Profile - ISRS',
    loginHeading: 'Access Your Profile',
    loginSubtitle: "We'll send you a secure login link via email",
    loginMagicLinkSent: '✓ Magic Link Sent!',
    loginCheckEmail: 'Check your email for a secure login link. The link will expire in 15 minutes.',
    loginError: '⚠ Error',
    loginEmailLabel: 'Email Address',
    loginEmailPlaceholder: 'your.email@example.com',
    loginSendMagicLink: 'Send Magic Link',
    loginWhatIsMagicLink: 'What is a Magic Link?',
    loginMagicLinkExplain: 'A magic link is a secure, one-time use link sent to your email. Click the link to access your profile without needing a password.',
    loginMagicLinkBenefit1: 'No passwords to remember',
    loginMagicLinkBenefit2: 'Expires after 15 minutes',
    loginMagicLinkBenefit3: 'Can only be used once',
    loginBackToHome: '← Back to Homepage',
    loginSending: 'Sending...',
    loginVerifying: 'Verifying...',
    loginEnterEmail: 'Please enter your email address',
    loginFailedSend: 'Failed to send magic link',
    loginNetworkError: 'Network error. Please try again.',
    loginInvalidLink: 'Invalid or expired magic link',
    loginFailedVerify: 'Failed to verify magic link',
    loginDevMode: 'Development Mode:',

    // Legal Pages
    legalPrivacyTitle: 'Privacy Policy - ISRS',
    legalPrivacyHeading: 'Privacy Policy',
    legalTermsTitle: 'Terms and Conditions - ISRS',
    legalTermsHeading: 'Terms and Conditions',
    legalAccessibilityTitle: 'Accessibility Statement - ISRS',
    legalAccessibilityHeading: 'Accessibility Statement',
    legalCodeOfConductTitle: 'Code of Conduct - ISRS',
    legalCodeOfConductHeading: 'Code of Conduct',
    legalOrganization: 'International Shellfish Restoration Society',
    legalLastUpdated: 'Last Updated:',
    legalHome: 'Home',
    legalBackToHome: '← Back to Homepage',
    legalNote: 'Note: This legal document is provided in English. Translations are for reference only; the English version is the legally binding document.'
  },
  es: {
    // Navegación
    home: 'Inicio',
    about: 'Acerca de',
    icsr: 'ICSR',
    gallery: 'Galería',
    support: 'Apoyo',
    donate: 'DONAR',
    skipToMain: 'Saltar al contenido principal',

    // Página de inicio - Hero
    heroHeading: 'Construyendo comunidad e innovación avanzada en la restauración global de moluscos',
    heroSubtitle: 'La Sociedad Internacional para la Restauración de Moluscos (ISRS) une a científicos, profesionales y comunidades de todo el mundo para proteger y restaurar ecosistemas vitales de moluscos. A través del intercambio de conocimientos, la colaboración y enfoques innovadores, trabajamos para garantizar la resiliencia de los ecosistemas costeros para las generaciones venideras.',

    // Página de inicio - Banner ICSR2026
    homeBannerTitle: 'ICSR2026 • Puget Sound, Washington',
    homeBannerDates: '5-8 de Octubre de 2026',
    homeBannerVenue: 'Little Creek Casino Resort',
    homeBannerDescription: 'Únase a más de 350 profesionales de restauración de moluscos de más de 25 países para investigación de vanguardia, talleres prácticos y visitas de campo a sitios de restauración Tribal. Presidido por Puget Sound Restoration Fund.',
    homeBannerViewDetails: 'Ver Detalles Completos',
    homeBannerBecomeSponsor: 'Convertirse en Patrocinador',
    homeBannerSponsorshipProgress: 'Progreso del Patrocinio',
    homeBannerGoal: 'Meta:',
    homeBannerRaised: 'recaudado',
    homeBannerEarlySponsors: 'Patrocinadores iniciales:',

    // Página de inicio - Iniciativas Destacadas
    icsrCardTitle: 'Conferencia Internacional sobre Restauración de Moluscos (ICSR)',
    icsrCardText: 'Únase a nosotros en Puget Sound, Washington, para ICSR 2026, la principal reunión global de ciencia y práctica de restauración de moluscos. Conéctese con líderes en el campo, comparta su investigación y descubra enfoques innovadores para los desafíos de restauración.',
    icsrCardButton: 'Más Información sobre ICSR 2026',

    knowledgeCardTitle: 'Intercambio Global de Conocimientos',
    knowledgeCardText: 'Acceda a investigaciones de vanguardia, mejores prácticas y lecciones aprendidas de proyectos de restauración en todo el mundo. Nuestra red internacional conecta a profesionales de todos los continentes para compartir experiencia y acelerar resultados exitosos de restauración.',
    knowledgeCardButton: 'Explorar Recursos',

    communityCardTitle: 'Impacto Comunitario',
    communityCardText: 'Desde arrecifes de ostras hasta lechos de mejillones, la restauración de moluscos mejora la calidad del agua, apoya la biodiversidad y construye la resiliencia costera. Descubra cómo nuestros miembros están marcando la diferencia en los ecosistemas costeros de todo el mundo.',
    communityCardButton: 'Ver Historias de Éxito',

    // Página de inicio - Últimas Noticias
    latestNews: 'Últimas Noticias',
    news1Title: 'El Registro Abre a Principios de 2026 para ICSR 2026',
    news1Text: 'Marque su calendario para la próxima Conferencia Internacional sobre Restauración de Moluscos en Puget Sound.',
    news1Button: 'Recibir Actualizaciones',

    news2Title: 'Lanzamiento de una Nueva Asociación Global',
    news2Text: 'ISRS une fuerzas con la Alianza para la Restauración de Ostras Nativas (NORA) y la Red de Restauración Costera de Australasia para avanzar en los esfuerzos de restauración internacional.',
    news2Button: 'Saber Más',

    news3Title: 'Destacados de Investigación Estudiantil',
    news3Text: 'Conozca a la próxima generación de científicos de restauración y su trabajo innovador.',
    news3Button: 'Ciencia de Nueva Generación',

    // Página de inicio - Por Qué Importa
    whyMattersHeading: 'Por Qué Importa la Restauración de Moluscos',
    whyMattersIntro: 'Los ecosistemas de moluscos proporcionan servicios esenciales que apoyan tanto a la vida marina como a las comunidades humanas:',

    benefit1Title: '💧 Filtración de Agua',
    benefit1Text: 'Mejor calidad del agua a través de filtración natural',

    benefit2Title: '🐟 Hábitat Crítico',
    benefit2Text: 'Hábitat esencial para especies marinas',

    benefit3Title: '🌊 Protección Costera',
    benefit3Text: 'Barreras naturales contra las marejadas y la erosión',

    benefit4Title: '🍽️ Seguridad Alimentaria',
    benefit4Text: 'Mariscos sostenibles para comunidades locales',

    benefit5Title: '🌱 Secuestro de Carbono',
    benefit5Text: 'Mitigación del cambio climático mediante almacenamiento de carbono',

    benefit6Title: '🎣 Pesquerías Sostenibles',
    benefit6Text: 'Apoyo a las economías locales y seguridad alimentaria',

    benefit7Title: '🏛️ Patrimonio Cultural',
    benefit7Text: 'Preservación de prácticas tradicionales',

    // Llamado a la Acción
    ctaText: 'Juntos, podemos restaurar estos ecosistemas vitales y construir costas más resilientes.',

    // Sección Participa
    getInvolvedHeading: 'Participa',

    joinNetworkTitle: 'Únete a Nuestra Red',
    joinNetworkText: 'Conéctate con profesionales de restauración, científicos y líderes comunitarios de todo el mundo.<br>Los miembros obtienen acceso a recursos exclusivos, oportunidades de networking y descuentos en conferencias.',
    joinNetworkButton: 'Hazte Miembro',

    shareKnowledgeTitle: 'Comparte Tu Conocimiento',
    shareKnowledgeText: 'Presenta tu investigación, contribuye a guías de mejores prácticas o asesora a profesionales emergentes. Tu experiencia ayuda a avanzar en el campo de la restauración de moluscos.',
    shareKnowledgeButton: 'Asóciate con Nosotros',

    supportMissionTitle: 'Apoya Nuestra Misión',
    supportMissionText: 'Ayuda a construir un futuro sostenible para los ecosistemas costeros a través de membresía, asociación o donaciones caritativas.',
    supportMissionButton: 'Haz una Donación',

    donationNote: 'ISRS usa Zeffy, una plataforma de recaudación de fondos 100% gratuita que nos permite recibir cada dólar de tu donación sin deducir tarifas de plataforma. Cuando dones, verás una contribución opcional para apoyar el servicio gratuito de Zeffy. Esta propina es completamente opcional: puedes ajustarla a cualquier cantidad o $0.',

    // Página de Apoyo
    supportHeroHeading: 'Apoya a ISRS',
    supportHeroSubtitle: 'Construyendo Resiliencia Global a Través de la Restauración de Ecosistemas Marinos',
    supportOpportunityHeading: 'La Oportunidad Crítica',
    supportOpportunityText: 'Los ecosistemas de moluscos proporcionan algunas de las soluciones más poderosas de la naturaleza a nuestros desafíos más apremiantes. Una sola ostra filtra 50 galones de agua diariamente. Los arrecifes de moluscos protegen las costas de marejadas y el aumento del nivel del mar. Estos ecosistemas apoyan la biodiversidad, secuestran carbono y sostienen comunidades costeras—sin embargo, hemos perdido hasta el 85% de ellos globalmente.',
    supportOpportunityBoxHeading: 'ISRS existe para revertir esta tendencia',
    supportOpportunityBoxText: 'Al unificar la comunidad global de restauración, avanzar en la comprensión científica y escalar enfoques de restauración exitosos en todo el mundo. Nuestra iniciativa principal es la Conferencia Internacional sobre Restauración de Moluscos (ICSR) bienal—la reunión mundial premier para la restauración de moluscos desde 1996.',
    supportStat1Number: '50',
    supportStat1Label: 'Galones filtrados diariamente por ostra',
    supportStat2Number: '85%',
    supportStat2Label: 'Pérdida global de moluscos',
    supportStat3Number: '300+',
    supportStat3Label: 'Profesionales ICSR',
    supportStat4Number: '20+',
    supportStat4Label: 'Países representados',
    supportUrgentHeading: 'Necesidad Urgente: Crisis de Financiamiento Federal',
    supportUrgentIntro: 'Cambios recientes en el presupuesto federal han creado desafíos sin precedentes para la restauración de moluscos:',
    supportUrgentPoint1: 'El presupuesto de Conservación de Hábitat de NOAA reducido en un 29%',
    supportUrgentPoint2: 'Más de 586 empleados de NOAA despedidos, reduciendo la capacidad de soporte técnico',
    supportUrgentPoint3: 'Programas Sea Grant en riesgo de eliminación o severa reducción de fondos',
    supportUrgentPoint4: 'Fase final del financiamiento de restauración de la Ley de Infraestructura Bipartidista terminando en 2025',
    supportUrgentConclusion: 'La comunidad de restauración de moluscos ha respondido con notable resiliencia. ISRS fortalece esta comunidad, conectando profesionales con diversas fuentes de financiamiento y asegurando que el impulso de restauración continúe a pesar de los desafíos federales.',
    supportPartnershipHeading: 'Oportunidades de Asociación',
    supportPartnershipIntro: 'ISRS da la bienvenida a socios en todos los niveles que comparten nuestro compromiso con ecosistemas marinos saludables.',
    supportProgramsHeading: 'Programas con Impacto Global',
    supportFeedbackHeading: 'Comparte Tu Opinión',
    supportFeedbackIntro: '¿Tienes sugerencias o preguntas sobre nuestras oportunidades de asociación? Nos encantaría escucharte.',
    supportFirstName: 'Nombre <span class="required">*</span>',
    supportLastName: 'Apellido <span class="required">*</span>',
    supportEmail: 'Correo Electrónico <span class="required">*</span>',
    supportOrganization: 'Organización',
    supportInquiryType: 'Tipo de Consulta',
    supportGeneralInquiry: 'Consulta General',
    supportFoundationPartner: 'Asociación con Fundación',
    supportCorporatePartner: 'Asociación Corporativa',
    supportGovernmentPartner: 'Asociación Gubernamental',
    supportAcademicPartner: 'Asociación Académica',
    supportIndividualDonation: 'Donación Individual',
    supportOther: 'Otro',
    supportMessage: 'Mensaje <span class="required">*</span>',
    supportCTAHeading: 'Únete a Nosotros',
    supportCTAText: 'Juntos, podemos construir costas resilientes y océanos saludables para las generaciones futuras a través del poder de la restauración de moluscos.',
    supportCTAContact: 'Contáctanos Sobre Asociación',
    supportCTAPressKit: 'Ver Kit de Prensa',
    supportCTAContactInfo: '¿Preguntas? Contáctanos en aaron@shellfish-society.org',

    // Por qué Importa la Restauración de Moluscos
    whyMattersHeading: 'Por Qué Importa la Restauración de Moluscos',
    whyMattersIntro: 'Descubre cómo los ecosistemas de moluscos proporcionan servicios esenciales—<br>desde la filtración del agua hasta la protección costera.',
    whyMattersButton: 'Más Información',

    // Red Global
    globalNetworkHeading: 'Nuestra Red Global',
    globalNetworkIntro: 'Únete a nuestra red en crecimiento de más de 2,600 miembros<br>trabajando para avanzar en la restauración de moluscos en todo el mundo.',
    globalNetworkText: 'ISRS conecta a profesionales de restauración en seis continentes, fomentando la colaboración entre:',

    stakeholder1: 'Instituciones de investigación',
    stakeholder2: 'Agencias gubernamentales',
    stakeholder3: 'Organizaciones de conservación',
    stakeholder4: 'Comunidades indígenas',
    stakeholder5: 'Socios industriales',
    stakeholder6: 'Partes interesadas locales',

    // Botones comunes
    learnMore: 'Saber Más',
    getInvolved: 'Participar',
    readMore: 'Leer Más',

    // Pie de página
    stayConnected: 'Mantente Conectado',
    stayConnectedText: '¿Interesado en trabajar juntos? Complete la información y nos pondremos en contacto en breve.',
    stayConnectedText2: '¡Esperamos saber de ti!',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo Electrónico',
    message: 'Mensaje',
    send: 'Enviar',
    required: '*',
    quickLinks: 'Enlaces Rápidos',
    connect: 'Conectar',
    adminPortal: 'Portal Administrativo',
    copyright: '© 2026 Sociedad Internacional para la Restauración de Moluscos. Todos los derechos reservados.',
    taxId: 'Identificación Fiscal (EIN): 39-2829151',

    // Pie de página
    footerTagline: 'Construyendo comunidad e innovación avanzada en la restauración global de moluscos',
    footerLegal: 'Legal',
    footerPrivacyPolicy: 'Política de Privacidad',
    footerTermsOfService: 'Términos de Servicio',
    footerCodeOfConduct: 'Código de Conducta',
    footerAccessibility: 'Accesibilidad',
    footerSitemap: 'Mapa del Sitio',
    footerPhotoGallery: 'Galería de Fotos',
    footerSupportISRS: 'Apoye a ISRS',
    footerPressKit: 'Kit de Prensa',
    footerTaxDisclaimer: 'ISRS es una organización sin fines de lucro 501(c)(3) (pendiente de aprobación del IRS). Las donaciones son deducibles de impuestos en la medida permitida por la ley.',

    // Banner de Consentimiento de Cookies
    cookieConsentTitle: 'Valoramos Su Privacidad',
    cookieConsentText: 'Utilizamos cookies para mejorar su experiencia de navegación, analizar el tráfico del sitio y entender de dónde vienen nuestros visitantes. Al continuar usando nuestro sitio, usted consiente nuestro uso de cookies.',
    cookieConsentAccept: 'Aceptar Todas',
    cookieConsentDecline: 'Rechazar No Esenciales',
    cookieConsentLearnMore: 'Más información en nuestra Política de Privacidad',

    // Portal de Miembros - Inicio de Sesión
    memberLogin: 'Inicio de Sesión de Miembro',
    loginSubtitle: 'Ingrese su dirección de correo electrónico y le enviaremos un enlace de inicio de sesión seguro',
    emailAddress: 'Dirección de Correo Electrónico',
    sendMagicLink: 'Enviar Enlace Mágico',
    securePasswordlessAuth: 'Autenticación Segura sin Contraseña',
    securePasswordlessDesc: 'No hay contraseñas que recordar. Le enviaremos un enlace mágico único a su correo electrónico que expira en 15 minutos.',
    portalAccountFeatures: '¿Qué puede hacer con su cuenta del portal?',
    portalFeature1: 'Registrarse para conferencias y eventos',
    portalFeature2: 'Enviar y gestionar resúmenes',
    portalFeature3: 'Acceder al directorio de miembros',
    portalFeature4: 'Gestionar su perfil y configuración de privacidad',
    portalFeature5: 'Ver historial de conferencias y presentaciones',
    portalFeature6: 'Miembros del consejo: Acceder a documentos de gobierno y votación',
    backToHome: 'Volver al Inicio',
    needHelp: '¿Necesita ayuda? Contáctenos en',
    dontHaveAccount: '¿Aún no tienes una cuenta?',
    createAccount: 'Crear Nueva Cuenta',
    pastAttendeeNote: '¿Asistió a una conferencia ICSR anterior? ¡Probablemente ya tenga una cuenta! Simplemente ingrese el correo electrónico que usó para el registro arriba.',
    learnAboutICSR: 'Información sobre ICSR2026',
    checkYourEmail: '¡Revise su Correo Electrónico!',
    magicLinkSent: 'Hemos enviado un enlace de inicio de sesión seguro a',
    magicLinkSentTo: 'Hemos enviado un enlace de inicio de sesión seguro a',
    magicLinkInstructions: 'Haga clic en el enlace del correo electrónico para acceder a su perfil de miembro. El enlace expirará en 15 minutos.',
    sendAnotherLink: 'Enviar Otro Enlace',

    // Portal de Miembros - Registro
    signupHeading: 'Únase a ISRS',
    signupSubtitle: 'Cree su cuenta de miembro para acceder al directorio y beneficios',
    emailAddressRequired: 'Correo Electrónico *',
    firstNameRequired: 'Nombre *',
    lastNameRequired: 'Apellido *',
    organizationOptional: 'Organización',
    countryOptional: 'País',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    loginHere: 'Iniciar Sesión Aquí',
    welcomeToISRS: '¡Bienvenido a ISRS!',
    verificationSent: 'Hemos enviado un enlace de verificación a',
    verificationInstructions: 'Haga clic en el enlace del correo electrónico para verificar su cuenta y completar el registro. El enlace expirará en 15 minutos.',
    goToLogin: 'Ir a Iniciar Sesión',
    creatingAccount: 'Creando Cuenta...',
    accountCreationFailed: 'No se pudo crear la cuenta. Por favor, inténtelo de nuevo.',
    accountExistsError: 'Ya existe una cuenta con este correo electrónico. Por favor inicie sesión.',

    // Portal de Miembros - Perfil
    myProfile: 'Mi Perfil',
    loading: 'Cargando...',
    editProfile: 'Editar Perfil',
    viewDirectory: 'Ver Directorio',
    profileCompletion: 'Completitud del Perfil',
    memberSince: 'Miembro desde',
    basicInformation: 'Información Básica',
    firstName: 'Nombre',
    lastName: 'Apellido',
    emailAddress: 'Correo Electrónico',
    emailCannotChange: 'El correo electrónico no se puede cambiar. Contacte a soporte si es necesario.',
    country: 'País',
    city: 'Ciudad',
    phone: 'Teléfono',
    professionalInformation: 'Información Profesional',
    organization: 'Organización',
    positionTitle: 'Posición/Título',
    department: 'Departamento',
    bioAboutMe: 'Biografía / Acerca de Mí',
    privacySettings: 'Configuración de Privacidad',
    profileVisibility: 'Visibilidad del Perfil',
    showInDirectory: 'Mostrar en el Directorio de Miembros',
    privacyNote: 'Su correo electrónico siempre es privado y nunca se muestra a otros miembros.',
    conferenceHistory: 'Historial de Conferencias',
    noConferences: 'Aún no hay historial de conferencias.',
    saveChanges: 'Guardar Cambios',
    cancel: 'Cancelar',
    savingProfile: 'Guardando...',
    profileSaved: '¡Perfil guardado exitosamente!',
    profileSaveFailed: 'No se pudo guardar el perfil. Por favor, inténtelo de nuevo.',
    completeProfileMessage: '¡Complete su perfil para conectarse con otros miembros!',
    almostCompleteMessage: '¡Casi terminado! Solo faltan algunos campos más.',
    profileCompleteMessage: '¡Su perfil está completo!',

    // Portal de Miembros - Verificación
    verifyingLogin: 'Verificando su Inicio de Sesión',
    verifyingLoginText: 'Por favor espere mientras iniciamos sesión de forma segura...',
    loginFailed: 'Inicio de Sesión Fallido',
    noTokenProvided: 'No se proporcionó un token de inicio de sesión en la URL.',
    requestNewLoginLink: 'Solicitar Nuevo Enlace de Inicio de Sesión',
    returnToHome: 'Volver al Inicio',
    troubleshooting: 'Solución de Problemas:',
    linksExpire: 'Los enlaces mágicos expiran después de 15 minutos',
    oneTimeUse: 'Cada enlace solo se puede usar una vez',
    useLatestLink: 'Asegúrese de hacer clic en el último enlace enviado a su correo electrónico',
    verificationError: 'Ocurrió un error inesperado durante la verificación del inicio de sesión.',
    verifyingMessage: 'Por favor espere mientras lo conectamos de forma segura...',
    loginFailed: 'Inicio de Sesión Fallido',
    invalidLink: 'Este enlace de inicio de sesión no es válido o ha expirado.',
    troubleshooting: 'Solución de problemas:',
    linkExpires: 'Los enlaces mágicos expiran después de 15 minutos',
    linkOnceOnly: 'Cada enlace solo se puede usar una vez',
    useLatestLink: 'Asegúrese de haber hecho clic en el último enlace enviado a su correo electrónico',
    requestNewLink: 'Solicitar Nuevo Enlace de Inicio de Sesión',
    returnToHome: 'Volver al Inicio',

    // Portal de Miembros - Bienvenida/Configuración de Perfil
    welcomeToISRS: '¡Bienvenido a ISRS!',
    profileCompletion: 'Completar Perfil',
    completeProfileMessage: 'Complete su perfil para conectarse con otros miembros y desbloquear todas las funciones',
    basicInformation: 'Información Básica',
    emailCannotChange: 'El correo electrónico no se puede cambiar',
    country: 'País',
    city: 'Ciudad',
    phone: 'Teléfono',

    // Información Profesional
    professionalInformation: 'Información Profesional',
    organization: 'Organización',
    positionTitle: 'Cargo/Título',
    department: 'Departamento',
    bioAboutMe: 'Biografía / Acerca de Mí',
    bioPlaceholder: 'Cuéntenos sobre su trabajo en restauración de moluscos...',
    researchAreas: 'Áreas de Investigación',
    researchAreasPlaceholder: 'Ej., restauración de arrecifes de ostras, calidad del agua, evaluación de hábitat...',
    separateWithCommas: 'Separe múltiples áreas con comas',

    // Historial de Conferencias
    conferenceHistory: 'Su Historial de Conferencias ICSR',

    // Privacidad y Directorio
    privacyDirectorySettings: 'Configuración de Privacidad y Directorio',
    memberDirectory: 'Directorio de Miembros',
    memberDirectoryDescription: 'El directorio de miembros de ISRS ayuda a conectar investigadores, profesionales y partes interesadas que trabajan en restauración de moluscos en todo el mundo.',
    includeInDirectory: 'Incluirme en el directorio público de miembros',
    chooseVisibleInfo: 'Elija qué información mostrar en el directorio:',
    nameRequired: 'Nombre (obligatorio)',
    position: 'Cargo',
    bio: 'Biografía',
    conferenceHistoryLabel: 'Historial de Conferencias',

    // Privacidad y Términos
    privacyTerms: 'Privacidad y Términos',
    privacyPolicyAgree: 'He leído y acepto la',
    privacyPolicy: 'Política de Privacidad',
    privacyConsentText: 'y consiento que ISRS recopile y procese mis datos personales según lo descrito.',
    termsOfService: 'Términos de Servicio',
    termsAgree: 'Acepto los Términos de Servicio de ISRS y entiendo que este perfil se utilizará con fines de networking y conferencias.',
    yourPrivacyRights: 'Sus Derechos de Privacidad:',
    privacyRightsText: 'Puede solicitar una copia de sus datos, actualizar su información o solicitar la eliminación de su cuenta en cualquier momento desde la configuración de su perfil. Nunca venderemos sus datos a terceros.',

    // Acciones del Formulario
    completeProfileContinue: 'Completar Perfil y Continuar',
    fieldsRequired: 'Los campos marcados con',
    areRequired: 'son obligatorios',
    editProfile: 'Editar Perfil',
    saveChanges: 'Guardar Cambios',
    cancel: 'Cancelar',
    saving: 'Guardando...',

    // Página de Perfil
    myProfile: 'Mi Perfil',
    memberSince: 'Miembro desde',
    viewDirectory: 'Ver Directorio',
    notProvided: 'No proporcionado',
    emailCannotChangeContact: 'El correo electrónico no se puede cambiar. Contacte a soporte si es necesario.',
    expertiseKeywords: 'Palabras Clave de Experiencia',
    separateKeywordsCommas: 'Separe las palabras clave con comas',

    // Presencia en Línea
    onlinePresence: 'Presencia en Línea',
    website: 'Sitio Web',
    linkedinURL: 'URL de LinkedIn',
    orcid: 'ORCID',

    // Visibilidad en el Directorio
    directoryPrivacySettings: 'Configuración de Directorio y Privacidad',
    visibleFieldsDirectory: 'Campos Visibles en el Directorio:',

    // Consejos de Perfil
    profileTip: 'Consejo:',
    profileTipMessage: '¡Complete más campos para aumentar la visibilidad de su perfil y ayudar a otros miembros a encontrarlo!',

    // Estado de Completitud del Perfil
    completeProfile: 'Completar Perfil',
    profileComplete: '¡Su perfil está completo y se ve genial!',
    goodProgress: '¡Buen progreso! Agregue más información para ayudar a los miembros a encontrarlo.',
    completeMoreFields: 'Complete más campos para aumentar la visibilidad de su perfil.',

    // Privacidad de Datos y Cuenta
    dataPrivacyAccount: 'Privacidad de Datos y Cuenta',
    exportYourData: 'Exportar Sus Datos',
    exportDataDescription: 'Descargue una copia de todos sus datos personales',
    requestDataExport: 'Solicitar Exportación de Datos',
    deleteAccount: 'Eliminar Cuenta',
    deleteAccountDescription: 'Eliminar permanentemente su cuenta y datos',
    logout: 'Cerrar Sesión',

    // Confirmaciones de Exportación/Eliminación de Datos
    exportDataConfirm: '¿Solicitar una copia de todos sus datos personales? Recibirá un correo electrónico con un enlace de descarga dentro de 48 horas.',
    exportDataSuccess: '¡Exportación de datos solicitada exitosamente! Recibirá un correo electrónico dentro de 48 horas.',
    deleteAccountConfirm: '¿Está seguro de que desea eliminar su cuenta?',
    deleteAccountWarning: 'Esto:\n• Lo eliminará del directorio de miembros\n• Eliminará todos sus datos personales\n• Cancelará cualquier registro de conferencia\n\nEsta acción no se puede deshacer.',
    deleteAccountReason: 'Opcional: Por favor díganos por qué se va (nos ayuda a mejorar):',
    deleteAccountSuccess: 'Eliminación de cuenta solicitada. Su cuenta será eliminada dentro de 7 días. Recibirá un correo electrónico de confirmación.',

    // Alertas y Mensajes
    profileUpdatedSuccess: '¡Perfil actualizado exitosamente!',
    failedToLoadProfile: 'Error al cargar su perfil. Por favor intente actualizar la página.',
    failedToSaveProfile: 'Error al guardar el perfil:',

    // Configuración de Notificaciones
    notificationSettings: 'Configuración de Notificaciones',
    receiveNotifications: 'Recibir Notificaciones',
    receiveNotificationsDesc: 'Control maestro - desactive para detener todas las notificaciones excepto alertas críticas de seguridad de cuenta',
    memberDirectoryUpdates: 'Actualizaciones del Directorio de Miembros',
    memberDirectoryUpdatesDesc: 'Nuevos miembros se unen, actualizaciones de perfil de sus conexiones',
    conferenceAnnouncements: 'Anuncios de Conferencia (ICSR)',
    conferenceAnnouncementsDesc: 'Noticias de eventos, apertura de registro, fechas límite, actualizaciones importantes',
    adminAnnouncements: 'Anuncios de Administración',
    adminAnnouncementsDesc: 'Noticias de la organización, cambios de políticas, actualizaciones importantes de ISRS',
    adminOnlyNotifications: 'Notificaciones Solo para Administradores',
    newMemberRegistrations: 'Nuevos Registros de Miembros',
    newMemberRegistrationsDesc: 'Notificado cuando nuevos miembros se registran y necesitan aprobación',
    moderationAlerts: 'Alertas de Moderación',
    moderationAlertsDesc: 'Señalizaciones de perfil, contenido reportado, preocupaciones de miembros',
    systemAlerts: 'Alertas del Sistema',
    systemAlertsDesc: 'Problemas técnicos, notificaciones de implementación, errores críticos',
    emailDeliveryPreference: 'Preferencia de Entrega de Correo',
    sendImmediately: 'Enviar inmediatamente (sin resumen)',
    dailyDigest: 'Resumen diario (una vez al día)',
    weeklyDigest: 'Resumen semanal (una vez por semana)',
    digestDescription: 'Los correos de resumen combinan múltiples notificaciones en un solo correo de resumen',
    saveNotificationSettings: 'Guardar Configuración de Notificaciones',
    savingNotifications: 'Guardando...',
    notificationsSaved: '¡Configuración de notificaciones guardada exitosamente!',
    notificationsSaveFailed: 'Error al guardar la configuración de notificaciones. Por favor intente de nuevo.',

    // Página del Directorio de Miembros
    memberDirectoryTitle: 'Directorio de Miembros',
    memberDirectorySubtitle: 'Conéctese con investigadores, profesionales y partes interesadas que trabajan en restauración de moluscos en todo el mundo',
    search: 'Buscar',
    searchPlaceholder: 'Buscar miembros...',
    searchFields: '(nombre, organización, biografía, áreas de investigación)',
    allCountries: 'Todos los Países',
    conferenceYear: 'Año de Conferencia',
    allYears: 'Todos los Años',
    clearFilters: 'Limpiar Filtros',
    loadingMembers: 'Cargando miembros...',
    noMembersFound: 'No se Encontraron Miembros',
    adjustSearchCriteria: 'Intente ajustar sus criterios de búsqueda o filtros',
    membersFound: 'miembros encontrados',
    memberFound: 'miembro encontrado',

    // CTA del Directorio
    joinISRSCommunity: 'Únase a la Comunidad ISRS',
    joinCommunityDescription: 'Conéctese con colegas, comparta su investigación y manténgase actualizado sobre iniciativas de restauración de moluscos en todo el mundo.',
    loginToProfile: 'Iniciar Sesión en su Perfil',

    // Registro de Conferencia
    conferenceRegistration: 'Registro de Conferencia',
    registrationFor: 'Regístrese para la Conferencia de la Sociedad Internacional para la Restauración de Moluscos',
    backToConferenceInfo: 'Volver a Información de Conferencia',
    yourProfile: 'Su Perfil',
    registrationDetails: 'Detalles de Registro',
    sessionsWorkshops: 'Sesiones y Talleres',
    reviewPayment: 'Revisión y Pago',

    // Formulario de Registro - Sección de Perfil
    cvResumeUpload: 'Cargar CV/Currículum (Opcional)',
    orProvideLink: 'O proporcione un enlace:',
    researchAreasCommaSeparated: 'Áreas de Investigación (separadas por comas)',
    next: 'Siguiente',
    back: 'Atrás',

    // Formulario de Registro - Sección de Detalles
    registrationType: 'Tipo de Registro',
    selectRegistrationType: 'Seleccione tipo de registro...',
    earlyBird: 'Tarifa Anticipada',
    student: 'Estudiante',
    earlyBirdPricing: '¡Precio de tarifa anticipada disponible ahora! Regístrese antes del 1 de marzo de 2026 para ahorrar.',
    discountCode: 'Código de Descuento (Opcional)',
    discountCodeDescription: '¿Tiene un código promocional? ¡Ingréselo aquí para ahorrar en su registro!',
    enterPromoCode: 'Ingrese código promocional (ej., EARLYBIRD2026)',
    applyCode: 'Aplicar Código',
    attendanceType: 'Tipo de Asistencia',
    inPerson: 'Presencial',
    virtual: 'Virtual',
    firstTimeISRS: 'Esta es mi primera conferencia ISRS',
    planToSubmitAbstract: 'Planeo enviar un resumen para presentación',
    dietaryRestrictions: 'Restricciones Dietéticas',
    none: 'Ninguna',
    vegetarian: 'Vegetariano',
    vegan: 'Vegano',
    glutenFree: 'Sin Gluten',
    other: 'Otro (especificar abajo)',
    dietaryNotes: 'Notas Dietéticas',
    dietaryNotesPlaceholder: 'Por favor especifique cualquier alergia o requisito dietético...',
    accessibilityNeeds: 'Necesidades de Accesibilidad',
    accessibilityPlaceholder: 'Por favor háganos saber si requiere alguna adaptación...',

    // Contacto de Emergencia
    emergencyContactName: 'Nombre de Contacto de Emergencia',
    emergencyContactEmail: 'Correo Electrónico de Contacto de Emergencia',
    emergencyContactPhone: 'Teléfono de Contacto de Emergencia',
    relationship: 'Relación',
    relationshipPlaceholder: 'ej., Cónyuge, Padre, Amigo',
    emergencyContactAuth: 'Autorizo a los administradores de la conferencia ISRS a contactar a mi contacto de emergencia designado en caso de una emergencia médica u otra situación urgente durante la conferencia.',

    // Eventos Especiales
    specialEventsActivities: 'Eventos Especiales y Actividades',
    selectSpecialEvents: 'Seleccione los eventos especiales y actividades a los que le gustaría asistir. Algunos eventos pueden tener tarifas adicionales.',
    welcomeReception: 'Recepción de Bienvenida',
    welcomeReceptionDesc: 'Únase a nosotros para la recepción de la noche de apertura (Incluida en el registro)',
    lowCountryBoil: 'Cena Low Country Boil',
    lowCountryBoilDesc: 'Festín tradicional de mariscos con colegas (Incluida en el registro)',
    fieldTrips: 'Excursiones',
    fieldTripsDesc: 'Seleccione todas las que le interesen - capacidad limitada, pueden aplicar tarifas adicionales',
    dolphinTours: 'Tours de Observación de Delfines - Tour guiado de vida silvestre costera',
    seaTurtleCenter: 'Visita al Centro de Tortugas Marinas - Tour educativo de instalación de conservación',
    restorationSiteTour: 'Tour de Sitio de Restauración Local - Visite proyectos de restauración activos',
    golfTournament: 'Torneo de Golf',
    golfTournamentDesc: 'Torneo de golf de networking (Tarifa adicional: $75)',

    // Camiseta e Invitados
    tshirtSize: 'Talla de Camiseta de Conferencia (Opcional)',
    noTshirt: 'No necesito camiseta',
    bringingGuest: '¿Trae un Invitado a Eventos Sociales?',
    noGuests: 'Sin invitados',
    guestFee: 'invitado',
    guestsFee: 'invitados',
    guestsDescription: 'Los invitados pueden asistir a eventos sociales y comidas (aplica tarifa adicional)',

    // Educación Continua
    requestContinuingEducation: 'Solicitar Créditos de Educación Continua',
    continuingEducationDesc: 'Créditos de EC de la Sociedad para la Restauración Ecológica (SER)',
    licenseNumber: 'Número de Licencia Profesional (si aplica)',
    licensingOrg: 'Organización de Licencias',

    // Alojamiento
    accommodationPreferences: 'Preferencias de Alojamiento',
    needsAccommodation: 'Necesito ayuda para reservar alojamiento',
    interestedRoomSharing: 'Estoy interesado en compartir habitación para reducir costos',
    roommatePreferences: 'Preferencias/Notas de Compañero de Habitación',
    roommatePreferencesPlaceholder: '¿Alguna preferencia para un compañero de habitación? Preferencia de género, tranquilo vs social, etc.',

    // Información Adicional
    additionalInformation: 'Información Adicional',
    willingToVolunteer: 'Dispuesto a ser voluntario durante la conferencia',
    firstTimeAttendee: 'Esta es mi primera conferencia ISRS/ICSR',
    joinMailingList: 'Unirse a la lista de correo de ISRS',
    receiveFutureUpdates: 'Recibir actualizaciones sobre conferencias futuras',

    // Selección de Sesiones
    selectSessionsWorkshops: 'Seleccione sus Sesiones y Talleres',
    sessionSelectionDescription: 'Elija los talleres y sesiones a los que le gustaría asistir. Algunas sesiones tienen capacidad limitada y pueden tener lista de espera.',
    sessionSelectionOptional: 'La selección de sesiones es opcional',
    sessionSelectionSkip: '- puede omitir este paso si no está interesado en sesiones específicas.',
    loadingSessions: 'Cargando sesiones disponibles...',
    noSessionsAvailable: 'Actualmente no hay sesiones disponibles para selección.',
    checkBackLater: 'Vuelva a consultar más tarde o continúe con su registro.',
    continueToReview: 'Continuar a Revisión',
    available: 'Disponible',
    limited: 'limitado',
    spotsLeft: 'lugares disponibles',
    waitlistOnly: 'Solo Lista de Espera',
    full: 'Lleno',
    additionalFee: 'Tarifa adicional:',
    selected: 'Seleccionado',
    chair: 'Presidente:',

    // Revisión y Pago
    reviewPaymentTitle: 'Revisión y Pago',
    registrationSummary: 'Resumen de Registro',
    name: 'Nombre',
    notSpecified: 'No especificado',
    attendance: 'Asistencia',
    registrationFee: 'Tarifa de Registro',
    total: 'Total',
    paymentMethod: 'Método de Pago',
    selectPaymentMethod: 'Seleccione método de pago...',
    onlinePayment: 'Pago en Línea (Tarjeta de Crédito/Débito vía Zeffy)',
    bankTransfer: 'Transferencia Bancaria',

    // Información de Pago Zeffy
    onlinePaymentViaZeffy: 'Pago en Línea vía Zeffy',
    zeffyDescription: 'ISRS usa Zeffy, una plataforma de pago 100% gratuita para organizaciones sin fines de lucro.',
    zeffyRedirect: 'Cuando proceda al pago, será redirigido a la página de pago segura de Zeffy.',
    zeffyTipInfo: 'Zeffy puede preguntarle si desea agregar una propina opcional para ayudar a mantener su plataforma gratuita para organizaciones sin fines de lucro como ISRS.',
    zeffyTipOptional: 'Esta propina es completamente opcional',
    zeffyTipAmount: 'y va a Zeffy, no a ISRS. Puede elegir "$0" o cualquier cantidad que desee.',
    registrationFeeToISRS: 'Su tarifa de registro de conferencia va 100% a ISRS para apoyar la conferencia y nuestra misión.',

    // Información de Transferencia Bancaria
    bankTransferInstructions: 'Instrucciones de Transferencia Bancaria',
    bankTransferMessage: 'Por favor transfiera la tarifa de registro a la siguiente cuenta bancaria de ISRS:',
    bankName: 'Nombre del Banco:',
    accountName: 'Nombre de la Cuenta:',
    accountNumber: 'Número de Cuenta:',
    routingNumberACH: 'Número de Ruta (ACH/Depósito Directo):',
    routingNumberWire: 'Número de Ruta (Transferencia Bancaria):',
    swiftCode: 'Código SWIFT:',
    swiftCodeNote: '(para transferencias bancarias internacionales)',
    bankTransferImportant: 'Importante:',
    includeRegistrationNumber: 'Incluya su número de registro en la referencia de transferencia',
    sendProofOfTransfer: 'Envíe comprobante de transferencia a',
    confirmationTimeline: 'Su registro será confirmado una vez que se reciba el pago (típicamente 3-5 días hábiles)',

    // Acuerdos Legales
    agreeToTerms: 'Acepto los',
    termsAndConditions: 'Términos y Condiciones',
    acknowledgePrivacyPolicy: 'Reconozco la',
    agreeCodeOfConduct: 'Acepto seguir el',
    codeOfConduct: 'Código de Conducta',
    completeRegistration: 'Completar Registro',
    processingRegistration: 'Procesando su registro...',

    // Página de Confirmación
    registrationCreated: '¡Registro Creado!',
    thankYouRegistration: 'Gracias por registrarse en la Conferencia Internacional ISRS 2026',
    yourRegistrationNumber: 'Su Número de Registro:',
    completeYourPayment: 'Complete su Pago',
    registrationPendingPayment: 'Su registro está actualmente',
    pendingPayment: 'pendiente de pago',
    completePaymentMessage: 'Por favor complete su pago para confirmar su asistencia.',
    amountDue: 'Monto Adeudado:',
    aboutZeffy: 'Acerca de Zeffy:',
    zeffyConfirmationNote: 'ISRS usa Zeffy, una plataforma de pago 100% gratuita para organizaciones sin fines de lucro. Zeffy puede preguntarle si desea agregar una',
    optionalTip: 'propina opcional',
    zeffyTipNote: '- puede elegir $0 o cualquier cantidad. Esta propina va a Zeffy, no a ISRS.',
    payNowWithZeffy: 'Pagar Ahora con Zeffy',
    emailConfirmationNote: 'Recibirá un correo electrónico de confirmación una vez que se procese su pago.',
    transferExactAmount: 'Transfiera el monto exacto mostrado arriba',
    includeRegNumber: 'Incluya su número de registro',
    inTransferReference: 'en la referencia de transferencia',
    emailProofOfTransfer: 'Envíe comprobante de transferencia a',
    confirmationAfterPayment: 'Su registro será confirmado una vez que se reciba el pago (típicamente 3-5 días hábiles)',

    // ¿Qué Sigue?
    whatsNext: '¿Qué Sigue?',
    completePaymentButton: 'Complete su pago usando el botón de arriba',
    checkEmailConfirmation: 'Revise su correo electrónico para la confirmación de registro',
    abstractSubmissionOpens: 'La presentación de resúmenes abre el 1 de abril de 2026',
    submitAbstract: 'Envíe el resumen de su presentación (si aplica)',
    bookTravel: 'Reserve su viaje y alojamiento',
    seeYouAt: '¡Nos vemos del 15 al 18 de junio de 2026!',

    // Acceso al Panel de Perfil
    yourProfileDashboard: 'Su Panel de Perfil',
    accessDashboardDescription: 'Acceda a su panel personalizado para ver todos sus registros, administrar su información y rastrear su actividad de conferencia.',
    accessYourProfile: 'Acceder a su Perfil',
    submitYourAbstract: 'Enviar su Resumen',
    secureAccess: 'Acceso Seguro:',
    secureAccessDescription: 'Usamos autenticación de enlace mágico - ¡no se necesitan contraseñas! Revise su correo electrónico',
    magicLinkExpiry: 'para un enlace de inicio de sesión seguro que expira en 15 minutos.',
    fromDashboardYouCan: 'Desde su panel puede:',
    viewAllRegistrations: 'Ver todos sus registros de conferencia',
    submitManageAbstracts: 'Enviar y administrar múltiples resúmenes',
    updateContactInfo: 'Actualizar su información de contacto',
    trackPaymentStatus: 'Rastrear su estado de pago',

    // Compartir en Redes Sociales
    spreadTheWord: '¡Corra la Voz!',
    spreadTheWordDescription: '¡Ayúdenos a hacer crecer la comunidad de restauración de moluscos! Comparta esta conferencia con colegas, amigos y familiares que se preocupan por la conservación marina.',
    shareOnTwitter: 'Compartir en X',
    shareOnLinkedIn: 'Compartir en LinkedIn',
    shareOnFacebook: 'Compartir en Facebook',
    inviteByEmail: 'Invitar Colegas por Correo Electrónico',
    inviteByEmailDescription: 'Ingrese las direcciones de correo electrónico de colegas que podrían estar interesados en asistir:',
    add: 'Agregar',
    sendInvitations: 'Enviar Invitaciones',
    invitationsSent: '¡Invitaciones enviadas exitosamente!',

    // Preguntas y Soporte
    questionsContact: '¿Preguntas? Contáctenos en',

    // Mensajes de Error
    invalidRegistrationLink: 'Enlace de registro inválido. Por favor revise su correo electrónico o contacte a soporte.',
    unableToLoadRegistration: 'No se pueden cargar los detalles de registro. Por favor contacte a soporte con su número de registro.',
    pleaseEnterDiscountCode: 'Por favor ingrese un código de descuento',
    selectRegistrationTypeFirst: 'Por favor seleccione un tipo de registro primero',
    invalidDiscountCode: 'Código de descuento inválido',
    failedToValidateDiscount: 'Error al validar el código de descuento. Por favor intente nuevamente.',
    fillRequiredFields: 'Por favor complete todos los campos obligatorios (marcados con *)',
    enterValidEmail: 'Por favor ingrese una dirección de correo electrónico válida',
    selectPaymentMethodError: 'Por favor seleccione un método de pago',
    registrationFailed: 'Registro fallido. Por favor intente nuevamente.',

    // Mensajes de Éxito
    registrationCreatedSuccess: '¡Registro creado exitosamente! Redirigiendo al pago...',
    registrationCreatedInstructions: '¡Registro creado exitosamente! Redirigiendo a instrucciones de pago...',

    // ========== PÁGINA ACERCA DE ==========
    // Acerca de - Hero
    aboutHeroHeading: 'Acerca de ISRS',
    aboutHeroSubtitle: 'La Sociedad Internacional para la Restauración de Moluscos apoya a la comunidad global de restauración de moluscos a través de la colaboración, la innovación y el intercambio de conocimientos.',

    // Acerca de - Quiénes Somos
    aboutWhoWeAre: 'Quiénes Somos',
    aboutWhoWeAreText: 'La Sociedad Internacional para la Restauración de Moluscos (ISRS) es una organización sin fines de lucro 501(c)(3) (pendiente de aprobación del IRS) establecida en 2024 para apoyar a la comunidad global de restauración de moluscos. Surgimos de la Conferencia Internacional sobre Restauración de Moluscos (ICSR), que ha convocado a la comunidad de restauración desde su fundación en 1996.',

    // Acerca de - Misión y Visión
    aboutMission: 'Misión',
    aboutMissionText: 'Construir comunidad, facilitar la comunicación y promover la innovación dentro de la comunidad de restauración de moluscos en todo el mundo.',
    aboutVision: 'Visión',
    aboutVisionText: 'Un futuro donde los ecosistemas de moluscos saludables apoyen costas resilientes, vida marina próspera y comunidades sostenibles en todo el mundo.',

    // Acerca de - Valores Fundamentales
    aboutCoreValuesHeading: 'Nuestros Valores Fundamentales',
    aboutCoreValuesIntro: 'ISRS opera guiada por seis principios fundamentales que dan forma a nuestro trabajo y comunidad:',
    aboutValueScience: 'Enfoque Basado en la Ciencia',
    aboutValueScienceDesc: 'Aplicamos investigación rigurosa para informar las prácticas de restauración y la toma de decisiones.',
    aboutValueCollaborative: 'Asociaciones Colaborativas',
    aboutValueCollaborativeDesc: 'Creemos en el poder de trabajar juntos a través de sectores, disciplinas y fronteras.',
    aboutValueInclusive: 'Participación Inclusiva',
    aboutValueInclusiveDesc: 'Damos la bienvenida a perspectivas diversas de científicos, profesionales, comunidades indígenas, formuladores de políticas e industria.',
    aboutValueInnovation: 'Innovación',
    aboutValueInnovationDesc: 'Promovemos la resolución creativa de problemas y nuevas técnicas y tecnologías de restauración.',
    aboutValueImpact: 'Impulsado por el Impacto',
    aboutValueImpactDesc: 'Nos enfocamos en resultados medibles que benefician a las poblaciones de moluscos, los ecosistemas y las comunidades.',
    aboutValueSustainability: 'Sostenibilidad',
    aboutValueSustainabilityDesc: 'Defendemos enfoques de restauración que apoyan la salud ecológica y la resiliencia a largo plazo.',

    // Acerca de - Lo Que Hacemos
    aboutWhatWeDo: 'Lo Que Hacemos',
    aboutHostICR: 'Organizar la Conferencia ICSR',
    aboutHostICRDesc: 'Organizamos la Conferencia Internacional sobre Restauración de Moluscos bienal, reuniendo a más de 300 participantes de más de 20 países para compartir investigaciones, mejores prácticas y nuevas innovaciones.',
    aboutFacilitateNetworking: 'Facilitar el Networking',
    aboutFacilitateNetworkingDesc: 'Conectamos a profesionales de restauración en todo el mundo a través de canales de comunicación durante todo el año, grupos de trabajo e intercambio de conocimientos.',
    aboutSupportRegional: 'Apoyar Redes Regionales',
    aboutSupportRegionalDesc: 'Colaboramos con redes regionales de restauración en América del Norte, Europa, Asia, Australia y más allá para avanzar en iniciativas de restauración locales.',
    aboutPromoteKnowledge: 'Promover el Intercambio de Conocimientos',
    aboutPromoteKnowledgeDesc: 'Facilitamos el intercambio de técnicas de restauración, hallazgos de investigación y lecciones aprendidas en toda la comunidad global.',
    aboutEngageDiverse: 'Involucrar a Diversos Interesados',
    aboutEngageDiverseDesc: 'Reunimos a investigadores, administradores, conservacionistas, grupos indígenas, socios de la industria y formuladores de políticas para un diálogo colaborativo.',
    aboutAdvanceInnovation: 'Avanzar en la Innovación',
    aboutAdvanceInnovationDesc: 'Apoyamos el desarrollo y la difusión de nuevos enfoques, tecnologías y estrategias de restauración.',

    // Acerca de - Nuestra Comunidad
    aboutCommunityHeading: 'Nuestra Comunidad',
    aboutCommunityIntro: 'ISRS reúne a una comunidad global diversa dedicada a la restauración de moluscos:',
    aboutCommunityScientists: 'Científicos Investigadores',
    aboutCommunityScientistsDesc: 'Avanzando la ciencia y el monitoreo de restauración',
    aboutCommunityPractitioners: 'Profesionales de Restauración',
    aboutCommunityPractitionersDesc: 'Implementando proyectos sobre el terreno',
    aboutCommunityManagers: 'Administradores de Recursos',
    aboutCommunityManagersDesc: 'Gestionando poblaciones y hábitats de moluscos',
    aboutCommunityOrgs: 'Organizaciones de Conservación',
    aboutCommunityOrgsDesc: 'Protegiendo ecosistemas costeros',
    aboutCommunityIndigenous: 'Comunidades Indígenas',
    aboutCommunityIndigenousDesc: 'Cuidando recursos tradicionales de moluscos',
    aboutCommunityIndustry: 'Socios de la Industria',
    aboutCommunityIndustryDesc: 'Promoviendo la acuicultura sostenible',
    aboutCommunityPolicy: 'Formuladores de Políticas',
    aboutCommunityPolicyDesc: 'Desarrollando políticas favorables a la restauración',
    aboutCommunityStudents: 'Estudiantes y Educadores',
    aboutCommunityStudentsDesc: 'Formando la próxima generación',

    // Acerca de - Asociaciones Estratégicas
    aboutPartnershipsHeading: 'Asociaciones Estratégicas',
    aboutPartnershipsIntro: 'ISRS colabora con organizaciones líderes para amplificar nuestro impacto:',
    aboutPartnerNORA: 'Alianza para la Restauración de Ostras Nativas (NORA)',
    aboutPartnerNORADesc: 'Asociación enfocada en avanzar la restauración de ostras en América del Norte a través de recursos compartidos, intercambio de conocimientos e iniciativas coordinadas.',
    aboutPartnerAustralasia: 'Red de Restauración Costera de Australasia',
    aboutPartnerAustralasiaDesc: 'Colaboración para conectar a profesionales de restauración en Australia, Nueva Zelanda y la región del Pacífico, compartiendo innovaciones en restauración de moluscos y costera.',

    // ========== PÁGINA ICSR ==========
    // ICSR - Hero
    icsrHeroHeading: 'Conferencia Internacional sobre Restauración de Moluscos',
    icsrHeroSubtitle: 'La reunión global premier para la ciencia y práctica de restauración de moluscos desde 1996',
    icsrCTA2026: 'ICSR2026 - Puget Sound',

    // ICSR - Acerca de
    icsrAboutHeading: 'Acerca de ICSR',
    icsrAboutText1: 'Desde 1996, la Conferencia Internacional sobre Restauración de Moluscos ha convocado a la comunidad global de restauración cada dos años. ICSR reúne a más de 300 participantes de más de 20 países, creando oportunidades sin precedentes para el intercambio de conocimientos, colaboración e innovación.',
    icsrAboutText2: 'La conferencia presenta presentaciones de investigación de vanguardia, talleres interactivos, visitas de campo, paneles de discusión y eventos de networking que avanzan la ciencia y la práctica de la restauración de moluscos en todo el mundo.',

    // ICSR - Quién Asiste
    icsrWhoAttendsHeading: 'Quién Asiste a ICSR',
    icsrAttendeeScientists: 'Científicos Investigadores',
    icsrAttendeeScientistsDesc: 'Investigadores líderes presentando los últimos hallazgos en ecología de moluscos, técnicas de restauración y servicios ecosistémicos.',
    icsrAttendeePractitioners: 'Profesionales de Restauración',
    icsrAttendeePractitionersDesc: 'Expertos sobre el terreno compartiendo lecciones aprendidas y enfoques innovadores de proyectos del mundo real.',
    icsrAttendeeManagers: 'Administradores de Recursos',
    icsrAttendeeManagersDesc: 'Funcionarios gubernamentales y administradores de recursos naturales desarrollando políticas y programas de restauración.',
    icsrAttendeeOrgs: 'Organizaciones de Conservación',
    icsrAttendeeOrgsDesc: 'ONGs y organizaciones sin fines de lucro liderando iniciativas de restauración en ecosistemas costeros.',
    icsrAttendeeIndigenous: 'Grupos Indígenas',
    icsrAttendeeIndigenousDesc: 'Portadores de conocimiento tradicional y custodios de recursos de moluscos y hábitats costeros.',
    icsrAttendeeStudents: 'Estudiantes',
    icsrAttendeeStudentsDesc: 'Estudiantes de posgrado e investigadores en etapa temprana construyendo la próxima generación de experiencia en restauración.',

    // ICSR - Actividades de la Conferencia
    icsrActivitiesHeading: 'Actividades de la Conferencia',
    icsrActivityResearch: 'Presentaciones de Investigación',
    icsrActivityResearchDesc: 'Presentaciones orales y charlas relámpago mostrando las últimas investigaciones sobre dinámica de poblaciones de ostras, evaluación de hábitat, restauración urbana, interacciones de especies y monitoreo de restauración.',
    icsrActivityWorkshops: 'Talleres Interactivos',
    icsrActivityWorkshopsDesc: 'Sesiones prácticas que cubren técnicas de restauración, protocolos de monitoreo, análisis de datos, participación de interesados y planificación de proyectos.',
    icsrActivityFieldTrips: 'Viajes de Campo',
    icsrActivityFieldTripsDesc: 'Visitas a proyectos de restauración activos, proporcionando experiencia de primera mano con enfoques y desafíos de restauración local.',
    icsrActivityPanels: 'Paneles de Discusión',
    icsrActivityPanelsDesc: 'Paneles de expertos abordando política, financiación, asociaciones, adaptación climática y desafíos emergentes de restauración.',
    icsrActivityPosters: 'Sesiones de Pósteres',
    icsrActivityPostersDesc: 'Presentaciones de pósteres vespertinas permitiendo discusiones en profundidad de investigaciones y proyectos de restauración.',
    icsrActivityNetworking: 'Eventos de Networking',
    icsrActivityNetworkingDesc: 'Recepciones de bienvenida, banquetes y actividades sociales fomentando conexiones en toda la comunidad global.',

    // ICSR - Historia de la Conferencia
    icsrHistoryHeading: 'Historia de la Conferencia',
    icsrHistoryIntro: 'ICSR se ha convocado bianualmente desde 1996, abarcando cuatro continentes y reuniendo a miles de profesionales de restauración durante casi tres décadas.',
    icsr2020s: 'Década de 2020',
    icsr2010s: 'Década de 2010',
    icsr2000s: 'Década de 2000',
    icsr1990s: 'Década de 1990',

    // ICSR - Código de Conducta
    icsrCodeOfConduct: 'Código de Conducta',
    icsrCodeIntro: 'ICSR se compromete a proporcionar un entorno respetuoso, inclusivo y acogedor para todos los participantes. Mantenemos una política de tolerancia cero para el acoso y el comportamiento inapropiado.',
    icsrCodeExpectations: 'Nuestras Expectativas',
    icsrCodeReporting: '<strong>Reportes:</strong> Los participantes que experimenten o presencien acoso deben contactar a los organizadores de la conferencia en <a href="mailto:info@shellfish-society.org" style="color: var(--primary-blue);">info@shellfish-society.org</a>',

    // ========== PÁGINA ICSR2026 ==========
    // ICSR2026 - Hero
    icsr2026SaveDateHeading: '¡RESERVE LA FECHA!',
    icsr2026HeroHeading: 'ICSR2026',
    icsr2026HostedBy: 'Organizado por <a href="https://restorationfund.org/" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">Puget Sound Restoration Fund</a>',
    icsr2026Location: 'Puget Sound, Estado de Washington',
    icsr2026LocationDates: 'Puget Sound, Estado de Washington<br>5-8 de Octubre de 2026',
    icsr2026Dates: '5-8 de Octubre de 2026',
    icsr2026DateRange: '5-8 de Octubre de 2026',

    // ICSR2026 - Descripción General
    icsr2026OverviewHeading: 'Únase a Nosotros en el Noroeste del Pacífico',
    icsr2026OverviewText1: 'La Conferencia Internacional sobre Restauración de Moluscos 2026 reunirá a la comunidad global de restauración durante cuatro días de investigación de vanguardia, talleres prácticos y networking invaluable con profesionales de restauración de todo el mundo.',
    icsr2026OverviewText2: 'Situada en la espectacular región de Puget Sound, ICSR2026 explorará la intersección del conocimiento ecológico tradicional, la ciencia moderna de restauración y la conservación basada en la comunidad.',
    icsr2026OverviewText3: 'La conferencia se abrirá con una <strong>ceremonia tradicional de bienvenida Coast Salish</strong>, honrando las profundas conexiones culturales entre el pueblo de la Isla Squaxin y los recursos de mariscos.',
    icsr2026MailingListCTA: 'Únase a la Lista de Correo para Actualizaciones',
    icsr2026JoinMailingList: 'Únase a la Lista de Correo para Actualizaciones',

    // ICSR2026 - Fechas Importantes
    icsr2026DatesHeading: 'Fechas Importantes',
    icsr2026ConferenceDates: 'Fechas de la Conferencia',
    icsr2026DownloadICS: 'Descargar .ics',
    icsr2026GoogleCalendar: 'Google Calendar',
    icsr2026Outlook: 'Outlook',
    icsr2026AbstractDeadline: 'Fecha Límite de Resúmenes',
    icsr2026ComingSoon: 'Próximamente',
    icsr2026EarlyBird: 'Registro Anticipado',
    icsr2026Early2026: 'Principios de 2026',
    icsr2026HotelBooking: 'Reserva de Hotel',
    icsr2026InfoTBA: 'Información Por Anunciar',

    // ICSR2026 - Qué Esperar
    icsr2026WhatToExpect: 'Qué Esperar',
    icsr2026ExpectHeading: 'Qué Esperar',
    icsr2026ExpectResearch: 'Investigación de Vanguardia',
    icsr2026ExpectResearchDesc: 'Presentaciones orales y charlas relámpago sobre dinámica de ostras, monitoreo de hábitat, restauración urbana, interacciones de especies, estructuras de arrecifes y adaptación climática',
    icsr2026ExpectWorkshops: 'Talleres Prácticos',
    icsr2026ExpectWorkshopsDesc: 'Sesiones interactivas sobre planificación de restauración, protocolos de monitoreo, participación comunitaria, conocimiento tradicional, financiación y análisis de datos',
    icsr2026ExpectFieldTrips: 'Viajes de Campo',
    icsr2026ExpectFieldTripsDesc: 'Visitas a sitios de restauración tribales, arrecifes de ostras de Puget Sound, proyectos de costas urbanas, recuperación de ostras Olympia y restauración de almejas geoduck',
    icsr2026ExpectNetworking: 'Networking',
    icsr2026ExpectNetworkingDesc: 'Recepción de bienvenida, sesiones de pósteres, banquete de conferencia, reuniones de redes regionales y reuniones informales durante toda la semana',

    // ICSR2026 - Sesiones Planificadas
    icsr2026SessionsHeading: 'Sesiones y Temas Planificados',
    icsr2026SessionsIntro: 'La programación de la conferencia está en desarrollo. Las sesiones planificadas incluyen:',

    // ICSR2026 - Lugar
    icsr2026VenueHeading: 'Lugar de la Conferencia en el Territorio de la Tribu Squaxin Island',
    icsr2026VenueText1: 'ICSR2026 se llevará a cabo en el <a href="https://littlecreek.com/" target="_blank" rel="noopener noreferrer">Little Creek Resort and Conference Center</a>, operado por la Tribu Squaxin Island en Shelton, Washington. El territorio ancestral del pueblo Squaxin Island incluye gran parte del sur de Puget Sound, y han sido administradores de recursos de moluscos durante miles de años, manteniendo profundas conexiones culturales y espirituales con almejas, ostras y otros moluscos.',
    icsr2026VenueText2: 'Hoy, la Tribu continúa esta tradición a través de la gestión activa de moluscos, programas de restauración y operaciones de acuicultura, integrando el conocimiento ecológico tradicional con la ciencia de conservación moderna. ICSR2026 brindará oportunidades únicas para aprender de los profesionales de restauración tribales y experimentar enfoques indígenas para la administración de moluscos.',

    // ICSR2026 - Por Qué Puget Sound
    icsr2026WhyPugetSound: '¿Por Qué Puget Sound?',
    icsr2026WhyHeading: '¿Por Qué Puget Sound?',
    icsr2026WhyPugetSoundIntro: 'Puget Sound es un punto caliente global para la innovación en restauración de moluscos<br>con profundas conexiones culturales con los moluscos:',
    icsr2026WhyIntro: 'Puget Sound es un punto caliente global para la innovación en restauración de moluscos con profundas conexiones culturales con los moluscos:',
    icsr2026WhyDiverseSpecies: '🌊 Especies Diversas',
    icsr2026WhySpecies: 'Especies Diversas',
    icsr2026WhyDiverseSpeciesDesc: 'Hogar de ostras Olympia nativas, ostras del Pacífico, almejas geoduck, almejas Manila y numerosas otras especies de moluscos.',
    icsr2026WhySpeciesDesc: 'Hogar de ostras Olympia nativas, ostras del Pacífico, almejas geoduck, almejas Manila y numerosas otras especies de moluscos.',
    icsr2026WhyResearch: 'Excelencia en Investigación',
    icsr2026WhyResearchDesc: 'Universidades e instituciones de investigación líderes que avanzan la ciencia de moluscos y las técnicas de restauración.',
    icsr2026WhyTribal: 'Liderazgo Tribal',
    icsr2026WhyTribalDesc: 'Tribus Coast Salish liderando programas innovadores de restauración basados en el conocimiento tradicional.',
    icsr2026WhyActiveRestoration: '🦪 Restauración Activa',
    icsr2026WhyRestoration: 'Restauración Activa',
    icsr2026WhyActiveRestorationDesc: 'Docenas de proyectos de restauración en curso que abordan la calidad del agua, la pérdida de hábitat y el cambio climático.',
    icsr2026WhyRestorationDesc: 'Docenas de proyectos de restauración en curso que abordan la calidad del agua, la pérdida de hábitat y el cambio climático.',
    icsr2026WhyPolicy: 'Innovación en Políticas',
    icsr2026WhyPolicyDesc: 'Políticas progresivas de gestión y restauración de moluscos que sirven como modelos para otras regiones.',
    icsr2026WhyEcosystem: 'Enfoque Ecosistémico',
    icsr2026WhyEcosystemDesc: 'Enfoques holísticos que integran la restauración de moluscos con la recuperación más amplia del ecosistema costero.',

    // ICSR2026 - Asistencia Esperada
    icsr2026ExpectedAttendance: 'Asistencia Esperada',
    icsr2026AttendanceHeading: 'Asistencia Esperada',
    icsr2026ExpectedParticipants: '350+',
    icsr2026ExpectedCountries: '25+',
    icsr2026ExpectedPresentations: '150+',
    icsr2026ParticipantsLabel: 'Participantes',
    icsr2026Participants: 'Participantes',
    icsr2026CountriesLabel: 'Países',
    icsr2026Countries: 'Países',
    icsr2026PresentationsLabel: 'Presentaciones',
    icsr2026Presentations: 'Presentaciones',

    // ICSR2026 - Registro y Patrocinio
    icsr2026RegistrationHeading: 'Registro',
    icsr2026RegistrationText: 'El registro se abrirá a principios de 2026. Regístrese para recibir actualizaciones y ser notificado cuando el registro esté disponible.',
    icsr2026RequestUpdates: 'Solicitar Actualizaciones',
    icsr2026SponsorshipHeading: 'Oportunidades de Patrocinio',
    icsr2026SponsorshipText: 'Apoye ICSR2026 y conéctese con la comunidad global de restauración de moluscos. Las oportunidades de patrocinio incluyen apoyo a eventos (viajes de campo, recepción, banquete) y becas de viaje para estudiantes.',
    icsr2026InquireSponsorship: 'Consultar sobre Patrocinio',

    // ICSR2026 - Patrocinadores
    icsr2026SponsorsHeading: 'Patrocinadores de la Conferencia',
    icsr2026SponsorsIntro: 'Agradecemos a nuestros patrocinadores que hacen posible ICSR2026 con su generoso apoyo.',
    icsr2026SponsorPSRF: 'Puget Sound Restoration Fund',
    icsr2026HostOrganization: 'Organización Anfitriona',
    icsr2026SponsorTNC: 'The Nature Conservancy - California',
    icsr2026SponsorLevel: 'Patrocinador $5,000',
    icsr2026SponsorTNCWA: 'The Nature Conservancy - Washington',
    icsr2026SponsorLevelWA: 'Patrocinador $2,000',

    // ICSR2026 - Código de Conducta
    icsr2026CodeOfConduct: 'Código de Conducta',
    icsr2026CodeHeading: 'Código de Conducta',
    icsr2026CodeText: 'ICSR2026 se compromete a proporcionar un entorno respetuoso, inclusivo y acogedor para todos los participantes. Mantenemos una política de tolerancia cero para el acoso y el comportamiento inapropiado. Se espera que todos los asistentes se traten con respeto, den la bienvenida a diversas perspectivas y se abstengan de fotografía o grabación no autorizadas.',
    icsr2026CodeContact: '<strong>¿Preguntas o inquietudes?</strong> Contáctenos en <a href="mailto:info@shellfish-society.org" style="color: var(--primary-blue);">info@shellfish-society.org</a>',

    // ICSR2026 - Modal de Lista de Correo
    icsr2026ModalCloseAriaLabel: 'Cerrar modal de lista de correo',
    icsr2026ModalTitle: 'Únase a Nuestra Lista de Correo',
    icsr2026ModalSubtitle: 'Manténgase actualizado sobre el registro de ICSR2026, envío de resúmenes y detalles de la conferencia.',
    icsr2026ModalFirstName: 'Nombre',
    icsr2026ModalLastName: 'Apellido',
    icsr2026ModalEmail: 'Correo Electrónico',
    icsr2026ModalOrganization: 'Organización',
    icsr2026ModalNote: 'Nota (Opcional)',
    icsr2026ModalNotePlaceholder: 'Agregue cualquier información adicional o preguntas sobre ICSR2026...',
    icsr2026ModalCancel: 'Cancelar',
    icsr2026ModalSubmit: 'Unirse a la Lista de Correo',
    icsr2026ModalSuccess: '✓ ¡Éxito!',
    icsr2026ModalSuccessText: 'Gracias por unirse a nuestra lista de correo. Le mantendremos informado sobre ICSR2026.',
    icsr2026ModalClose: 'Cerrar',
    icsr2026ModalErrorMessage: 'Hubo un error al enviar su información. Por favor intente nuevamente o contáctenos directamente en info@shellfish-society.org',

    // ========== PÁGINA GALERÍA ==========
    // Galería - Encabezado
    galleryHeading: 'Galería de Fotos',
    gallerySubtitle: 'Explore fotos de proyectos de restauración de moluscos, investigación y eventos de ISRS y la comunidad global de restauración',
    galleryDescription: 'Explore fotos de proyectos de restauración de moluscos, investigación y eventos de ISRS y la comunidad global de restauración',

    // Galería - Búsqueda y Filtros
    gallerySearchFilterHeading: '🔍 Buscar y Filtrar',
    gallerySearchLabel: 'Búsqueda de Texto',
    gallerySearchPlaceholder: 'Descripción, etiquetas, ubicación...',
    galleryAISearchLabel: 'Búsqueda Visual con IA',
    galleryAISearchPlaceholder: 'Describa la escena...',
    galleryConferenceLabel: 'Conferencia/Evento',
    galleryAllEvents: 'Todos los Eventos',
    galleryPhotoTypeLabel: 'Tipo de Foto',
    galleryAllTypes: 'Todos los Tipos',
    galleryTypeConference: 'Fotos de Conferencia',
    galleryTypeHistoric: 'Fotos Históricas',
    galleryTypeHeadshots: 'Retratos/Personas',
    galleryTypeLogos: 'Logotipos',
    galleryTypeBackgrounds: 'Fondos',
    galleryLocationLabel: 'Ubicación',
    galleryAllLocations: 'Todas las Ubicaciones',
    galleryYearLabel: 'Año',
    galleryAllYears: 'Todos los Años',
    gallerySortByLabel: 'Ordenar Por',
    gallerySortLabel: 'Ordenar Por',
    gallerySortDateNewest: 'Fecha (Más Reciente Primero)',
    gallerySortDateOldest: 'Fecha (Más Antigua Primero)',
    gallerySortNewest: 'Fecha (Más Reciente Primero)',
    gallerySortOldest: 'Fecha (Más Antigua Primero)',
    gallerySortAlphaAZ: 'Alfabético (A-Z)',
    gallerySortAlphaZA: 'Alfabético (Z-A)',
    gallerySortCategory: 'Categoría',
    gallerySortPhotographer: 'Fotógrafo',
    gallerySearchButton: 'Buscar',
    galleryApplyButton: 'Buscar',
    galleryClearButton: 'Limpiar',
    galleryShowingAll: 'Mostrando todas las fotos',
    galleryDownloadButton: 'Descargar Seleccionadas',
    galleryDownloadDesc: 'Descargar fotos seleccionadas',
    galleryDownloadFiltered: 'Descargar Fotos Filtradas',
    galleryUploadButton: 'Subir Fotos',
    galleryUploadHeading: 'Subir Fotos',
    galleryUploadDescription: 'Comparta fotos de sus proyectos de restauración, investigación o eventos. Archivos aceptados: JPG, PNG (máx. 10MB cada uno)',
    galleryFeaturedHeading: 'Galerías Destacadas',
    galleryFeaturedICSR2024: 'ICSR 2024 - Charleston',
    galleryFeaturedICSR2024Desc: 'Explora momentos destacados de nuestra 11ª Conferencia Internacional sobre Restauración de Moluscos en Charleston, Carolina del Sur',
    galleryLegalNotice: 'Todas las fotos son propiedad de sus respectivos dueños. Todos los derechos reservados.',
    galleryLegalViewTerms: 'Ver términos completos',
    galleryKeyboardShortcuts: 'Atajos de Teclado',
    galleryLoading: 'Cargando fotos...',

    // Galería - Aviso Legal
    galleryLegalHeading: 'Aviso de Derechos de Autor',
    galleryLegalText: 'Las fotos son propiedad de sus respectivos dueños (ISRS, akorn environmental y contribuyentes individuales). Todos los derechos reservados. El uso, reproducción o distribución no autorizados están prohibidos.',
    galleryViewTerms: 'Ver términos completos',

    // Galería - Lightbox
    galleryDownload: 'Descargar',
    galleryFavorite: 'Favorito',
    galleryShare: 'Compartir',
    galleryPhotoDetails: 'Detalles de la Foto',
    galleryRelatedPhotos: 'Fotos Relacionadas',
    galleryComments: 'Comentarios',
    galleryAddComment: 'Agregar un comentario...',
    galleryPostComment: 'Publicar Comentario',
    galleryNoComments: '¡No hay comentarios aún. Sea el primero!',

    // Galería - Etiquetas de Metadatos
    galleryFilename: 'Nombre de Archivo',
    galleryDateTaken: 'Fecha de Captura',
    galleryCamera: 'Cámara',
    galleryLens: 'Lente',
    galleryFocalLength: 'Distancia Focal',
    galleryAperture: 'Apertura',
    galleryShutterSpeed: 'Velocidad de Obturación',
    galleryISO: 'ISO',
    galleryViews: 'Vistas',

    // Galería - Mensajes
    galleryFavoriteSuccess: '¡Agregado a tus favoritos!',
    galleryCommentSuccess: '¡Comentario publicado!',
    galleryLoginRequired: 'Por favor inicie sesión para comentar',
    galleryLoginFavorite: 'Por favor inicie sesión para guardar favoritos',
    galleryLinkCopied: '¡Enlace copiado al portapapeles!',
    galleryDownloadConfirm: '¿Descargar {count} fotos como archivo ZIP?',
    galleryDownloadStarted: '¡Descarga iniciada!',
    galleryDownloadFailed: 'Descarga fallida. Por favor intente nuevamente o contacte a soporte.',
    galleryNoPhotos: 'No hay fotos para descargar',
    galleryLoadingMore: 'Cargando más fotos...',
    galleryNoMore: '¡Ha llegado al final!',

    // Galería - Atajos de Teclado
    galleryShortcutsHeading: 'Atajos de Teclado',
    galleryShortcutHelp: 'Mostrar/ocultar esta ayuda',
    galleryShortcutNext: 'Siguiente foto',
    galleryShortcutPrev: 'Foto anterior',
    galleryShortcutClose: 'Cerrar lightbox',
    galleryShortcutZoomIn: 'Acercar',
    galleryShortcutZoomOut: 'Alejar',
    galleryShortcutZoomReset: 'Restablecer zoom',
    galleryShortcutFullscreen: 'Alternar pantalla completa',
    galleryShortcutSearch: 'Enfocar búsqueda',

    // Galería - Estados Vacíos
    galleryNoPhotosFound: 'No se Encontraron Fotos',
    galleryNoPhotosMessage: 'Ninguna foto coincide con sus filtros actuales. Intente ajustar sus criterios de búsqueda.',
    galleryComingSoonHeading: 'Galería Próximamente',
    galleryComingSoonMessage: 'Vuelva más tarde para ver fotos de nuestros proyectos de restauración y eventos.',

    // ========== PÁGINA APOYO ==========
    // Apoyo - Hero
    supportHeroHeading: 'Apoye a ISRS',
    supportHeroSubtitle: 'Construyendo Resiliencia Global a Través de la Restauración de Ecosistemas Marinos',

    // Apoyo - Oportunidad
    supportOpportunityHeading: 'La Oportunidad Crítica',
    supportOpportunityText: 'Los ecosistemas de moluscos proporcionan algunas de las soluciones más poderosas de la naturaleza a nuestros desafíos más apremiantes. Una sola ostra filtra 50 galones de agua diariamente. Los arrecifes de moluscos protegen las costas de marejadas ciclónicas y aumento del nivel del mar. Estos ecosistemas apoyan la biodiversidad, secuestran carbono y sostienen comunidades costeras, sin embargo, hemos perdido hasta el 85% de ellos a nivel mundial.',
    supportOpportunityBox: 'ISRS existe para revertir esta tendencia',
    supportOpportunityBoxText: 'Al unificar la comunidad global de restauración, avanzar el entendimiento científico y escalar enfoques exitosos de restauración en todo el mundo. Nuestra iniciativa insignia es la Conferencia Internacional sobre Restauración de Moluscos (ICSR) bienal, la reunión premier mundial para la restauración de moluscos desde 1996.',

    // Apoyo - Estadísticas
    support50Gallons: 'Galones filtrados diariamente por ostra',
    support85Loss: 'Pérdida global de moluscos',
    support300Plus: 'Profesionales de ICSR',
    support20Countries: 'Países representados',

    // Apoyo - Necesidad Urgente
    supportUrgentHeading: 'Necesidad Urgente: Crisis de Financiamiento Federal',
    supportUrgentText: 'Cambios recientes en el presupuesto federal han creado desafíos sin precedentes para la restauración de moluscos:',
    supportUrgentConclusion: 'La comunidad de restauración de moluscos ha respondido con notable resiliencia. ISRS fortalece esta comunidad, conectando a profesionales con diversas fuentes de financiamiento y asegurando que el impulso de restauración continúe a pesar de los desafíos federales.',

    // Apoyo - Oportunidades de Asociación
    supportPartnerHeading: 'Oportunidades de Asociación',
    supportPartnerIntro: 'ISRS da la bienvenida a socios de todos los niveles que comparten nuestro compromiso con ecosistemas marinos saludables.',

    supportFoundations: 'Para Fundaciones',
    supportFoundationsDesc: 'Inversión estratégica en soluciones climáticas basadas en la naturaleza con potencial de impacto global.',
    supportFoundationsImpact: 'Su Impacto',
    supportFoundationsLevels: 'Niveles de Inversión:',

    supportCorporations: 'Para Corporaciones',
    supportCorporationsDesc: 'Demuestre liderazgo ambiental mientras entrega beneficios ESG concretos.',
    supportCorporationsImpact: 'Su Impacto',
    supportCorporationsLevels: 'Niveles de Asociación:',

    supportGovernment: 'Para Gobierno',
    supportGovernmentDesc: 'Colaboración multilateral para la resiliencia costera y la gestión sostenible de recursos.',
    supportGovernmentImpact: 'Su Impacto',
    supportGovernmentLevels: 'Niveles de Asociación:',

    supportAcademia: 'Para Academia',
    supportAcademiaDesc: 'Avance el entendimiento científico a través de la colaboración global.',
    supportAcademiaImpact: 'Su Impacto',
    supportAcademiaLevels: 'Niveles de Asociación:',

    supportIndustry: 'Para Industria',
    supportIndustryDesc: 'Proteja los recursos marinos de los que depende su negocio.',
    supportIndustryImpact: 'Su Impacto',
    supportIndustryLevels: 'Niveles de Asociación:',

    supportIndividual: 'Para Donantes Individuales',
    supportIndividualDesc: 'Únase al movimiento global de restauración en cualquier nivel.',
    supportIndividualLevels: 'Niveles de Membresía',

    // Apoyo - Programas
    supportProgramsHeading: 'Programas que Entregan Impacto Global',
    supportProgramICR: 'Conferencia ICSR Bienal',
    supportProgramICRDesc: 'La reunión premier mundial para la restauración de moluscos, reuniendo a más de 300 profesionales de más de 20 países para compartir ciencia innovadora y enfoques exitosos de restauración. ICSR2026 se llevará a cabo del 5 al 8 de octubre de 2026, en el <a href="https://littlecreek.com/" target="_blank" rel="noopener noreferrer">Little Creek Resort and Conference Center</a>, operado por la Tribu Squaxin Island en Shelton, Washington.',
    supportProgramNetwork: 'Red Profesional Global',
    supportProgramNetworkDesc: 'Compromiso durante todo el año conectando a profesionales de restauración en todo el mundo a través de foros, seminarios web e iniciativas colaborativas que abordan desafíos compartidos.',
    supportProgramResearch: 'Apoyo a Investigación e Innovación',
    supportProgramResearchDesc: 'Facilitando investigación colaborativa, documentando mejores prácticas y apoyando la participación estudiantil en la ciencia de restauración.',
    supportProgramPolicy: 'Política y Defensa',
    supportProgramPolicyDesc: 'Avanzando políticas de restauración basadas en la ciencia y conectando a profesionales con oportunidades de financiamiento y apoyo regulatorio.',

    // Apoyo - Retroalimentación
    supportFeedbackHeading: 'Comparta su Retroalimentación',
    supportFeedbackIntro: '¿Tiene sugerencias o preguntas sobre nuestras oportunidades de asociación? Nos encantaría escuchar de usted.',
    supportFirstName: 'Nombre',
    supportLastName: 'Apellido',
    supportEmail: 'Correo Electrónico',
    supportOrganization: 'Organización',
    supportInquiryType: 'Tipo de Consulta',
    supportMessage: 'Mensaje',
    supportSend: 'Enviar Mensaje',

    // Apoyo - Tipos de Consulta
    supportGeneral: 'Consulta General',
    supportFoundationPartner: 'Asociación de Fundación',
    supportCorporatePartner: 'Asociación Corporativa',
    supportGovernmentPartner: 'Asociación Gubernamental',
    supportAcademicPartner: 'Asociación Académica',
    supportIndividualDonation: 'Donación Individual',
    supportOther: 'Otro',

    // Apoyo - CTA
    supportCTAHeading: 'Únase a Nosotros',
    supportCTAText: 'Juntos, podemos construir costas resilientes y océanos saludables para las generaciones futuras a través del poder de la restauración de moluscos.',
    supportContactPartnership: 'Contáctenos sobre Asociación',
    supportViewPressKit: 'Ver Kit de Prensa',

    // Portal de Miembros - Bienvenida
    welcomeToISRS: '¡Bienvenido a ISRS!',
    welcomeMessageExisting: 'Nos alegra que esté aquí. Tenemos su información de ICSR %YEARS%. Por favor revise y complete su perfil abajo.',
    welcomeMessageNew: '¡Nos emociona que se una a la comunidad ISRS! Complete su perfil para comenzar.',
    profileCompletionPrompt: 'Complete su perfil para conectarse con otros miembros y desbloquear todas las características',
    firstNameRequired: 'Nombre *',
    lastNameRequired: 'Apellido *',
    countryRequired: 'País *',
    cityLabel: 'Ciudad',
    emailCannotBeChanged: 'El correo electrónico no se puede cambiar',
    organizationRequired: 'Organización *',
    positionTitleLabel: 'Posición/Título',
    departmentLabel: 'Departamento',
    bioLabel: 'Biografía / Acerca de Mí',
    bioPlaceholder: 'Cuéntenos sobre su trabajo en restauración de moluscos...',
    researchAreasLabel: 'Áreas de Investigación',
    researchAreasPlaceholder: 'Por ejemplo, restauración de arrecifes de ostras, calidad del agua, evaluación de hábitat...',
    separateWithCommas: 'Separe múltiples áreas con comas',
    yourConferenceHistory: 'Su Historial de Conferencias ICSR',
    privacyDirectorySettings: 'Configuración de Privacidad y Directorio',
    memberDirectoryHeading: 'Directorio de Miembros',
    memberDirectoryDescription: 'El directorio de miembros de ISRS ayuda a conectar investigadores, practicantes y partes interesadas que trabajan en la restauración de moluscos en todo el mundo.',
    includeInDirectory: 'Incluirme en el directorio público de miembros',
    chooseVisibleFields: 'Elija qué información mostrar en el directorio:',
    nameRequiredField: 'Nombre (requerido)',
    organizationField: 'Organización',
    positionField: 'Posición/Título',
    countryField: 'País',
    cityField: 'Ciudad',
    bioField: 'Biografía',
    researchAreasField: 'Áreas de Investigación',
    conferenceHistoryField: 'Historial de Conferencias',
    privacyTermsHeading: 'Privacidad y Términos *',
    privacyConsentText: 'He leído y acepto la <a href="/privacy-policy.html" target="_blank">Política de Privacidad</a> y consiento que ISRS recopile y procese mis datos personales según se describe.',
    termsConsentText: 'Acepto los Términos de Servicio de ISRS y entiendo que este perfil se utilizará con fines de networking y conferencias.',
    yourPrivacyRights: 'Sus Derechos de Privacidad:',
    privacyRightsText: 'Puede solicitar una copia de sus datos, actualizar su información o solicitar la eliminación de su cuenta en cualquier momento desde la configuración de su perfil. Nunca venderemos sus datos a terceros.',
    completeProfileContinue: 'Completar Perfil y Continuar',
    fieldsMarkedRequired: 'Los campos marcados con * son requeridos',
    mustAcceptTerms: 'Debe aceptar la Política de Privacidad y los Términos de Servicio para continuar.',
    savingProfile: 'Guardando Perfil...',
    failedToSave: 'No se pudo guardar su perfil. Por favor intente de nuevo.',

    // Portal de Miembros - Directorio
    memberDirectory: 'Directorio de Miembros',
    directorySubtitle: 'Conéctese con investigadores, practicantes y partes interesadas que trabajan en la restauración de moluscos en todo el mundo',
    resultsCount: 'Mostrando %COUNT% miembros',
    searchLabel: 'Buscar',
    searchPlaceholder: 'Buscar miembros...',
    searchHint: '(nombre, organización, biografía, áreas de investigación)',
    countryFilterLabel: 'País',
    allCountries: 'Todos los Países',
    conferenceYearLabel: 'Año de Conferencia',
    allYears: 'Todos los Años',
    clearFiltersBtn: 'Limpiar Filtros',
    loadingMembers: 'Cargando miembros...',
    noMembersFound: 'No se Encontraron Miembros',
    tryAdjustingFilters: 'Intente ajustar sus criterios de búsqueda o filtros',
    joinISRSCommunity: 'Únase a la Comunidad ISRS',
    connectColleagues: 'Conéctese con colegas, comparta su investigación y manténgase actualizado sobre las iniciativas de restauración de moluscos en todo el mundo.',
    loginToProfile: 'Iniciar Sesión en Su Perfil',

    // Inscripción a la Conferencia
    confRegTitle: 'Inscripción a la Conferencia - ISRS 2026',
    confRegBackToConf: 'Volver a Información de la Conferencia',
    confRegHeading: 'Conferencia ISRS 2026',
    confRegSubtitle: 'Inscríbase para la Conferencia de la Sociedad Internacional de Restauración de Moluscos',
    confRegDate: '15-18 de Junio de 2026',

    // Pasos de Progreso
    confRegStep1: 'Su Perfil',
    confRegStep2: 'Detalles de Inscripción',
    confRegStep3: 'Sesiones y Talleres',
    confRegStep4: 'Revisión y Pago',

    // Paso 1: Perfil
    confRegFirstName: 'Nombre',
    confRegLastName: 'Apellido',
    confRegEmail: 'Correo Electrónico',
    confRegEmailHint: 'Este será su correo de inicio de sesión para acceder a su inscripción',
    confRegOrganization: 'Organización',
    confRegPosition: 'Cargo/Título',
    confRegCountry: 'País',
    confRegSelectCountry: 'Seleccione país...',
    confRegState: 'Estado',
    confRegProvince: 'Provincia',
    confRegSelectState: 'Seleccione estado...',
    confRegSelectProvince: 'Seleccione provincia...',
    confRegCity: 'Ciudad',
    confRegPhone: 'Número de Teléfono',
    confRegBio: 'Biografía Profesional',
    confRegBioPlaceholder: 'Cuéntenos sobre su trabajo en restauración de moluscos...',
    confRegBioHint: 'Esto será visible en el directorio de asistentes',
    confRegCV: 'Cargar CV/Currículum (Opcional)',
    confRegCVLink: 'O proporcione un enlace:',
    confRegResearchAreas: 'Áreas de Investigación (separadas por comas)',
    confRegResearchPlaceholder: 'ej., restauración de ostras, calidad del agua, adaptación climática',

    // Paso 2: Detalles de Inscripción
    confRegType: 'Tipo de Inscripción',
    confRegSelectType: 'Seleccione tipo de inscripción...',
    confRegEarlyBird: 'Inscripción Anticipada',
    confRegStudent: 'Estudiante',
    confRegEarlyBirdNotice: '🎉 ¡Precios de inscripción anticipada disponibles ahora! Inscríbase antes del 1 de marzo de 2026 para ahorrar.',
    confRegDiscountCode: 'Código de Descuento (Opcional)',
    confRegDiscountHint: '¿Tiene un código promocional? ¡Ingréselo aquí para ahorrar en su inscripción!',
    confRegDiscountPlaceholder: 'Ingrese código promocional (ej., EARLYBIRD2026)',
    confRegApplyCode: 'Aplicar Código',
    confRegValidating: 'Validando...',
    confRegEnterCode: 'Por favor ingrese un código de descuento',
    confRegSelectTypeFirst: 'Por favor seleccione un tipo de inscripción primero',
    confRegConfNotLoaded: 'Datos de la conferencia no cargados. Por favor actualice la página.',
    confRegInvalidCode: 'Código de descuento inválido',
    confRegCodeFailed: 'No se pudo validar el código de descuento. Por favor intente de nuevo.',
    confRegYouSavePercent: 'Ahorrará %VALUE%% en su tarifa de inscripción',
    confRegYouSaveAmount: 'Ahorrará $%VALUE% en su tarifa de inscripción',
    confRegRemoveCode: 'Eliminar código de descuento',

    confRegAttendanceType: 'Tipo de Asistencia',
    confRegInPerson: 'Presencial',
    confRegVirtual: 'Virtual',
    confRegFirstTime: 'Esta es mi primera conferencia ISRS',
    confRegPresenter: 'Planeo enviar un resumen para presentación',

    confRegDietary: 'Restricciones Dietéticas',
    confRegDietaryNone: 'Ninguna',
    confRegVegetarian: 'Vegetariano',
    confRegVegan: 'Vegano',
    confRegGlutenFree: 'Sin Gluten',
    confRegDietaryOther: 'Otro (especifique abajo)',
    confRegDietaryNotes: 'Notas Dietéticas',
    confRegDietaryPlaceholder: 'Por favor especifique alergias o requisitos dietéticos...',
    confRegAccessibility: 'Necesidades de Accesibilidad',
    confRegAccessibilityPlaceholder: 'Por favor háganos saber si requiere adaptaciones...',

    confRegEmergencyName: 'Nombre del Contacto de Emergencia',
    confRegEmergencyEmail: 'Correo del Contacto de Emergencia',
    confRegEmergencyPhone: 'Teléfono del Contacto de Emergencia',
    confRegEmergencyRelationship: 'Relación',
    confRegEmergencyRelationshipPlaceholder: 'ej., Cónyuge, Padre/Madre, Amigo',
    confRegEmergencyAuth: 'Autorizo a los administradores de la conferencia ISRS a contactar a mi contacto de emergencia designado en caso de una emergencia médica u otra situación urgente durante la conferencia.',

    confRegSpecialEvents: 'Eventos y Actividades Especiales',
    confRegSpecialEventsDesc: 'Seleccione los eventos y actividades especiales a los que le gustaría asistir. Algunos eventos pueden tener tarifas adicionales.',
    confRegWelcomeReception: 'Recepción de Bienvenida',
    confRegWelcomeReceptionDesc: 'Únase a nosotros para la recepción de la noche inaugural (Incluida en la inscripción)',
    confRegLowCountryBoil: 'Cena Low Country Boil',
    confRegLowCountryBoilDesc: 'Festín tradicional de mariscos con colegas (Incluido en la inscripción)',

    confRegFieldTrips: 'Excursiones',
    confRegFieldTripsDesc: 'Seleccione todas las que le interesen - capacidad limitada, pueden aplicar tarifas adicionales',
    confRegDolphinTours: 'Tours de Avistamiento de Delfines - Tour guiado de vida silvestre costera',
    confRegSeaTurtleCenter: 'Visita al Centro de Tortugas Marinas - Tour educativo de instalaciones de conservación',
    confRegRestorationSiteTour: 'Tour de Sitios de Restauración Locales - Visite proyectos de restauración activos',
    confRegGolfTournament: 'Torneo de Golf',
    confRegGolfTournamentDesc: 'Torneo de golf para networking (Tarifa adicional: $75)',

    confRegTshirtSize: 'Talla de Camiseta de la Conferencia (Opcional)',
    confRegNoTshirt: 'No necesito camiseta',
    confRegGuests: '¿Trae un Invitado a Eventos Sociales?',
    confRegNoGuests: 'Sin invitados',
    confRegOneGuest: '1 invitado (+$150)',
    confRegTwoGuests: '2 invitados (+$300)',
    confRegGuestsHint: 'Los invitados pueden asistir a eventos sociales y comidas (aplica tarifa adicional)',

    confRegContinuingEd: 'Solicitar Créditos de Educación Continua',
    confRegContinuingEdDesc: 'Créditos CE de la Sociedad para la Restauración Ecológica (SER)',
    confRegLicenseNumber: 'Número de Licencia Profesional (si aplica)',
    confRegLicenseNumberPlaceholder: 'ej., PWS #12345',
    confRegLicensingOrg: 'Organización de Licencias',
    confRegLicensingOrgPlaceholder: 'ej., Sociedad para la Restauración Ecológica',

    confRegAccommodation: 'Preferencias de Alojamiento',
    confRegNeedsAccommodation: 'Necesito ayuda para reservar alojamiento',
    confRegRoomSharing: 'Me interesa compartir habitación para reducir costos',
    confRegRoommatePrefs: 'Preferencias/Notas de Compañero de Habitación',
    confRegRoommatePlaceholder: '¿Alguna preferencia para compañero de habitación? Preferencia de género, tranquilo vs social, etc.',

    confRegAdditionalInfo: 'Información Adicional',
    confRegWillingVolunteer: 'Dispuesto a ser voluntario durante la conferencia',
    confRegFirstTimeAttendee: 'Esta es mi primera conferencia ISRS/ICSR',
    confRegOptInMailing: 'Unirse a la lista de correo de ISRS',
    confRegOptInFuture: 'Recibir actualizaciones sobre futuras conferencias',

    // Paso 3: Sesiones
    confRegSelectSessions: 'Seleccione Sus Sesiones y Talleres',
    confRegSessionsDesc: 'Elija los talleres y sesiones a los que le gustaría asistir. Algunas sesiones tienen capacidad limitada y pueden tener lista de espera. <strong>La selección de sesiones es opcional</strong> - puede omitir este paso si no está interesado en sesiones específicas.',
    confRegLoadingSessions: 'Cargando sesiones disponibles...',
    confRegNoSessions: 'No hay eventos disponibles para selección actualmente.',
    confRegCheckBack: 'Vuelva más tarde o continúe con su inscripción.',
    confRegSessionsError: 'No se pudieron cargar las sesiones',
    confRegSessionsErrorDesc: 'Puede continuar con la inscripción y agregar sesiones más tarde, o intente actualizar la página.',
    confRegContinueReview: 'Continuar a Revisión',
    confRegDateTBD: 'Fecha Por Determinar',
    confRegAvailable: 'Disponible',
    confRegLimited: '%COUNT% lugares restantes',
    confRegWaitlist: 'Lista de Espera',
    confRegFull: 'Completo',
    confRegGuestsWelcome: 'Invitados bienvenidos (aplica tarifa adicional)',
    confRegFeePerPerson: 'Tarifa:',
    confRegSelected: 'Seleccionado',
    confRegAlreadySignedUp: 'Ya inscrito',
    confRegAlreadySignedUpWaitlist: 'Ya inscrito (Lista de Espera)',

    // Paso 4: Revisión y Pago
    confRegReviewPayment: 'Revisión y Pago',
    confRegSummary: 'Resumen de Inscripción',
    confRegName: 'Nombre:',
    confRegEmailLabel: 'Correo:',
    confRegOrgLabel: 'Organización:',
    confRegNotSpecified: 'No especificado',
    confRegCountryLabel: 'País:',
    confRegTypeLabel: 'Tipo de Inscripción:',
    confRegAttendanceLabel: 'Asistencia:',
    confRegSelectedSessions: 'Sesiones y Talleres Seleccionados',
    confRegDiscountApplied: 'Descuento Aplicado',
    confRegCodeApplied: 'Código de descuento aplicado',
    confRegYouSave: 'Usted ahorra:',
    confRegAdditionalFee: 'Tarifa adicional:',

    confRegFeeSummary: 'Tarifa de Inscripción',
    confRegTotal: 'Total',
    confRegPaymentMethod: 'Método de Pago',
    confRegSelectPayment: 'Seleccione método de pago...',
    confRegOnlinePayment: 'Pago en Línea (Tarjeta de Crédito/Débito vía Zeffy)',
    confRegBankTransfer: 'Transferencia Bancaria',

    confRegZeffyTitle: '💳 Pago en Línea vía Zeffy',
    confRegZeffyDesc1: 'ISRS usa Zeffy, una plataforma de pago 100% gratuita para organizaciones sin fines de lucro.',
    confRegZeffyDesc2: 'Cuando proceda al pago, será redirigido a la página de pago seguro de Zeffy.',
    confRegZeffyImportant: 'Importante:',
    confRegZeffyTip: 'Zeffy puede preguntar si desea agregar una propina opcional para ayudar a mantener su plataforma gratuita para organizaciones sin fines de lucro como ISRS. <strong>Esta propina es completamente opcional</strong> y va a Zeffy, no a ISRS. Puede elegir "$0" o cualquier cantidad que desee.',
    confRegZeffyFee: 'Su tarifa de inscripción a la conferencia va 100% a ISRS para apoyar la conferencia y nuestra misión.',

    confRegBankTitle: '🏦 Instrucciones de Transferencia Bancaria',
    confRegBankDesc: 'Por favor transfiera la tarifa de inscripción a la siguiente cuenta bancaria de ISRS:',
    confRegBankName: 'Nombre del Banco:',
    confRegAccountName: 'Nombre de la Cuenta:',
    confRegAccountNumber: 'Número de Cuenta:',
    confRegRoutingACH: 'Número de Ruta (ACH/Depósito Directo):',
    confRegRoutingWire: 'Número de Ruta (Transferencia):',
    confRegSwiftCode: 'Código SWIFT:',
    confRegSwiftNote: '(para transferencias internacionales)',
    confRegBankImportant: 'Importante:',
    confRegBankInstr1: 'Incluya su número de inscripción en la referencia de transferencia',
    confRegBankInstr2: 'Envíe comprobante de transferencia a',
    confRegBankInstr3: 'Su inscripción será confirmada una vez recibido el pago (típicamente 3-5 días hábiles)',

    confRegAgreeTerms: 'Acepto los',
    confRegTermsLink: 'Términos y Condiciones',
    confRegAgreePrivacy: 'Reconozco la',
    confRegPrivacyLink: 'Política de Privacidad',
    confRegAgreeCode: 'Acepto seguir el',
    confRegCodeLink: 'Código de Conducta',

    confRegCompleteBtn: 'Completar Inscripción',
    confRegProcessing: 'Procesando su inscripción...',
    confRegSelectPaymentError: 'Por favor seleccione un método de pago',
    confRegSuccess: '¡Inscripción creada exitosamente! Redirigiendo al pago...',
    confRegSuccessBank: '¡Inscripción creada exitosamente! Redirigiendo a instrucciones de pago...',
    confRegFailed: 'La inscripción falló. Por favor intente de nuevo.',

    // Mensajes de Validación
    confRegRequiredFields: 'Por favor complete todos los campos requeridos (marcados con *)',
    confRegInvalidEmail: 'Por favor ingrese una dirección de correo válida',
    confRegSelectTypeError: 'Por favor seleccione un tipo de inscripción',
    confRegEventFull: 'Este evento está completo.',
    confRegAlreadyRegistered: 'Ya está inscrito para este evento.',

    // Mensaje de bienvenida
    confRegWelcomeBack: '¡Bienvenido de nuevo, %NAME%! Hemos completado su información previamente. Por favor revise y actualice según sea necesario.',

    // Botones de navegación
    confRegBack: 'Atrás',
    confRegNext: 'Siguiente',

    // Etiquetas de tipo de inscripción
    confRegEarlyBirdLabel: 'Inscripción Anticipada',
    confRegStudentLabel: 'Inscripción de Estudiante',

    // Página de Unirse a la Membresía
    joinTitle: 'Unirse a ISRS - Convertirse en Miembro',
    joinHeading: 'Únase a la Sociedad Internacional de Restauración de Moluscos',
    joinSubtitle: 'Sea parte de una comunidad global que avanza la restauración de moluscos y la conservación marina',
    joinBenefitsHeading: '🌊 Beneficios de Membresía',
    joinBenefit1: 'Acceso a investigación y publicaciones exclusivas',
    joinBenefit2: 'Inscripción con descuento a conferencias',
    joinBenefit3: 'Oportunidades de networking mundial',
    joinBenefit4: 'Boletín mensual y actualizaciones',
    joinBenefit5: 'Derecho a voto en elecciones de la junta',
    joinBenefit6: 'Apoye los esfuerzos globales de restauración',

    joinSelectMembership: 'Seleccione Su Membresía',
    joinRegularMember: 'Miembro Regular',
    joinRegularPrice: '$50/año',
    joinRegularDesc: 'Para profesionales e investigadores',
    joinStudentMember: 'Miembro Estudiante',
    joinStudentPrice: '$25/año',
    joinStudentDesc: 'Para estudiantes con identificación válida',
    joinLifetimeMember: 'Miembro Vitalicio',
    joinLifetimePrice: '$1,000',
    joinLifetimeDesc: 'Pago único, acceso de por vida',
    joinCorporateMember: 'Corporativo',
    joinCorporatePrice: '$500/año',
    joinCorporateDesc: 'Para organizaciones (5 miembros)',

    joinPersonalInfo: 'Información Personal',
    joinProfessionalBg: 'Antecedentes Profesionales',
    joinResearchAreas: 'Áreas de Investigación/Intereses',
    joinResearchPlaceholder: 'ej., Restauración de Ostras, Ecología Marina, Calidad del Agua',
    joinResearchHint: 'Separe múltiples áreas con comas',
    joinBioLabel: 'Biografía',
    joinBioPlaceholder: 'Cuéntenos sobre su trabajo e intereses en la restauración de moluscos...',
    joinWebsite: 'URL del Sitio Web',
    joinLinkedIn: 'Perfil de LinkedIn',

    joinDonationHeading: '💚 Apoye Nuestra Misión (Opcional)',
    joinDonationDesc: 'Sus cuotas de membresía nos ayudan a operar. Una donación adicional nos ayuda a aumentar nuestro impacto en la restauración global de moluscos.',
    joinNoDonation: 'Sin Donación',
    joinCustomAmount: 'Cantidad Personalizada:',
    joinInHonorOf: 'En Honor/Memoria De (Opcional)',
    joinInHonorPlaceholder: 'Dedique esta donación',

    joinCommPrefs: 'Preferencias de Comunicación',
    joinOptInEmails: 'Envíenme actualizaciones sobre actividades y oportunidades de ISRS',
    joinOptInNewsletter: 'Suscribirse al boletín mensual',

    joinProceedPayment: 'Proceder al Pago',
    joinPaymentNote: '💳 Pago seguro proporcionado por Zeffy (100% gratis, sin comisiones)',
    joinProcessing: 'Procesando su membresía...',
    joinWelcome: '🎉 ¡Bienvenido a ISRS!',
    joinSuccess: 'Su membresía ha sido creada exitosamente.',
    joinCheckEmail: 'Revise su correo electrónico para confirmación y próximos pasos.',
    joinSelectType: 'Por favor seleccione un tipo de membresía',
    joinCompletePayment: 'Complete Su Pago',
    joinCompletedPayment: 'He Completado el Pago',

    // Página de Confirmación de Conferencia
    confConfirmTitle: 'Confirmación de Registro - ISRS 2026',
    confConfirmLoading: 'Cargando detalles del registro...',
    confConfirmInvalidLink: 'Enlace de registro inválido. Por favor revise su correo electrónico o contacte a soporte.',
    confConfirmLoadError: 'No se pueden cargar los detalles del registro. Por favor contacte a soporte con su número de registro.',
    confConfirmHeading: '¡Registro Creado!',
    confConfirmThankYou: 'Gracias por registrarse para la Conferencia Internacional ISRS 2026',
    confConfirmRegNumber: 'Su Número de Registro:',
    confConfirmCompletePayment: '⚠️ Complete Su Pago',
    confConfirmPendingPayment: 'Su registro está actualmente <strong>pendiente de pago</strong>. Por favor complete su pago para confirmar su asistencia.',
    confConfirmAmountDue: 'Monto a Pagar:',
    confConfirmAboutZeffy: '<strong>Acerca de Zeffy:</strong> ISRS usa Zeffy, una plataforma de pago 100% gratuita para organizaciones sin fines de lucro. Zeffy puede preguntar si desea agregar una <strong>propina opcional</strong> - puede elegir $0 o cualquier cantidad. Esta propina va a Zeffy, no a ISRS.',
    confConfirmPayNow: 'Pagar Ahora con Zeffy',
    confConfirmPaymentProcessed: 'Recibirá un correo de confirmación una vez que se procese su pago.',
    confConfirmBankTransfer: '🏦 Instrucciones de Transferencia Bancaria',
    confConfirmBankPending: 'Su registro está actualmente <strong>pendiente de pago</strong>. Por favor transfiera la tarifa de registro para completar su registro.',
    confConfirmBankName: 'Nombre del Banco:',
    confConfirmAccountName: 'Nombre de la Cuenta:',
    confConfirmAccountNumber: 'Número de Cuenta:',
    confConfirmRoutingACH: 'Número de Ruta (ACH/Depósito Directo):',
    confConfirmRoutingWire: 'Número de Ruta (Transferencia Bancaria):',
    confConfirmSwiftCode: 'Código SWIFT:',
    confConfirmSwiftNote: '(para transferencias internacionales)',
    confConfirmTransferRef: '⚠️ REQUERIDO - Referencia de Transferencia:',
    confConfirmImportantSteps: 'Pasos Importantes:',
    confConfirmBankStep1: 'Transfiera la cantidad exacta mostrada arriba',
    confConfirmBankStep2: 'Incluya su número de registro ({0}) en la referencia de transferencia',
    confConfirmBankStep3: 'Envíe comprobante de transferencia a',
    confConfirmBankStep4: 'Su registro será confirmado una vez que se reciba el pago (típicamente 3-5 días hábiles)',
    confConfirmWhatsNext: '¿Qué Sigue?',
    confConfirmNext1: 'Complete su pago usando el botón de arriba',
    confConfirmNext2: 'Revise su correo para la confirmación de registro',
    confConfirmNext3: 'La presentación de resúmenes abre el 1 de abril de 2026',
    confConfirmNext4: 'Envíe su resumen de presentación (si aplica)',
    confConfirmNext5: 'Reserve su viaje y alojamiento',
    confConfirmNext6: '¡Únase a nosotros del 15 al 18 de junio de 2026!',
    confConfirmProfileDashboard: 'Su Panel de Perfil',
    confConfirmProfileDesc: 'Acceda a su panel personalizado para ver todos sus registros, gestionar su información y seguir su actividad en la conferencia.',
    confConfirmAccessProfile: 'Acceder a Su Perfil',
    confConfirmSubmitAbstract: 'Enviar Su Resumen',
    confConfirmSecureAccess: '<strong>Acceso Seguro:</strong> Usamos autenticación con enlace mágico - ¡no necesita contraseña! Revise su correo ({0}) para un enlace de inicio de sesión seguro que expira en 15 minutos.',
    confConfirmDashboardFeatures: 'Desde su panel puede:',
    confConfirmDashboardFeature1: 'Ver todos sus registros de conferencia',
    confConfirmDashboardFeature2: 'Enviar y gestionar múltiples resúmenes',
    confConfirmDashboardFeature3: 'Actualizar su información de contacto',
    confConfirmDashboardFeature4: 'Seguir el estado de su pago',
    confConfirmSpreadWord: '🎉 ¡Corra la Voz!',
    confConfirmShareText: '¡Ayúdenos a hacer crecer la comunidad de restauración de mariscos! Comparta esta conferencia con colegas, amigos y familiares que se preocupan por la conservación marina.',
    confConfirmShareX: 'Compartir en X',
    confConfirmShareLinkedIn: 'Compartir en LinkedIn',
    confConfirmShareFacebook: 'Compartir en Facebook',
    confConfirmInviteColleagues: '📧 Invitar Colegas por Correo',
    confConfirmInviteDesc: 'Ingrese direcciones de correo de colegas que podrían estar interesados en asistir:',
    confConfirmEmailPlaceholder: 'colega@ejemplo.com',
    confConfirmAddEmail: 'Agregar',
    confConfirmSendInvites: 'Enviar Invitaciones',
    confConfirmInvitesSent: '✓ ¡Invitaciones enviadas exitosamente!',
    confConfirmQuestions: '¿Preguntas?',
    confConfirmContactUs: 'Contáctenos en',
    confConfirmReturnHome: 'Volver al Inicio',
    confConfirmValidEmail: 'Por favor ingrese una dirección de correo válida',
    confConfirmEmailAdded: 'Este correo ya ha sido agregado',
    confConfirmAddAtLeastOne: 'Por favor agregue al menos una dirección de correo',
    confConfirmInviteFailed: 'No se pudieron enviar las invitaciones. Por favor intente de nuevo o contacte a soporte.',

    // Página de Envío de Resumen
    abstractTitle: 'Enviar Resumen - ISRS 2026',
    abstractHeading: 'Envíe Su Resumen',
    abstractConference: 'Conferencia Internacional ISRS 2026',
    abstractLocation: '15-18 de junio de 2026 | Jekyll Island, Georgia',
    abstractDeadline: '📅 Fecha Límite de Envío: 15 de marzo de 2026',
    abstractNotification: 'Notificación de aceptación: 15 de abril de 2026',
    abstractSubmitting: 'Enviando su resumen...',
    abstractSuccessHeading: '🎉 ¡Resumen Enviado Exitosamente!',
    abstractSuccessNumber: 'Su número de envío es:',
    abstractSuccessEmail: 'Recibirá un correo de confirmación en breve.',
    abstractViewDashboard: 'Ver Su Panel de Perfil →',
    abstractBasicInfo: 'Información Básica',
    abstractTitleLabel: 'Título del Resumen',
    abstractTitleMax: 'Máximo 250 caracteres',
    abstractTextLabel: 'Texto del Resumen',
    abstractTextMax: 'Máximo 3000 caracteres. Por favor no incluya nombres de autores o afiliaciones en el texto del resumen.',
    abstractKeywords: 'Palabras Clave',
    abstractKeywordPlaceholder: 'Ingrese una palabra clave',
    abstractAddKeyword: 'Agregar Palabra Clave',
    abstractKeywordHint: 'Agregue 3-6 palabras clave para ayudar a categorizar su resumen',
    abstractPresentationFormat: 'Formato de Presentación',
    abstractOral: '🎤 Presentación Oral',
    abstractOralDesc: 'Charla de 15 minutos con 5 minutos de preguntas',
    abstractPoster: '📊 Presentación de Póster',
    abstractPosterDesc: 'Exhiba y discuta su investigación',
    abstractEither: '🤷 Cualquier Formato',
    abstractEitherDesc: 'Tiene flexibilidad con el formato',
    abstractTopicArea: 'Área Temática',
    abstractSelectTopic: 'Seleccione área temática...',
    abstractTopicRestoration: 'Ecología de Restauración',
    abstractTopicWater: 'Calidad del Agua',
    abstractTopicHabitat: 'Restauración de Hábitat',
    abstractTopicOyster: 'Restauración de Ostras',
    abstractTopicClam: 'Restauración de Almejas',
    abstractTopicMussel: 'Restauración de Mejillones/Agua Dulce',
    abstractTopicPolicy: 'Políticas y Gestión',
    abstractTopicAquaculture: 'Acuicultura',
    abstractTopicCommunity: 'Participación Comunitaria',
    abstractTopicClimate: 'Impactos del Cambio Climático',
    abstractTopicMonitoring: 'Monitoreo y Evaluación',
    abstractTopicOther: 'Otro',
    abstractPreferredSession: 'Sesión Preferida (Opcional)',
    abstractSessionPlaceholder: 'ej., Restauración Costera',
    abstractSessionHint: 'Si desea ser agrupado con temas similares',
    abstractPresentingAuthor: 'Autor Presentador',
    abstractYourEmail: 'Su Correo Electrónico',
    abstractEmailHint: 'Usaremos esto para contactarlo sobre su envío',
    abstractYourName: 'Su Nombre',
    abstractOrganization: 'Organización/Institución',
    abstractOrcid: 'ORCID (Opcional)',
    abstractGetOrcid: 'Obtenga su ORCID',
    abstractCoAuthors: 'Co-Autores (Opcional)',
    abstractCoAuthorsDesc: 'Agregue cualquier co-autor que contribuyó a este trabajo. Serán listados en el programa.',
    abstractAddCoAuthor: 'Agregar Co-Autor',
    abstractRemove: 'Eliminar',
    abstractCoAuthorName: 'Nombre',
    abstractCoAuthorEmail: 'Correo Electrónico',
    abstractCoAuthorOrg: 'Organización',
    abstractAdditionalReq: 'Requisitos Adicionales',
    abstractAVEquipment: 'Necesitaré equipo audiovisual (proyector/pantalla)',
    abstractSpecialEquip: 'Equipo o Requisitos Especiales (Opcional)',
    abstractSpecialPlaceholder: 'ej., Necesito toma eléctrica para exhibición, requiero conexión a internet, etc.',
    abstractAgreeTerms: 'Acepto los',
    abstractTermsLink: 'Términos y Condiciones',
    abstractAcknowledgePrivacy: 'Reconozco la',
    abstractPrivacyLink: 'Política de Privacidad',
    abstractSubmitButton: 'Enviar Resumen',
    abstractSubmitNote: 'Al enviar, acepta presentar si es aceptado',
    abstractLoginRequired: 'Por favor inicie sesión para enviar un resumen',
    abstractSessionExpired: 'Su sesión ha expirado. Por favor inicie sesión de nuevo.',
    abstractSelectFormat: 'Por favor seleccione un formato de presentación',
    abstractNoConference: 'No se encontró conferencia activa. Por favor intente más tarde.',
    abstractProfileError: 'Perfil de usuario no cargado. Por favor actualice la página.',
    abstractMaxKeywords: 'Máximo 6 palabras clave permitidas',
    abstractKeywordExists: 'Esta palabra clave ya ha sido agregada',

    // Página de Bienvenida
    welcomeTitle: 'Bienvenido a ISRS - Sociedad Internacional para la Restauración de Mariscos',
    welcomeHeading: 'Bienvenido a ISRS',
    welcomeSubtitle: 'Sociedad Internacional para la Restauración de Mariscos',
    welcomeAnnouncementHeading: '🎉 ¡Nuevo Portal de Miembros Lanzado!',
    welcomeAnnouncementText: 'Acceda a su perfil, explore el directorio de miembros, regístrese para ICSR2026 en Puget Sound y conéctese con la comunidad global de restauración de mariscos.',
    welcomeGetStarted: 'Comenzar',
    welcomeEnterEmail: 'Ingrese su correo electrónico para verificar su estado de membresía o unirse a nuestra comunidad.',
    welcomeEmailPlaceholder: 'su@correo.com',
    welcomeContinue: 'Continuar',
    welcomeBenefit1: 'Membresía gratuita',
    welcomeBenefit2: 'Acceso al directorio de miembros',
    welcomeBenefit3: 'Registro de conferencia',
    welcomeBenefit4: 'Red global',
    welcomeAlreadyExploring: '¿Ya está explorando?',
    welcomeContinueToMain: 'Continuar al sitio principal',
    welcomeLearnICRS: 'Conozca ICSR',
    welcomeICRS2026Details: 'Detalles de ICSR2026',
    welcomeEnterEmailError: 'Por favor ingrese su dirección de correo electrónico',
    welcomeChecking: 'Verificando...',
    welcomeEmailSent: '¡Correo Enviado!',
    welcomeCheckEmail: '✅ ¡Revise su correo! Le hemos enviado un enlace mágico para iniciar sesión.',
    welcomeNoAccount: 'No tenemos una cuenta con ese correo. ¿Le gustaría convertirse en miembro?',
    welcomeJoinNow: 'Únase a ISRS (Gratis)',
    welcomeSignupComingSoon: '¡Registro de membresía próximamente! Por ahora, contacte a info@shellfish-society.org',
    welcomeNetworkError: 'Error de red. Por favor verifique su conexión e intente de nuevo.',
    welcomeSomethingWrong: 'Algo salió mal. Por favor intente de nuevo.',
    // Página de Bienvenida - Vista Previa de Perfil (Paso 2)
    welcomeWelcomeBack: '¡Bienvenido de Nuevo!',
    welcomeFoundProfile: 'Encontramos su perfil en nuestro sistema. Por favor verifique que sea usted:',
    welcomeLocation: 'Ubicación',
    welcomeConferenceHistory: 'Historial de Conferencias',
    welcomeCurrentRoles: 'Roles Actuales',
    welcomeSendMagicLink: 'Sí, Envíenme un Enlace Mágico',
    welcomeNotMe: 'Este No Soy Yo',
    welcomeSending: 'Enviando...',
    // Página de Bienvenida - Nuevo Usuario (Paso 2 Alt)
    welcomeNewMember: '¡Bienvenido, Nuevo Miembro!',
    welcomeNoExistingAccount: 'No tenemos una cuenta existente con este correo electrónico. Únase a nuestra comunidad para acceder al portal de miembros, registro de conferencias y más.',
    welcomeTryDifferent: 'Probar Otro Correo',
    welcomeCreating: 'Configurando...',

    // Página de Inicio de Sesión de Perfil
    loginTitle: 'Iniciar Sesión en Su Perfil - ISRS',
    loginHeading: 'Acceda a Su Perfil',
    loginSubtitle: 'Le enviaremos un enlace seguro de inicio de sesión por correo electrónico',
    loginMagicLinkSent: '✓ ¡Enlace Mágico Enviado!',
    loginCheckEmail: 'Revise su correo para el enlace seguro de inicio de sesión. El enlace expirará en 15 minutos.',
    loginError: '⚠ Error',
    loginEmailLabel: 'Dirección de Correo',
    loginEmailPlaceholder: 'su.correo@ejemplo.com',
    loginSendMagicLink: 'Enviar Enlace Mágico',
    loginWhatIsMagicLink: '¿Qué es un Enlace Mágico?',
    loginMagicLinkExplain: 'Un enlace mágico es un enlace seguro de un solo uso enviado a su correo. Haga clic en el enlace para acceder a su perfil sin necesidad de contraseña.',
    loginMagicLinkBenefit1: 'Sin contraseñas que recordar',
    loginMagicLinkBenefit2: 'Expira después de 15 minutos',
    loginMagicLinkBenefit3: 'Solo puede usarse una vez',
    loginBackToHome: '← Volver al Inicio',
    loginSending: 'Enviando...',
    loginVerifying: 'Verificando...',
    loginEnterEmail: 'Por favor ingrese su dirección de correo electrónico',
    loginFailedSend: 'Error al enviar enlace mágico',
    loginNetworkError: 'Error de red. Por favor intente de nuevo.',
    loginInvalidLink: 'Enlace mágico inválido o expirado',
    loginFailedVerify: 'Error al verificar enlace mágico',
    loginDevMode: 'Modo de Desarrollo:',

    // Páginas Legales
    legalPrivacyTitle: 'Política de Privacidad - ISRS',
    legalPrivacyHeading: 'Política de Privacidad',
    legalTermsTitle: 'Términos y Condiciones - ISRS',
    legalTermsHeading: 'Términos y Condiciones',
    legalAccessibilityTitle: 'Declaración de Accesibilidad - ISRS',
    legalAccessibilityHeading: 'Declaración de Accesibilidad',
    legalCodeOfConductTitle: 'Código de Conducta - ISRS',
    legalCodeOfConductHeading: 'Código de Conducta',
    legalOrganization: 'Sociedad Internacional para la Restauración de Mariscos',
    legalLastUpdated: 'Última Actualización:',
    legalHome: 'Inicio',
    legalBackToHome: '← Volver al Inicio',
    legalNote: 'Nota: Este documento legal se proporciona en inglés. Las traducciones son solo para referencia; la versión en inglés es el documento legalmente vinculante.'
  },
  fr: {
    // Navigation
    home: 'Accueil',
    about: 'À Propos',
    icsr: 'ICSR',
    gallery: 'Galerie',
    support: 'Soutien',
    donate: 'FAIRE UN DON',
    skipToMain: 'Passer au contenu principal',

    // Page d'accueil - Hero
    heroHeading: 'Construire une communauté et faire progresser l\'innovation dans la restauration mondiale des mollusques',
    heroSubtitle: 'La Société Internationale pour la Restauration des Mollusques (ISRS) réunit des scientifiques, des praticiens et des communautés du monde entier pour protéger et restaurer les écosystèmes de mollusques vitaux. Par le partage des connaissances, la collaboration et des approches innovantes, nous travaillons à assurer la résilience des écosystèmes côtiers pour les générations à venir.',

    // Page d'accueil - Bannière ICSR2026
    homeBannerTitle: 'ICSR2026 • Puget Sound, Washington',
    homeBannerDates: '5-8 Octobre 2026',
    homeBannerVenue: 'Little Creek Casino Resort',
    homeBannerDescription: 'Rejoignez plus de 350 praticiens de la restauration des mollusques de plus de 25 pays pour des recherches de pointe, des ateliers pratiques et des visites de sites de restauration tribaux. Présidé par Puget Sound Restoration Fund.',
    homeBannerViewDetails: 'Voir Tous les Détails',
    homeBannerBecomeSponsor: 'Devenir Sponsor',
    homeBannerSponsorshipProgress: 'Progrès du Parrainage',
    homeBannerGoal: 'Objectif :',
    homeBannerRaised: 'collecté',
    homeBannerEarlySponsors: 'Sponsors initiaux :',

    // Page d'accueil - Initiatives Vedettes
    icsrCardTitle: 'Conférence Internationale sur la Restauration des Mollusques (ICSR)',
    icsrCardText: 'Rejoignez-nous à Puget Sound, Washington, pour ICSR 2026, le principal rassemblement mondial de science et de pratique de restauration des mollusques. Connectez-vous avec les leaders du domaine, partagez vos recherches et découvrez des approches innovantes aux défis de restauration.',
    icsrCardButton: 'En Savoir Plus sur ICSR 2026',

    knowledgeCardTitle: 'Échange Mondial de Connaissances',
    knowledgeCardText: 'Accédez à des recherches de pointe, aux meilleures pratiques et aux leçons tirées de projets de restauration dans le monde entier. Notre réseau international connecte les praticiens sur tous les continents pour partager l\'expertise et accélérer les résultats de restauration réussis.',
    knowledgeCardButton: 'Explorer les Ressources',

    communityCardTitle: 'Impact Communautaire',
    communityCardText: 'Des récifs d\'huîtres aux bancs de moules, la restauration des mollusques améliore la qualité de l\'eau, soutient la biodiversité et renforce la résilience côtière. Découvrez comment nos membres font une différence dans les écosystèmes côtiers du monde entier.',
    communityCardButton: 'Voir les Réussites',

    // Page d'accueil - Dernières Nouvelles
    latestNews: 'Dernières Nouvelles',
    news1Title: 'Les Inscriptions Ouvrent Début 2026 pour ICSR 2026',
    news1Text: 'Marquez votre calendrier pour la prochaine Conférence Internationale sur la Restauration des Mollusques à Puget Sound.',
    news1Button: 'Recevoir les Mises à Jour',

    news2Title: 'Lancement d\'un Nouveau Partenariat Mondial',
    news2Text: 'ISRS s\'associe à la Native Oyster Restoration Alliance (NORA) et au Réseau de Restauration Côtière d\'Australasie pour faire progresser les efforts de restauration internationale.',
    news2Button: 'En Savoir Plus',

    news3Title: 'Recherche Étudiante en Vedette',
    news3Text: 'Rencontrez la prochaine génération de scientifiques de la restauration et leur travail révolutionnaire.',
    news3Button: 'Science de Nouvelle Génération',

    // Page d'accueil - Pourquoi C'est Important
    whyMattersHeading: 'Pourquoi la Restauration des Mollusques Importe',
    whyMattersIntro: 'Les écosystèmes de mollusques fournissent des services essentiels qui soutiennent à la fois la vie marine et les communautés humaines:',

    benefit1Title: '💧 Filtration de l\'Eau',
    benefit1Text: 'Qualité de l\'eau améliorée par filtration naturelle',

    benefit2Title: '🐟 Habitat Critique',
    benefit2Text: 'Habitat essentiel pour les espèces marines',

    benefit3Title: '🌊 Protection Côtière',
    benefit3Text: 'Barrières naturelles contre les ondes de tempête et l\'érosion',

    benefit4Title: '🍽️ Sécurité Alimentaire',
    benefit4Text: 'Fruits de mer durables pour les communautés locales',

    benefit5Title: '🌱 Séquestration du Carbone',
    benefit5Text: 'Atténuation du changement climatique par le stockage du carbone',

    benefit6Title: '🎣 Pêcheries Durables',
    benefit6Text: 'Soutien aux économies locales et à la sécurité alimentaire',

    benefit7Title: '🏛️ Patrimoine Culturel',
    benefit7Text: 'Préservation des pratiques traditionnelles',

    // Appel à l\'Action
    ctaText: 'Ensemble, nous pouvons restaurer ces écosystèmes vitaux et construire des côtes plus résilientes.',

    // Section S\'impliquer
    getInvolvedHeading: 'S\'impliquer',

    joinNetworkTitle: 'Rejoignez Notre Réseau',
    joinNetworkText: 'Connectez-vous avec des praticiens de la restauration, des scientifiques et des leaders communautaires du monde entier.<br>Les membres ont accès à des ressources exclusives, des opportunités de réseautage et des réductions pour les conférences.',
    joinNetworkButton: 'Devenir Membre',

    shareKnowledgeTitle: 'Partagez Vos Connaissances',
    shareKnowledgeText: 'Présentez vos recherches, contribuez aux guides de meilleures pratiques ou mentorez des professionnels émergents. Votre expertise aide à faire progresser le domaine de la restauration des mollusques.',
    shareKnowledgeButton: 'Partenariat avec Nous',

    supportMissionTitle: 'Soutenez Notre Mission',
    supportMissionText: 'Aidez à construire un avenir durable pour les écosystèmes côtiers par le biais de l\'adhésion, du partenariat ou du don caritatif.',
    supportMissionButton: 'Faire un Don',

    donationNote: 'ISRS utilise Zeffy, une plateforme de collecte de fonds 100% gratuite qui nous permet de recevoir chaque dollar de votre don sans déduire de frais de plateforme. Lorsque vous faites un don, vous verrez une contribution optionnelle pour soutenir le service gratuit de Zeffy. Ce pourboire est entièrement optionnel - vous pouvez l\'ajuster à n\'importe quel montant ou 0$.',

    // Page de Soutien
    supportHeroHeading: 'Soutenir ISRS',
    supportHeroSubtitle: 'Construire la Résilience Mondiale par la Restauration des Écosystèmes Marins',
    supportOpportunityHeading: 'L\'Opportunité Critique',
    supportOpportunityText: 'Les écosystèmes de mollusques fournissent certaines des solutions les plus puissantes de la nature à nos défis les plus pressants. Une seule huître filtre 50 gallons d\'eau quotidiennement. Les récifs de mollusques protègent les côtes contre les ondes de tempête et l\'élévation du niveau de la mer. Ces écosystèmes soutiennent la biodiversité, séquestrent le carbone et maintiennent les communautés côtières—pourtant nous en avons perdu jusqu\'à 85% à l\'échelle mondiale.',
    supportOpportunityBoxHeading: 'ISRS existe pour inverser cette tendance',
    supportOpportunityBoxText: 'En unifiant la communauté mondiale de restauration, en faisant progresser la compréhension scientifique et en développant des approches de restauration réussies dans le monde entier. Notre initiative phare est la Conférence Internationale sur la Restauration des Mollusques (ICSR) biennale—le premier rassemblement mondial pour la restauration des mollusques depuis 1996.',
    supportStat1Number: '50',
    supportStat1Label: 'Gallons filtrés quotidiennement par huître',
    supportStat2Number: '85%',
    supportStat2Label: 'Perte mondiale de mollusques',
    supportStat3Number: '300+',
    supportStat3Label: 'Praticiens ICSR',
    supportStat4Number: '20+',
    supportStat4Label: 'Pays représentés',
    supportUrgentHeading: 'Besoin Urgent: Crise de Financement Fédéral',
    supportUrgentIntro: 'Les changements récents du budget fédéral ont créé des défis sans précédent pour la restauration des mollusques:',
    supportUrgentPoint1: 'Le budget de Conservation des Habitats de la NOAA réduit de 29%',
    supportUrgentPoint2: 'Plus de 586 employés de la NOAA licenciés, réduisant la capacité de support technique',
    supportUrgentPoint3: 'Les programmes Sea Grant risquent l\'élimination ou un définancement sévère',
    supportUrgentPoint4: 'Phase finale du financement de restauration de la Loi Bipartisane sur les Infrastructures se terminant en 2025',
    supportUrgentConclusion: 'La communauté de restauration des mollusques a répondu avec une résilience remarquable. ISRS renforce cette communauté, connectant les praticiens avec diverses sources de financement et assurant que l\'élan de restauration continue malgré les défis fédéraux.',
    supportPartnershipHeading: 'Opportunités de Partenariat',
    supportPartnershipIntro: 'ISRS accueille les partenaires à tous les niveaux qui partagent notre engagement envers des écosystèmes marins sains.',
    supportProgramsHeading: 'Programmes à Impact Mondial',
    supportFeedbackHeading: 'Partagez Vos Commentaires',
    supportFeedbackIntro: 'Vous avez des suggestions ou des questions sur nos opportunités de partenariat? Nous serions ravis de vous entendre.',
    supportFirstName: 'Prénom <span class="required">*</span>',
    supportLastName: 'Nom <span class="required">*</span>',
    supportEmail: 'Email <span class="required">*</span>',
    supportOrganization: 'Organisation',
    supportInquiryType: 'Type de Demande',
    supportGeneralInquiry: 'Demande Générale',
    supportFoundationPartner: 'Partenariat Fondation',
    supportCorporatePartner: 'Partenariat Corporatif',
    supportGovernmentPartner: 'Partenariat Gouvernemental',
    supportAcademicPartner: 'Partenariat Académique',
    supportIndividualDonation: 'Don Individuel',
    supportOther: 'Autre',
    supportMessage: 'Message <span class="required">*</span>',
    supportCTAHeading: 'Rejoignez-Nous',
    supportCTAText: 'Ensemble, nous pouvons construire des côtes résilientes et des océans sains pour les générations futures grâce au pouvoir de la restauration des mollusques.',
    supportCTAContact: 'Contactez-Nous pour un Partenariat',
    supportCTAPressKit: 'Voir le Dossier de Presse',
    supportCTAContactInfo: 'Des questions? Contactez-nous à aaron@shellfish-society.org',

    // Pourquoi la Restauration des Mollusques Est Importante
    whyMattersHeading: 'Pourquoi la Restauration des Mollusques Est Importante',
    whyMattersIntro: 'Découvrez comment les écosystèmes de mollusques fournissent des services essentiels—<br>de la filtration de l\'eau à la protection côtière.',
    whyMattersButton: 'En Savoir Plus',

    // Réseau Global
    globalNetworkHeading: 'Notre Réseau Mondial',
    globalNetworkIntro: 'Rejoignez notre réseau en croissance de plus de 2 600 membres<br>travaillant à faire progresser la restauration des mollusques dans le monde entier.',
    globalNetworkText: 'ISRS connecte les praticiens de la restauration sur six continents, favorisant la collaboration entre:',

    stakeholder1: 'Institutions de recherche',
    stakeholder2: 'Agences gouvernementales',
    stakeholder3: 'Organisations de conservation',
    stakeholder4: 'Communautés autochtones',
    stakeholder5: 'Partenaires industriels',
    stakeholder6: 'Parties prenantes locales',

    // Boutons communs
    learnMore: 'En Savoir Plus',
    getInvolved: 'S\'impliquer',
    readMore: 'Lire Plus',

    // Pied de page
    stayConnected: 'Restez Connecté',
    stayConnectedText: 'Intéressé par une collaboration? Remplissez les informations et nous vous contacterons sous peu.',
    stayConnectedText2: 'Nous avons hâte de vous entendre!',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Courriel',
    message: 'Message',
    send: 'Envoyer',
    required: '*',
    quickLinks: 'Liens Rapides',
    connect: 'Connecter',
    adminPortal: 'Portail Admin',
    copyright: '© 2026 Société Internationale pour la Restauration des Mollusques. Tous droits réservés.',
    taxId: 'Numéro fiscal (EIN): 39-2829151',

    // Pied de page
    footerTagline: 'Construire une communauté et faire progresser l\'innovation dans la restauration mondiale des mollusques',
    footerLegal: 'Légal',
    footerPrivacyPolicy: 'Politique de Confidentialité',
    footerTermsOfService: 'Conditions de Service',
    footerCodeOfConduct: 'Code de Conduite',
    footerAccessibility: 'Accessibilité',
    footerSitemap: 'Plan du Site',
    footerPhotoGallery: 'Galerie de Photos',
    footerSupportISRS: 'Soutenir ISRS',
    footerPressKit: 'Kit de Presse',
    footerTaxDisclaimer: 'ISRS est une organisation à but non lucratif 501(c)(3) (en attente d\'approbation de l\'IRS). Les dons sont déductibles d\'impôts dans la mesure autorisée par la loi.',

    // Bannière de Consentement aux Cookies
    cookieConsentTitle: 'Nous Valorisons Votre Vie Privée',
    cookieConsentText: 'Nous utilisons des cookies pour améliorer votre expérience de navigation, analyser le trafic du site et comprendre d\'où viennent nos visiteurs. En continuant à utiliser notre site, vous consentez à notre utilisation des cookies.',
    cookieConsentAccept: 'Accepter Tout',
    cookieConsentDecline: 'Refuser les Non-Essentiels',
    cookieConsentLearnMore: 'En savoir plus dans notre Politique de Confidentialité',

    // Portail des Membres - Connexion
    memberLogin: 'Connexion Membre',
    loginSubtitle: 'Entrez votre adresse e-mail et nous vous enverrons un lien de connexion sécurisé',
    emailAddress: 'Adresse E-mail',
    sendMagicLink: 'Envoyer le Lien Magique',
    securePasswordlessAuth: 'Authentification Sécurisée sans Mot de Passe',
    securePasswordlessDesc: 'Aucun mot de passe à retenir. Nous vous enverrons un lien magique unique par e-mail qui expire dans 15 minutes.',
    portalAccountFeatures: 'Que pouvez-vous faire avec votre compte du portail?',
    portalFeature1: 'S\'inscrire aux conférences et événements',
    portalFeature2: 'Soumettre et gérer des résumés',
    portalFeature3: 'Accéder au répertoire des membres',
    portalFeature4: 'Gérer votre profil et paramètres de confidentialité',
    portalFeature5: 'Voir l\'historique des conférences et présentations',
    portalFeature6: 'Membres du conseil: Accéder aux documents de gouvernance et votes',
    backToHome: 'Retour à l\'Accueil',
    needHelp: 'Besoin d\'aide? Contactez-nous à',
    dontHaveAccount: 'Vous n\'avez pas encore de compte?',
    createAccount: 'Créer un Nouveau Compte',
    pastAttendeeNote: 'Vous avez assisté à une conférence ICSR précédente? Vous avez probablement déjà un compte! Entrez simplement l\'adresse e-mail que vous avez utilisée pour l\'inscription ci-dessus.',
    learnAboutICSR: 'En Savoir Plus sur ICSR2026',
    checkYourEmail: 'Vérifiez Votre E-mail!',
    magicLinkSent: 'Nous avons envoyé un lien de connexion sécurisé à',
    magicLinkSentTo: 'Nous avons envoyé un lien de connexion sécurisé à',
    magicLinkInstructions: 'Cliquez sur le lien dans l\'e-mail pour accéder à votre profil de membre. Le lien expirera dans 15 minutes.',
    sendAnotherLink: 'Envoyer un Autre Lien',

    // Portail des Membres - Inscription
    signupHeading: 'Rejoindre ISRS',
    signupSubtitle: 'Créez votre compte membre pour accéder au répertoire et aux avantages',
    emailAddressRequired: 'Adresse E-mail *',
    firstNameRequired: 'Prénom *',
    lastNameRequired: 'Nom *',
    organizationOptional: 'Organisation',
    countryOptional: 'Pays',
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    loginHere: 'Se Connecter Ici',
    welcomeToISRS: 'Bienvenue à ISRS!',
    verificationSent: 'Nous avons envoyé un lien de vérification à',
    verificationInstructions: 'Cliquez sur le lien dans l\'e-mail pour vérifier votre compte et terminer l\'inscription. Le lien expirera dans 15 minutes.',
    goToLogin: 'Aller à la Connexion',
    creatingAccount: 'Création du Compte...',
    accountCreationFailed: 'Échec de la création du compte. Veuillez réessayer.',
    accountExistsError: 'Un compte avec cet e-mail existe déjà. Veuillez vous connecter.',

    // Portail des Membres - Profil
    myProfile: 'Mon Profil',
    loading: 'Chargement...',
    editProfile: 'Modifier le Profil',
    viewDirectory: 'Voir le Répertoire',
    profileCompletion: 'Complétude du Profil',
    memberSince: 'Membre depuis',
    basicInformation: 'Informations de Base',
    firstName: 'Prénom',
    lastName: 'Nom',
    emailAddress: 'Adresse E-mail',
    emailCannotChange: 'L\'adresse e-mail ne peut pas être modifiée. Contactez le support si nécessaire.',
    country: 'Pays',
    city: 'Ville',
    phone: 'Téléphone',
    professionalInformation: 'Informations Professionnelles',
    organization: 'Organisation',
    positionTitle: 'Poste/Titre',
    department: 'Département',
    bioAboutMe: 'Biographie / À Propos de Moi',
    privacySettings: 'Paramètres de Confidentialité',
    profileVisibility: 'Visibilité du Profil',
    showInDirectory: 'Afficher dans le Répertoire des Membres',
    privacyNote: 'Votre adresse e-mail est toujours privée et n\'est jamais affichée aux autres membres.',
    conferenceHistory: 'Historique des Conférences',
    noConferences: 'Pas encore d\'historique de conférences.',
    saveChanges: 'Enregistrer les Modifications',
    cancel: 'Annuler',
    savingProfile: 'Enregistrement...',
    profileSaved: 'Profil enregistré avec succès!',
    profileSaveFailed: 'Échec de l\'enregistrement du profil. Veuillez réessayer.',
    completeProfileMessage: 'Complétez votre profil pour vous connecter avec d\'autres membres!',
    almostCompleteMessage: 'Vous y êtes presque! Encore quelques champs à compléter.',
    profileCompleteMessage: 'Votre profil est complet!',

    // Portail des Membres - Vérification
    verifyingLogin: 'Vérification de Votre Connexion',
    verifyingLoginText: 'Veuillez patienter pendant que nous vous connectons en toute sécurité...',
    loginFailed: 'Échec de la Connexion',
    noTokenProvided: 'Aucun jeton de connexion fourni dans l\'URL.',
    requestNewLoginLink: 'Demander un Nouveau Lien de Connexion',
    returnToHome: 'Retour à l\'Accueil',
    troubleshooting: 'Dépannage:',
    linksExpire: 'Les liens magiques expirent après 15 minutes',
    oneTimeUse: 'Chaque lien ne peut être utilisé qu\'une seule fois',
    useLatestLink: 'Assurez-vous d\'avoir cliqué sur le dernier lien envoyé à votre e-mail',
    verificationError: 'Une erreur inattendue s\'est produite lors de la vérification de la connexion.',
    verifyingMessage: 'Veuillez patienter pendant que nous vous connectons en toute sécurité...',
    loginFailed: 'Échec de Connexion',
    invalidLink: 'Ce lien de connexion est invalide ou a expiré.',
    troubleshooting: 'Dépannage:',
    linkExpires: 'Les liens magiques expirent après 15 minutes',
    linkOnceOnly: 'Chaque lien ne peut être utilisé qu\'une seule fois',
    useLatestLink: 'Assurez-vous d\'avoir cliqué sur le dernier lien envoyé à votre e-mail',
    requestNewLink: 'Demander un Nouveau Lien de Connexion',
    returnToHome: 'Retour à l\'Accueil',

    // Portail des Membres - Bienvenue/Configuration du Profil
    welcomeToISRS: 'Bienvenue à ISRS!',
    profileCompletion: 'Complétion du Profil',
    completeProfileMessage: 'Complétez votre profil pour vous connecter avec d\'autres membres et débloquer toutes les fonctionnalités',
    basicInformation: 'Informations de Base',
    emailCannotChange: 'L\'e-mail ne peut pas être modifié',
    country: 'Pays',
    city: 'Ville',
    phone: 'Téléphone',

    // Informations Professionnelles
    professionalInformation: 'Informations Professionnelles',
    organization: 'Organisation',
    positionTitle: 'Poste/Titre',
    department: 'Département',
    bioAboutMe: 'Biographie / À Propos de Moi',
    bioPlaceholder: 'Parlez-nous de votre travail en restauration des mollusques...',
    researchAreas: 'Domaines de Recherche',
    researchAreasPlaceholder: 'Ex., restauration de récifs d\'huîtres, qualité de l\'eau, évaluation de l\'habitat...',
    separateWithCommas: 'Séparez les domaines multiples par des virgules',

    // Historique des Conférences
    conferenceHistory: 'Votre Historique de Conférences ICSR',

    // Paramètres de Confidentialité et Répertoire
    privacyDirectorySettings: 'Paramètres de Confidentialité et Répertoire',
    memberDirectory: 'Répertoire des Membres',
    memberDirectoryDescription: 'Le répertoire des membres d\'ISRS aide à connecter les chercheurs, les praticiens et les parties prenantes travaillant dans la restauration des mollusques dans le monde entier.',
    includeInDirectory: 'M\'inclure dans le répertoire public des membres',
    chooseVisibleInfo: 'Choisissez les informations à afficher dans le répertoire:',
    nameRequired: 'Nom (obligatoire)',
    position: 'Poste',
    bio: 'Biographie',
    conferenceHistoryLabel: 'Historique des Conférences',

    // Confidentialité et Conditions
    privacyTerms: 'Confidentialité et Conditions',
    privacyPolicyAgree: 'J\'ai lu et j\'accepte la',
    privacyPolicy: 'Politique de Confidentialité',
    privacyConsentText: 'et consens à ce qu\'ISRS collecte et traite mes données personnelles comme décrit.',
    termsOfService: 'Conditions d\'Utilisation',
    termsAgree: 'J\'accepte les Conditions d\'Utilisation d\'ISRS et comprends que ce profil sera utilisé à des fins de réseautage et de conférence.',
    yourPrivacyRights: 'Vos Droits à la Confidentialité:',
    privacyRightsText: 'Vous pouvez demander une copie de vos données, mettre à jour vos informations ou demander la suppression de votre compte à tout moment à partir des paramètres de votre profil. Nous ne vendrons jamais vos données à des tiers.',

    // Actions du Formulaire
    completeProfileContinue: 'Compléter le Profil et Continuer',
    fieldsRequired: 'Les champs marqués d\'un',
    areRequired: 'sont obligatoires',
    editProfile: 'Modifier le Profil',
    saveChanges: 'Enregistrer les Modifications',
    cancel: 'Annuler',
    saving: 'Enregistrement...',

    // Page de Profil
    myProfile: 'Mon Profil',
    memberSince: 'Membre depuis',
    viewDirectory: 'Voir le Répertoire',
    notProvided: 'Non fourni',
    emailCannotChangeContact: 'L\'e-mail ne peut pas être modifié. Contactez le support si nécessaire.',
    expertiseKeywords: 'Mots-clés d\'Expertise',
    separateKeywordsCommas: 'Séparez les mots-clés par des virgules',

    // Présence en Ligne
    onlinePresence: 'Présence en Ligne',
    website: 'Site Web',
    linkedinURL: 'URL LinkedIn',
    orcid: 'ORCID',

    // Visibilité dans le Répertoire
    directoryPrivacySettings: 'Paramètres de Répertoire et Confidentialité',
    visibleFieldsDirectory: 'Champs Visibles dans le Répertoire:',

    // Conseils de Profil
    profileTip: 'Conseil:',
    profileTipMessage: 'Complétez plus de champs pour augmenter la visibilité de votre profil et aider les autres membres à vous trouver!',

    // État de Complétion du Profil
    completeProfile: 'Compléter le Profil',
    profileComplete: 'Votre profil est complet et superbe!',
    goodProgress: 'Bon progrès! Ajoutez plus d\'informations pour aider les membres à vous trouver.',
    completeMoreFields: 'Complétez plus de champs pour augmenter la visibilité de votre profil.',

    // Confidentialité des Données et Compte
    dataPrivacyAccount: 'Confidentialité des Données et Compte',
    exportYourData: 'Exporter Vos Données',
    exportDataDescription: 'Téléchargez une copie de toutes vos données personnelles',
    requestDataExport: 'Demander l\'Exportation des Données',
    deleteAccount: 'Supprimer le Compte',
    deleteAccountDescription: 'Supprimer définitivement votre compte et vos données',
    logout: 'Déconnexion',

    // Confirmations d\'Exportation/Suppression de Données
    exportDataConfirm: 'Demander une copie de toutes vos données personnelles? Vous recevrez un e-mail avec un lien de téléchargement dans les 48 heures.',
    exportDataSuccess: 'Exportation de données demandée avec succès! Vous recevrez un e-mail dans les 48 heures.',
    deleteAccountConfirm: 'Êtes-vous sûr de vouloir supprimer votre compte?',
    deleteAccountWarning: 'Cela va:\n• Vous retirer du répertoire des membres\n• Supprimer toutes vos données personnelles\n• Annuler toutes les inscriptions à des conférences\n\nCette action ne peut pas être annulée.',
    deleteAccountReason: 'Optionnel: Veuillez nous dire pourquoi vous partez (nous aide à améliorer):',
    deleteAccountSuccess: 'Suppression de compte demandée. Votre compte sera supprimé dans les 7 jours. Vous recevrez un e-mail de confirmation.',

    // Alertes et Messages
    profileUpdatedSuccess: 'Profil mis à jour avec succès!',
    failedToLoadProfile: 'Échec du chargement de votre profil. Veuillez essayer d\'actualiser la page.',
    failedToSaveProfile: 'Échec de l\'enregistrement du profil:',

    // Paramètres de Notification
    notificationSettings: 'Paramètres de Notification',
    receiveNotifications: 'Recevoir les Notifications',
    receiveNotificationsDesc: 'Contrôle principal - désactivez pour arrêter toutes les notifications sauf les alertes de sécurité critiques du compte',
    memberDirectoryUpdates: 'Mises à Jour du Répertoire des Membres',
    memberDirectoryUpdatesDesc: 'Nouveaux membres rejoints, mises à jour de profil de vos connexions',
    conferenceAnnouncements: 'Annonces de Conférence (ICSR)',
    conferenceAnnouncementsDesc: 'Actualités événementielles, ouverture des inscriptions, dates limites, mises à jour importantes',
    adminAnnouncements: 'Annonces Administratives',
    adminAnnouncementsDesc: 'Actualités de l\'organisation, changements de politique, mises à jour importantes ISRS',
    adminOnlyNotifications: 'Notifications Réservées aux Administrateurs',
    newMemberRegistrations: 'Nouvelles Inscriptions de Membres',
    newMemberRegistrationsDesc: 'Notifié lorsque de nouveaux membres s\'inscrivent et ont besoin d\'approbation',
    moderationAlerts: 'Alertes de Modération',
    moderationAlertsDesc: 'Signalements de profil, contenu signalé, préoccupations des membres',
    systemAlerts: 'Alertes Système',
    systemAlertsDesc: 'Problèmes techniques, notifications de déploiement, erreurs critiques',
    emailDeliveryPreference: 'Préférence de Livraison par E-mail',
    sendImmediately: 'Envoyer immédiatement (sans résumé)',
    dailyDigest: 'Résumé quotidien (une fois par jour)',
    weeklyDigest: 'Résumé hebdomadaire (une fois par semaine)',
    digestDescription: 'Les e-mails de résumé combinent plusieurs notifications en un seul e-mail récapitulatif',
    saveNotificationSettings: 'Enregistrer les Paramètres de Notification',
    savingNotifications: 'Enregistrement...',
    notificationsSaved: 'Paramètres de notification enregistrés avec succès!',
    notificationsSaveFailed: 'Échec de l\'enregistrement des paramètres de notification. Veuillez réessayer.',

    // Page du Répertoire des Membres
    memberDirectoryTitle: 'Répertoire des Membres',
    memberDirectorySubtitle: 'Connectez-vous avec des chercheurs, des praticiens et des parties prenantes travaillant dans la restauration des mollusques dans le monde entier',
    search: 'Rechercher',
    searchPlaceholder: 'Rechercher des membres...',
    searchFields: '(nom, organisation, biographie, domaines de recherche)',
    allCountries: 'Tous les Pays',
    conferenceYear: 'Année de Conférence',
    allYears: 'Toutes les Années',
    clearFilters: 'Effacer les Filtres',
    loadingMembers: 'Chargement des membres...',
    noMembersFound: 'Aucun Membre Trouvé',
    adjustSearchCriteria: 'Essayez d\'ajuster vos critères de recherche ou filtres',
    membersFound: 'membres trouvés',
    memberFound: 'membre trouvé',

    // CTA du Répertoire
    joinISRSCommunity: 'Rejoignez la Communauté ISRS',
    joinCommunityDescription: 'Connectez-vous avec des collègues, partagez vos recherches et restez informé des initiatives de restauration des mollusques dans le monde entier.',
    loginToProfile: 'Connexion à Votre Profil',

    // Inscription à la Conférence
    conferenceRegistration: 'Inscription à la Conférence',
    registrationFor: 'Inscrivez-vous à la Conférence de la Société Internationale pour la Restauration des Mollusques',
    backToConferenceInfo: 'Retour aux Informations sur la Conférence',
    yourProfile: 'Votre Profil',
    registrationDetails: 'Détails de l\'Inscription',
    sessionsWorkshops: 'Sessions et Ateliers',
    reviewPayment: 'Révision et Paiement',

    // Formulaire d\'Inscription - Section Profil
    cvResumeUpload: 'Téléchargement CV/Curriculum Vitae (Optionnel)',
    orProvideLink: 'Ou fournissez un lien:',
    researchAreasCommaSeparated: 'Domaines de Recherche (séparés par des virgules)',
    next: 'Suivant',
    back: 'Retour',

    // Formulaire d\'Inscription - Section Détails
    registrationType: 'Type d\'Inscription',
    selectRegistrationType: 'Sélectionnez le type d\'inscription...',
    earlyBird: 'Tarif Préférentiel',
    student: 'Étudiant',
    earlyBirdPricing: 'Tarif préférentiel disponible maintenant! Inscrivez-vous avant le 1er mars 2026 pour économiser.',
    discountCode: 'Code de Réduction (Optionnel)',
    discountCodeDescription: 'Vous avez un code promo? Entrez-le ici pour économiser sur votre inscription!',
    enterPromoCode: 'Entrez le code promo (ex., EARLYBIRD2026)',
    applyCode: 'Appliquer le Code',
    attendanceType: 'Type de Participation',
    inPerson: 'En Personne',
    virtual: 'Virtuel',
    firstTimeISRS: 'C\'est ma première conférence ISRS',
    planToSubmitAbstract: 'Je prévois de soumettre un résumé de présentation',
    dietaryRestrictions: 'Restrictions Alimentaires',
    none: 'Aucune',
    vegetarian: 'Végétarien',
    vegan: 'Végétalien',
    glutenFree: 'Sans Gluten',
    other: 'Autre (spécifier ci-dessous)',
    dietaryNotes: 'Notes Alimentaires',
    dietaryNotesPlaceholder: 'Veuillez spécifier toute allergie ou exigence alimentaire...',
    accessibilityNeeds: 'Besoins d\'Accessibilité',
    accessibilityPlaceholder: 'Veuillez nous faire savoir si vous avez besoin d\'aménagements...',

    // Contact d\'Urgence
    emergencyContactName: 'Nom du Contact d\'Urgence',
    emergencyContactEmail: 'E-mail du Contact d\'Urgence',
    emergencyContactPhone: 'Téléphone du Contact d\'Urgence',
    relationship: 'Relation',
    relationshipPlaceholder: 'ex., Conjoint, Parent, Ami',
    emergencyContactAuth: 'J\'autorise les administrateurs de la conférence ISRS à contacter mon contact d\'urgence désigné en cas d\'urgence médicale ou d\'autre situation urgente pendant la conférence.',

    // Événements Spéciaux
    specialEventsActivities: 'Événements Spéciaux et Activités',
    selectSpecialEvents: 'Sélectionnez les événements spéciaux et les activités auxquels vous souhaitez assister. Certains événements peuvent avoir des frais supplémentaires.',
    welcomeReception: 'Réception de Bienvenue',
    welcomeReceptionDesc: 'Rejoignez-nous pour la réception d\'ouverture (Inclus dans l\'inscription)',
    lowCountryBoil: 'Dîner Low Country Boil',
    lowCountryBoilDesc: 'Festin traditionnel de fruits de mer avec des collègues (Inclus dans l\'inscription)',
    fieldTrips: 'Excursions',
    fieldTripsDesc: 'Sélectionnez toutes celles qui vous intéressent - capacité limitée, des frais supplémentaires peuvent s\'appliquer',
    dolphinTours: 'Tours d\'Observation des Dauphins - Visite guidée de la faune côtière',
    seaTurtleCenter: 'Visite du Centre des Tortues Marines - Visite éducative de l\'installation de conservation',
    restorationSiteTour: 'Visite du Site de Restauration Local - Visitez des projets de restauration actifs',
    golfTournament: 'Tournoi de Golf',
    golfTournamentDesc: 'Tournoi de golf de réseautage (Frais supplémentaires: 75$)',

    // T-shirt et Invités
    tshirtSize: 'Taille du T-shirt de Conférence (Optionnel)',
    noTshirt: 'Pas besoin de t-shirt',
    bringingGuest: 'Amenez-vous un Invité aux Événements Sociaux?',
    noGuests: 'Pas d\'invités',
    guestFee: 'invité',
    guestsFee: 'invités',
    guestsDescription: 'Les invités peuvent assister aux événements sociaux et aux repas (frais supplémentaires s\'appliquent)',

    // Formation Continue
    requestContinuingEducation: 'Demander des Crédits de Formation Continue',
    continuingEducationDesc: 'Crédits de FC de la Society for Ecological Restoration (SER)',
    licenseNumber: 'Numéro de Licence Professionnelle (si applicable)',
    licensingOrg: 'Organisation de Licence',

    // Hébergement
    accommodationPreferences: 'Préférences d\'Hébergement',
    needsAccommodation: 'J\'ai besoin d\'aide pour réserver un hébergement',
    interestedRoomSharing: 'Je suis intéressé à partager une chambre pour réduire les coûts',
    roommatePreferences: 'Préférences/Notes de Colocataire',
    roommatePreferencesPlaceholder: 'Des préférences pour un colocataire? Préférence de genre, calme vs social, etc.',

    // Informations Supplémentaires
    additionalInformation: 'Informations Supplémentaires',
    willingToVolunteer: 'Disposé à faire du bénévolat pendant la conférence',
    firstTimeAttendee: 'C\'est ma première conférence ISRS/ICSR',
    joinMailingList: 'Rejoindre la liste de diffusion ISRS',
    receiveFutureUpdates: 'Recevoir des mises à jour sur les futures conférences',

    // Sélection de Sessions
    selectSessionsWorkshops: 'Sélectionnez Vos Sessions et Ateliers',
    sessionSelectionDescription: 'Choisissez les ateliers et les sessions auxquels vous souhaitez assister. Certaines sessions ont une capacité limitée et peuvent avoir une liste d\'attente.',
    sessionSelectionOptional: 'La sélection de sessions est optionnelle',
    sessionSelectionSkip: '- vous pouvez sauter cette étape si vous n\'êtes pas intéressé par des sessions spécifiques.',
    loadingSessions: 'Chargement des sessions disponibles...',
    noSessionsAvailable: 'Aucune session n\'est actuellement disponible pour la sélection.',
    checkBackLater: 'Revenez plus tard ou continuez votre inscription.',
    continueToReview: 'Continuer vers la Révision',
    available: 'Disponible',
    limited: 'limité',
    spotsLeft: 'places restantes',
    waitlistOnly: 'Liste d\'Attente Seulement',
    full: 'Complet',
    additionalFee: 'Frais supplémentaires:',
    selected: 'Sélectionné',
    chair: 'Président:',

    // Révision et Paiement
    reviewPaymentTitle: 'Révision et Paiement',
    registrationSummary: 'Résumé de l\'Inscription',
    name: 'Nom',
    notSpecified: 'Non spécifié',
    attendance: 'Participation',
    registrationFee: 'Frais d\'Inscription',
    total: 'Total',
    paymentMethod: 'Méthode de Paiement',
    selectPaymentMethod: 'Sélectionnez la méthode de paiement...',
    onlinePayment: 'Paiement en Ligne (Carte de Crédit/Débit via Zeffy)',
    bankTransfer: 'Virement Bancaire',

    // Informations de Paiement Zeffy
    onlinePaymentViaZeffy: 'Paiement en Ligne via Zeffy',
    zeffyDescription: 'ISRS utilise Zeffy, une plateforme de paiement 100% gratuite pour les organisations à but non lucratif.',
    zeffyRedirect: 'Lorsque vous procéderez au paiement, vous serez redirigé vers la page de paiement sécurisée de Zeffy.',
    zeffyTipInfo: 'Zeffy peut vous demander si vous souhaitez ajouter un pourboire optionnel pour aider à maintenir leur plateforme gratuite pour les organisations à but non lucratif comme ISRS.',
    zeffyTipOptional: 'Ce pourboire est entièrement optionnel',
    zeffyTipAmount: 'et va à Zeffy, pas à ISRS. Vous pouvez choisir "0$" ou n\'importe quel montant que vous souhaitez.',
    registrationFeeToISRS: 'Vos frais d\'inscription à la conférence vont 100% à ISRS pour soutenir la conférence et notre mission.',

    // Informations de Virement Bancaire
    bankTransferInstructions: 'Instructions de Virement Bancaire',
    bankTransferMessage: 'Veuillez transférer les frais d\'inscription sur le compte bancaire ISRS suivant:',
    bankName: 'Nom de la Banque:',
    accountName: 'Nom du Compte:',
    accountNumber: 'Numéro de Compte:',
    routingNumberACH: 'Numéro de Routage (ACH/Dépôt Direct):',
    routingNumberWire: 'Numéro de Routage (Virement Bancaire):',
    swiftCode: 'Code SWIFT:',
    swiftCodeNote: '(pour les virements bancaires internationaux)',
    bankTransferImportant: 'Important:',
    includeRegistrationNumber: 'Incluez votre numéro d\'inscription dans la référence du virement',
    sendProofOfTransfer: 'Envoyez la preuve du virement à',
    confirmationTimeline: 'Votre inscription sera confirmée une fois le paiement reçu (généralement 3-5 jours ouvrables)',

    // Accords Légaux
    agreeToTerms: 'J\'accepte les',
    termsAndConditions: 'Termes et Conditions',
    acknowledgePrivacyPolicy: 'Je reconnais la',
    agreeCodeOfConduct: 'J\'accepte de suivre le',
    codeOfConduct: 'Code de Conduite',
    completeRegistration: 'Compléter l\'Inscription',
    processingRegistration: 'Traitement de votre inscription...',

    // Page de Confirmation
    registrationCreated: 'Inscription Créée!',
    thankYouRegistration: 'Merci de vous être inscrit à la Conférence Internationale ISRS 2026',
    yourRegistrationNumber: 'Votre Numéro d\'Inscription:',
    completeYourPayment: 'Complétez Votre Paiement',
    registrationPendingPayment: 'Votre inscription est actuellement',
    pendingPayment: 'en attente de paiement',
    completePaymentMessage: 'Veuillez compléter votre paiement pour confirmer votre participation.',
    amountDue: 'Montant Dû:',
    aboutZeffy: 'À Propos de Zeffy:',
    zeffyConfirmationNote: 'ISRS utilise Zeffy, une plateforme de paiement 100% gratuite pour les organisations à but non lucratif. Zeffy peut vous demander si vous souhaitez ajouter un',
    optionalTip: 'pourboire optionnel',
    zeffyTipNote: '- vous pouvez choisir 0$ ou n\'importe quel montant. Ce pourboire va à Zeffy, pas à ISRS.',
    payNowWithZeffy: 'Payer Maintenant avec Zeffy',
    emailConfirmationNote: 'Vous recevrez un e-mail de confirmation une fois votre paiement traité.',
    transferExactAmount: 'Transférez le montant exact indiqué ci-dessus',
    includeRegNumber: 'Incluez votre numéro d\'inscription',
    inTransferReference: 'dans la référence du virement',
    emailProofOfTransfer: 'Envoyez la preuve du virement à',
    confirmationAfterPayment: 'Votre inscription sera confirmée une fois le paiement reçu (généralement 3-5 jours ouvrables)',

    // Et Ensuite?
    whatsNext: 'Et Ensuite?',
    completePaymentButton: 'Complétez votre paiement en utilisant le bouton ci-dessus',
    checkEmailConfirmation: 'Vérifiez votre e-mail pour la confirmation d\'inscription',
    abstractSubmissionOpens: 'La soumission de résumés ouvre le 1er avril 2026',
    submitAbstract: 'Soumettez le résumé de votre présentation (si applicable)',
    bookTravel: 'Réservez votre voyage et hébergement',
    seeYouAt: 'Rejoignez-nous du 15 au 18 juin 2026!',

    // Accès au Tableau de Bord du Profil
    yourProfileDashboard: 'Votre Tableau de Bord du Profil',
    accessDashboardDescription: 'Accédez à votre tableau de bord personnalisé pour voir toutes vos inscriptions, gérer vos informations et suivre votre activité de conférence.',
    accessYourProfile: 'Accéder à Votre Profil',
    submitYourAbstract: 'Soumettre Votre Résumé',
    secureAccess: 'Accès Sécurisé:',
    secureAccessDescription: 'Nous utilisons l\'authentification par lien magique - pas besoin de mots de passe! Vérifiez votre e-mail',
    magicLinkExpiry: 'pour un lien de connexion sécurisé qui expire dans 15 minutes.',
    fromDashboardYouCan: 'Depuis votre tableau de bord, vous pouvez:',
    viewAllRegistrations: 'Voir toutes vos inscriptions à des conférences',
    submitManageAbstracts: 'Soumettre et gérer plusieurs résumés',
    updateContactInfo: 'Mettre à jour vos informations de contact',
    trackPaymentStatus: 'Suivre votre statut de paiement',

    // Partage Social
    spreadTheWord: 'Faites Passer le Mot!',
    spreadTheWordDescription: 'Aidez-nous à développer la communauté de restauration des mollusques! Partagez cette conférence avec des collègues, des amis et de la famille qui se soucient de la conservation marine.',
    shareOnTwitter: 'Partager sur X',
    shareOnLinkedIn: 'Partager sur LinkedIn',
    shareOnFacebook: 'Partager sur Facebook',
    inviteByEmail: 'Inviter des Collègues par E-mail',
    inviteByEmailDescription: 'Entrez les adresses e-mail des collègues qui pourraient être intéressés à assister:',
    add: 'Ajouter',
    sendInvitations: 'Envoyer les Invitations',
    invitationsSent: 'Invitations envoyées avec succès!',

    // Questions et Support
    questionsContact: 'Des questions? Contactez-nous à',

    // Messages d\'Erreur
    invalidRegistrationLink: 'Lien d\'inscription invalide. Veuillez vérifier votre e-mail ou contacter le support.',
    unableToLoadRegistration: 'Impossible de charger les détails de l\'inscription. Veuillez contacter le support avec votre numéro d\'inscription.',
    pleaseEnterDiscountCode: 'Veuillez entrer un code de réduction',
    selectRegistrationTypeFirst: 'Veuillez d\'abord sélectionner un type d\'inscription',
    invalidDiscountCode: 'Code de réduction invalide',
    failedToValidateDiscount: 'Échec de la validation du code de réduction. Veuillez réessayer.',
    fillRequiredFields: 'Veuillez remplir tous les champs obligatoires (marqués d\'un *)',
    enterValidEmail: 'Veuillez entrer une adresse e-mail valide',
    selectPaymentMethodError: 'Veuillez sélectionner une méthode de paiement',
    registrationFailed: 'Échec de l\'inscription. Veuillez réessayer.',

    // Messages de Succès
    registrationCreatedSuccess: 'Inscription créée avec succès! Redirection vers le paiement...',
    registrationCreatedInstructions: 'Inscription créée avec succès! Redirection vers les instructions de paiement...',

    // ========== PAGE À PROPOS ==========
    // À Propos - Hero
    aboutHeroHeading: 'À Propos d\'ISRS',
    aboutHeroSubtitle: 'La Société Internationale pour la Restauration des Mollusques soutient la communauté mondiale de restauration des mollusques par la collaboration, l\'innovation et le partage des connaissances.',

    // À Propos - Qui Nous Sommes
    aboutWhoWeAre: 'Qui Nous Sommes',
    aboutWhoWeAreText: 'La Société Internationale pour la Restauration des Mollusques (ISRS) est une organisation à but non lucratif 501(c)(3) (en attente d\'approbation de l\'IRS) établie en 2024 pour soutenir la communauté mondiale de restauration des mollusques. Nous sommes issus de la Conférence Internationale sur la Restauration des Mollusques (ICSR), qui réunit la communauté de restauration depuis sa fondation en 1996.',

    // À Propos - Mission et Vision
    aboutMission: 'Mission',
    aboutMissionText: 'Construire une communauté, faciliter la communication et promouvoir l\'innovation au sein de la communauté mondiale de restauration des mollusques.',
    aboutVision: 'Vision',
    aboutVisionText: 'Un avenir où des écosystèmes de mollusques sains soutiennent des côtes résilientes, une vie marine florissante et des communautés durables à travers le monde.',

    // À Propos - Valeurs Fondamentales
    aboutCoreValuesHeading: 'Nos Valeurs Fondamentales',
    aboutCoreValuesIntro: 'ISRS opère guidée par six principes fondamentaux qui façonnent notre travail et notre communauté:',
    aboutValueScience: 'Approche Scientifique',
    aboutValueScienceDesc: 'Nous appliquons une recherche rigoureuse pour éclairer les pratiques de restauration et la prise de décision.',
    aboutValueCollaborative: 'Partenariats Collaboratifs',
    aboutValueCollaborativeDesc: 'Nous croyons au pouvoir de travailler ensemble à travers les secteurs, les disciplines et les frontières.',
    aboutValueInclusive: 'Participation Inclusive',
    aboutValueInclusiveDesc: 'Nous accueillons diverses perspectives de scientifiques, praticiens, communautés autochtones, décideurs politiques et industrie.',
    aboutValueInnovation: 'Innovation',
    aboutValueInnovationDesc: 'Nous promouvons la résolution créative de problèmes et de nouvelles techniques et technologies de restauration.',
    aboutValueImpact: 'Axé sur l\'Impact',
    aboutValueImpactDesc: 'Nous nous concentrons sur des résultats mesurables qui profitent aux populations de mollusques, aux écosystèmes et aux communautés.',
    aboutValueSustainability: 'Durabilité',
    aboutValueSustainabilityDesc: 'Nous défendons des approches de restauration qui soutiennent la santé écologique et la résilience à long terme.',

    // À Propos - Ce Que Nous Faisons
    aboutWhatWeDo: 'Ce Que Nous Faisons',
    aboutHostICR: 'Organiser la Conférence ICSR',
    aboutHostICRDesc: 'Nous organisons la Conférence Internationale sur la Restauration des Mollusques bisannuelle, réunissant plus de 300 participants de plus de 20 pays pour partager recherches, meilleures pratiques et nouvelles innovations.',
    aboutFacilitateNetworking: 'Faciliter le Réseautage',
    aboutFacilitateNetworkingDesc: 'Nous connectons les praticiens de la restauration dans le monde entier par des canaux de communication tout au long de l\'année, des groupes de travail et le partage des connaissances.',
    aboutSupportRegional: 'Soutenir les Réseaux Régionaux',
    aboutSupportRegionalDesc: 'Nous collaborons avec les réseaux régionaux de restauration en Amérique du Nord, en Europe, en Asie, en Australie et au-delà pour faire progresser les initiatives de restauration locales.',
    aboutPromoteKnowledge: 'Promouvoir l\'Échange de Connaissances',
    aboutPromoteKnowledgeDesc: 'Nous facilitons le partage des techniques de restauration, des résultats de recherche et des leçons apprises à travers la communauté mondiale.',
    aboutEngageDiverse: 'Engager Divers Intervenants',
    aboutEngageDiverseDesc: 'Nous réunissons chercheurs, gestionnaires, conservationnistes, groupes autochtones, partenaires industriels et décideurs politiques pour un dialogue collaboratif.',
    aboutAdvanceInnovation: 'Faire Progresser l\'Innovation',
    aboutAdvanceInnovationDesc: 'Nous soutenons le développement et la diffusion de nouvelles approches, technologies et stratégies de restauration.',

    // À Propos - Notre Communauté
    aboutCommunityHeading: 'Notre Communauté',
    aboutCommunityIntro: 'ISRS réunit une communauté mondiale diversifiée dédiée à la restauration des mollusques:',
    aboutCommunityScientists: 'Scientifiques Chercheurs',
    aboutCommunityScientistsDesc: 'Faire progresser la science et le suivi de la restauration',
    aboutCommunityPractitioners: 'Praticiens de la Restauration',
    aboutCommunityPractitionersDesc: 'Mise en œuvre de projets sur le terrain',
    aboutCommunityManagers: 'Gestionnaires de Ressources',
    aboutCommunityManagersDesc: 'Gestion des populations et habitats de mollusques',
    aboutCommunityOrgs: 'Organisations de Conservation',
    aboutCommunityOrgsDesc: 'Protection des écosystèmes côtiers',
    aboutCommunityIndigenous: 'Communautés Autochtones',
    aboutCommunityIndigenousDesc: 'Gérance des ressources traditionnelles de mollusques',
    aboutCommunityIndustry: 'Partenaires Industriels',
    aboutCommunityIndustryDesc: 'Promotion de l\'aquaculture durable',
    aboutCommunityPolicy: 'Décideurs Politiques',
    aboutCommunityPolicyDesc: 'Développement de politiques favorables à la restauration',
    aboutCommunityStudents: 'Étudiants et Éducateurs',
    aboutCommunityStudentsDesc: 'Former la prochaine génération',

    // À Propos - Partenariats Stratégiques
    aboutPartnershipsHeading: 'Partenariats Stratégiques',
    aboutPartnershipsIntro: 'ISRS collabore avec des organisations de premier plan pour amplifier notre impact:',
    aboutPartnerNORA: 'Alliance pour la Restauration des Huîtres Indigènes (NORA)',
    aboutPartnerNORADesc: 'Partenariat axé sur l\'avancement de la restauration des huîtres en Amérique du Nord par le partage des ressources, l\'échange de connaissances et les initiatives coordonnées.',
    aboutPartnerAustralasia: 'Réseau de Restauration Côtière d\'Australasie',
    aboutPartnerAustralasiaDesc: 'Collaboration pour connecter les praticiens de la restauration en Australie, Nouvelle-Zélande et la région du Pacifique, partageant les innovations en restauration des mollusques et côtière.',

    // ========== PAGE ICSR ==========
    // ICSR - Hero
    icsrHeroHeading: 'Conférence Internationale sur la Restauration des Mollusques',
    icsrHeroSubtitle: 'Le rassemblement mondial premier pour la science et la pratique de restauration des mollusques depuis 1996',
    icsrCTA2026: 'ICSR2026 - Puget Sound',

    // ICSR - À Propos
    icsrAboutHeading: 'À Propos de ICSR',
    icsrAboutText1: 'Depuis 1996, la Conférence Internationale sur la Restauration des Mollusques réunit la communauté mondiale de restauration tous les deux ans. ICSR rassemble plus de 300 participants de plus de 20 pays, créant des opportunités sans précédent pour l\'échange de connaissances, la collaboration et l\'innovation.',
    icsrAboutText2: 'La conférence présente des présentations de recherche de pointe, des ateliers interactifs, des visites sur le terrain, des tables rondes et des événements de réseautage qui font progresser la science et la pratique de la restauration des mollusques dans le monde entier.',

    // ICSR - Qui Participe
    icsrWhoAttendsHeading: 'Qui Participe à ICSR',
    icsrAttendeeScientists: 'Scientifiques Chercheurs',
    icsrAttendeeScientistsDesc: 'Chercheurs de premier plan présentant les dernières découvertes en écologie des mollusques, techniques de restauration et services écosystémiques.',
    icsrAttendeePractitioners: 'Praticiens de la Restauration',
    icsrAttendeePractitionersDesc: 'Experts de terrain partageant les leçons apprises et les approches innovantes de projets réels.',
    icsrAttendeeManagers: 'Gestionnaires de Ressources',
    icsrAttendeeManagersDesc: 'Fonctionnaires gouvernementaux et gestionnaires de ressources naturelles développant des politiques et programmes de restauration.',
    icsrAttendeeOrgs: 'Organisations de Conservation',
    icsrAttendeeOrgsDesc: 'ONG et organisations à but non lucratif dirigeant des initiatives de restauration dans les écosystèmes côtiers.',
    icsrAttendeeIndigenous: 'Groupes Autochtones',
    icsrAttendeeIndigenousDesc: 'Détenteurs de connaissances traditionnelles et gardiens des ressources de mollusques et des habitats côtiers.',
    icsrAttendeeStudents: 'Étudiants',
    icsrAttendeeStudentsDesc: 'Étudiants diplômés et chercheurs en début de carrière construisant la prochaine génération d\'expertise en restauration.',

    // ICSR - Activités de la Conférence
    icsrActivitiesHeading: 'Activités de la Conférence',
    icsrActivityResearch: 'Présentations de Recherche',
    icsrActivityResearchDesc: 'Présentations orales et conférences éclair présentant les dernières recherches sur la dynamique des populations d\'huîtres, l\'évaluation des habitats, la restauration urbaine, les interactions des espèces et le suivi de la restauration.',
    icsrActivityWorkshops: 'Ateliers Interactifs',
    icsrActivityWorkshopsDesc: 'Sessions pratiques couvrant les techniques de restauration, les protocoles de suivi, l\'analyse de données, l\'engagement des parties prenantes et la planification de projets.',
    icsrActivityFieldTrips: 'Visites sur le Terrain',
    icsrActivityFieldTripsDesc: 'Visites de sites de projets de restauration actifs, offrant une expérience directe des approches et défis de restauration locaux.',
    icsrActivityPanels: 'Tables Rondes',
    icsrActivityPanelsDesc: 'Panels d\'experts abordant la politique, le financement, les partenariats, l\'adaptation au climat et les défis émergents de restauration.',
    icsrActivityPosters: 'Sessions de Posters',
    icsrActivityPostersDesc: 'Présentations de posters en soirée permettant des discussions approfondies sur les recherches et projets de restauration.',
    icsrActivityNetworking: 'Événements de Réseautage',
    icsrActivityNetworkingDesc: 'Réceptions de bienvenue, banquets et activités sociales favorisant les connexions à travers la communauté mondiale.',

    // ICSR - Histoire de la Conférence
    icsrHistoryHeading: 'Histoire de la Conférence',
    icsrHistoryIntro: 'ICSR se réunit tous les deux ans depuis 1996, couvrant quatre continents et rassemblant des milliers de professionnels de la restauration pendant près de trois décennies.',
    icsr2020s: 'Années 2020',
    icsr2010s: 'Années 2010',
    icsr2000s: 'Années 2000',
    icsr1990s: 'Années 1990',

    // ICSR - Code de Conduite
    icsrCodeOfConduct: 'Code de Conduite',
    icsrCodeIntro: 'ICSR s\'engage à fournir un environnement respectueux, inclusif et accueillant pour tous les participants. Nous maintenons une politique de tolérance zéro pour le harcèlement et les comportements inappropriés.',
    icsrCodeExpectations: 'Nos Attentes',
    icsrCodeReporting: '<strong>Signalement:</strong> Les participants qui subissent ou sont témoins de harcèlement doivent contacter les organisateurs de la conférence à <a href="mailto:info@shellfish-society.org" style="color: var(--primary-blue);">info@shellfish-society.org</a>',

    // ========== PAGE ICSR2026 ==========
    // ICSR2026 - Hero
    icsr2026SaveDateHeading: 'RÉSERVEZ LA DATE !',
    icsr2026HeroHeading: 'ICSR2026',
    icsr2026HostedBy: 'Organisé par <a href="https://restorationfund.org/" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">Puget Sound Restoration Fund</a>',
    icsr2026Location: 'Puget Sound, État de Washington',
    icsr2026LocationDates: 'Puget Sound, État de Washington<br>5-8 Octobre 2026',
    icsr2026Dates: '5-8 Octobre 2026',
    icsr2026DateRange: '5-8 Octobre 2026',

    // ICSR2026 - Aperçu
    icsr2026OverviewHeading: 'Rejoignez-Nous dans le Nord-Ouest du Pacifique',
    icsr2026OverviewText1: 'La Conférence Internationale sur la Restauration des Mollusques 2026 réunira la communauté mondiale de restauration pendant quatre jours de recherche de pointe, d\'ateliers pratiques et de réseautage inestimable avec des praticiens de la restauration du monde entier.',
    icsr2026OverviewText2: 'Située dans la spectaculaire région de Puget Sound, ICSR2026 explorera l\'intersection du savoir écologique traditionnel, de la science moderne de restauration et de la conservation communautaire.',
    icsr2026OverviewText3: 'La conférence s\'ouvrira avec une <strong>cérémonie de bienvenue traditionnelle Coast Salish</strong>, honorant les liens culturels profonds entre le peuple de l\'île Squaxin et les ressources en coquillages.',
    icsr2026MailingListCTA: 'Rejoindre la Liste de Diffusion pour les Mises à Jour',
    icsr2026JoinMailingList: 'Rejoindre la Liste de Diffusion pour les Mises à Jour',

    // ICSR2026 - Dates Importantes
    icsr2026DatesHeading: 'Dates Importantes',
    icsr2026ConferenceDates: 'Dates de la Conférence',
    icsr2026DownloadICS: 'Télécharger .ics',
    icsr2026GoogleCalendar: 'Google Agenda',
    icsr2026Outlook: 'Outlook',
    icsr2026AbstractDeadline: 'Date Limite des Résumés',
    icsr2026ComingSoon: 'Prochainement',
    icsr2026EarlyBird: 'Inscription Anticipée',
    icsr2026Early2026: 'Début 2026',
    icsr2026HotelBooking: 'Réservation d\'Hôtel',
    icsr2026InfoTBA: 'Informations à Venir',

    // ICSR2026 - À Quoi S\'Attendre
    icsr2026WhatToExpect: 'À Quoi S\'Attendre',
    icsr2026ExpectHeading: 'À Quoi S\'Attendre',
    icsr2026ExpectResearch: 'Recherche de Pointe',
    icsr2026ExpectResearchDesc: 'Présentations orales et conférences éclair sur la dynamique des huîtres, le suivi des habitats, la restauration urbaine, les interactions des espèces, les structures récifales et l\'adaptation au climat',
    icsr2026ExpectWorkshops: 'Ateliers Pratiques',
    icsr2026ExpectWorkshopsDesc: 'Sessions interactives sur la planification de restauration, les protocoles de suivi, l\'engagement communautaire, le savoir traditionnel, le financement et l\'analyse de données',
    icsr2026ExpectFieldTrips: 'Visites sur le Terrain',
    icsr2026ExpectFieldTripsDesc: 'Visites de sites de restauration tribaux, récifs d\'huîtres de Puget Sound, projets de rivages urbains, récupération d\'huîtres Olympia et restauration de palourdes géoduck',
    icsr2026ExpectNetworking: 'Réseautage',
    icsr2026ExpectNetworkingDesc: 'Réception de bienvenue, sessions de posters, banquet de conférence, réunions de réseaux régionaux et rassemblements informels tout au long de la semaine',

    // ICSR2026 - Sessions Planifiées
    icsr2026SessionsHeading: 'Sessions et Thèmes Planifiés',
    icsr2026SessionsIntro: 'La programmation de la conférence est en cours d\'élaboration. Les sessions planifiées comprennent:',

    // ICSR2026 - Lieu
    icsr2026VenueHeading: 'Lieu de Conférence sur le Territoire de la Tribu Squaxin Island',
    icsr2026VenueText1: 'ICSR2026 se tiendra au <a href="https://littlecreek.com/" target="_blank" rel="noopener noreferrer">Little Creek Resort and Conference Center</a>, exploité par la Tribu Squaxin Island à Shelton, Washington. Le territoire ancestral du peuple Squaxin Island comprend une grande partie du sud de Puget Sound, et ils ont été gestionnaires des ressources de mollusques pendant des milliers d\'années, maintenant de profondes connexions culturelles et spirituelles avec les palourdes, les huîtres et autres mollusques.',
    icsr2026VenueText2: 'Aujourd\'hui, la Tribu continue cette tradition par la gestion active des mollusques, les programmes de restauration et les opérations d\'aquaculture, intégrant le savoir écologique traditionnel avec la science de conservation moderne. ICSR2026 offrira des opportunités uniques d\'apprendre des praticiens de la restauration tribaux et de découvrir les approches autochtones de la gérance des mollusques.',

    // ICSR2026 - Pourquoi Puget Sound
    icsr2026WhyPugetSound: 'Pourquoi Puget Sound?',
    icsr2026WhyHeading: 'Pourquoi Puget Sound?',
    icsr2026WhyPugetSoundIntro: 'Puget Sound est un point chaud mondial pour l\'innovation en restauration des mollusques<br>avec de profondes connexions culturelles aux mollusques:',
    icsr2026WhyIntro: 'Puget Sound est un point chaud mondial pour l\'innovation en restauration des mollusques avec de profondes connexions culturelles aux mollusques:',
    icsr2026WhyDiverseSpecies: '🌊 Espèces Diverses',
    icsr2026WhySpecies: 'Espèces Diverses',
    icsr2026WhyDiverseSpeciesDesc: 'Habitat des huîtres Olympia indigènes, huîtres du Pacifique, palourdes géoduck, palourdes Manila et de nombreuses autres espèces de mollusques.',
    icsr2026WhySpeciesDesc: 'Habitat des huîtres Olympia indigènes, huîtres du Pacifique, palourdes géoduck, palourdes Manila et de nombreuses autres espèces de mollusques.',
    icsr2026WhyResearch: 'Excellence en Recherche',
    icsr2026WhyResearchDesc: 'Universités et institutions de recherche de premier plan faisant progresser la science des mollusques et les techniques de restauration.',
    icsr2026WhyTribal: 'Leadership Tribal',
    icsr2026WhyTribalDesc: 'Tribus Coast Salish dirigeant des programmes innovants de restauration ancrés dans le savoir traditionnel.',
    icsr2026WhyActiveRestoration: '🦪 Restauration Active',
    icsr2026WhyRestoration: 'Restauration Active',
    icsr2026WhyActiveRestorationDesc: 'Des dizaines de projets de restauration en cours abordant la qualité de l\'eau, la perte d\'habitat et le changement climatique.',
    icsr2026WhyRestorationDesc: 'Des dizaines de projets de restauration en cours abordant la qualité de l\'eau, la perte d\'habitat et le changement climatique.',
    icsr2026WhyPolicy: 'Innovation Politique',
    icsr2026WhyPolicyDesc: 'Politiques progressistes de gestion et de restauration des mollusques servant de modèles pour d\'autres régions.',
    icsr2026WhyEcosystem: 'Focus Écosystémique',
    icsr2026WhyEcosystemDesc: 'Approches holistiques intégrant la restauration des mollusques avec la récupération plus large de l\'écosystème côtier.',

    // ICSR2026 - Participation Attendue
    icsr2026ExpectedAttendance: 'Participation Attendue',
    icsr2026AttendanceHeading: 'Participation Attendue',
    icsr2026ExpectedParticipants: '350+',
    icsr2026ExpectedCountries: '25+',
    icsr2026ExpectedPresentations: '150+',
    icsr2026ParticipantsLabel: 'Participants',
    icsr2026Participants: 'Participants',
    icsr2026CountriesLabel: 'Pays',
    icsr2026Countries: 'Pays',
    icsr2026PresentationsLabel: 'Présentations',
    icsr2026Presentations: 'Présentations',

    // ICSR2026 - Inscription et Parrainage
    icsr2026RegistrationHeading: 'Inscription',
    icsr2026RegistrationText: 'L\'inscription ouvrira début 2026. Inscrivez-vous pour recevoir des mises à jour et être informé lorsque l\'inscription sera disponible.',
    icsr2026RequestUpdates: 'Demander des Mises à Jour',
    icsr2026SponsorshipHeading: 'Opportunités de Parrainage',
    icsr2026SponsorshipText: 'Soutenez ICSR2026 et connectez-vous avec la communauté mondiale de restauration des mollusques. Les opportunités de parrainage incluent le soutien d\'événements (visites sur le terrain, réception, banquet) et bourses de voyage pour étudiants.',
    icsr2026InquireSponsorship: 'Se Renseigner sur le Parrainage',

    // ICSR2026 - Sponsors
    icsr2026SponsorsHeading: 'Sponsors de la Conférence',
    icsr2026SponsorsIntro: 'Nous remercions chaleureusement nos sponsors qui rendent ICSR2026 possible par leur généreux soutien.',
    icsr2026SponsorPSRF: 'Puget Sound Restoration Fund',
    icsr2026HostOrganization: 'Organisation Hôte',
    icsr2026SponsorTNC: 'The Nature Conservancy - California',
    icsr2026SponsorLevel: 'Sponsor $5,000',
    icsr2026SponsorTNCWA: 'The Nature Conservancy - Washington',
    icsr2026SponsorLevelWA: 'Sponsor $2,000',

    // ICSR2026 - Code de Conduite
    icsr2026CodeOfConduct: 'Code de Conduite',
    icsr2026CodeHeading: 'Code de Conduite',
    icsr2026CodeText: 'ICSR2026 s\'engage à fournir un environnement respectueux, inclusif et accueillant pour tous les participants. Nous maintenons une politique de tolérance zéro pour le harcèlement et les comportements inappropriés. Tous les participants sont tenus de se traiter avec respect, d\'accueillir diverses perspectives et de s\'abstenir de photographie ou enregistrement non autorisés.',
    icsr2026CodeContact: '<strong>Questions ou préoccupations?</strong> Contactez-nous à <a href="mailto:info@shellfish-society.org" style="color: var(--primary-blue);">info@shellfish-society.org</a>',

    // ICSR2026 - Modal Liste de Diffusion
    icsr2026ModalCloseAriaLabel: 'Fermer modal liste de diffusion',
    icsr2026ModalTitle: 'Rejoignez Notre Liste de Diffusion',
    icsr2026ModalSubtitle: 'Restez informé sur l\'inscription à ICSR2026, les soumissions de résumés et les détails de la conférence.',
    icsr2026ModalFirstName: 'Prénom',
    icsr2026ModalLastName: 'Nom de Famille',
    icsr2026ModalEmail: 'Email',
    icsr2026ModalOrganization: 'Organisation',
    icsr2026ModalNote: 'Note (Optionnel)',
    icsr2026ModalNotePlaceholder: 'Ajoutez toute information supplémentaire ou questions sur ICSR2026...',
    icsr2026ModalCancel: 'Annuler',
    icsr2026ModalSubmit: 'Rejoindre la Liste de Diffusion',
    icsr2026ModalSuccess: '✓ Succès!',
    icsr2026ModalSuccessText: 'Merci de vous être joint à notre liste de diffusion. Nous vous tiendrons informé sur ICSR2026.',
    icsr2026ModalClose: 'Fermer',
    icsr2026ModalErrorMessage: 'Une erreur s\'est produite lors de la soumission de vos informations. Veuillez réessayer ou nous contacter directement à info@shellfish-society.org',

    // ========== PAGE GALERIE ==========
    // Galerie - En-tête
    galleryHeading: 'Galerie de Photos',
    gallerySubtitle: 'Explorez les photos de projets de restauration des mollusques, recherches et événements d\'ISRS et de la communauté mondiale de restauration',
    galleryDescription: 'Explorez les photos de projets de restauration des mollusques, recherches et événements d\'ISRS et de la communauté mondiale de restauration',

    // Galerie - Recherche et Filtres
    gallerySearchFilterHeading: '🔍 Rechercher et Filtrer',
    gallerySearchLabel: 'Recherche Textuelle',
    gallerySearchPlaceholder: 'Légende, étiquettes, localisation...',
    galleryAISearchLabel: 'Recherche Visuelle par IA',
    galleryAISearchPlaceholder: 'Décrivez la scène...',
    galleryConferenceLabel: 'Conférence/Événement',
    galleryAllEvents: 'Tous les Événements',
    galleryPhotoTypeLabel: 'Type de Photo',
    galleryAllTypes: 'Tous les Types',
    galleryTypeConference: 'Photos de Conférence',
    galleryTypeHistoric: 'Photos Historiques',
    galleryTypeHeadshots: 'Portraits/Personnes',
    galleryTypeLogos: 'Logos',
    galleryTypeBackgrounds: 'Arrière-plans',
    galleryLocationLabel: 'Localisation',
    galleryAllLocations: 'Toutes les Localisations',
    galleryYearLabel: 'Année',
    galleryAllYears: 'Toutes les Années',
    gallerySortByLabel: 'Trier Par',
    gallerySortLabel: 'Trier Par',
    gallerySortDateNewest: 'Date (Plus Récente en Premier)',
    gallerySortDateOldest: 'Date (Plus Ancienne en Premier)',
    gallerySortNewest: 'Date (Plus Récente en Premier)',
    gallerySortOldest: 'Date (Plus Ancienne en Premier)',
    gallerySortAlphaAZ: 'Alphabétique (A-Z)',
    gallerySortAlphaZA: 'Alphabétique (Z-A)',
    gallerySortCategory: 'Catégorie',
    gallerySortPhotographer: 'Photographe',
    gallerySearchButton: 'Rechercher',
    galleryApplyButton: 'Rechercher',
    galleryClearButton: 'Effacer',
    galleryShowingAll: 'Affichage de toutes les photos',
    galleryDownloadButton: 'Télécharger Sélectionnées',
    galleryDownloadDesc: 'Télécharger les photos sélectionnées',
    galleryDownloadFiltered: 'Télécharger Photos Filtrées',
    galleryUploadButton: 'Téléverser Photos',
    galleryUploadHeading: 'Téléverser des Photos',
    galleryUploadDescription: 'Partagez des photos de vos projets de restauration, recherches ou événements. Formats acceptés: JPG, PNG (max. 10MB chacun)',
    galleryFeaturedHeading: 'Galeries en Vedette',
    galleryFeaturedICSR2024: 'ICSR 2024 - Charleston',
    galleryFeaturedICSR2024Desc: 'Découvrez les moments forts de notre 11e Conférence Internationale sur la Restauration des Mollusques à Charleston, Caroline du Sud',
    galleryLegalNotice: 'Toutes les photos sont la propriété de leurs propriétaires respectifs. Tous droits réservés.',
    galleryLegalViewTerms: 'Voir les conditions complètes',
    galleryKeyboardShortcuts: 'Raccourcis Clavier',
    galleryLoading: 'Chargement des photos...',

    // Galerie - Avis Légal
    galleryLegalHeading: 'Avis de Droits d\'Auteur',
    galleryLegalText: 'Les photos sont la propriété de leurs propriétaires respectifs (ISRS, akorn environmental et contributeurs individuels). Tous droits réservés. L\'utilisation, la reproduction ou la distribution non autorisées sont interdites.',
    galleryViewTerms: 'Voir les conditions complètes',

    // Galerie - Lightbox
    galleryDownload: 'Télécharger',
    galleryFavorite: 'Favori',
    galleryShare: 'Partager',
    galleryPhotoDetails: 'Détails de la Photo',
    galleryRelatedPhotos: 'Photos Associées',
    galleryComments: 'Commentaires',
    galleryAddComment: 'Ajouter un commentaire...',
    galleryPostComment: 'Publier Commentaire',
    galleryNoComments: 'Pas encore de commentaires. Soyez le premier!',

    // Galerie - Étiquettes de Métadonnées
    galleryFilename: 'Nom de Fichier',
    galleryDateTaken: 'Date de Prise',
    galleryCamera: 'Appareil Photo',
    galleryLens: 'Objectif',
    galleryFocalLength: 'Longueur Focale',
    galleryAperture: 'Ouverture',
    galleryShutterSpeed: 'Vitesse d\'Obturation',
    galleryISO: 'ISO',
    galleryViews: 'Vues',

    // Galerie - Messages
    galleryFavoriteSuccess: 'Ajouté à vos favoris!',
    galleryCommentSuccess: 'Commentaire publié!',
    galleryLoginRequired: 'Veuillez vous connecter pour commenter',
    galleryLoginFavorite: 'Veuillez vous connecter pour enregistrer des favoris',
    galleryLinkCopied: 'Lien copié dans le presse-papiers!',
    galleryDownloadConfirm: 'Télécharger {count} photos en fichier ZIP?',
    galleryDownloadStarted: 'Téléchargement commencé!',
    galleryDownloadFailed: 'Téléchargement échoué. Veuillez réessayer ou contacter le support.',
    galleryNoPhotos: 'Aucune photo à télécharger',
    galleryLoadingMore: 'Chargement de plus de photos...',
    galleryNoMore: 'Vous avez atteint la fin!',

    // Galerie - Raccourcis Clavier
    galleryShortcutsHeading: 'Raccourcis Clavier',
    galleryShortcutHelp: 'Afficher/masquer cette aide',
    galleryShortcutNext: 'Photo suivante',
    galleryShortcutPrev: 'Photo précédente',
    galleryShortcutClose: 'Fermer la lightbox',
    galleryShortcutZoomIn: 'Zoomer',
    galleryShortcutZoomOut: 'Dézoomer',
    galleryShortcutZoomReset: 'Réinitialiser le zoom',
    galleryShortcutFullscreen: 'Basculer plein écran',
    galleryShortcutSearch: 'Focaliser la recherche',

    // Galerie - États Vides
    galleryNoPhotosFound: 'Aucune Photo Trouvée',
    galleryNoPhotosMessage: 'Aucune photo ne correspond à vos filtres actuels. Essayez d\'ajuster vos critères de recherche.',
    galleryComingSoonHeading: 'Galerie Bientôt Disponible',
    galleryComingSoonMessage: 'Revenez plus tard pour des photos de nos projets de restauration et événements.',

    // ========== PAGE SOUTIEN ==========
    // Soutien - Hero
    supportHeroHeading: 'Soutenir ISRS',
    supportHeroSubtitle: 'Construire la Résilience Mondiale par la Restauration des Écosystèmes Marins',

    // Soutien - Opportunité
    supportOpportunityHeading: 'L\'Opportunité Critique',
    supportOpportunityText: 'Les écosystèmes de mollusques fournissent certaines des solutions les plus puissantes de la nature à nos défis les plus urgents. Une seule huître filtre 50 gallons d\'eau quotidiennement. Les récifs de mollusques protègent les côtes des ondes de tempête et de l\'élévation du niveau de la mer. Ces écosystèmes soutiennent la biodiversité, séquestrent le carbone et soutiennent les communautés côtières—pourtant nous en avons perdu jusqu\'à 85% à l\'échelle mondiale.',
    supportOpportunityBox: 'ISRS existe pour inverser cette tendance',
    supportOpportunityBoxText: 'En unifiant la communauté mondiale de restauration, en faisant progresser la compréhension scientifique et en élargissant les approches de restauration réussies dans le monde entier. Notre initiative phare est la Conférence Internationale sur la Restauration des Mollusques (ICSR) bisannuelle—le rassemblement mondial premier pour la restauration des mollusques depuis 1996.',

    // Soutien - Statistiques
    support50Gallons: 'Gallons filtrés quotidiennement par huître',
    support85Loss: 'Perte mondiale de mollusques',
    support300Plus: 'Praticiens ICSR',
    support20Countries: 'Pays représentés',

    // Soutien - Besoin Urgent
    supportUrgentHeading: 'Besoin Urgent: Crise de Financement Fédéral',
    supportUrgentText: 'Les changements budgétaires fédéraux récents ont créé des défis sans précédent pour la restauration des mollusques:',
    supportUrgentConclusion: 'La communauté de restauration des mollusques a répondu avec une résilience remarquable. ISRS renforce cette communauté, connectant les praticiens avec diverses sources de financement et assurant que l\'élan de restauration continue malgré les défis fédéraux.',

    // Soutien - Opportunités de Partenariat
    supportPartnerHeading: 'Opportunités de Partenariat',
    supportPartnerIntro: 'ISRS accueille des partenaires à tous les niveaux qui partagent notre engagement envers des écosystèmes marins sains.',

    supportFoundations: 'Pour les Fondations',
    supportFoundationsDesc: 'Investissement stratégique dans des solutions climatiques basées sur la nature avec un potentiel d\'impact mondial.',
    supportFoundationsImpact: 'Votre Impact',
    supportFoundationsLevels: 'Niveaux d\'Investissement:',

    supportCorporations: 'Pour les Entreprises',
    supportCorporationsDesc: 'Démontrez un leadership environnemental tout en offrant des avantages ESG concrets.',
    supportCorporationsImpact: 'Votre Impact',
    supportCorporationsLevels: 'Niveaux de Partenariat:',

    supportGovernment: 'Pour le Gouvernement',
    supportGovernmentDesc: 'Collaboration multilatérale pour la résilience côtière et la gestion durable des ressources.',
    supportGovernmentImpact: 'Votre Impact',
    supportGovernmentLevels: 'Niveaux de Partenariat:',

    supportAcademia: 'Pour le Milieu Académique',
    supportAcademiaDesc: 'Faire progresser la compréhension scientifique par la collaboration mondiale.',
    supportAcademiaImpact: 'Votre Impact',
    supportAcademiaLevels: 'Niveaux de Partenariat:',

    supportIndustry: 'Pour l\'Industrie',
    supportIndustryDesc: 'Protégez les ressources marines dont votre entreprise dépend.',
    supportIndustryImpact: 'Votre Impact',
    supportIndustryLevels: 'Niveaux de Partenariat:',

    supportIndividual: 'Pour les Donateurs Individuels',
    supportIndividualDesc: 'Rejoignez le mouvement mondial de restauration à tout niveau.',
    supportIndividualLevels: 'Niveaux d\'Adhésion',

    // Soutien - Programmes
    supportProgramsHeading: 'Programmes Offrant un Impact Mondial',
    supportProgramICR: 'Conférence ICSR Bisannuelle',
    supportProgramICRDesc: 'Le rassemblement mondial premier pour la restauration des mollusques, réunissant plus de 300 praticiens de plus de 20 pays pour partager des sciences révolutionnaires et des approches de restauration réussies. ICSR2026 se tiendra du 5 au 8 octobre 2026, au <a href="https://littlecreek.com/" target="_blank" rel="noopener noreferrer">Little Creek Resort and Conference Center</a>, exploité par la Tribu Squaxin Island à Shelton, Washington.',
    supportProgramNetwork: 'Réseau Professionnel Mondial',
    supportProgramNetworkDesc: 'Engagement tout au long de l\'année connectant les praticiens de la restauration dans le monde entier par des forums, webinaires et initiatives collaboratives abordant des défis partagés.',
    supportProgramResearch: 'Soutien à la Recherche et à l\'Innovation',
    supportProgramResearchDesc: 'Faciliter la recherche collaborative, documenter les meilleures pratiques et soutenir l\'engagement étudiant dans la science de restauration.',
    supportProgramPolicy: 'Politique et Plaidoyer',
    supportProgramPolicyDesc: 'Faire progresser les politiques de restauration basées sur la science et connecter les praticiens avec des opportunités de financement et un soutien réglementaire.',

    // Soutien - Retours
    supportFeedbackHeading: 'Partagez Vos Retours',
    supportFeedbackIntro: 'Avez-vous des suggestions ou des questions sur nos opportunités de partenariat? Nous aimerions vous entendre.',
    supportFirstName: 'Prénom',
    supportLastName: 'Nom de Famille',
    supportEmail: 'Email',
    supportOrganization: 'Organisation',
    supportInquiryType: 'Type de Demande',
    supportMessage: 'Message',
    supportSend: 'Envoyer Message',

    // Soutien - Types de Demande
    supportGeneral: 'Demande Générale',
    supportFoundationPartner: 'Partenariat de Fondation',
    supportCorporatePartner: 'Partenariat d\'Entreprise',
    supportGovernmentPartner: 'Partenariat Gouvernemental',
    supportAcademicPartner: 'Partenariat Académique',
    supportIndividualDonation: 'Don Individuel',
    supportOther: 'Autre',

    // Soutien - CTA
    supportCTAHeading: 'Rejoignez-Nous',
    supportCTAText: 'Ensemble, nous pouvons construire des côtes résilientes et des océans sains pour les générations futures par le pouvoir de la restauration des mollusques.',
    supportContactPartnership: 'Contactez-Nous pour un Partenariat',
    supportViewPressKit: 'Voir le Kit de Presse',

    // Portail des Membres - Bienvenue
    welcomeToISRS: 'Bienvenue à ISRS!',
    welcomeMessageExisting: 'Nous sommes ravis de vous accueillir! Nous avons vos informations de ICSR %YEARS%. Veuillez revoir et compléter votre profil ci-dessous.',
    welcomeMessageNew: 'Nous sommes ravis de vous accueillir dans la communauté ISRS! Veuillez compléter votre profil pour commencer.',
    profileCompletionPrompt: 'Complétez votre profil pour vous connecter avec d\'autres membres et débloquer toutes les fonctionnalités',
    firstNameRequired: 'Prénom *',
    lastNameRequired: 'Nom *',
    countryRequired: 'Pays *',
    cityLabel: 'Ville',
    emailCannotBeChanged: 'L\'adresse e-mail ne peut pas être modifiée',
    organizationRequired: 'Organisation *',
    positionTitleLabel: 'Poste/Titre',
    departmentLabel: 'Département',
    bioLabel: 'Biographie / À Propos de Moi',
    bioPlaceholder: 'Parlez-nous de votre travail dans la restauration des mollusques...',
    researchAreasLabel: 'Domaines de Recherche',
    researchAreasPlaceholder: 'Par exemple, restauration de récifs d\'huîtres, qualité de l\'eau, évaluation de l\'habitat...',
    separateWithCommas: 'Séparez plusieurs domaines par des virgules',
    yourConferenceHistory: 'Votre Historique de Conférence ICSR',
    privacyDirectorySettings: 'Paramètres de Confidentialité et Répertoire',
    memberDirectoryHeading: 'Répertoire des Membres',
    memberDirectoryDescription: 'Le répertoire des membres d\'ISRS aide à connecter les chercheurs, les praticiens et les parties prenantes travaillant dans la restauration des mollusques dans le monde entier.',
    includeInDirectory: 'M\'inclure dans le répertoire public des membres',
    chooseVisibleFields: 'Choisissez les informations à afficher dans le répertoire:',
    nameRequiredField: 'Nom (requis)',
    organizationField: 'Organisation',
    positionField: 'Poste/Titre',
    countryField: 'Pays',
    cityField: 'Ville',
    bioField: 'Biographie',
    researchAreasField: 'Domaines de Recherche',
    conferenceHistoryField: 'Historique de Conférence',
    privacyTermsHeading: 'Confidentialité et Conditions *',
    privacyConsentText: 'J\'ai lu et j\'accepte la <a href="/privacy-policy.html" target="_blank">Politique de Confidentialité</a> et consens à ce qu\'ISRS collecte et traite mes données personnelles comme décrit.',
    termsConsentText: 'J\'accepte les Conditions de Service d\'ISRS et comprends que ce profil sera utilisé à des fins de réseautage et de conférence.',
    yourPrivacyRights: 'Vos Droits à la Confidentialité:',
    privacyRightsText: 'Vous pouvez demander une copie de vos données, mettre à jour vos informations ou demander la suppression de votre compte à tout moment depuis les paramètres de votre profil. Nous ne vendrons jamais vos données à des tiers.',
    completeProfileContinue: 'Compléter le Profil et Continuer',
    fieldsMarkedRequired: 'Les champs marqués d\'un * sont requis',
    mustAcceptTerms: 'Vous devez accepter la Politique de Confidentialité et les Conditions de Service pour continuer.',
    savingProfile: 'Enregistrement du Profil...',
    failedToSave: 'Échec de l\'enregistrement de votre profil. Veuillez réessayer.',

    // Portail des Membres - Répertoire
    memberDirectory: 'Répertoire des Membres',
    directorySubtitle: 'Connectez-vous avec des chercheurs, des praticiens et des parties prenantes travaillant dans la restauration des mollusques dans le monde entier',
    resultsCount: 'Affichage de %COUNT% membres',
    searchLabel: 'Rechercher',
    searchPlaceholder: 'Rechercher des membres...',
    searchHint: '(nom, organisation, biographie, domaines de recherche)',
    countryFilterLabel: 'Pays',
    allCountries: 'Tous les Pays',
    conferenceYearLabel: 'Année de Conférence',
    allYears: 'Toutes les Années',
    clearFiltersBtn: 'Effacer les Filtres',
    loadingMembers: 'Chargement des membres...',
    noMembersFound: 'Aucun Membre Trouvé',
    tryAdjustingFilters: 'Essayez d\'ajuster vos critères de recherche ou filtres',
    joinISRSCommunity: 'Rejoignez la Communauté ISRS',
    connectColleagues: 'Connectez-vous avec des collègues, partagez vos recherches et restez informé des initiatives de restauration des mollusques dans le monde entier.',
    loginToProfile: 'Se Connecter à Votre Profil',

    // Inscription à la Conférence
    confRegTitle: 'Inscription à la Conférence - ISRS 2026',
    confRegBackToConf: 'Retour aux Informations de la Conférence',
    confRegHeading: 'Conférence ISRS 2026',
    confRegSubtitle: 'Inscrivez-vous à la Conférence de la Société Internationale de Restauration des Mollusques',
    confRegDate: '15-18 Juin 2026',

    // Étapes de Progression
    confRegStep1: 'Votre Profil',
    confRegStep2: 'Détails d\'Inscription',
    confRegStep3: 'Sessions et Ateliers',
    confRegStep4: 'Révision et Paiement',

    // Étape 1: Profil
    confRegFirstName: 'Prénom',
    confRegLastName: 'Nom de Famille',
    confRegEmail: 'Adresse E-mail',
    confRegEmailHint: 'Ce sera votre e-mail de connexion pour accéder à votre inscription',
    confRegOrganization: 'Organisation',
    confRegPosition: 'Poste/Titre',
    confRegCountry: 'Pays',
    confRegSelectCountry: 'Sélectionnez un pays...',
    confRegState: 'État',
    confRegProvince: 'Province',
    confRegSelectState: 'Sélectionnez un état...',
    confRegSelectProvince: 'Sélectionnez une province...',
    confRegCity: 'Ville',
    confRegPhone: 'Numéro de Téléphone',
    confRegBio: 'Biographie Professionnelle',
    confRegBioPlaceholder: 'Parlez-nous de votre travail dans la restauration des mollusques...',
    confRegBioHint: 'Ceci sera visible dans le répertoire des participants',
    confRegCV: 'Télécharger CV/Résumé (Optionnel)',
    confRegCVLink: 'Ou fournissez un lien:',
    confRegResearchAreas: 'Domaines de Recherche (séparés par des virgules)',
    confRegResearchPlaceholder: 'ex., restauration d\'huîtres, qualité de l\'eau, adaptation climatique',

    // Étape 2: Détails d'Inscription
    confRegType: 'Type d\'Inscription',
    confRegSelectType: 'Sélectionnez le type d\'inscription...',
    confRegEarlyBird: 'Inscription Anticipée',
    confRegStudent: 'Étudiant',
    confRegEarlyBirdNotice: '🎉 Tarifs d\'inscription anticipée disponibles maintenant! Inscrivez-vous avant le 1er mars 2026 pour économiser.',
    confRegDiscountCode: 'Code de Réduction (Optionnel)',
    confRegDiscountHint: 'Vous avez un code promo? Entrez-le ici pour économiser sur votre inscription!',
    confRegDiscountPlaceholder: 'Entrez le code promo (ex., EARLYBIRD2026)',
    confRegApplyCode: 'Appliquer le Code',
    confRegValidating: 'Validation...',
    confRegEnterCode: 'Veuillez entrer un code de réduction',
    confRegSelectTypeFirst: 'Veuillez d\'abord sélectionner un type d\'inscription',
    confRegConfNotLoaded: 'Données de la conférence non chargées. Veuillez actualiser la page.',
    confRegInvalidCode: 'Code de réduction invalide',
    confRegCodeFailed: 'Échec de la validation du code de réduction. Veuillez réessayer.',
    confRegYouSavePercent: 'Vous économiserez %VALUE%% sur vos frais d\'inscription',
    confRegYouSaveAmount: 'Vous économiserez $%VALUE% sur vos frais d\'inscription',
    confRegRemoveCode: 'Supprimer le code de réduction',

    confRegAttendanceType: 'Type de Participation',
    confRegInPerson: 'En Personne',
    confRegVirtual: 'Virtuel',
    confRegFirstTime: 'C\'est ma première conférence ISRS',
    confRegPresenter: 'Je prévois de soumettre un résumé pour présentation',

    confRegDietary: 'Restrictions Alimentaires',
    confRegDietaryNone: 'Aucune',
    confRegVegetarian: 'Végétarien',
    confRegVegan: 'Végétalien',
    confRegGlutenFree: 'Sans Gluten',
    confRegDietaryOther: 'Autre (précisez ci-dessous)',
    confRegDietaryNotes: 'Notes Alimentaires',
    confRegDietaryPlaceholder: 'Veuillez préciser toute allergie ou exigence alimentaire...',
    confRegAccessibility: 'Besoins d\'Accessibilité',
    confRegAccessibilityPlaceholder: 'Veuillez nous informer si vous avez besoin d\'aménagements...',

    confRegEmergencyName: 'Nom du Contact d\'Urgence',
    confRegEmergencyEmail: 'E-mail du Contact d\'Urgence',
    confRegEmergencyPhone: 'Téléphone du Contact d\'Urgence',
    confRegEmergencyRelationship: 'Relation',
    confRegEmergencyRelationshipPlaceholder: 'ex., Conjoint, Parent, Ami',
    confRegEmergencyAuth: 'J\'autorise les administrateurs de la conférence ISRS à contacter mon contact d\'urgence désigné en cas d\'urgence médicale ou d\'autre situation urgente pendant la conférence.',

    confRegSpecialEvents: 'Événements et Activités Spéciaux',
    confRegSpecialEventsDesc: 'Sélectionnez les événements et activités spéciaux auxquels vous souhaitez participer. Certains événements peuvent avoir des frais supplémentaires.',
    confRegWelcomeReception: 'Réception de Bienvenue',
    confRegWelcomeReceptionDesc: 'Rejoignez-nous pour la réception de la soirée d\'ouverture (Inclus dans l\'inscription)',
    confRegLowCountryBoil: 'Dîner Low Country Boil',
    confRegLowCountryBoilDesc: 'Festin traditionnel de fruits de mer avec des collègues (Inclus dans l\'inscription)',

    confRegFieldTrips: 'Excursions',
    confRegFieldTripsDesc: 'Sélectionnez toutes celles qui vous intéressent - capacité limitée, des frais supplémentaires peuvent s\'appliquer',
    confRegDolphinTours: 'Observation des Dauphins - Visite guidée de la faune côtière',
    confRegSeaTurtleCenter: 'Visite du Centre des Tortues Marines - Visite éducative des installations de conservation',
    confRegRestorationSiteTour: 'Visite des Sites de Restauration Locaux - Visitez des projets de restauration actifs',
    confRegGolfTournament: 'Tournoi de Golf',
    confRegGolfTournamentDesc: 'Tournoi de golf de réseautage (Frais supplémentaires: $75)',

    confRegTshirtSize: 'Taille de T-shirt de la Conférence (Optionnel)',
    confRegNoTshirt: 'Pas besoin de t-shirt',
    confRegGuests: 'Amenez-vous un Invité aux Événements Sociaux?',
    confRegNoGuests: 'Pas d\'invités',
    confRegOneGuest: '1 invité (+$150)',
    confRegTwoGuests: '2 invités (+$300)',
    confRegGuestsHint: 'Les invités peuvent participer aux événements sociaux et aux repas (frais supplémentaires)',

    confRegContinuingEd: 'Demander des Crédits de Formation Continue',
    confRegContinuingEdDesc: 'Crédits CE de la Société pour la Restauration Écologique (SER)',
    confRegLicenseNumber: 'Numéro de Licence Professionnelle (si applicable)',
    confRegLicenseNumberPlaceholder: 'ex., PWS #12345',
    confRegLicensingOrg: 'Organisation de Licence',
    confRegLicensingOrgPlaceholder: 'ex., Société pour la Restauration Écologique',

    confRegAccommodation: 'Préférences d\'Hébergement',
    confRegNeedsAccommodation: 'J\'ai besoin d\'aide pour réserver un hébergement',
    confRegRoomSharing: 'Je suis intéressé par le partage de chambre pour réduire les coûts',
    confRegRoommatePrefs: 'Préférences/Notes de Colocataire',
    confRegRoommatePlaceholder: 'Des préférences pour un colocataire? Préférence de genre, calme vs social, etc.',

    confRegAdditionalInfo: 'Informations Supplémentaires',
    confRegWillingVolunteer: 'Disposé à faire du bénévolat pendant la conférence',
    confRegFirstTimeAttendee: 'C\'est ma première conférence ISRS/ICSR',
    confRegOptInMailing: 'Rejoindre la liste de diffusion ISRS',
    confRegOptInFuture: 'Recevoir des mises à jour sur les futures conférences',

    // Étape 3: Sessions
    confRegSelectSessions: 'Sélectionnez Vos Sessions et Ateliers',
    confRegSessionsDesc: 'Choisissez les ateliers et sessions auxquels vous souhaitez participer. Certaines sessions ont une capacité limitée et peuvent avoir une liste d\'attente. <strong>La sélection de sessions est optionnelle</strong> - vous pouvez ignorer cette étape si vous n\'êtes pas intéressé par des sessions spécifiques.',
    confRegLoadingSessions: 'Chargement des sessions disponibles...',
    confRegNoSessions: 'Aucun événement actuellement disponible pour sélection.',
    confRegCheckBack: 'Revenez plus tard ou continuez avec votre inscription.',
    confRegSessionsError: 'Impossible de charger les sessions',
    confRegSessionsErrorDesc: 'Vous pouvez continuer l\'inscription et ajouter des sessions plus tard, ou essayez d\'actualiser la page.',
    confRegContinueReview: 'Continuer vers la Révision',
    confRegDateTBD: 'Date À Déterminer',
    confRegAvailable: 'Disponible',
    confRegLimited: '%COUNT% places restantes',
    confRegWaitlist: 'Liste d\'Attente',
    confRegFull: 'Complet',
    confRegGuestsWelcome: 'Invités bienvenus (frais supplémentaires)',
    confRegFeePerPerson: 'Frais:',
    confRegSelected: 'Sélectionné',
    confRegAlreadySignedUp: 'Déjà inscrit',
    confRegAlreadySignedUpWaitlist: 'Déjà inscrit (Liste d\'Attente)',

    // Étape 4: Révision et Paiement
    confRegReviewPayment: 'Révision et Paiement',
    confRegSummary: 'Résumé de l\'Inscription',
    confRegName: 'Nom:',
    confRegEmailLabel: 'E-mail:',
    confRegOrgLabel: 'Organisation:',
    confRegNotSpecified: 'Non spécifié',
    confRegCountryLabel: 'Pays:',
    confRegTypeLabel: 'Type d\'Inscription:',
    confRegAttendanceLabel: 'Participation:',
    confRegSelectedSessions: 'Sessions et Ateliers Sélectionnés',
    confRegDiscountApplied: 'Réduction Appliquée',
    confRegCodeApplied: 'Code de réduction appliqué',
    confRegYouSave: 'Vous économisez:',
    confRegAdditionalFee: 'Frais supplémentaires:',

    confRegFeeSummary: 'Frais d\'Inscription',
    confRegTotal: 'Total',
    confRegPaymentMethod: 'Méthode de Paiement',
    confRegSelectPayment: 'Sélectionnez une méthode de paiement...',
    confRegOnlinePayment: 'Paiement en Ligne (Carte de Crédit/Débit via Zeffy)',
    confRegBankTransfer: 'Virement Bancaire',

    confRegZeffyTitle: '💳 Paiement en Ligne via Zeffy',
    confRegZeffyDesc1: 'ISRS utilise Zeffy, une plateforme de paiement 100% gratuite pour les organisations à but non lucratif.',
    confRegZeffyDesc2: 'Lorsque vous procéderez au paiement, vous serez redirigé vers la page de paiement sécurisé de Zeffy.',
    confRegZeffyImportant: 'Important:',
    confRegZeffyTip: 'Zeffy peut vous demander si vous souhaitez ajouter un pourboire optionnel pour aider à maintenir leur plateforme gratuite pour les organisations à but non lucratif comme ISRS. <strong>Ce pourboire est entièrement optionnel</strong> et va à Zeffy, pas à ISRS. Vous pouvez choisir "$0" ou le montant que vous souhaitez.',
    confRegZeffyFee: 'Vos frais d\'inscription à la conférence vont à 100% à ISRS pour soutenir la conférence et notre mission.',

    confRegBankTitle: '🏦 Instructions de Virement Bancaire',
    confRegBankDesc: 'Veuillez transférer les frais d\'inscription au compte bancaire ISRS suivant:',
    confRegBankName: 'Nom de la Banque:',
    confRegAccountName: 'Nom du Compte:',
    confRegAccountNumber: 'Numéro de Compte:',
    confRegRoutingACH: 'Numéro de Routage (ACH/Dépôt Direct):',
    confRegRoutingWire: 'Numéro de Routage (Virement):',
    confRegSwiftCode: 'Code SWIFT:',
    confRegSwiftNote: '(pour les virements internationaux)',
    confRegBankImportant: 'Important:',
    confRegBankInstr1: 'Incluez votre numéro d\'inscription dans la référence du virement',
    confRegBankInstr2: 'Envoyez la preuve de virement à',
    confRegBankInstr3: 'Votre inscription sera confirmée une fois le paiement reçu (généralement 3-5 jours ouvrables)',

    confRegAgreeTerms: 'J\'accepte les',
    confRegTermsLink: 'Termes et Conditions',
    confRegAgreePrivacy: 'Je reconnais la',
    confRegPrivacyLink: 'Politique de Confidentialité',
    confRegAgreeCode: 'J\'accepte de suivre le',
    confRegCodeLink: 'Code de Conduite',

    confRegCompleteBtn: 'Terminer l\'Inscription',
    confRegProcessing: 'Traitement de votre inscription...',
    confRegSelectPaymentError: 'Veuillez sélectionner une méthode de paiement',
    confRegSuccess: 'Inscription créée avec succès! Redirection vers le paiement...',
    confRegSuccessBank: 'Inscription créée avec succès! Redirection vers les instructions de paiement...',
    confRegFailed: 'L\'inscription a échoué. Veuillez réessayer.',

    // Messages de Validation
    confRegRequiredFields: 'Veuillez remplir tous les champs obligatoires (marqués d\'un *)',
    confRegInvalidEmail: 'Veuillez entrer une adresse e-mail valide',
    confRegSelectTypeError: 'Veuillez sélectionner un type d\'inscription',
    confRegEventFull: 'Cet événement est complet.',
    confRegAlreadyRegistered: 'Vous êtes déjà inscrit à cet événement.',

    // Message de bienvenue
    confRegWelcomeBack: 'Bienvenue, %NAME%! Nous avons pré-rempli vos informations. Veuillez vérifier et mettre à jour si nécessaire.',

    // Boutons de navigation
    confRegBack: 'Retour',
    confRegNext: 'Suivant',

    // Étiquettes de type d'inscription
    confRegEarlyBirdLabel: 'Inscription Anticipée',
    confRegStudentLabel: 'Inscription Étudiant',

    // Page d'Adhésion
    joinTitle: 'Rejoindre ISRS - Devenir Membre',
    joinHeading: 'Rejoignez la Société Internationale de Restauration des Mollusques',
    joinSubtitle: 'Faites partie d\'une communauté mondiale qui fait progresser la restauration des mollusques et la conservation marine',
    joinBenefitsHeading: '🌊 Avantages des Membres',
    joinBenefit1: 'Accès à la recherche et aux publications exclusives',
    joinBenefit2: 'Inscription à prix réduit aux conférences',
    joinBenefit3: 'Opportunités de réseautage mondial',
    joinBenefit4: 'Bulletin mensuel et mises à jour',
    joinBenefit5: 'Droit de vote aux élections du conseil',
    joinBenefit6: 'Soutenez les efforts mondiaux de restauration',

    joinSelectMembership: 'Sélectionnez Votre Adhésion',
    joinRegularMember: 'Membre Régulier',
    joinRegularPrice: '50 $/an',
    joinRegularDesc: 'Pour les professionnels et les chercheurs',
    joinStudentMember: 'Membre Étudiant',
    joinStudentPrice: '25 $/an',
    joinStudentDesc: 'Pour les étudiants avec une pièce d\'identité valide',
    joinLifetimeMember: 'Membre à Vie',
    joinLifetimePrice: '1 000 $',
    joinLifetimeDesc: 'Paiement unique, accès à vie',
    joinCorporateMember: 'Entreprise',
    joinCorporatePrice: '500 $/an',
    joinCorporateDesc: 'Pour les organisations (5 membres)',

    joinPersonalInfo: 'Informations Personnelles',
    joinProfessionalBg: 'Parcours Professionnel',
    joinResearchAreas: 'Domaines de Recherche/Intérêts',
    joinResearchPlaceholder: 'ex., Restauration d\'Huîtres, Écologie Marine, Qualité de l\'Eau',
    joinResearchHint: 'Séparez plusieurs domaines par des virgules',
    joinBioLabel: 'Biographie',
    joinBioPlaceholder: 'Parlez-nous de votre travail et de vos intérêts dans la restauration des mollusques...',
    joinWebsite: 'URL du Site Web',
    joinLinkedIn: 'Profil LinkedIn',

    joinDonationHeading: '💚 Soutenez Notre Mission (Optionnel)',
    joinDonationDesc: 'Vos cotisations nous aident à fonctionner. Un don supplémentaire nous aide à accroître notre impact sur la restauration mondiale des mollusques.',
    joinNoDonation: 'Pas de Don',
    joinCustomAmount: 'Montant Personnalisé:',
    joinInHonorOf: 'En l\'Honneur/Mémoire De (Optionnel)',
    joinInHonorPlaceholder: 'Dédiez ce don',

    joinCommPrefs: 'Préférences de Communication',
    joinOptInEmails: 'Envoyez-moi des mises à jour sur les activités et opportunités d\'ISRS',
    joinOptInNewsletter: 'S\'abonner au bulletin mensuel',

    joinProceedPayment: 'Procéder au Paiement',
    joinPaymentNote: '💳 Paiement sécurisé par Zeffy (100% gratuit, sans frais de plateforme)',
    joinProcessing: 'Traitement de votre adhésion...',
    joinWelcome: '🎉 Bienvenue à ISRS!',
    joinSuccess: 'Votre adhésion a été créée avec succès.',
    joinCheckEmail: 'Vérifiez votre e-mail pour la confirmation et les prochaines étapes.',
    joinSelectType: 'Veuillez sélectionner un type d\'adhésion',
    joinCompletePayment: 'Complétez Votre Paiement',
    joinCompletedPayment: 'J\'ai Complété le Paiement',

    // Page de Confirmation de Conférence
    confConfirmTitle: 'Confirmation d\'Inscription - ISRS 2026',
    confConfirmLoading: 'Chargement des détails d\'inscription...',
    confConfirmInvalidLink: 'Lien d\'inscription invalide. Veuillez vérifier votre e-mail ou contacter le support.',
    confConfirmLoadError: 'Impossible de charger les détails d\'inscription. Veuillez contacter le support avec votre numéro d\'inscription.',
    confConfirmHeading: 'Inscription Créée!',
    confConfirmThankYou: 'Merci de vous être inscrit à la Conférence Internationale ISRS 2026',
    confConfirmRegNumber: 'Votre Numéro d\'Inscription:',
    confConfirmCompletePayment: '⚠️ Complétez Votre Paiement',
    confConfirmPendingPayment: 'Votre inscription est actuellement <strong>en attente de paiement</strong>. Veuillez compléter votre paiement pour confirmer votre participation.',
    confConfirmAmountDue: 'Montant Dû:',
    confConfirmAboutZeffy: '<strong>À propos de Zeffy:</strong> ISRS utilise Zeffy, une plateforme de paiement 100% gratuite pour les organismes à but non lucratif. Zeffy peut demander si vous souhaitez ajouter un <strong>pourboire optionnel</strong> - vous pouvez choisir 0$ ou tout autre montant. Ce pourboire va à Zeffy, pas à ISRS.',
    confConfirmPayNow: 'Payer Maintenant avec Zeffy',
    confConfirmPaymentProcessed: 'Vous recevrez un e-mail de confirmation une fois votre paiement traité.',
    confConfirmBankTransfer: '🏦 Instructions de Virement Bancaire',
    confConfirmBankPending: 'Votre inscription est actuellement <strong>en attente de paiement</strong>. Veuillez transférer les frais d\'inscription pour compléter votre inscription.',
    confConfirmBankName: 'Nom de la Banque:',
    confConfirmAccountName: 'Nom du Compte:',
    confConfirmAccountNumber: 'Numéro de Compte:',
    confConfirmRoutingACH: 'Numéro de Routage (ACH/Dépôt Direct):',
    confConfirmRoutingWire: 'Numéro de Routage (Virement Bancaire):',
    confConfirmSwiftCode: 'Code SWIFT:',
    confConfirmSwiftNote: '(pour les virements internationaux)',
    confConfirmTransferRef: '⚠️ REQUIS - Référence de Transfert:',
    confConfirmImportantSteps: 'Étapes Importantes:',
    confConfirmBankStep1: 'Transférez le montant exact indiqué ci-dessus',
    confConfirmBankStep2: 'Incluez votre numéro d\'inscription ({0}) dans la référence de transfert',
    confConfirmBankStep3: 'Envoyez la preuve de transfert à',
    confConfirmBankStep4: 'Votre inscription sera confirmée une fois le paiement reçu (généralement 3-5 jours ouvrables)',
    confConfirmWhatsNext: 'Quelle est la Suite?',
    confConfirmNext1: 'Complétez votre paiement en utilisant le bouton ci-dessus',
    confConfirmNext2: 'Vérifiez votre e-mail pour la confirmation d\'inscription',
    confConfirmNext3: 'La soumission des résumés ouvre le 1er avril 2026',
    confConfirmNext4: 'Soumettez votre résumé de présentation (si applicable)',
    confConfirmNext5: 'Réservez votre voyage et hébergement',
    confConfirmNext6: 'Rejoignez-nous du 15 au 18 juin 2026!',
    confConfirmProfileDashboard: 'Votre Tableau de Bord',
    confConfirmProfileDesc: 'Accédez à votre tableau de bord personnalisé pour voir toutes vos inscriptions, gérer vos informations et suivre votre activité de conférence.',
    confConfirmAccessProfile: 'Accéder à Votre Profil',
    confConfirmSubmitAbstract: 'Soumettre Votre Résumé',
    confConfirmSecureAccess: '<strong>Accès Sécurisé:</strong> Nous utilisons l\'authentification par lien magique - pas besoin de mot de passe! Vérifiez votre e-mail ({0}) pour un lien de connexion sécurisé qui expire dans 15 minutes.',
    confConfirmDashboardFeatures: 'Depuis votre tableau de bord, vous pouvez:',
    confConfirmDashboardFeature1: 'Voir toutes vos inscriptions de conférence',
    confConfirmDashboardFeature2: 'Soumettre et gérer plusieurs résumés',
    confConfirmDashboardFeature3: 'Mettre à jour vos coordonnées',
    confConfirmDashboardFeature4: 'Suivre l\'état de votre paiement',
    confConfirmSpreadWord: '🎉 Passez le Mot!',
    confConfirmShareText: 'Aidez-nous à développer la communauté de restauration des mollusques! Partagez cette conférence avec des collègues, amis et famille qui se soucient de la conservation marine.',
    confConfirmShareX: 'Partager sur X',
    confConfirmShareLinkedIn: 'Partager sur LinkedIn',
    confConfirmShareFacebook: 'Partager sur Facebook',
    confConfirmInviteColleagues: '📧 Inviter des Collègues par E-mail',
    confConfirmInviteDesc: 'Entrez les adresses e-mail des collègues qui pourraient être intéressés à participer:',
    confConfirmEmailPlaceholder: 'collegue@exemple.com',
    confConfirmAddEmail: 'Ajouter',
    confConfirmSendInvites: 'Envoyer les Invitations',
    confConfirmInvitesSent: '✓ Invitations envoyées avec succès!',
    confConfirmQuestions: 'Questions?',
    confConfirmContactUs: 'Contactez-nous à',
    confConfirmReturnHome: 'Retour à l\'Accueil',
    confConfirmValidEmail: 'Veuillez entrer une adresse e-mail valide',
    confConfirmEmailAdded: 'Cet e-mail a déjà été ajouté',
    confConfirmAddAtLeastOne: 'Veuillez ajouter au moins une adresse e-mail',
    confConfirmInviteFailed: 'Échec de l\'envoi des invitations. Veuillez réessayer ou contacter le support.',

    // Page de Soumission de Résumé
    abstractTitle: 'Soumettre un Résumé - ISRS 2026',
    abstractHeading: 'Soumettez Votre Résumé',
    abstractConference: 'Conférence Internationale ISRS 2026',
    abstractLocation: '15-18 juin 2026 | Jekyll Island, Géorgie',
    abstractDeadline: '📅 Date Limite de Soumission: 15 mars 2026',
    abstractNotification: 'Notification d\'acceptation: 15 avril 2026',
    abstractSubmitting: 'Soumission de votre résumé...',
    abstractSuccessHeading: '🎉 Résumé Soumis avec Succès!',
    abstractSuccessNumber: 'Votre numéro de soumission est:',
    abstractSuccessEmail: 'Vous recevrez un e-mail de confirmation sous peu.',
    abstractViewDashboard: 'Voir Votre Tableau de Bord →',
    abstractBasicInfo: 'Informations de Base',
    abstractTitleLabel: 'Titre du Résumé',
    abstractTitleMax: 'Maximum 250 caractères',
    abstractTextLabel: 'Texte du Résumé',
    abstractTextMax: 'Maximum 3000 caractères. Veuillez ne pas inclure les noms des auteurs ou affiliations dans le texte du résumé.',
    abstractKeywords: 'Mots-Clés',
    abstractKeywordPlaceholder: 'Entrez un mot-clé',
    abstractAddKeyword: 'Ajouter Mot-Clé',
    abstractKeywordHint: 'Ajoutez 3-6 mots-clés pour aider à catégoriser votre résumé',
    abstractPresentationFormat: 'Format de Présentation',
    abstractOral: '🎤 Présentation Orale',
    abstractOralDesc: 'Exposé de 15 minutes avec 5 minutes de questions',
    abstractPoster: '📊 Présentation par Affiche',
    abstractPosterDesc: 'Exposez et discutez de votre recherche',
    abstractEither: '🤷 L\'un ou l\'Autre',
    abstractEitherDesc: 'Vous êtes flexible sur le format',
    abstractTopicArea: 'Domaine Thématique',
    abstractSelectTopic: 'Sélectionnez le domaine...',
    abstractTopicRestoration: 'Écologie de Restauration',
    abstractTopicWater: 'Qualité de l\'Eau',
    abstractTopicHabitat: 'Restauration d\'Habitat',
    abstractTopicOyster: 'Restauration d\'Huîtres',
    abstractTopicClam: 'Restauration de Palourdes',
    abstractTopicMussel: 'Restauration de Moules/Eau Douce',
    abstractTopicPolicy: 'Politiques et Gestion',
    abstractTopicAquaculture: 'Aquaculture',
    abstractTopicCommunity: 'Engagement Communautaire',
    abstractTopicClimate: 'Impacts du Changement Climatique',
    abstractTopicMonitoring: 'Surveillance et Évaluation',
    abstractTopicOther: 'Autre',
    abstractPreferredSession: 'Session Préférée (Optionnel)',
    abstractSessionPlaceholder: 'ex., Restauration Côtière',
    abstractSessionHint: 'Si vous souhaitez être regroupé avec des sujets similaires',
    abstractPresentingAuthor: 'Auteur Présentateur',
    abstractYourEmail: 'Votre E-mail',
    abstractEmailHint: 'Nous utiliserons ceci pour vous contacter concernant votre soumission',
    abstractYourName: 'Votre Nom',
    abstractOrganization: 'Organisation/Institution',
    abstractOrcid: 'ORCID (Optionnel)',
    abstractGetOrcid: 'Obtenez votre ORCID',
    abstractCoAuthors: 'Co-Auteurs (Optionnel)',
    abstractCoAuthorsDesc: 'Ajoutez les co-auteurs qui ont contribué à ce travail. Ils seront listés dans le programme.',
    abstractAddCoAuthor: 'Ajouter Co-Auteur',
    abstractRemove: 'Supprimer',
    abstractCoAuthorName: 'Nom',
    abstractCoAuthorEmail: 'E-mail',
    abstractCoAuthorOrg: 'Organisation',
    abstractAdditionalReq: 'Exigences Supplémentaires',
    abstractAVEquipment: 'J\'aurai besoin d\'équipement audiovisuel (projecteur/écran)',
    abstractSpecialEquip: 'Équipement ou Exigences Spéciales (Optionnel)',
    abstractSpecialPlaceholder: 'ex., Besoin d\'une prise électrique pour affichage, connexion internet requise, etc.',
    abstractAgreeTerms: 'J\'accepte les',
    abstractTermsLink: 'Conditions Générales',
    abstractAcknowledgePrivacy: 'Je reconnais la',
    abstractPrivacyLink: 'Politique de Confidentialité',
    abstractSubmitButton: 'Soumettre le Résumé',
    abstractSubmitNote: 'En soumettant, vous acceptez de présenter si accepté',
    abstractLoginRequired: 'Veuillez vous connecter pour soumettre un résumé',
    abstractSessionExpired: 'Votre session a expiré. Veuillez vous reconnecter.',
    abstractSelectFormat: 'Veuillez sélectionner un format de présentation',
    abstractNoConference: 'Aucune conférence active trouvée. Veuillez réessayer plus tard.',
    abstractProfileError: 'Profil utilisateur non chargé. Veuillez actualiser la page.',
    abstractMaxKeywords: 'Maximum 6 mots-clés autorisés',
    abstractKeywordExists: 'Ce mot-clé a déjà été ajouté',

    // Page de Bienvenue
    welcomeTitle: 'Bienvenue à ISRS - Société Internationale pour la Restauration des Mollusques',
    welcomeHeading: 'Bienvenue à ISRS',
    welcomeSubtitle: 'Société Internationale pour la Restauration des Mollusques',
    welcomeAnnouncementHeading: '🎉 Nouveau Portail Membres Lancé!',
    welcomeAnnouncementText: 'Accédez à votre profil, explorez le répertoire des membres, inscrivez-vous à ICSR2026 à Puget Sound et connectez-vous avec la communauté mondiale de restauration des mollusques.',
    welcomeGetStarted: 'Commencer',
    welcomeEnterEmail: 'Entrez votre e-mail pour vérifier votre statut de membre ou rejoindre notre communauté.',
    welcomeEmailPlaceholder: 'votre@email.com',
    welcomeContinue: 'Continuer',
    welcomeBenefit1: 'Adhésion gratuite',
    welcomeBenefit2: 'Accès au répertoire des membres',
    welcomeBenefit3: 'Inscription à la conférence',
    welcomeBenefit4: 'Réseau mondial',
    welcomeAlreadyExploring: 'Déjà en exploration?',
    welcomeContinueToMain: 'Continuer vers le site principal',
    welcomeLearnICRS: 'En savoir plus sur ICSR',
    welcomeICRS2026Details: 'Détails ICSR2026',
    welcomeEnterEmailError: 'Veuillez entrer votre adresse e-mail',
    welcomeChecking: 'Vérification...',
    welcomeEmailSent: 'E-mail Envoyé!',
    welcomeCheckEmail: '✅ Vérifiez votre e-mail! Nous vous avons envoyé un lien magique pour vous connecter.',
    welcomeNoAccount: 'Nous n\'avons pas de compte avec cet e-mail. Souhaitez-vous devenir membre?',
    welcomeJoinNow: 'Rejoindre ISRS (Gratuit)',
    welcomeSignupComingSoon: 'Inscription bientôt disponible! Pour l\'instant, contactez info@shellfish-society.org',
    welcomeNetworkError: 'Erreur réseau. Veuillez vérifier votre connexion et réessayer.',
    welcomeSomethingWrong: 'Quelque chose s\'est mal passé. Veuillez réessayer.',
    // Page de Bienvenue - Aperçu du Profil (Étape 2)
    welcomeWelcomeBack: 'Bienvenue à Nouveau!',
    welcomeFoundProfile: 'Nous avons trouvé votre profil dans notre système. Veuillez vérifier qu\'il s\'agit bien de vous:',
    welcomeLocation: 'Localisation',
    welcomeConferenceHistory: 'Historique des Conférences',
    welcomeCurrentRoles: 'Rôles Actuels',
    welcomeSendMagicLink: 'Oui, Envoyez-moi un Lien Magique',
    welcomeNotMe: 'Ce N\'est Pas Moi',
    welcomeSending: 'Envoi...',
    // Page de Bienvenue - Nouvel Utilisateur (Étape 2 Alt)
    welcomeNewMember: 'Bienvenue, Nouveau Membre!',
    welcomeNoExistingAccount: 'Nous n\'avons pas de compte existant avec cette adresse e-mail. Rejoignez notre communauté pour accéder au portail membres, à l\'inscription aux conférences et plus encore.',
    welcomeTryDifferent: 'Essayer un Autre E-mail',
    welcomeCreating: 'Configuration...',

    // Page de Connexion Profil
    loginTitle: 'Connexion à Votre Profil - ISRS',
    loginHeading: 'Accédez à Votre Profil',
    loginSubtitle: 'Nous vous enverrons un lien de connexion sécurisé par e-mail',
    loginMagicLinkSent: '✓ Lien Magique Envoyé!',
    loginCheckEmail: 'Vérifiez votre e-mail pour le lien de connexion sécurisé. Le lien expirera dans 15 minutes.',
    loginError: '⚠ Erreur',
    loginEmailLabel: 'Adresse E-mail',
    loginEmailPlaceholder: 'votre.email@exemple.com',
    loginSendMagicLink: 'Envoyer le Lien Magique',
    loginWhatIsMagicLink: 'Qu\'est-ce qu\'un Lien Magique?',
    loginMagicLinkExplain: 'Un lien magique est un lien sécurisé à usage unique envoyé à votre e-mail. Cliquez sur le lien pour accéder à votre profil sans mot de passe.',
    loginMagicLinkBenefit1: 'Pas de mots de passe à retenir',
    loginMagicLinkBenefit2: 'Expire après 15 minutes',
    loginMagicLinkBenefit3: 'Ne peut être utilisé qu\'une fois',
    loginBackToHome: '← Retour à l\'Accueil',
    loginSending: 'Envoi...',
    loginVerifying: 'Vérification...',
    loginEnterEmail: 'Veuillez entrer votre adresse e-mail',
    loginFailedSend: 'Échec de l\'envoi du lien magique',
    loginNetworkError: 'Erreur réseau. Veuillez réessayer.',
    loginInvalidLink: 'Lien magique invalide ou expiré',
    loginFailedVerify: 'Échec de la vérification du lien magique',
    loginDevMode: 'Mode Développement:',

    // Pages Légales
    legalPrivacyTitle: 'Politique de Confidentialité - ISRS',
    legalPrivacyHeading: 'Politique de Confidentialité',
    legalTermsTitle: 'Conditions Générales - ISRS',
    legalTermsHeading: 'Conditions Générales',
    legalAccessibilityTitle: 'Déclaration d\'Accessibilité - ISRS',
    legalAccessibilityHeading: 'Déclaration d\'Accessibilité',
    legalCodeOfConductTitle: 'Code de Conduite - ISRS',
    legalCodeOfConductHeading: 'Code de Conduite',
    legalOrganization: 'Société Internationale pour la Restauration des Mollusques',
    legalLastUpdated: 'Dernière Mise à Jour:',
    legalHome: 'Accueil',
    legalBackToHome: '← Retour à l\'Accueil',
    legalNote: 'Note: Ce document juridique est fourni en anglais. Les traductions sont fournies à titre indicatif uniquement; la version anglaise est le document juridiquement contraignant.'
  }
};

// Get current language from localStorage, browser, or default to English
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const lang = browserLang.toLowerCase().split('-')[0]; // Get just the language code (e.g., 'en' from 'en-US')

  // Check if we support this language
  if (['en', 'es', 'fr'].includes(lang)) {
    return lang;
  }
  return 'en'; // Default to English
}

let currentLang = localStorage.getItem('isrs_language') || detectBrowserLanguage();

// Translate function
function t(key) {
  return translations[currentLang][key] || translations.en[key] || key;
}

// Change language
function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('isrs_language', lang);
  document.documentElement.lang = lang;

  // Reload components with new language
  loadHeader();
  loadStayConnected();
  loadFooter();

  // Update language selector
  updateLanguageSelector();

  // Translate page content
  translatePage();

  // Re-apply theme to ensure dark mode is preserved after header reload
  if (typeof applyTheme === 'function') {
    applyTheme();
  }
}

// Translate all elements with data-i18n attributes
function translatePage() {
  // Translate text content
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);

    // Handle different element types
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      if (element.hasAttribute('placeholder')) {
        element.placeholder = translation;
      } else {
        element.value = translation;
      }
    } else {
      element.innerHTML = translation; // Use innerHTML to preserve HTML tags like <strong>, <br>
    }
  });

  // Translate placeholders separately (for elements with data-i18n-placeholder)
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    const translation = t(key);
    element.placeholder = translation;
  });

  // Translate aria-label attributes
  document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
    const key = element.getAttribute('data-i18n-aria-label');
    const translation = t(key);
    element.setAttribute('aria-label', translation);
  });
}

// Toggle language dropdown menu
function toggleLanguageDropdown(event) {
  event?.stopPropagation();
  const menu = document.getElementById('language-dropdown-menu');
  const btn = document.getElementById('language-dropdown-btn');
  const isVisible = menu.style.display === 'block';

  menu.style.display = isVisible ? 'none' : 'block';

  // Update aria-expanded
  if (btn) {
    btn.setAttribute('aria-expanded', !isVisible);
  }

  // Focus first option when opening
  if (!isVisible) {
    setTimeout(() => {
      const firstOption = menu.querySelector('.lang-option');
      firstOption?.focus();
    }, 10);
  }
}

// Select language from dropdown
function selectLanguage(lang) {
  changeLanguage(lang);
  const menu = document.getElementById('language-dropdown-menu');
  const btn = document.getElementById('language-dropdown-btn');
  if (menu) menu.style.display = 'none';
  if (btn) {
    btn.setAttribute('aria-expanded', 'false');
    btn.focus(); // Return focus to button
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdown = document.querySelector('.language-dropdown');
  const menu = document.getElementById('language-dropdown-menu');
  const btn = document.getElementById('language-dropdown-btn');

  if (dropdown && menu && !dropdown.contains(event.target)) {
    menu.style.display = 'none';
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
});

// Keyboard navigation for dropdown
document.addEventListener('keydown', function(event) {
  const menu = document.getElementById('language-dropdown-menu');
  if (!menu || menu.style.display !== 'block') return;

  const options = Array.from(menu.querySelectorAll('.lang-option'));
  const currentIndex = options.indexOf(document.activeElement);

  switch(event.key) {
    case 'ArrowDown':
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % options.length;
      options[nextIndex]?.focus();
      break;
    case 'ArrowUp':
      event.preventDefault();
      const prevIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
      options[prevIndex]?.focus();
      break;
    case 'Escape':
      event.preventDefault();
      menu.style.display = 'none';
      document.getElementById('language-dropdown-btn')?.focus();
      document.getElementById('language-dropdown-btn')?.setAttribute('aria-expanded', 'false');
      break;
    case 'Enter':
    case ' ':
      if (document.activeElement.classList.contains('lang-option')) {
        event.preventDefault();
        document.activeElement.click();
      }
      break;
  }
});

// Update language selector UI
function updateLanguageSelector() {
  const buttons = document.querySelectorAll('.lang-btn, .lang-option');
  buttons.forEach(btn => {
    if (btn.dataset.lang === currentLang) {
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'true');
    } else {
      btn.classList.remove('active');
      btn.removeAttribute('aria-current');
    }
  });
}

// Header component
function loadHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  header.innerHTML = `
    <a href="#main-content" class="skip-link">${t('skipToMain')}</a>
    <nav class="navbar" role="navigation" aria-label="Main navigation">
      <a href="/" class="logo" aria-label="ISRS Home">
        <img id="header-logo" src="/images/logo-wide-blue.png" alt="ISRS Logo" width="1640" height="640" fetchpriority="high" />
      </a>
      <button class="mobile-menu-toggle" onclick="toggleMobileMenu()" aria-label="Toggle menu" aria-expanded="false">
        <span aria-hidden="true">☰</span>
      </button>
      <ul class="nav-links" id="navLinks">
        <li><a href="/" class="nav-link" data-page="home">${t('home')}</a></li>
        <li><a href="/about.html" class="nav-link" data-page="about">${t('about')}</a></li>
        <li class="dropdown">
          <a href="/icsr.html" class="nav-link" data-page="icsr" aria-haspopup="true" aria-expanded="false">${t('icsr')}</a>
          <ul class="dropdown-menu" role="menu">
            <li role="none"><a href="/icsr.html" class="nav-link" data-page="icsr" role="menuitem">${t('icsr')}</a></li>
            <li role="none"><a href="/icsr2026.html" class="nav-link" data-page="icsr2026" role="menuitem">ICSR2026</a></li>
          </ul>
        </li>
        <li><a href="/gallery.html" class="nav-link" data-page="gallery">${t('gallery')}</a></li>
        <li><a href="/support.html" class="nav-link" data-page="support">${t('support')}</a></li>
        <li><a href="https://www.zeffy.com/en-US/donation-form/isrs-building-tomorrows-ocean-leaders" target="_blank" rel="noopener noreferrer" class="btn-donate">${t('donate')}</a></li>
      </ul>
      <div class="header-controls">
        <button id="text-size-toggle" class="control-btn" onclick="cycleTextSize()" aria-label="Change text size" title="Change text size">
          <span aria-hidden="true">A</span>
        </button>
        <button id="theme-toggle" class="control-btn" onclick="toggleTheme()" aria-label="Toggle dark mode" title="Toggle dark mode">
          <span class="theme-icon" aria-hidden="true">🌙</span>
        </button>
        <div class="control-divider"></div>
        <div class="language-dropdown" style="position: relative;">
          <button class="control-btn" id="language-dropdown-btn" onclick="toggleLanguageDropdown(event)" aria-label="Select language" aria-expanded="false" aria-haspopup="true" title="Language / Idioma / Langue">
            <span aria-hidden="true">🌐</span>
          </button>
          <div id="language-dropdown-menu" class="language-dropdown-menu" role="menu" aria-label="Language options" style="display: none;">
            <button class="lang-option ${currentLang === 'en' ? 'active' : ''}" data-lang="en" onclick="selectLanguage('en')" role="menuitem" ${currentLang === 'en' ? 'aria-current="true"' : ''}>
              <span class="flag" aria-hidden="true">🇺🇸</span> English
            </button>
            <button class="lang-option ${currentLang === 'es' ? 'active' : ''}" data-lang="es" onclick="selectLanguage('es')" role="menuitem" ${currentLang === 'es' ? 'aria-current="true"' : ''}>
              <span class="flag" aria-hidden="true">🇪🇸</span> Español
            </button>
            <button class="lang-option ${currentLang === 'fr' ? 'active' : ''}" data-lang="fr" onclick="selectLanguage('fr')" role="menuitem" ${currentLang === 'fr' ? 'aria-current="true"' : ''}>
              <span class="flag" aria-hidden="true">🇫🇷</span> Français
            </button>
          </div>
        </div>
        <div class="control-divider"></div>
        <div class="social-links-header">
          <a href="#" class="social-link-header" aria-label="Facebook - Coming Soon" title="Facebook - Coming Soon">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="#" class="social-link-header" aria-label="Instagram - Coming Soon" title="Instagram - Coming Soon">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="#" class="social-link-header" aria-label="LinkedIn - Coming Soon" title="LinkedIn - Coming Soon">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="#" class="social-link-header" aria-label="X (Twitter) - Coming Soon" title="X (Twitter) - Coming Soon">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        </div>
        <div class="control-divider"></div>
        <a href="/login.html" class="control-btn user-profile-btn" id="user-profile-btn" aria-label="Login / Member Portal" title="Login / Member Portal">
          <span aria-hidden="true">🦪</span>
        </a>
      </div>
    </nav>
  `;

  // Highlight active nav link based on current page
  highlightActiveNavLink();
}

// Function to highlight the active navigation link
function highlightActiveNavLink() {
  const path = window.location.pathname;

  // Determine current page
  let currentPage = 'home';
  if (path === '/' || path === '/index.html') {
    currentPage = 'home';
  } else if (path.includes('about')) {
    currentPage = 'about';
  } else if (path.includes('icsr2026')) {
    currentPage = 'icsr2026';
  } else if (path.includes('icsr')) {
    currentPage = 'icsr';
  } else if (path.includes('gallery')) {
    currentPage = 'gallery';
  } else if (path.includes('support')) {
    currentPage = 'support';
  }

  // Add 'active' class to matching nav links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
    }
  });
}

// Stay Connected component
function loadStayConnected() {
  const stayConnected = document.getElementById('stay-connected');
  if (!stayConnected) return;

  stayConnected.innerHTML = `
    <section class="section stay-connected" aria-labelledby="stay-connected-heading">
      <div class="container">
        <div class="stay-connected-wrapper">
          <div class="stay-connected-content">
            <h2 id="stay-connected-heading">${t('stayConnected')}</h2>
            <p class="stay-connected-text">
              ${t('stayConnectedText')}<br>
              ${t('stayConnectedText2')}
            </p>
          </div>
          <form class="contact-form" id="contactForm" onsubmit="handleContactSubmit(event)">
            <div class="form-row form-row-3">
              <div class="form-group">
                <label for="firstName">${t('firstName')} <span class="required" aria-label="required">${t('required')}</span></label>
                <input type="text" id="firstName" name="firstName" required aria-required="true" />
              </div>
              <div class="form-group">
                <label for="lastName">${t('lastName')} <span class="required" aria-label="required">${t('required')}</span></label>
                <input type="text" id="lastName" name="lastName" required aria-required="true" />
              </div>
              <div class="form-group">
                <label for="email">${t('email')} <span class="required" aria-label="required">${t('required')}</span></label>
                <input type="email" id="email" name="email" required aria-required="true" />
              </div>
            </div>
            <div class="form-group">
              <label for="message">${t('message')}</label>
              <textarea id="message" name="message" rows="3" aria-describedby="message-hint"></textarea>
              <span id="message-hint" class="sr-only">Optional message field</span>
            </div>
            <button type="submit" class="btn btn-primary">${t('send')}</button>
          </form>
        </div>
      </div>
    </section>
  `;
}

// Footer component
function loadFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container">
      <div class="footer-content">
        <div class="footer-section footer-logo-section">
          <img src="/images/logo-wide-white.svg" alt="ISRS Logo" class="footer-logo" />
          <p>International Shellfish Restoration Society</p>
          <p>${t('footerTagline')}</p>
          <p class="footer-ein">${t('taxId')}</p>
          <div class="footer-social-links">
            <a href="#" class="footer-social-link" aria-label="Facebook - Coming Soon" title="Facebook - Coming Soon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" class="footer-social-link" aria-label="Instagram - Coming Soon" title="Instagram - Coming Soon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#" class="footer-social-link" aria-label="LinkedIn - Coming Soon" title="LinkedIn - Coming Soon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="#" class="footer-social-link" aria-label="X (Twitter) - Coming Soon" title="X (Twitter) - Coming Soon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
        <div class="footer-section">
          <h4>${t('quickLinks')}</h4>
          <ul>
            <li><a href="/">${t('home')}</a></li>
            <li><a href="/about.html">${t('about')}</a></li>
            <li><a href="/icsr.html">${t('icsr')}</a></li>
            <li><a href="/icsr2026.html">ICSR2026</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>${t('footerLegal')}</h4>
          <ul>
            <li><a href="/legal/privacy.html">${t('footerPrivacyPolicy')}</a></li>
            <li><a href="/legal/terms.html">${t('footerTermsOfService')}</a></li>
            <li><a href="/legal/code-of-conduct.html">${t('footerCodeOfConduct')}</a></li>
            <li><a href="/legal/accessibility.html">${t('footerAccessibility')}</a></li>
            <li><a href="/sitemap.xml">${t('footerSitemap')}</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>${t('connect')}</h4>
          <ul>
            <li><a href="/gallery.html">${t('footerPhotoGallery')}</a></li>
            <li><a href="/support.html">${t('footerSupportISRS')}</a></li>
            <li><a href="https://www.zeffy.com/en-US/donation-form/isrs-building-tomorrows-ocean-leaders" target="_blank" rel="noopener noreferrer">${t('donate')}</a></li>
            <li><a href="/press-kit.html">${t('footerPressKit')}</a></li>
            <li><a href="/admin/" target="_blank" rel="noopener noreferrer">${t('adminPortal')}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>${t('copyright')}</p>
        <p class="footer-legal-note">${t('footerTaxDisclaimer')}</p>
      </div>
    </div>
  `;
}

// Cookie Consent Banner for GDPR Compliance
function loadCookieConsent() {
  // Check if user has already made a choice
  const consentStatus = localStorage.getItem('isrs_cookie_consent');
  if (consentStatus) return;

  // Create cookie consent banner
  const banner = document.createElement('div');
  banner.id = 'cookie-consent-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-labelledby', 'cookie-consent-title');
  banner.setAttribute('aria-describedby', 'cookie-consent-description');
  banner.innerHTML = `
    <div class="cookie-consent-content">
      <div class="cookie-consent-text">
        <h3 id="cookie-consent-title">${t('cookieConsentTitle')}</h3>
        <p id="cookie-consent-description">${t('cookieConsentText')}</p>
        <a href="/legal/privacy.html" class="cookie-consent-link">${t('cookieConsentLearnMore')}</a>
      </div>
      <div class="cookie-consent-buttons">
        <button type="button" class="cookie-btn cookie-btn-accept" onclick="acceptCookies()">${t('cookieConsentAccept')}</button>
        <button type="button" class="cookie-btn cookie-btn-decline" onclick="declineCookies()">${t('cookieConsentDecline')}</button>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #cookie-consent-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #1e5a8e, #2980b9);
      color: white;
      padding: 1rem;
      z-index: 10000;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .cookie-consent-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .cookie-consent-text {
      flex: 1;
      min-width: 280px;
    }
    .cookie-consent-text h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    .cookie-consent-text p {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      opacity: 0.95;
      line-height: 1.5;
    }
    .cookie-consent-link {
      color: white;
      text-decoration: underline;
      font-size: 0.85rem;
    }
    .cookie-consent-link:hover {
      opacity: 0.8;
    }
    .cookie-consent-buttons {
      display: flex;
      gap: 0.75rem;
      flex-shrink: 0;
    }
    .cookie-btn {
      padding: 0.6rem 1.25rem;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;
      border: none;
    }
    .cookie-btn-accept {
      background: white;
      color: #1e5a8e;
    }
    .cookie-btn-accept:hover {
      background: #f0f0f0;
      transform: translateY(-1px);
    }
    .cookie-btn-decline {
      background: transparent;
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.7);
    }
    .cookie-btn-decline:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: white;
    }
    @media (max-width: 600px) {
      .cookie-consent-content {
        flex-direction: column;
        text-align: center;
      }
      .cookie-consent-buttons {
        width: 100%;
        justify-content: center;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(banner);
}

// Accept cookies and enable analytics
function acceptCookies() {
  localStorage.setItem('isrs_cookie_consent', 'accepted');
  localStorage.setItem('isrs_cookie_consent_date', new Date().toISOString());

  // Enable analytics if it was waiting for consent
  if (window.ISRSAnalytics && typeof window.ISRSAnalytics.enableTracking === 'function') {
    window.ISRSAnalytics.enableTracking();
  }

  hideCookieBanner();

  // Track the consent for analytics
  if (window.ISRSAnalytics) {
    window.ISRSAnalytics.trackEvent('cookie_consent', 'accepted');
  }
}

// Decline cookies - disable non-essential tracking
function declineCookies() {
  localStorage.setItem('isrs_cookie_consent', 'declined');
  localStorage.setItem('isrs_cookie_consent_date', new Date().toISOString());

  // Disable analytics tracking
  if (window.ISRSAnalytics && typeof window.ISRSAnalytics.disableTracking === 'function') {
    window.ISRSAnalytics.disableTracking();
  }

  hideCookieBanner();
}

// Hide the cookie banner with animation
function hideCookieBanner() {
  const banner = document.getElementById('cookie-consent-banner');
  if (banner) {
    banner.style.animation = 'slideDown 0.3s ease-in forwards';
    banner.style.setProperty('--slideDown', 'translateY(100%)');

    // Add slideDown animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from { transform: translateY(0); }
        to { transform: translateY(100%); }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => banner.remove(), 300);
  }
}

// Make cookie functions globally available
window.acceptCookies = acceptCookies;
window.declineCookies = declineCookies;

// Handle contact form submission
async function handleContactSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  // Track form submission
  if (window.ISRSAnalytics) {
    window.ISRSAnalytics.trackFormSubmission('contact_form');
  }

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.textContent = '...';

  const formData = {
    firstName: form.firstName.value,
    lastName: form.lastName.value,
    email: form.email.value,
    message: form.message.value
  };

  try {
    // TODO: Send to backend API
    console.log('Contact form submitted:', formData);

    // Show success message
    alert('Thank you! We will be in touch soon.');
    form.reset();
  } catch (error) {
    console.error('Form submission error:', error);
    alert('Sorry, there was an error. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// Toggle mobile menu
function toggleMobileMenu() {
  const navLinks = document.getElementById('navLinks');
  const toggle = document.querySelector('.mobile-menu-toggle');

  if (navLinks) {
    navLinks.classList.toggle('active');
    const isExpanded = navLinks.classList.contains('active');
    toggle.setAttribute('aria-expanded', isExpanded);
  }
}

// Update user profile button based on login status
function updateUserProfileButton() {
  const profileBtn = document.getElementById('user-profile-btn');
  if (!profileBtn) return;

  try {
    const userData = localStorage.getItem('isrs_user_data');
    const authToken = localStorage.getItem('isrs_auth_token');

    if (userData && authToken) {
      const user = JSON.parse(userData);

      // User is logged in - route to appropriate portal
      if (user.role === 'admin' || user.role === 'superadmin' || user.role === 'board') {
        // Admin, superadmin, and board members go to admin portal
        profileBtn.href = '/admin/';
        profileBtn.setAttribute('target', '_blank');
        profileBtn.setAttribute('rel', 'noopener noreferrer');
        profileBtn.setAttribute('aria-label', 'Admin Portal (opens in new window)');
        profileBtn.setAttribute('title', 'Admin Portal (opens in new window)');
      } else {
        // Advisory and other members go to member portal
        profileBtn.href = '/member/profile.html';
        profileBtn.setAttribute('aria-label', 'My Profile');
        profileBtn.setAttribute('title', 'My Profile');
      }
    } else {
      // User is not logged in - go to login page
      profileBtn.href = '/login.html';
      profileBtn.setAttribute('aria-label', 'Login');
      profileBtn.setAttribute('title', 'Login');
    }
  } catch (error) {
    console.error('Error updating profile button:', error);
    // Default to login page on error
    profileBtn.href = '/login.html';
  }
}

// Initialize components on page load
document.addEventListener('DOMContentLoaded', () => {
  // Set document language
  document.documentElement.lang = currentLang;

  // Load all components
  loadHeader();
  loadStayConnected();
  loadFooter();

  // Update user profile button based on login status
  updateUserProfileButton();

  // Translate page content
  translatePage();

  // Initialize feedback widget
  if (typeof initFeedbackWidget !== 'undefined') {
    initFeedbackWidget({ isAdminPortal: false });
  }

  // Load cookie consent banner (GDPR compliance)
  loadCookieConsent();

  // Make functions globally available
  window.changeLanguage = changeLanguage;
  window.toggleMobileMenu = toggleMobileMenu;
  window.handleContactSubmit = handleContactSubmit;
});
