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
    joinNetworkText: 'Connect with restoration practitioners, scientists, and community leaders worldwide. Members gain access to exclusive resources, networking opportunities, and conference discounts.',
    joinNetworkButton: 'Become a Member',

    shareKnowledgeTitle: 'Share Your Knowledge',
    shareKnowledgeText: 'Present your research, contribute to best practices guides, or mentor emerging professionals. Your expertise helps advance the field of shellfish restoration.',
    shareKnowledgeButton: 'Partner With Us',

    supportMissionTitle: 'Support Our Mission',
    supportMissionText: 'Help build a sustainable future for coastal ecosystems through membership, partnership, or charitable giving.',
    supportMissionButton: 'Make a Donation',

    donationNote: 'ISRS uses Zeffy, a 100% free fundraising platform that allows us to receive every dollar of your donation without deducting platform fees. When you donate, you\'ll see an optional contribution to support Zeffy\'s free service. This tip is completely optional - you may adjust it to any amount or $0.',

    // Global Network
    globalNetworkHeading: 'Our Global Network',
    globalNetworkIntro: 'Join our growing network of over 2,600 members working to advance shellfish restoration worldwide.',
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
    copyright: '© 2025 International Shellfish Restoration Society. All rights reserved.',
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
    pastAttendeeNote: 'If you\'ve attended a past ICSR conference, you already have an account! Just enter the email you used for registration.',
    learnAboutICSR: 'Learn About ICSR2026',
    checkYourEmail: 'Check Your Email!',
    magicLinkSent: 'We\'ve sent a secure login link to',
    magicLinkInstructions: 'Click the link in the email to access your member profile. The link will expire in 15 minutes.',
    sendAnotherLink: 'Send Another Link',

    // Member Portal - Verification
    verifyingLogin: 'Verifying Your Login',
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
    icsr2026HeroHeading: 'ICSR2026',
    icsr2026HostedBy: 'Hosted by Puget Sound Restoration Foundation',
    icsr2026Location: 'Puget Sound, Washington State',
    icsr2026Dates: 'October 4-8, 2026',

    // ICSR2026 - Overview
    icsr2026OverviewHeading: 'Join Us in the Pacific Northwest',
    icsr2026OverviewText1: 'The 2026 International Conference on Shellfish Restoration will bring together the global restoration community for four days of cutting-edge research, practical workshops, and invaluable networking with restoration practitioners from around the world.',
    icsr2026OverviewText2: 'Set in the spectacular Puget Sound region, ICSR2026 will explore the intersection of traditional ecological knowledge, modern restoration science, and community-based conservation.',
    icsr2026MailingListCTA: 'Join Mailing List for Updates',

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
    icsr2026ExpectHeading: 'What to Expect',
    icsr2026ExpectResearch: 'Cutting-Edge Research',
    icsr2026ExpectResearchDesc: 'Oral presentations and lightning talks on oyster dynamics, habitat monitoring, urban restoration, species interactions, reef structures, and climate adaptation',
    icsr2026ExpectWorkshops: 'Hands-On Workshops',
    icsr2026ExpectWorkshopsDesc: 'Interactive sessions on restoration planning, monitoring protocols, community engagement, traditional knowledge, funding, and data analysis',
    icsr2026ExpectFieldTrips: 'Field Trips',
    icsr2026ExpectFieldTripsDesc: 'Site visits to Tribal restoration sites, Puget Sound oyster reefs, urban shoreline projects, Olympia oyster recovery, and geoduck restoration',
    icsr2026ExpectNetworking: 'Networking',
    icsr2026ExpectNetworkingDesc: 'Welcome reception, poster sessions, conference banquet, regional network meetings, and informal gatherings throughout the week',

    // ICSR2026 - Venue
    icsr2026VenueHeading: 'Conference Venue at Squaxin Island Tribe Territory',
    icsr2026VenueText1: 'ICSR2026 will be held at the Little Creek Resort and Conference Center, operated by the Squaxin Island Tribe in Shelton, Washington. The Squaxin Island people\'s ancestral territory includes much of southern Puget Sound, and they have been stewards of shellfish resources for thousands of years, maintaining deep cultural and spiritual connections to clams, oysters, and other shellfish.',
    icsr2026VenueText2: 'Today, the Tribe continues this tradition through active shellfish management, restoration programs, and aquaculture operations, integrating traditional ecological knowledge with modern conservation science. ICSR2026 will provide unique opportunities to learn from Tribal restoration practitioners and experience Indigenous approaches to shellfish stewardship.',

    // ICSR2026 - Why Puget Sound
    icsr2026WhyHeading: 'Why Puget Sound?',
    icsr2026WhyIntro: 'Puget Sound is a global hotspot for shellfish restoration innovation with deep cultural connections to shellfish:',
    icsr2026WhySpecies: 'Diverse Species',
    icsr2026WhySpeciesDesc: 'Home to native Olympia oysters, Pacific oysters, geoduck clams, Manila clams, and numerous other shellfish species.',
    icsr2026WhyResearch: 'Research Excellence',
    icsr2026WhyResearchDesc: 'Leading universities and research institutions advancing shellfish science and restoration techniques.',
    icsr2026WhyTribal: 'Tribal Leadership',
    icsr2026WhyTribalDesc: 'Coast Salish Tribes leading innovative restoration programs rooted in traditional knowledge.',
    icsr2026WhyRestoration: 'Active Restoration',
    icsr2026WhyRestorationDesc: 'Dozens of ongoing restoration projects addressing water quality, habitat loss, and climate change.',
    icsr2026WhyPolicy: 'Policy Innovation',
    icsr2026WhyPolicyDesc: 'Progressive shellfish management and restoration policies serving as models for other regions.',
    icsr2026WhyEcosystem: 'Ecosystem Focus',
    icsr2026WhyEcosystemDesc: 'Holistic approaches integrating shellfish restoration with broader coastal ecosystem recovery.',

    // ICSR2026 - Expected Attendance
    icsr2026AttendanceHeading: 'Expected Attendance',
    icsr2026Participants: 'Participants',
    icsr2026Countries: 'Countries',
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

    // ICSR2026 - Code of Conduct
    icsr2026CodeHeading: 'Code of Conduct',
    icsr2026CodeText: 'ICSR2026 is committed to providing a respectful, inclusive, and welcoming environment for all participants. We maintain a zero-tolerance policy for harassment and inappropriate behavior. All attendees are expected to treat each other with respect, welcome diverse perspectives, and refrain from unauthorized photography or recording.',

    // ICSR2026 - Mailing List Modal
    icsr2026ModalCloseAriaLabel: 'Close mailing list modal',
    icsr2026ModalTitle: 'Join Our Mailing List',
    icsr2026ModalSubtitle: 'Stay updated on ICSR2026 registration, abstract submissions, and conference details.',
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
    supportProgramICRDesc: 'The world\'s premier gathering for molluscan shellfish restoration, bringing together 300+ practitioners from 20+ countries to share breakthrough science and successful restoration approaches. ICSR2026 will be held October 4-8, 2026, at the Little Creek Resort and Conference Center, operated by the Squaxin Island Tribe in Shelton, Washington.',
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
    supportViewPressKit: 'View Press Kit'
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
    joinNetworkText: 'Conéctate con profesionales de restauración, científicos y líderes comunitarios de todo el mundo. Los miembros obtienen acceso a recursos exclusivos, oportunidades de networking y descuentos en conferencias.',
    joinNetworkButton: 'Hazte Miembro',

    shareKnowledgeTitle: 'Comparte Tu Conocimiento',
    shareKnowledgeText: 'Presenta tu investigación, contribuye a guías de mejores prácticas o asesora a profesionales emergentes. Tu experiencia ayuda a avanzar en el campo de la restauración de moluscos.',
    shareKnowledgeButton: 'Asóciate con Nosotros',

    supportMissionTitle: 'Apoya Nuestra Misión',
    supportMissionText: 'Ayuda a construir un futuro sostenible para los ecosistemas costeros a través de membresía, asociación o donaciones caritativas.',
    supportMissionButton: 'Haz una Donación',

    donationNote: 'ISRS usa Zeffy, una plataforma de recaudación de fondos 100% gratuita que nos permite recibir cada dólar de tu donación sin deducir tarifas de plataforma. Cuando dones, verás una contribución opcional para apoyar el servicio gratuito de Zeffy. Esta propina es completamente opcional: puedes ajustarla a cualquier cantidad o $0.',

    // Red Global
    globalNetworkHeading: 'Nuestra Red Global',
    globalNetworkIntro: 'Únete a nuestra red en crecimiento de más de 2,600 miembros trabajando para avanzar en la restauración de moluscos en todo el mundo.',
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
    copyright: '© 2025 Sociedad Internacional para la Restauración de Moluscos. Todos los derechos reservados.',
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
    pastAttendeeNote: 'Si ha asistido a una conferencia ICSR anterior, ¡ya tiene una cuenta! Simplemente ingrese el correo electrónico que usó para el registro.',
    learnAboutICSR: 'Información sobre ICSR2026',
    checkYourEmail: '¡Revise su Correo Electrónico!',
    magicLinkSent: 'Hemos enviado un enlace de inicio de sesión seguro a',
    magicLinkInstructions: 'Haga clic en el enlace del correo electrónico para acceder a su perfil de miembro. El enlace expirará en 15 minutos.',
    sendAnotherLink: 'Enviar Otro Enlace',

    // Portal de Miembros - Verificación
    verifyingLogin: 'Verificando su Inicio de Sesión',
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
    icsr2026HeroHeading: 'ICSR2026',
    icsr2026HostedBy: 'Organizado por la Fundación de Restauración de Puget Sound',
    icsr2026Location: 'Puget Sound, Estado de Washington',
    icsr2026Dates: '4-8 de Octubre de 2026',

    // ICSR2026 - Descripción General
    icsr2026OverviewHeading: 'Únase a Nosotros en el Noroeste del Pacífico',
    icsr2026OverviewText1: 'La Conferencia Internacional sobre Restauración de Moluscos 2026 reunirá a la comunidad global de restauración durante cuatro días de investigación de vanguardia, talleres prácticos y networking invaluable con profesionales de restauración de todo el mundo.',
    icsr2026OverviewText2: 'Situada en la espectacular región de Puget Sound, ICSR2026 explorará la intersección del conocimiento ecológico tradicional, la ciencia moderna de restauración y la conservación basada en la comunidad.',
    icsr2026MailingListCTA: 'Únase a la Lista de Correo para Actualizaciones',

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
    icsr2026ExpectHeading: 'Qué Esperar',
    icsr2026ExpectResearch: 'Investigación de Vanguardia',
    icsr2026ExpectResearchDesc: 'Presentaciones orales y charlas relámpago sobre dinámica de ostras, monitoreo de hábitat, restauración urbana, interacciones de especies, estructuras de arrecifes y adaptación climática',
    icsr2026ExpectWorkshops: 'Talleres Prácticos',
    icsr2026ExpectWorkshopsDesc: 'Sesiones interactivas sobre planificación de restauración, protocolos de monitoreo, participación comunitaria, conocimiento tradicional, financiación y análisis de datos',
    icsr2026ExpectFieldTrips: 'Viajes de Campo',
    icsr2026ExpectFieldTripsDesc: 'Visitas a sitios de restauración tribales, arrecifes de ostras de Puget Sound, proyectos de costas urbanas, recuperación de ostras Olympia y restauración de almejas geoduck',
    icsr2026ExpectNetworking: 'Networking',
    icsr2026ExpectNetworkingDesc: 'Recepción de bienvenida, sesiones de pósteres, banquete de conferencia, reuniones de redes regionales y reuniones informales durante toda la semana',

    // ICSR2026 - Lugar
    icsr2026VenueHeading: 'Lugar de la Conferencia en el Territorio de la Tribu Squaxin Island',
    icsr2026VenueText1: 'ICSR2026 se llevará a cabo en el Little Creek Resort and Conference Center, operado por la Tribu Squaxin Island en Shelton, Washington. El territorio ancestral del pueblo Squaxin Island incluye gran parte del sur de Puget Sound, y han sido administradores de recursos de moluscos durante miles de años, manteniendo profundas conexiones culturales y espirituales con almejas, ostras y otros moluscos.',
    icsr2026VenueText2: 'Hoy, la Tribu continúa esta tradición a través de la gestión activa de moluscos, programas de restauración y operaciones de acuicultura, integrando el conocimiento ecológico tradicional con la ciencia de conservación moderna. ICSR2026 brindará oportunidades únicas para aprender de los profesionales de restauración tribales y experimentar enfoques indígenas para la administración de moluscos.',

    // ICSR2026 - Por Qué Puget Sound
    icsr2026WhyHeading: '¿Por Qué Puget Sound?',
    icsr2026WhyIntro: 'Puget Sound es un punto caliente global para la innovación en restauración de moluscos con profundas conexiones culturales con los moluscos:',
    icsr2026WhySpecies: 'Especies Diversas',
    icsr2026WhySpeciesDesc: 'Hogar de ostras Olympia nativas, ostras del Pacífico, almejas geoduck, almejas Manila y numerosas otras especies de moluscos.',
    icsr2026WhyResearch: 'Excelencia en Investigación',
    icsr2026WhyResearchDesc: 'Universidades e instituciones de investigación líderes que avanzan la ciencia de moluscos y las técnicas de restauración.',
    icsr2026WhyTribal: 'Liderazgo Tribal',
    icsr2026WhyTribalDesc: 'Tribus Coast Salish liderando programas innovadores de restauración basados en el conocimiento tradicional.',
    icsr2026WhyRestoration: 'Restauración Activa',
    icsr2026WhyRestorationDesc: 'Docenas de proyectos de restauración en curso que abordan la calidad del agua, la pérdida de hábitat y el cambio climático.',
    icsr2026WhyPolicy: 'Innovación en Políticas',
    icsr2026WhyPolicyDesc: 'Políticas progresivas de gestión y restauración de moluscos que sirven como modelos para otras regiones.',
    icsr2026WhyEcosystem: 'Enfoque Ecosistémico',
    icsr2026WhyEcosystemDesc: 'Enfoques holísticos que integran la restauración de moluscos con la recuperación más amplia del ecosistema costero.',

    // ICSR2026 - Asistencia Esperada
    icsr2026AttendanceHeading: 'Asistencia Esperada',
    icsr2026Participants: 'Participantes',
    icsr2026Countries: 'Países',
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

    // ICSR2026 - Código de Conducta
    icsr2026CodeHeading: 'Código de Conducta',
    icsr2026CodeText: 'ICSR2026 se compromete a proporcionar un entorno respetuoso, inclusivo y acogedor para todos los participantes. Mantenemos una política de tolerancia cero para el acoso y el comportamiento inapropiado. Se espera que todos los asistentes se traten con respeto, den la bienvenida a diversas perspectivas y se abstengan de fotografía o grabación no autorizadas.',

    // ICSR2026 - Modal de Lista de Correo
    icsr2026ModalCloseAriaLabel: 'Cerrar modal de lista de correo',
    icsr2026ModalTitle: 'Únase a Nuestra Lista de Correo',
    icsr2026ModalSubtitle: 'Manténgase actualizado sobre el registro de ICSR2026, envío de resúmenes y detalles de la conferencia.',
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
    supportProgramICRDesc: 'La reunión premier mundial para la restauración de moluscos, reuniendo a más de 300 profesionales de más de 20 países para compartir ciencia innovadora y enfoques exitosos de restauración. ICSR2026 se llevará a cabo del 4 al 8 de octubre de 2026, en el Little Creek Resort and Conference Center, operado por la Tribu Squaxin Island en Shelton, Washington.',
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
    supportViewPressKit: 'Ver Kit de Prensa'
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
    joinNetworkText: 'Connectez-vous avec des praticiens de la restauration, des scientifiques et des leaders communautaires du monde entier. Les membres ont accès à des ressources exclusives, des opportunités de réseautage et des réductions pour les conférences.',
    joinNetworkButton: 'Devenir Membre',

    shareKnowledgeTitle: 'Partagez Vos Connaissances',
    shareKnowledgeText: 'Présentez vos recherches, contribuez aux guides de meilleures pratiques ou mentorez des professionnels émergents. Votre expertise aide à faire progresser le domaine de la restauration des mollusques.',
    shareKnowledgeButton: 'Partenariat avec Nous',

    supportMissionTitle: 'Soutenez Notre Mission',
    supportMissionText: 'Aidez à construire un avenir durable pour les écosystèmes côtiers par le biais de l\'adhésion, du partenariat ou du don caritatif.',
    supportMissionButton: 'Faire un Don',

    donationNote: 'ISRS utilise Zeffy, une plateforme de collecte de fonds 100% gratuite qui nous permet de recevoir chaque dollar de votre don sans déduire de frais de plateforme. Lorsque vous faites un don, vous verrez une contribution optionnelle pour soutenir le service gratuit de Zeffy. Ce pourboire est entièrement optionnel - vous pouvez l\'ajuster à n\'importe quel montant ou 0$.',

    // Réseau Global
    globalNetworkHeading: 'Notre Réseau Mondial',
    globalNetworkIntro: 'Rejoignez notre réseau en croissance de plus de 2 600 membres travaillant à faire progresser la restauration des mollusques dans le monde entier.',
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
    copyright: '© 2025 Société Internationale pour la Restauration des Mollusques. Tous droits réservés.',
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
    pastAttendeeNote: 'Si vous avez assisté à une conférence ICSR précédente, vous avez déjà un compte! Entrez simplement l\'adresse e-mail que vous avez utilisée pour l\'inscription.',
    learnAboutICSR: 'En Savoir Plus sur ICSR2026',
    checkYourEmail: 'Vérifiez Votre E-mail!',
    magicLinkSent: 'Nous avons envoyé un lien de connexion sécurisé à',
    magicLinkInstructions: 'Cliquez sur le lien dans l\'e-mail pour accéder à votre profil de membre. Le lien expirera dans 15 minutes.',
    sendAnotherLink: 'Envoyer un Autre Lien',

    // Portail des Membres - Vérification
    verifyingLogin: 'Vérification de Votre Connexion',
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
    icsr2026HeroHeading: 'ICSR2026',
    icsr2026HostedBy: 'Organisé par la Fondation de Restauration de Puget Sound',
    icsr2026Location: 'Puget Sound, État de Washington',
    icsr2026Dates: '4-8 Octobre 2026',

    // ICSR2026 - Aperçu
    icsr2026OverviewHeading: 'Rejoignez-Nous dans le Nord-Ouest du Pacifique',
    icsr2026OverviewText1: 'La Conférence Internationale sur la Restauration des Mollusques 2026 réunira la communauté mondiale de restauration pendant quatre jours de recherche de pointe, d\'ateliers pratiques et de réseautage inestimable avec des praticiens de la restauration du monde entier.',
    icsr2026OverviewText2: 'Située dans la spectaculaire région de Puget Sound, ICSR2026 explorera l\'intersection du savoir écologique traditionnel, de la science moderne de restauration et de la conservation communautaire.',
    icsr2026MailingListCTA: 'Rejoindre la Liste de Diffusion pour les Mises à Jour',

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
    icsr2026ExpectHeading: 'À Quoi S\'Attendre',
    icsr2026ExpectResearch: 'Recherche de Pointe',
    icsr2026ExpectResearchDesc: 'Présentations orales et conférences éclair sur la dynamique des huîtres, le suivi des habitats, la restauration urbaine, les interactions des espèces, les structures récifales et l\'adaptation au climat',
    icsr2026ExpectWorkshops: 'Ateliers Pratiques',
    icsr2026ExpectWorkshopsDesc: 'Sessions interactives sur la planification de restauration, les protocoles de suivi, l\'engagement communautaire, le savoir traditionnel, le financement et l\'analyse de données',
    icsr2026ExpectFieldTrips: 'Visites sur le Terrain',
    icsr2026ExpectFieldTripsDesc: 'Visites de sites de restauration tribaux, récifs d\'huîtres de Puget Sound, projets de rivages urbains, récupération d\'huîtres Olympia et restauration de palourdes géoduck',
    icsr2026ExpectNetworking: 'Réseautage',
    icsr2026ExpectNetworkingDesc: 'Réception de bienvenue, sessions de posters, banquet de conférence, réunions de réseaux régionaux et rassemblements informels tout au long de la semaine',

    // ICSR2026 - Lieu
    icsr2026VenueHeading: 'Lieu de Conférence sur le Territoire de la Tribu Squaxin Island',
    icsr2026VenueText1: 'ICSR2026 se tiendra au Little Creek Resort and Conference Center, exploité par la Tribu Squaxin Island à Shelton, Washington. Le territoire ancestral du peuple Squaxin Island comprend une grande partie du sud de Puget Sound, et ils ont été gestionnaires des ressources de mollusques pendant des milliers d\'années, maintenant de profondes connexions culturelles et spirituelles avec les palourdes, les huîtres et autres mollusques.',
    icsr2026VenueText2: 'Aujourd\'hui, la Tribu continue cette tradition par la gestion active des mollusques, les programmes de restauration et les opérations d\'aquaculture, intégrant le savoir écologique traditionnel avec la science de conservation moderne. ICSR2026 offrira des opportunités uniques d\'apprendre des praticiens de la restauration tribaux et de découvrir les approches autochtones de la gérance des mollusques.',

    // ICSR2026 - Pourquoi Puget Sound
    icsr2026WhyHeading: 'Pourquoi Puget Sound?',
    icsr2026WhyIntro: 'Puget Sound est un point chaud mondial pour l\'innovation en restauration des mollusques avec de profondes connexions culturelles aux mollusques:',
    icsr2026WhySpecies: 'Espèces Diverses',
    icsr2026WhySpeciesDesc: 'Habitat des huîtres Olympia indigènes, huîtres du Pacifique, palourdes géoduck, palourdes Manila et de nombreuses autres espèces de mollusques.',
    icsr2026WhyResearch: 'Excellence en Recherche',
    icsr2026WhyResearchDesc: 'Universités et institutions de recherche de premier plan faisant progresser la science des mollusques et les techniques de restauration.',
    icsr2026WhyTribal: 'Leadership Tribal',
    icsr2026WhyTribalDesc: 'Tribus Coast Salish dirigeant des programmes innovants de restauration ancrés dans le savoir traditionnel.',
    icsr2026WhyRestoration: 'Restauration Active',
    icsr2026WhyRestorationDesc: 'Des dizaines de projets de restauration en cours abordant la qualité de l\'eau, la perte d\'habitat et le changement climatique.',
    icsr2026WhyPolicy: 'Innovation Politique',
    icsr2026WhyPolicyDesc: 'Politiques progressistes de gestion et de restauration des mollusques servant de modèles pour d\'autres régions.',
    icsr2026WhyEcosystem: 'Focus Écosystémique',
    icsr2026WhyEcosystemDesc: 'Approches holistiques intégrant la restauration des mollusques avec la récupération plus large de l\'écosystème côtier.',

    // ICSR2026 - Participation Attendue
    icsr2026AttendanceHeading: 'Participation Attendue',
    icsr2026Participants: 'Participants',
    icsr2026Countries: 'Pays',
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

    // ICSR2026 - Code de Conduite
    icsr2026CodeHeading: 'Code de Conduite',
    icsr2026CodeText: 'ICSR2026 s\'engage à fournir un environnement respectueux, inclusif et accueillant pour tous les participants. Nous maintenons une politique de tolérance zéro pour le harcèlement et les comportements inappropriés. Tous les participants sont tenus de se traiter avec respect, d\'accueillir diverses perspectives et de s\'abstenir de photographie ou enregistrement non autorisés.',

    // ICSR2026 - Modal Liste de Diffusion
    icsr2026ModalCloseAriaLabel: 'Fermer modal liste de diffusion',
    icsr2026ModalTitle: 'Rejoignez Notre Liste de Diffusion',
    icsr2026ModalSubtitle: 'Restez informé sur l\'inscription à ICSR2026, les soumissions de résumés et les détails de la conférence.',
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
    supportProgramICRDesc: 'Le rassemblement mondial premier pour la restauration des mollusques, réunissant plus de 300 praticiens de plus de 20 pays pour partager des sciences révolutionnaires et des approches de restauration réussies. ICSR2026 se tiendra du 4 au 8 octobre 2026, au Little Creek Resort and Conference Center, exploité par la Tribu Squaxin Island à Shelton, Washington.',
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
    supportViewPressKit: 'Voir le Kit de Presse'
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

  // Make functions globally available
  window.changeLanguage = changeLanguage;
  window.toggleMobileMenu = toggleMobileMenu;
  window.handleContactSubmit = handleContactSubmit;
});
