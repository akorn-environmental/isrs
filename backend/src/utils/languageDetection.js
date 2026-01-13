/**
 * Language Detection Utility
 * Detects user's preferred language from various sources
 */

const { query } = require('../config/database');
const { isLanguageSupported } = require('../services/emailTranslations');

/**
 * Detect user's preferred language
 * Priority: 1. User profile preference 2. Browser/request header 3. Default (en)
 *
 * @param {string} email - User's email address
 * @param {object} req - Express request object (optional, for Accept-Language header)
 * @returns {Promise<string>} Language code (en, fr, es)
 */
async function detectUserLanguage(email, req = null) {
  try {
    // 1. Check user's profile preference
    if (email) {
      const result = await query(
        'SELECT preferred_language FROM attendee_profiles WHERE user_email = $1',
        [email]
      );

      if (result.rows.length > 0 && result.rows[0].preferred_language) {
        const prefLang = result.rows[0].preferred_language.toLowerCase();
        if (isLanguageSupported(prefLang)) {
          return prefLang;
        }
      }
    }

    // 2. Check Accept-Language header from request
    if (req && req.headers && req.headers['accept-language']) {
      const acceptLang = req.headers['accept-language'];
      // Parse Accept-Language header (e.g., "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7")
      const languages = acceptLang.split(',').map(lang => {
        const parts = lang.trim().split(';');
        const code = parts[0].split('-')[0].toLowerCase(); // Get just 'fr' from 'fr-FR'
        const quality = parts[1] ? parseFloat(parts[1].replace('q=', '')) : 1.0;
        return { code, quality };
      });

      // Sort by quality (preference)
      languages.sort((a, b) => b.quality - a.quality);

      // Find first supported language
      for (const lang of languages) {
        if (isLanguageSupported(lang.code)) {
          return lang.code;
        }
      }
    }

    // 3. Default to English
    return 'en';
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'en'; // Fallback to English on error
  }
}

/**
 * Update user's language preference
 * @param {string} email - User's email address
 * @param {string} language - Language code to set
 * @returns {Promise<boolean>} Success status
 */
async function updateUserLanguage(email, language) {
  try {
    if (!isLanguageSupported(language)) {
      console.warn(`Unsupported language: ${language}, using 'en'`);
      language = 'en';
    }

    await query(
      'UPDATE attendee_profiles SET preferred_language = $1, updated_at = NOW() WHERE user_email = $2',
      [language, email]
    );

    return true;
  } catch (error) {
    console.error('Error updating user language:', error);
    return false;
  }
}

/**
 * Parse language from locale string
 * @param {string} locale - Locale string (e.g., 'en-US', 'fr_FR')
 * @returns {string} Language code (en, fr, es)
 */
function parseLanguageFromLocale(locale) {
  if (!locale) return 'en';

  const langCode = locale.split(/[-_]/)[0].toLowerCase();
  return isLanguageSupported(langCode) ? langCode : 'en';
}

module.exports = {
  detectUserLanguage,
  updateUserLanguage,
  parseLanguageFromLocale
};
