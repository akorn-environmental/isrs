/**
 * ISRS Board Members (Final List)
 * These names are used for Claude prompt authority and vote column headers
 */
const BOARD_MEMBERS = [
  'Dorothy Leonard',
  'Beth Walton',
  'Rick DeVoe',
  'Mark Risse',
  'Katie Mosher',
  'Mark Luckenbach',
  'Simon Branigan',
  'Tristan Hugh-Jones'
];

/**
 * Board Member Directory (optional metadata)
 */
const BOARD_MEMBER_DIRECTORY = {
  'Dorothy Leonard': {
    email: 'msmussel@oceanequities.org',
    role: 'Board Chair'
  },
  'Beth Walton': {
    email: 'beth@oystersouth.com',
    role: 'Board Member'
  },
  'Rick DeVoe': {
    email: 'devoemr@cofc.edu',
    role: 'Board Member'
  },
  'Mark Risse': {
    email: 'mrisse@uga.edu',
    role: 'Board Member'
  },
  'Katie Mosher': {
    email: 'kmosher@billionoysterproject.org',
    role: 'Board Member'
  },
  'Mark Luckenbach': {
    email: 'luck@vims.edu',
    role: 'Board Member'
  },
  'Simon Branigan': {
    email: 'simon.branigan@tnc.org',
    role: 'Board Member'
  },
  'Tristan Hugh-Jones': {
    email: 'tristan@oysters.co.uk',
    role: 'Board Member'
  }
};

/**
 * User Permissions Configuration
 */
const USER_ROLES = {
  ADMIN: 'admin',           // Full admins: Lisa Paton, Erin Flaherty
  BOARD: 'board',           // Board members with vote access
  ADVISORY: 'advisory',     // Advisory panel: edit access, NO board votes
  VIEWER: 'viewer'          // Read-only access
};

// Full administrators - complete system access
const ADMIN_USERS = [
  'lisa.paton@gmail.com',              // Lisa Paton
  'erinflahertyconsulting@gmail.com',  // Erin Flaherty
  'admin@shellfish-society.org',       // System Admin
  'aaron.kornbluth@gmail.com'          // Aaron Kornbluth
];

// Board members - edit access + board vote access
const BOARD_USERS = [
  'mrisse@uga.edu',                    // Mark Risse
  'kmosher@billionoysterproject.org',  // Katie Mosher
  'luck@vims.edu',                     // Mark Luckenbach
  'tristan@oysters.co.uk',             // Tristan Hugh-Jones
  'simon.branigan@tnc.org',            // Simon Branigan
  'msmussel@oceanequities.org',        // Dorothy Leonard
  'beth@oystersouth.com',              // Beth Walton
  'devoemr@cofc.edu'                   // M Richard DeVoe
];

// Advisory panel - edit access but NO board vote access
const ADVISORY_USERS = [
  'betsy@restorationfund.org',         // Betsy Peabody
  'andylacatell@gmail.com',            // Andy Lacatell
  'bircha59@gmail.com',                // Anne Birch
  'bhancock@tnc.org',                  // Boze Hancock
  'michael.doall@stonybrook.edu',      // Michael Doall
  'carlibertrand@hotmail.com',         // Carli Bertrand
  'kingsleysmithp@dnr.sc.gov',         // Peter Kingsley-Smith
  'lcoen1@fau.edu',                    // Loren Coen
  'ladon.swann@usm.edu',               // LaDon Swann
  'allgooddeeds@gmail.com'             // Aaron Kornblooth (Test Member Account)
];

const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'view', 'edit', 'delete', 'admin', 'export', 'import',
    'enhance', 'cleanup', 'user_management', 'board_votes',
    'send_emails', 'ai_query'
  ],
  [USER_ROLES.BOARD]: [
    'view', 'edit', 'export', 'conference_admin',
    'donor_access', 'board_votes', 'send_emails'
  ],
  [USER_ROLES.ADVISORY]: [
    'view', 'edit', 'export', 'conference_management'
    // Note: NO 'board_votes' permission for advisory panel
  ],
  [USER_ROLES.VIEWER]: ['view']
};

module.exports = {
  BOARD_MEMBERS,
  BOARD_MEMBER_DIRECTORY,
  USER_ROLES,
  ADMIN_USERS,
  BOARD_USERS,
  ADVISORY_USERS,
  STEERING_USERS: ADVISORY_USERS, // Backwards compatibility alias
  ROLE_PERMISSIONS
};
