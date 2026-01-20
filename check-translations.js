#!/usr/bin/env node

/**
 * ISRS Translation Completeness Checker
 * Verifies all translation keys are present across EN/ES/FR
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_JS = path.join(__dirname, 'frontend/public/js/components.js');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function extractKeysFromLanguageBlock(content, lang) {
  const keys = new Set();

  // Find the language block (e.g., "en: {" ... "}")
  const langRegex = new RegExp(`${lang}:\\s*\\{`, 'g');
  const match = langRegex.exec(content);

  if (!match) {
    return keys;
  }

  // Find all key-value pairs in this language block
  // Match pattern: key: 'value' or key: "value"
  const keyRegex = /\b(\w+):\s*['"`]/g;
  let keyMatch;

  // Extract text from the language block
  // Find the matching closing brace
  const startIdx = match.index + match[0].length;
  let braceCount = 1;
  let endIdx = startIdx;

  for (let i = startIdx; i < content.length && braceCount > 0; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') braceCount--;
    endIdx = i;
  }

  const langBlock = content.substring(startIdx, endIdx);

  // Extract all keys from this block
  while ((keyMatch = keyRegex.exec(langBlock)) !== null) {
    const key = keyMatch[1];
    // Filter out common JavaScript keywords
    if (!['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while'].includes(key)) {
      keys.add(key);
    }
  }

  return keys;
}

function checkTranslations() {
  console.log(`${colors.blue}Checking translation completeness...${colors.reset}\n`);

  if (!fs.existsSync(COMPONENTS_JS)) {
    console.log(`${colors.red}✗ components.js not found at: ${COMPONENTS_JS}${colors.reset}`);
    process.exit(1);
  }

  try {
    // Read the file
    const content = fs.readFileSync(COMPONENTS_JS, 'utf8');

    // Extract keys for each language
    const enKeys = extractKeysFromLanguageBlock(content, 'en');
    const esKeys = extractKeysFromLanguageBlock(content, 'es');
    const frKeys = extractKeysFromLanguageBlock(content, 'fr');

    console.log('Translation keys found:');
    console.log(`  English (en): ${enKeys.size} keys`);
    console.log(`  Spanish (es): ${esKeys.size} keys`);
    console.log(`  French (fr):  ${frKeys.size} keys`);
    console.log('');

    // Check if counts match
    if (enKeys.size === esKeys.size && enKeys.size === frKeys.size) {
      console.log(`${colors.green}✓ All languages have matching key counts${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ Translation key count mismatch:${colors.reset}`);
      if (enKeys.size !== esKeys.size) {
        console.log(`  EN-ES difference: ${Math.abs(enKeys.size - esKeys.size)} keys`);
      }
      if (enKeys.size !== frKeys.size) {
        console.log(`  EN-FR difference: ${Math.abs(enKeys.size - frKeys.size)} keys`);
      }
    }
    console.log('');

    // Check for missing keys
    let hasIssues = false;

    // Keys in EN but missing in ES
    const missingInES = [...enKeys].filter(key => !esKeys.has(key));
    if (missingInES.length > 0) {
      console.log(`${colors.yellow}⚠ Missing in Spanish (${missingInES.length}):${colors.reset}`);
      missingInES.slice(0, 5).forEach(key => console.log(`    - ${key}`));
      if (missingInES.length > 5) {
        console.log(`    ... and ${missingInES.length - 5} more`);
      }
      console.log('');
      hasIssues = true;
    }

    // Keys in EN but missing in FR
    const missingInFR = [...enKeys].filter(key => !frKeys.has(key));
    if (missingInFR.length > 0) {
      console.log(`${colors.yellow}⚠ Missing in French (${missingInFR.length}):${colors.reset}`);
      missingInFR.slice(0, 5).forEach(key => console.log(`    - ${key}`));
      if (missingInFR.length > 5) {
        console.log(`    ... and ${missingInFR.length - 5} more`);
      }
      console.log('');
      hasIssues = true;
    }

    // Keys in ES but missing in EN
    const extraInES = [...esKeys].filter(key => !enKeys.has(key));
    if (extraInES.length > 0) {
      console.log(`${colors.yellow}⚠ In Spanish but not English (${extraInES.length}):${colors.reset}`);
      extraInES.slice(0, 5).forEach(key => console.log(`    - ${key}`));
      if (extraInES.length > 5) {
        console.log(`    ... and ${extraInES.length - 5} more`);
      }
      console.log('');
      hasIssues = true;
    }

    // Keys in FR but missing in EN
    const extraInFR = [...frKeys].filter(key => !enKeys.has(key));
    if (extraInFR.length > 0) {
      console.log(`${colors.yellow}⚠ In French but not English (${extraInFR.length}):${colors.reset}`);
      extraInFR.slice(0, 5).forEach(key => console.log(`    - ${key}`));
      if (extraInFR.length > 5) {
        console.log(`    ... and ${extraInFR.length - 5} more`);
      }
      console.log('');
      hasIssues = true;
    }

    // Check critical member portal keys
    const criticalKeys = [
      'memberLogin',
      'signupHeading',
      'verifyingLogin',
      'myProfile',
      'welcomeToISRS',
      'memberDirectory'
    ];

    console.log('Checking critical member portal keys:');
    let missingCritical = 0;

    criticalKeys.forEach(key => {
      const inEN = enKeys.has(key);
      const inES = esKeys.has(key);
      const inFR = frKeys.has(key);

      if (inEN && inES && inFR) {
        console.log(`  ${colors.green}✓${colors.reset} ${key} (all languages)`);
      } else {
        const missing = [];
        if (!inEN) missing.push('EN');
        if (!inES) missing.push('ES');
        if (!inFR) missing.push('FR');

        console.log(`  ${colors.red}✗${colors.reset} ${key} - Missing in: ${missing.join(', ')}`);
        missingCritical++;
        hasIssues = true;
      }
    });
    console.log('');

    // Summary
    if (!hasIssues) {
      console.log(`${colors.green}✓ All translations are complete and synchronized!${colors.reset}`);
      console.log(`${colors.green}✓ All ${enKeys.size} keys present in EN, ES, and FR${colors.reset}`);
      console.log(`${colors.green}✓ All 6 critical member portal pages verified${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.yellow}⚠ Translation issues found - please review above${colors.reset}`);
      if (missingCritical > 0) {
        console.log(`${colors.red}✗ ${missingCritical}/6 critical member portal keys have issues${colors.reset}`);
      }
      return false;
    }

  } catch (error) {
    console.log(`${colors.red}✗ Error checking translations: ${error.message}${colors.reset}`);
    if (process.env.DEBUG) {
      console.error(error);
    }
    return false;
  }
}

// Run the check
const success = checkTranslations();
process.exit(success ? 0 : 1);
