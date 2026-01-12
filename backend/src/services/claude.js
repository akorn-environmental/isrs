const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

/**
 * Analyze contacts to identify potential duplicates using Claude AI
 * @param {Array} contacts - Array of contact objects to analyze
 * @returns {Promise<Array>} - Array of duplicate groups with confidence scores
 */
async function identifyDuplicates(contacts) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY not configured');
  }

  // Prepare contact data for Claude (limit fields to relevant ones)
  const simplifiedContacts = contacts.map((c, idx) => ({
    index: idx,
    id: c.id,
    name: c.full_name,
    email: c.email,
    phone: c.phone,
    organization: c.organization_name,
    city: c.city,
    state_province: c.state_province,
    country: c.country,
    role: c.role,
  }));

  const prompt = `You are a data quality expert analyzing the International Shellfish Restoration Society (ISRS) contact database for DUPLICATE RECORDS of the SAME PERSON.

CRITICAL: A duplicate means THE SAME PERSON appears multiple times in the database. Do NOT flag different people who work at the same organization or share an email domain.

TRUE duplicates (flag these):
- Same person with slightly different name spellings (John Smith vs Jon Smith, Michael vs Mike)
- Same person with two different email addresses (john.smith@work.com AND johnsmith@gmail.com)
- Same person entered twice with minor data variations
- Typos in names that are clearly the same person (Jamison vs Jamieson when other data matches)

NOT duplicates (do NOT flag):
- Different people at the same organization (e.g., 5 NOAA employees are 5 different people, not duplicates)
- Different people with same email domain (@noaa.gov, @fda.hhs.gov, etc.)
- Different people from the same country or region
- Different people with the same first name or same last name
- Colleagues at the same institution

Analyze these contacts and identify TRUE duplicates only. Return a JSON array of duplicate groups:
{
  "contacts": [index1, index2, ...],
  "confidence": 0-100,
  "reason": "Specific evidence why these are the same person",
  "recommended_action": "merge" or "review"
}

Only include groups where you are CONFIDENT these are the same individual person (confidence >= 70).

Contacts to analyze:
${JSON.stringify(simplifiedContacts, null, 2)}`;

  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Parse Claude's response
  const responseText = message.content[0].text;

  // Extract JSON from response (Claude might include explanation text)
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error('Claude response did not contain valid JSON array:', responseText);
    return [];
  }

  const duplicateGroups = JSON.parse(jsonMatch[0]);

  // Map indices back to actual contact objects
  return duplicateGroups.map(group => ({
    ...group,
    contacts: group.contacts.map(idx => contacts[idx]),
  }));
}

/**
 * Perform a web search using a simple search API
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of search results
 */
async function performWebSearch(query) {
  try {
    // Use DuckDuckGo Instant Answer API (free, no API key needed)
    const axios = require('axios');
    const encodedQuery = encodeURIComponent(query);

    // Try DuckDuckGo first
    const ddgResponse = await axios.get(
      `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`,
      { timeout: 5000 }
    );

    const results = [];

    if (ddgResponse.data) {
      // Abstract/summary from DuckDuckGo
      if (ddgResponse.data.Abstract) {
        results.push({
          title: ddgResponse.data.Heading || 'Summary',
          snippet: ddgResponse.data.Abstract,
          source: ddgResponse.data.AbstractSource || 'DuckDuckGo',
          url: ddgResponse.data.AbstractURL || ''
        });
      }

      // Related topics
      if (ddgResponse.data.RelatedTopics && ddgResponse.data.RelatedTopics.length > 0) {
        ddgResponse.data.RelatedTopics.slice(0, 5).forEach(topic => {
          if (topic.Text) {
            results.push({
              title: topic.Text.substring(0, 100),
              snippet: topic.Text,
              source: 'DuckDuckGo',
              url: topic.FirstURL || ''
            });
          }
        });
      }

      // Infobox data (structured information)
      if (ddgResponse.data.Infobox && ddgResponse.data.Infobox.content) {
        ddgResponse.data.Infobox.content.forEach(item => {
          if (item.label && item.value) {
            results.push({
              title: item.label,
              snippet: item.value,
              source: 'Infobox',
              url: ''
            });
          }
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Web search error:', error.message);
    return [];
  }
}

/**
 * Enhance a contact record with additional context and data quality improvements
 * Uses web search to find additional information about the contact
 * @param {Object} contact - Contact object to enhance
 * @param {Object} options - Options: { useWebSearch: boolean }
 * @returns {Promise<Object>} - Enhanced contact with suggestions
 */
async function enhanceContact(contact, options = { useWebSearch: true }) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY not configured');
  }

  let webSearchResults = [];

  // Perform web searches if enabled
  if (options.useWebSearch) {
    const searchQueries = [];

    // Build search queries based on available contact info
    const name = contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
    const org = contact.organization_name || contact.organization;

    if (name && org) {
      searchQueries.push(`${name} ${org}`);
    } else if (name) {
      searchQueries.push(`${name} shellfish restoration OR marine biology OR coastal ecology`);
    }

    if (org) {
      searchQueries.push(`${org} shellfish restoration OR oyster OR marine conservation`);
    }

    // Also search for the email domain to learn about the organization
    if (contact.email) {
      const domain = contact.email.split('@')[1];
      if (domain && !domain.includes('gmail') && !domain.includes('yahoo') && !domain.includes('hotmail')) {
        searchQueries.push(`${domain} organization`);
      }
    }

    // Perform searches (limit to first 2 queries to keep it fast)
    for (const query of searchQueries.slice(0, 2)) {
      const results = await performWebSearch(query);
      webSearchResults = webSearchResults.concat(results);
    }
  }

  // Build the prompt with web search context
  const webSearchContext = webSearchResults.length > 0
    ? `\n\nWEB SEARCH RESULTS (use these to enrich the contact data):\n${JSON.stringify(webSearchResults.slice(0, 10), null, 2)}`
    : '\n\n(No web search results available)';

  // Extract email domain info for the prompt
  const emailDomain = contact.email ? contact.email.split('@')[1] : null;
  let domainHint = '';
  if (emailDomain) {
    // Parse government domains for state/org hints
    if (emailDomain.endsWith('.gov') || emailDomain.endsWith('.state.us')) {
      const parts = emailDomain.split('.');
      // Common patterns: agency.state.gov (e.g., dhh.la.gov = Louisiana Dept of Health)
      // or agency.state.us (e.g., dec.ny.us = NY Dept of Environmental Conservation)
      domainHint = `\n\nEMAIL DOMAIN ANALYSIS for "${emailDomain}":
- This is a US GOVERNMENT email domain
- Common pattern: [agency].[state].gov or [agency].[state].[country]
- State abbreviations in .gov domains indicate the US state (e.g., "la" = Louisiana, "ny" = New York, "ca" = California)
- Examples: dhh.la.gov = Louisiana Dept of Health and Hospitals, dec.ny.gov = NY Dept of Environmental Conservation
- ALWAYS extract and suggest the state_province from the state abbreviation in the domain
- ALWAYS try to identify the full organization name from the agency abbreviation`;
    } else if (emailDomain.endsWith('.edu')) {
      domainHint = `\n\nEMAIL DOMAIN ANALYSIS for "${emailDomain}":
- This is a US EDUCATIONAL institution
- Try to identify the university/college name from the domain`;
    } else if (emailDomain.endsWith('.org')) {
      domainHint = `\n\nEMAIL DOMAIN ANALYSIS for "${emailDomain}":
- This is likely a non-profit organization
- Try to identify the organization name from the domain`;
    }
  }

  const prompt = `You are a data quality expert reviewing a contact record for the International Shellfish Restoration Society (ISRS).

CRITICAL INSTRUCTIONS:
1. ALWAYS analyze the email domain to extract state/organization info
2. For .gov domains like "dhh.la.gov", the state code (e.g., "la") indicates Louisiana - suggest state_province = "Louisiana"
3. For .gov domains, the agency abbreviation (e.g., "dhh") typically indicates the department - look it up or make an educated guess
4. Use the web search results to verify and enrich information
5. Do NOT leave state_province empty if there's a state code in the email domain
${domainHint}

Analyze this contact and provide:
1. Data quality issues (missing fields, formatting problems, inconsistencies)
2. Suggestions for improvement based on email domain analysis AND web search findings
3. Inferred/discovered information
4. Relevance assessment for shellfish restoration (scale 1-10)
5. Confidence level for each suggested field (high/medium/low)

Contact:
${JSON.stringify(contact, null, 2)}
${webSearchContext}

Return a JSON object with:
{
  "quality_score": 0-100,
  "issues": ["issue1", "issue2", ...],
  "suggestions": {
    "state_province": {
      "value": "Full state name extracted from email domain",
      "confidence": "high",
      "source": "email domain analysis"
    },
    "organization_name": {
      "value": "Full organization name",
      "confidence": "high|medium",
      "source": "email domain analysis or web search"
    },
    "field_name": {
      "value": "suggested_value",
      "confidence": "high|medium|low",
      "source": "where this info came from"
    }
  },
  "web_findings": {
    "person_info": "any discovered information about the person",
    "org_info": "any discovered information about their organization",
    "relevant_publications": "any publications or projects found",
    "social_profiles": "any LinkedIn, ResearchGate, etc. profiles found"
  },
  "relevance_score": 0-10,
  "relevance_notes": "Why this contact is relevant to shellfish restoration",
  "search_summary": "Brief summary of what was found via web search"
}

REMEMBER: For email like aarousse@dhh.la.gov:
- state_province should be "Louisiana" (from "la" in domain)
- organization_name should be "Louisiana Department of Health" or similar (from "dhh")
- contact_type should be "Government"`;

  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
    max_tokens: 3000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error('Claude response did not contain valid JSON:', responseText);
    return null;
  }

  const result = JSON.parse(jsonMatch[0]);

  // Add metadata about the enhancement process
  result.enhancement_metadata = {
    web_search_performed: options.useWebSearch,
    search_results_count: webSearchResults.length,
    timestamp: new Date().toISOString()
  };

  return result;
}

/**
 * Batch review multiple contacts and provide prioritized recommendations
 * @param {Array} contacts - Array of contacts to review
 * @param {Object} options - Review options (focus areas, criteria)
 * @returns {Promise<Object>} - Review summary with recommendations
 */
async function batchReviewContacts(contacts, options = {}) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY not configured');
  }

  const { focus = 'quality', limit = 100 } = options;
  const reviewContacts = contacts.slice(0, limit);

  const simplifiedContacts = reviewContacts.map((c, idx) => ({
    index: idx,
    id: c.id,
    name: c.full_name,
    email: c.email,
    phone: c.phone,
    organization: c.organization_name,
    role: c.role,
    city: c.city,
    state_province: c.state_province,
    country: c.country,
    expertise: c.expertise,
    notes: c.notes,
  }));

  const prompt = `You are reviewing the International Shellfish Restoration Society (ISRS) contact database.

Review these ${reviewContacts.length} contacts focusing on: ${focus}

Context: ISRS is a 501(c)(3) nonprofit supporting the global shellfish restoration community. Our network includes 2,600+ researchers, government agencies, and conservation organizations working on oyster, mussel, and clam ecosystem restoration.

Provide:
1. Overall database health assessment
2. Top 10 priority contacts to review/fix (with reasons)
3. Common data quality issues
4. Recommended actions for improvement
5. Insights about the composition of this contact set (roles, organizations, geographic distribution)

Contacts:
${JSON.stringify(simplifiedContacts, null, 2)}

Return a JSON object with:
{
  "health_score": 0-100,
  "summary": "Brief overall assessment",
  "priority_contacts": [
    {
      "index": 0,
      "reason": "Why this contact needs attention",
      "priority": "high/medium/low"
    }
  ],
  "common_issues": ["issue1", "issue2", ...],
  "recommendations": ["action1", "action2", ...],
  "insights": {
    "role_distribution": "observations about roles",
    "geographic_coverage": "observations about locations",
    "data_completeness": "overall completeness assessment"
  }
}`;

  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error('Claude response did not contain valid JSON:', responseText);
    return null;
  }

  const review = JSON.parse(jsonMatch[0]);

  // Map indices back to actual contact objects
  review.priority_contacts = review.priority_contacts.map(pc => ({
    ...pc,
    contact: reviewContacts[pc.index],
  }));

  return review;
}

/**
 * Merge duplicate contacts with AI assistance
 * @param {Array} duplicates - Array of duplicate contact objects
 * @returns {Promise<Object>} - Merged contact with best data from each
 */
async function suggestMerge(duplicates) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY not configured');
  }

  const prompt = `You are merging duplicate contact records for the International Shellfish Restoration Society (ISRS).

Analyze these duplicate contacts and create a single merged record by:
1. Choosing the most complete/accurate value for each field
2. Combining notes and preserving unique information
3. Marking fields with conflicting data for manual review
4. Preserving all email addresses if different (comma-separated)
5. Combining expertise and interests fields intelligently

Duplicates:
${JSON.stringify(duplicates, null, 2)}

Return a JSON object with:
{
  "merged_contact": {
    "full_name": "best value",
    "first_name": "best value",
    "last_name": "best value",
    "email": "best value or combined",
    "phone": "best value",
    "organization_name": "best value",
    "role": "best value",
    "title": "best value",
    "city": "best value",
    "state_province": "best value",
    "country": "best value",
    "expertise": "combined expertise",
    "interests": "combined interests",
    "notes": "combined notes"
  },
  "conflicts": [
    {
      "field": "field_name",
      "values": ["value1", "value2"],
      "recommendation": "which to choose and why"
    }
  ],
  "confidence": 0-100,
  "notes_to_add": "Any additional notes from merge process"
}`;

  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error('Claude response did not contain valid JSON:', responseText);
    return null;
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Standardize organization names using AI
 * @param {Array} organizations - Array of organization objects
 * @returns {Promise<Object>} - Standardization suggestions
 */
async function standardizeOrganizations(organizations) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY not configured');
  }

  const simplifiedOrgs = organizations.map((o, idx) => ({
    index: idx,
    id: o.id,
    name: o.name,
    country: o.country,
    type: o.type,
  }));

  const prompt = `You are standardizing organization names for the International Shellfish Restoration Society (ISRS) database.

Analyze these organizations and identify:
1. Duplicate organizations (same entity, different names)
2. Standard naming conventions (official names, abbreviations)
3. Recommended canonical names for each organization
4. Organization type classifications

Organizations:
${JSON.stringify(simplifiedOrgs, null, 2)}

Return a JSON object with:
{
  "duplicate_groups": [
    {
      "canonical_name": "official organization name",
      "organization_indices": [idx1, idx2, ...],
      "confidence": 0-100,
      "reason": "why these are the same organization"
    }
  ],
  "standardization_suggestions": [
    {
      "index": 0,
      "current_name": "current name",
      "suggested_name": "standardized name",
      "reasoning": "why this is better"
    }
  ],
  "recommendations": ["overall recommendation1", "recommendation2", ...]
}`;

  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error('Claude response did not contain valid JSON:', responseText);
    return null;
  }

  const result = JSON.parse(jsonMatch[0]);

  // Map indices back to actual organization objects
  if (result.duplicate_groups) {
    result.duplicate_groups = result.duplicate_groups.map(group => ({
      ...group,
      organizations: group.organization_indices.map(idx => organizations[idx]),
    }));
  }

  if (result.standardization_suggestions) {
    result.standardization_suggestions = result.standardization_suggestions.map(sugg => ({
      ...sugg,
      organization: organizations[sugg.index],
    }));
  }

  return result;
}

module.exports = {
  identifyDuplicates,
  enhanceContact,
  batchReviewContacts,
  suggestMerge,
  standardizeOrganizations,
};
