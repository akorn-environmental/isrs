const axios = require('axios');
const { pool } = require('../config/database');

/**
 * Contact Enrichment Service for ISRS
 * Enriches contacts using Apollo.io, Clearbit, Hunter.io, FullContact, and Lusha APIs
 * Adapted from CTC implementation for ISRS contact/attendee structure
 */

class ContactEnrichmentService {
  constructor() {
    this.apolloKey = process.env.APOLLO_API_KEY;
    this.clearbitKey = process.env.CLEARBIT_API_KEY;
    this.hunterKey = process.env.HUNTER_API_KEY;
    this.lushaKey = process.env.LUSHA_API_KEY;
    this.fullContactKey = process.env.FULLCONTACT_API_KEY;
  }

  /**
   * Main enrichment method - tries multiple sources
   * @param {number|null} contactId - ID from contacts table (optional)
   * @param {string|null} attendeeId - UUID from attendee_profiles table (optional)
   * @param {string} email - Email address to enrich
   * @param {string} name - Optional full name to help matching
   * @param {string} company - Optional company name/domain
   */
  async enrichContact(contactId = null, attendeeId = null, email, name = null, company = null) {
    console.log(`[Contact Enrichment] Enriching: ${email}`);

    const enrichmentData = {
      email: email,
      sources_used: [],
      data_found: {}
    };

    try {
      // 1. Try Apollo.io first (free tier with 10k credits/month!)
      if (this.apolloKey) {
        try {
          const apolloData = await this.enrichWithApollo(email, name, company);
          if (apolloData) {
            enrichmentData.sources_used.push('apollo');
            enrichmentData.data_found = { ...enrichmentData.data_found, ...apolloData };
            console.log('[Contact Enrichment] ✓ Apollo.io data retrieved');
          }
        } catch (error) {
          console.log('[Contact Enrichment] Apollo.io failed:', error.message);
        }
      }

      // 2. Try Clearbit if Apollo didn't find everything (best data quality)
      if (this.clearbitKey && !enrichmentData.data_found.job_title) {
        try {
          const clearbitData = await this.enrichWithClearbit(email);
          if (clearbitData) {
            enrichmentData.sources_used.push('clearbit');
            enrichmentData.data_found = { ...enrichmentData.data_found, ...clearbitData };
            console.log('[Contact Enrichment] ✓ Clearbit data retrieved');
          }
        } catch (error) {
          console.log('[Contact Enrichment] Clearbit failed:', error.message);
        }
      }

      // 3. Try FullContact if we don't have enough data
      if (this.fullContactKey && !enrichmentData.data_found.job_title) {
        try {
          const fullContactData = await this.enrichWithFullContact(email);
          if (fullContactData) {
            enrichmentData.sources_used.push('fullcontact');
            enrichmentData.data_found = { ...enrichmentData.data_found, ...fullContactData };
            console.log('[Contact Enrichment] ✓ FullContact data retrieved');
          }
        } catch (error) {
          console.log('[Contact Enrichment] FullContact failed:', error.message);
        }
      }

      // 4. Try Hunter.io if we need to find/verify email
      if (this.hunterKey && company && name) {
        try {
          const hunterData = await this.findEmailWithHunter(name, company);
          if (hunterData) {
            enrichmentData.sources_used.push('hunter');
            enrichmentData.data_found = { ...enrichmentData.data_found, ...hunterData };
            console.log('[Contact Enrichment] ✓ Hunter data retrieved');
          }
        } catch (error) {
          console.log('[Contact Enrichment] Hunter failed:', error.message);
        }
      }

      // 5. Try Lusha for phone numbers
      if (this.lushaKey && enrichmentData.data_found.linkedin_url) {
        try {
          const lushaData = await this.enrichWithLusha(enrichmentData.data_found.linkedin_url);
          if (lushaData) {
            enrichmentData.sources_used.push('lusha');
            enrichmentData.data_found = { ...enrichmentData.data_found, ...lushaData };
            console.log('[Contact Enrichment] ✓ Lusha data retrieved');
          }
        } catch (error) {
          console.log('[Contact Enrichment] Lusha failed:', error.message);
        }
      }

      // 6. Save enrichment data to database
      if (enrichmentData.sources_used.length > 0) {
        await this.saveEnrichmentData(contactId, attendeeId, enrichmentData);
        console.log(`[Contact Enrichment] ✅ Enriched ${email} using: ${enrichmentData.sources_used.join(', ')}`);
      } else {
        console.log('[Contact Enrichment] ⚠️ No enrichment data found');
      }

      return enrichmentData;

    } catch (error) {
      console.error('[Contact Enrichment] Error:', error.message);
      return null;
    }
  }

  /**
   * Enrich using Apollo.io (FREE tier: 10,000 credits/month!)
   */
  async enrichWithApollo(email, name = null, company = null) {
    try {
      // Apollo.io People Search API
      const response = await axios.post(
        'https://api.apollo.io/v1/people/match',
        {
          email: email,
          // Optional: helps with matching
          ...(name && { name: name }),
          ...(company && { organization_name: company })
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'X-Api-Key': this.apolloKey
          },
          timeout: 10000
        }
      );

      const person = response.data.person;
      if (!person) {
        return null;
      }

      return {
        // Person data
        full_name: person.name || null,
        job_title: person.title || null,
        job_seniority: person.seniority || null,
        job_role: person.functions?.[0] || null,
        location: person.city || person.state || person.country || null,
        linkedin_url: person.linkedin_url || null,
        twitter_handle: person.twitter_url ? person.twitter_url.split('/').pop() : null,
        avatar_url: person.photo_url || null,

        // Contact data
        phone: person.phone_numbers?.[0]?.raw_number || null,
        mobile_phone: person.phone_numbers?.find(p => p.type === 'mobile')?.raw_number || null,
        office_phone: person.phone_numbers?.find(p => p.type === 'work')?.raw_number || null,

        // Company data (from organization object)
        company_name: person.organization?.name || null,
        company_domain: person.organization?.website_url || person.organization?.primary_domain || null,
        company_size: person.organization?.estimated_num_employees
          ? `${person.organization.estimated_num_employees}+`
          : null,
        company_industry: person.organization?.industry || null,
        company_tags: person.organization?.keywords || [],
        company_description: person.organization?.short_description || null,
        company_founded: person.organization?.founded_year || null,
        company_linkedin: person.organization?.linkedin_url || null,

        // Additional Apollo-specific data
        email_confidence: person.email_status || null, // 'verified', 'guessed', etc.
        department: person.departments?.[0] || null
      };
    } catch (error) {
      if (error.response?.status === 404 || error.response?.data?.message?.includes('not found')) {
        console.log('[Apollo.io] No data found for email');
        return null;
      }
      throw error;
    }
  }

  /**
   * Enrich using Clearbit Enrichment API
   */
  async enrichWithClearbit(email) {
    try {
      const response = await axios.get(`https://person-stream.clearbit.com/v2/combined/find`, {
        params: { email },
        auth: {
          username: this.clearbitKey,
          password: '' // Clearbit uses HTTP basic auth with key as username
        },
        timeout: 10000
      });

      const person = response.data.person || {};
      const company = response.data.company || {};

      return {
        // Person data
        full_name: person.name?.fullName || null,
        job_title: person.employment?.title || null,
        job_seniority: person.employment?.seniority || null,
        job_role: person.employment?.role || null,
        location: person.location || null,
        linkedin_url: person.linkedin?.handle ? `https://linkedin.com/in/${person.linkedin.handle}` : null,
        twitter_handle: person.twitter?.handle || null,
        avatar_url: person.avatar || null,
        bio: person.bio || null,

        // Company data
        company_name: company.name || null,
        company_domain: company.domain || null,
        company_size: company.metrics?.employeesRange || null,
        company_industry: company.category?.industry || null,
        company_tags: company.tags || [],
        company_description: company.description || null,
        company_founded: company.foundedYear || null,
        company_linkedin: company.linkedin?.handle ? `https://linkedin.com/company/${company.linkedin.handle}` : null
      };
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('[Clearbit] No data found for email');
        return null;
      }
      throw error;
    }
  }

  /**
   * Enrich using FullContact Person API
   */
  async enrichWithFullContact(email) {
    try {
      const response = await axios.post(
        'https://api.fullcontact.com/v3/person.enrich',
        { email },
        {
          headers: {
            'Authorization': `Bearer ${this.fullContactKey}`
          },
          timeout: 10000
        }
      );

      const data = response.data;
      const employment = data.employment?.[0] || {};
      const demographics = data.demographics || {};

      return {
        full_name: data.fullName || null,
        job_title: employment.title || null,
        company_name: employment.name || null,
        company_domain: employment.domain || null,
        location: data.location || null,
        linkedin_url: data.linkedin || null,
        twitter_handle: data.twitter || null,
        avatar_url: data.avatar || null,
        bio: data.bio || null,
        age_range: demographics.age || null,
        gender: demographics.gender || null
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find email using Hunter.io
   */
  async findEmailWithHunter(fullName, companyDomain) {
    try {
      const [firstName, ...lastNameParts] = fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      const response = await axios.get('https://api.hunter.io/v2/email-finder', {
        params: {
          domain: companyDomain,
          first_name: firstName,
          last_name: lastName,
          api_key: this.hunterKey
        },
        timeout: 10000
      });

      const data = response.data.data;

      if (data.email) {
        return {
          email: data.email,
          email_confidence: data.score / 100, // Convert 0-100 to 0-1
          email_sources: data.sources?.length || 0,
          job_title: data.position || null,
          linkedin_url: data.linkedin_url || null,
          twitter_handle: data.twitter || null,
          phone: data.phone_number || null
        };
      }

      return null;
    } catch (error) {
      console.error('[Hunter] Error:', error.message);
      return null;
    }
  }

  /**
   * Get company emails using Hunter.io Domain Search
   */
  async findCompanyEmails(companyDomain, limit = 10) {
    try {
      const response = await axios.get('https://api.hunter.io/v2/domain-search', {
        params: {
          domain: companyDomain,
          limit: limit,
          api_key: this.hunterKey
        },
        timeout: 10000
      });

      const data = response.data.data;

      return {
        domain: data.domain,
        organization: data.organization,
        pattern: data.pattern, // e.g., "{first}@company.com"
        emails: data.emails.map(e => ({
          email: e.value,
          full_name: `${e.first_name} ${e.last_name}`,
          job_title: e.position,
          seniority: e.seniority,
          department: e.department,
          linkedin: e.linkedin,
          twitter: e.twitter,
          confidence: e.confidence
        }))
      };
    } catch (error) {
      console.error('[Hunter Domain Search] Error:', error.message);
      return null;
    }
  }

  /**
   * Enrich using Lusha (for phone numbers)
   */
  async enrichWithLusha(linkedinUrl) {
    try {
      // Lusha API requires LinkedIn URL or company + name
      const response = await axios.post(
        'https://api.lusha.com/person',
        { linkedinUrl },
        {
          headers: {
            'api_key': this.lushaKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const data = response.data;

      return {
        phone: data.phoneNumbers?.[0] || null,
        mobile_phone: data.phoneNumbers?.find(p => p.type === 'mobile')?.number || null,
        office_phone: data.phoneNumbers?.find(p => p.type === 'work')?.number || null,
        email: data.emailAddresses?.[0] || null
      };
    } catch (error) {
      console.error('[Lusha] Error:', error.message);
      return null;
    }
  }

  /**
   * Save enrichment data to database
   * Supports both contact_id (INTEGER) and attendee_id (UUID)
   */
  async saveEnrichmentData(contactId, attendeeId, enrichmentData) {
    try {
      // Determine primary source
      const primarySource = enrichmentData.sources_used[0] || 'unknown';

      const query = `
        INSERT INTO contact_enrichment (
          contact_id, attendee_id, email, enrichment_source,
          full_name, job_title, job_seniority, job_role, department,
          location, bio, avatar_url,
          phone, mobile_phone, office_phone, email_confidence,
          company_name, company_domain, company_size, company_industry,
          company_tags, company_founded, company_linkedin,
          linkedin_url, twitter_handle,
          enriched_at, raw_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, NOW(), $26)
        ON CONFLICT (email, enrichment_source) DO UPDATE SET
          contact_id = COALESCE(EXCLUDED.contact_id, contact_enrichment.contact_id),
          attendee_id = COALESCE(EXCLUDED.attendee_id, contact_enrichment.attendee_id),
          full_name = EXCLUDED.full_name,
          job_title = EXCLUDED.job_title,
          job_seniority = EXCLUDED.job_seniority,
          job_role = EXCLUDED.job_role,
          department = EXCLUDED.department,
          location = EXCLUDED.location,
          bio = EXCLUDED.bio,
          avatar_url = EXCLUDED.avatar_url,
          phone = EXCLUDED.phone,
          mobile_phone = EXCLUDED.mobile_phone,
          office_phone = EXCLUDED.office_phone,
          email_confidence = EXCLUDED.email_confidence,
          company_name = EXCLUDED.company_name,
          company_domain = EXCLUDED.company_domain,
          company_size = EXCLUDED.company_size,
          company_industry = EXCLUDED.company_industry,
          company_tags = EXCLUDED.company_tags,
          company_founded = EXCLUDED.company_founded,
          company_linkedin = EXCLUDED.company_linkedin,
          linkedin_url = EXCLUDED.linkedin_url,
          twitter_handle = EXCLUDED.twitter_handle,
          enriched_at = NOW(),
          raw_data = EXCLUDED.raw_data
        RETURNING *
      `;

      const data = enrichmentData.data_found;

      const values = [
        contactId || null,
        attendeeId || null,
        enrichmentData.email,
        primarySource,
        data.full_name || null,
        data.job_title || null,
        data.job_seniority || null,
        data.job_role || null,
        data.department || null,
        data.location || null,
        data.bio || null,
        data.avatar_url || null,
        data.phone || null,
        data.mobile_phone || null,
        data.office_phone || null,
        data.email_confidence || null,
        data.company_name || null,
        data.company_domain || null,
        data.company_size || null,
        data.company_industry || null,
        data.company_tags || [],
        data.company_founded || null,
        data.company_linkedin || null,
        data.linkedin_url || null,
        data.twitter_handle || null,
        JSON.stringify(enrichmentData)
      ];

      const result = await pool.query(query, values);

      // Log API usage
      await this.logApiUsage(primarySource, true, null);

      return result.rows[0];
    } catch (error) {
      console.error('[Contact Enrichment] Error saving to database:', error.message);
      throw error;
    }
  }

  /**
   * Log API usage for monitoring and rate limiting
   */
  async logApiUsage(apiName, success, errorMessage = null) {
    try {
      const query = `
        INSERT INTO enrichment_api_logs (
          api_name, success, error_message, created_at
        ) VALUES ($1, $2, $3, NOW())
      `;
      await pool.query(query, [apiName, success, errorMessage]);
    } catch (error) {
      console.error('[Contact Enrichment] Error logging API usage:', error.message);
      // Don't throw - logging failure shouldn't break enrichment
    }
  }

  /**
   * Get enriched data for a contact or attendee
   */
  async getEnrichedData(contactId = null, attendeeId = null) {
    if (!contactId && !attendeeId) {
      throw new Error('Either contactId or attendeeId must be provided');
    }

    let query, values;

    if (contactId) {
      query = `
        SELECT * FROM contact_enrichment
        WHERE contact_id = $1
        ORDER BY enriched_at DESC
      `;
      values = [contactId];
    } else {
      query = `
        SELECT * FROM contact_enrichment
        WHERE attendee_id = $1
        ORDER BY enriched_at DESC
      `;
      values = [attendeeId];
    }

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Get enriched data by email
   */
  async getEnrichedDataByEmail(email) {
    const query = `
      SELECT * FROM contact_enrichment
      WHERE email = $1
      ORDER BY enriched_at DESC
    `;
    const result = await pool.query(query, [email]);
    return result.rows;
  }

  /**
   * Batch enrich multiple contacts
   */
  async batchEnrich(contacts, delayMs = 1000) {
    console.log(`[Contact Enrichment] Batch enriching ${contacts.length} contacts...`);
    const results = [];

    for (const contact of contacts) {
      try {
        const result = await this.enrichContact(
          contact.id || contact.contact_id || null,
          contact.attendee_id || null,
          contact.email,
          contact.name || contact.full_name,
          contact.company_domain || contact.organization_name
        );
        results.push({
          id: contact.id || contact.attendee_id,
          email: contact.email,
          success: true,
          data: result
        });

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (error) {
        console.error(`[Contact Enrichment] Failed for ${contact.email}:`, error.message);
        results.push({
          id: contact.id || contact.attendee_id,
          email: contact.email,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`[Contact Enrichment] Batch complete: ${results.filter(r => r.success).length}/${contacts.length} enriched`);
    return results;
  }

  /**
   * Check which enrichment services are configured
   */
  getConfiguredServices() {
    return {
      apollo: !!this.apolloKey,
      clearbit: !!this.clearbitKey,
      hunter: !!this.hunterKey,
      fullcontact: !!this.fullContactKey,
      lusha: !!this.lushaKey
    };
  }
}

module.exports = new ContactEnrichmentService();
