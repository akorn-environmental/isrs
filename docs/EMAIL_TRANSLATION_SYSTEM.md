# Email Translation System for ISRS

Complete multilingual email support for English, French, and Spanish.

## Overview

The ISRS email translation system provides:
- **90+ translation keys** for all email templates
- **3 languages**: English (en), French (fr), Spanish (es)
- **Automatic language detection** from user profiles and browser preferences
- **Easy-to-use API** for developers

## Files

### Core Translation File
- **`backend/src/services/emailTranslations.js`**
  - Contains all translations for 4 email templates
  - Exports `t()` function for translations
  - Supports variable replacement (e.g., `{conferenceName}`)

### Language Detection
- **`backend/src/utils/languageDetection.js`**
  - `detectUserLanguage(email, req)` - Auto-detect from profile/browser
  - `updateUserLanguage(email, language)` - Update user's preference
  - `parseLanguageFromLocale(locale)` - Parse language from locale string

### Email Templates (Updated for i18n)
- **`backend/src/services/emailService.js`**
  - `sendMagicLink()` - ✅ MULTILINGUAL
- **`backend/src/services/templates/registrationConfirmation.js`**
  - `registrationConfirmationTemplate()` - 🔄 PARTIAL (structure ready)
- **`backend/src/services/templates/paymentReceipt.js`**
  - `paymentReceiptTemplate()` - 🔄 TODO
- **`backend/src/services/templates/conferenceReminder.js`**
  - `conferenceReminderTemplate()` - 🔄 TODO

## Usage

### 1. Sending Magic Link Email (Complete Example)

```javascript
const { sendMagicLink } = require('./services/emailService');
const { detectUserLanguage } = require('./utils/languageDetection');

// Auto-detect language
const language = await detectUserLanguage(userEmail, req);

// Send email in user's language
await sendMagicLink(userEmail, firstName, magicLink, language);
```

### 2. Using Translations Directly

```javascript
const { t } = require('./services/emailTranslations');

// Basic translation
const subject = t('magicLinkSubject', 'fr');
// Returns: "Votre Lien de Connexion Sécurisé - Portail Membre ISRS"

// Translation with variables
const intro = t('regConfirmIntro', 'es', { conferenceName: 'ICSR 2026' });
// Returns: "¡Gracias por registrarse en <strong>ICSR 2026</strong>! Estamos emocionados..."
```

### 3. Language Detection Priority

The system detects language in this order:
1. **User Profile** - `attendee_profiles.preferred_language` column
2. **Browser Header** - `Accept-Language` from HTTP request
3. **Default** - Falls back to English ('en')

Example:
```javascript
const language = await detectUserLanguage('user@example.com', req);
// Checks database first, then Accept-Language header, defaults to 'en'
```

### 4. Updating User Language Preference

Users can set their language preference via the member portal:

```javascript
const { updateUserLanguage } = require('./utils/languageDetection');

// Update user's language (e.g., from profile settings)
await updateUserLanguage('user@example.com', 'fr');
```

## Translation Keys

### Magic Link Email (10 keys)
- `magicLinkSubject` - Email subject line
- `magicLinkGreeting` - "Hello" / "Bonjour" / "Hola"
- `magicLinkIntro` - Introduction paragraph
- `magicLinkButton` - Button text
- `magicLinkExpiry` - Expiration notice
- `magicLinkIgnore` - "If you didn't request..." message
- `magicLinkSecurityTitle` - Security reminder title
- `magicLinkSecurityText` - Security reminder text
- `magicLinkTroubleTitle` - Troubleshooting header
- `magicLinkTroubleCopy` - Copy/paste instructions

### Registration Confirmation (30+ keys)
- `regConfirmSubject`, `regConfirmHeader`, `regConfirmGreeting`
- `regConfirmIntro`, `regDetailsTitle`, `regDetailsId`, `regDetailsType`
- `regPaymentTitle`, `regPaymentRegFee`, `regPaymentDiscount`, `regPaymentTotal`
- `regSessionsTitle`, `regNextStepsTitle`, `regImportantInfoTitle`
- ...and more (see emailTranslations.js for full list)

### Payment Receipt (20+ keys)
- `receiptSubject`, `receiptHeader`, `receiptGreeting`
- `receiptIntro`, `receiptDetailsTitle`, `receiptDate`, `receiptTransactionId`
- `receiptChargesTitle`, `receiptTaxTitle`, `receiptQuestionsTitle`
- ...and more

### Conference Reminder (25+ keys)
- `reminderSubject`, `reminderHeader`, `reminderGreeting`
- `reminderIntro`, `reminderDetailsTitle`, `reminderSessionsTitle`
- `reminderPrepTitle`, `reminderHotelTitle`, `reminderResourcesTitle`
- ...and more

### Common Elements (10 keys)
- `signatureTeam`, `signatureName`, `signatureEmail`
- `footerNonprofit`, `footerTaxId`, `footerAddress`
- `currency`, `dateFormat`, `timeFormat`

## Adding New Translations

To add a new email template or new strings:

1. **Add to emailTranslations.js**:
```javascript
const emailTranslations = {
  en: {
    newKey: 'English text',
    newKeyWithVar: 'Hello {name}!'
  },
  fr: {
    newKey: 'Texte en français',
    newKeyWithVar: 'Bonjour {name} !'
  },
  es: {
    newKey: 'Texto en español',
    newKeyWithVar: '¡Hola {name}!'
  }
};
```

2. **Use in your template**:
```javascript
const { t } = require('./emailTranslations');

function myEmailTemplate(data) {
  const { language = 'en', userName } = data;

  return {
    subject: t('newKey', language),
    html: `<p>${t('newKeyWithVar', language, { name: userName })}</p>`
  };
}
```

## Testing

### Test Different Languages

```javascript
// Test French magic link
await sendMagicLink('test@example.com', 'Jean', 'https://...', 'fr');

// Test Spanish magic link
await sendMagicLink('test@example.com', 'María', 'https://...', 'es');

// Test English (default)
await sendMagicLink('test@example.com', 'John', 'https://...');
```

### Verify Translations in Database

```sql
-- Check user's language preference
SELECT user_email, preferred_language
FROM attendee_profiles
WHERE user_email = 'test@example.com';

-- Update for testing
UPDATE attendee_profiles
SET preferred_language = 'fr'
WHERE user_email = 'test@example.com';
```

## Database Schema

The `attendee_profiles` table already has language support:

```sql
-- Column exists since migration 003
ALTER TABLE attendee_profiles
ADD COLUMN preferred_language VARCHAR(50) DEFAULT 'en';
```

Supported values: `'en'`, `'fr'`, `'es'`

## TODO: Complete Integration

### Remaining Work

1. **✅ DONE**:
   - Translation file with 90+ keys (all 3 languages)
   - Language detection utility
   - Magic link email fully translated

2. **🔄 IN PROGRESS**:
   - Registration confirmation template (structure updated, needs full integration)

3. **📋 TODO**:
   - Payment receipt template (add language parameter + use t() function)
   - Conference reminder template (add language parameter + use t() function)
   - Update controllers to pass language parameter
   - Frontend language selector in member profile settings
   - Admin UI to view/set user language preferences

### Quick Integration Guide for Remaining Templates

For each template file:

```javascript
// 1. Add at top
const { t } = require('../emailTranslations');

// 2. Add language parameter to function
function templateName(data) {
  const { language = 'en', ...otherData } = data;

  // 3. Replace all hardcoded strings
  return {
    subject: t('keyName', language),
    html: `...${t('anotherKey', language)}...`
  };
}
```

## Benefits

- ✅ **Inclusive**: Serves French & Spanish-speaking members
- ✅ **Professional**: Proper translations (not machine-only)
- ✅ **Flexible**: Easy to add new languages or update existing ones
- ✅ **Automatic**: Detects user preference without manual selection
- ✅ **Maintainable**: All translations in one centralized file
- ✅ **Conference-ready**: High priority for upcoming international events

## Support

For questions or to add new languages, contact the ISRS development team.

---

**Last Updated**: January 2026
**Status**: Core infrastructure complete, integration in progress
