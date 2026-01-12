/**
 * Security Utilities
 * 
 * Provides input validation and sanitization functions
 * to prevent SQL injection and other attacks.
 */

/**
 * Allowed column names for contacts table
 * Only these fields can be used in dynamic SQL queries
 */
const ALLOWED_CONTACT_COLUMNS = new Set([
  'full_name',
  'first_name',
  'last_name',
  'email',
  'organization_name',
  'organization_id',
  'role',
  'title',
  'department',
  'phone',
  'mobile_phone',
  'fax',
  'address',
  'address_line_2',
  'city',
  'state',
  'postal_code',
  'country',
  'website',
  'linkedin_url',
  'twitter_handle',
  'bio',
  'notes',
  'tags',
  'source',
  'source_detail',
  'contact_type',
  'status',
  'last_contacted',
  'next_followup',
  'data_quality_score',
  'ai_enhanced',
  'ai_enhanced_at',
  'preferred_language',
  'timezone',
  'do_not_email',
  'do_not_call',
  'gdpr_consent',
  'gdpr_consent_date'
]);

/**
 * Allowed column names for organizations table
 */
const ALLOWED_ORGANIZATION_COLUMNS = new Set([
  'name',
  'type',
  'website',
  'phone',
  'fax',
  'email',
  'address',
  'address_line_2',
  'city',
  'state',
  'postal_code',
  'country',
  'description',
  'notes',
  'tags',
  'status',
  'founded_year',
  'employee_count',
  'annual_budget',
  'focus_areas',
  'partnership_status'
]);

/**
 * Validate that all column names in an object are allowed
 * @param {Object} data - Object with column names as keys
 * @param {Set} allowedColumns - Set of allowed column names
 * @returns {Object} - { valid: boolean, invalidColumns: string[] }
 */
function validateColumns(data, allowedColumns) {
  const invalidColumns = [];
  
  for (const key of Object.keys(data)) {
    if (!allowedColumns.has(key)) {
      invalidColumns.push(key);
    }
  }
  
  return {
    valid: invalidColumns.length === 0,
    invalidColumns
  };
}

/**
 * Filter object to only include allowed columns
 * @param {Object} data - Object with column names as keys
 * @param {Set} allowedColumns - Set of allowed column names
 * @returns {Object} - Filtered object with only allowed columns
 */
function filterToAllowedColumns(data, allowedColumns) {
  const filtered = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (allowedColumns.has(key)) {
      filtered[key] = value;
    }
  }
  
  return filtered;
}

/**
 * Sanitize a string for safe SQL identifier use
 * Only allows alphanumeric characters and underscores
 * @param {string} identifier - The identifier to sanitize
 * @returns {string|null} - Sanitized identifier or null if invalid
 */
function sanitizeIdentifier(identifier) {
  if (typeof identifier !== 'string') return null;
  
  // Only allow alphanumeric and underscores
  const sanitized = identifier.replace(/[^a-zA-Z0-9_]/g, '');
  
  // Must start with a letter
  if (!/^[a-zA-Z]/.test(sanitized)) return null;
  
  // Limit length
  if (sanitized.length > 64) return null;
  
  return sanitized;
}

/**
 * Escape HTML entities to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[&<>"'/]/g, char => htmlEntities[char]);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  
  // Basic email regex - not perfect but catches most issues
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate numeric ID
 * @param {any} id - ID to validate
 * @returns {boolean} - True if valid positive integer
 */
function isValidId(id) {
  const num = parseInt(id, 10);
  return !isNaN(num) && num > 0 && num <= Number.MAX_SAFE_INTEGER;
}

module.exports = {
  ALLOWED_CONTACT_COLUMNS,
  ALLOWED_ORGANIZATION_COLUMNS,
  validateColumns,
  filterToAllowedColumns,
  sanitizeIdentifier,
  escapeHtml,
  isValidEmail,
  isValidId
};
