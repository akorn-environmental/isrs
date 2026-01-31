const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';

// Known organization domains for shellfish restoration
const KNOWN_DOMAINS = {
  // Government agencies
  'noaa.gov': 'NOAA',
  'dfw.wa.gov': 'Washington Department of Fish & Wildlife',
  'epa.gov': 'Environmental Protection Agency',
  'doi.gov': 'Department of the Interior',

  // Research institutions
  'vims.edu': 'Virginia Institute of Marine Science',
  'mit.edu': 'Massachusetts Institute of Technology',
  'stanford.edu': 'Stanford University',
  'uw.edu': 'University of Washington',
  'ucsd.edu': 'UC San Diego',

  // Conservation organizations
  'tnc.org': 'The Nature Conservancy',
  'restorationfund.org': 'Puget Sound Restoration Fund',
  'savethesound.org': 'Save The Sound',
  'shellfish-society.org': 'International Shellfish Restoration Society',

  // Aquaculture companies
  'taylorshellfish.com': 'Taylor Shellfish',
  'hamahama.com': 'Hama Hama Company',

  // Tribes
  'suquamish.nsn.us': 'Suquamish Tribe',
  'squaxinisland.org': 'Squaxin Island Tribe'
};

/**
 * Extract organization from email address
 */
function extractOrganizationFromEmail(email) {
  if (!email) return null;

  const domain = email.split('@')[1];
  if (!domain) return null;

  // Check known domains first
  if (KNOWN_DOMAINS[domain]) {
    return {
      name: KNOWN_DOMAINS[domain],
      domain,
      source: 'known_mapping',
      confidence: 1.0
    };
  }

  // Filter out personal email providers
  const personalDomains = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com',
    'icloud.com', 'mail.com', 'protonmail.com', 'me.com'
  ];

  if (personalDomains.includes(domain)) {
    return null;
  }

  // Extract organization name from domain
  let orgName = domain.split('.')[0];

  // Clean up common patterns
  orgName = orgName
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    name: orgName,
    domain,
    source: 'domain_extraction',
    confidence: 0.6,
    needsAIEnhancement: true
  };
}

/**
 * Enhance organization name using AI
 */
async function enhanceOrganizationName(orgName, email) {
  try {
    const prompt = `Given the organization name "${orgName}" extracted from email domain "${email}", provide the proper full organization name.

Examples:
- "restorationfund" → "Puget Sound Restoration Fund"
- "taylorshellfish" → "Taylor Shellfish Farms"
- "suquamish" → "Suquamish Tribe"

Return ONLY the enhanced organization name, or "UNKNOWN" if you cannot determine it.`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }]
    });

    const enhanced = message.content[0].text.trim();

    if (enhanced === 'UNKNOWN' || enhanced.length < 2) {
      return orgName;
    }

    return enhanced;
  } catch (error) {
    console.error('[Org Detection] AI enhancement error:', error);
    return orgName;
  }
}

/**
 * Detect organization type
 */
async function detectOrganizationType(orgName, domain) {
  try {
    const prompt = `Classify this organization: "${orgName}" (${domain})

Types:
- University
- Non-Profit
- Government
- Tribal
- Corporation
- Research Institute
- Service/SaaS (for companies like Google, Microsoft, etc.)

Return ONLY the type.`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 50,
      messages: [{ role: 'user', content: prompt }]
    });

    const type = message.content[0].text.trim();

    // Filter out service companies
    if (type === 'Service/SaaS') {
      return null;
    }

    return type;
  } catch (error) {
    console.error('[Org Detection] Type detection error:', error);
    return 'Unknown';
  }
}

/**
 * Detect geographic region
 */
async function detectOrganizationRegion(orgName, domain) {
  try {
    const prompt = `What is the geographic location/region for this organization: "${orgName}" (${domain})?

Format: "Continent/Country/State or Region"
Examples:
- "North America/US/Washington"
- "Europe/UK/Scotland"
- "North America/US/California"

Return ONLY the formatted location or "Unknown" if unclear.`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }]
    });

    const region = message.content[0].text.trim();

    if (region === 'Unknown' || region.length < 3) {
      return null;
    }

    return region;
  } catch (error) {
    console.error('[Org Detection] Region detection error:', error);
    return null;
  }
}

/**
 * Process all contacts and extract organizations
 */
async function extractOrganizationsFromContacts(contacts) {
  const organizations = new Map();

  for (const contact of contacts) {
    if (!contact.email) continue;

    const org = extractOrganizationFromEmail(contact.email);
    if (!org) continue;

    // AI enhancement if needed
    if (org.needsAIEnhancement) {
      org.name = await enhanceOrganizationName(org.name, contact.email);
      org.confidence = 0.8;
    }

    // Get organization type
    org.type = await detectOrganizationType(org.name, org.domain);
    if (!org.type) continue; // Filter out service companies

    // Get geographic region
    org.region = await detectOrganizationRegion(org.name, org.domain);

    // Add to map (deduplicate by domain)
    if (!organizations.has(org.domain)) {
      organizations.set(org.domain, org);
    }
  }

  return Array.from(organizations.values());
}

module.exports = {
  extractOrganizationFromEmail,
  enhanceOrganizationName,
  detectOrganizationType,
  detectOrganizationRegion,
  extractOrganizationsFromContacts
};
