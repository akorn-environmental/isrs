#!/usr/bin/env node

/**
 * Translation Analysis Script for ISRS
 * Analyzes translation mismatches in components.js
 */

const fs = require('fs');
const path = require('path');

const filePath = '/Users/akorn/Desktop/ITERM PROJECTS/ISRS/frontend/public/js/components.js';

// Read the file
const content = fs.readFileSync(filePath, 'utf8');

// Extract translation object
const translationsMatch = content.match(/const translations = \{([\s\S]*?)\n\};/);
if (!translationsMatch) {
  console.error('Could not find translations object');
  process.exit(1);
}

// Function to extract keys from a language block
function extractKeys(langBlock) {
  const keys = new Set();
  // Match all key definitions: key: 'value' or key: "value"
  const keyPattern = /^\s*(\w+):\s*['"]/gm;
  let match;

  while ((match = keyPattern.exec(langBlock)) !== null) {
    keys.add(match[1]);
  }

  return keys;
}

// Function to extract language block
function extractLanguageBlock(content, lang) {
  // Find the start of the language block
  const langStartRegex = new RegExp(`\\b${lang}:\\s*\\{`);
  const startMatch = langStartRegex.exec(content);

  if (!startMatch) {
    console.error(`Could not find ${lang} block`);
    return null;
  }

  let startIndex = startMatch.index + startMatch[0].length;
  let braceCount = 1;
  let endIndex = startIndex;

  // Find matching closing brace
  while (braceCount > 0 && endIndex < content.length) {
    if (content[endIndex] === '{') braceCount++;
    if (content[endIndex] === '}') braceCount--;
    endIndex++;
  }

  return content.substring(startIndex, endIndex - 1);
}

// Function to get key with its value
function extractKeyValues(langBlock) {
  const keyValues = {};
  const lines = langBlock.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match key: 'value' or key: "value" pattern
    const match = line.match(/^(\w+):\s*(['"])((?:(?!\2)[^\\]|\\.)*)(\2)/);
    if (match) {
      const key = match[1];
      const value = match[3];
      keyValues[key] = value;
    }
  }

  return keyValues;
}

console.log('='.repeat(80));
console.log('TRANSLATION ANALYSIS FOR ISRS');
console.log('='.repeat(80));
console.log();

// Extract language blocks
const enBlock = extractLanguageBlock(translationsMatch[1], 'en');
const esBlock = extractLanguageBlock(translationsMatch[1], 'es');
const frBlock = extractLanguageBlock(translationsMatch[1], 'fr');

// Extract keys
const enKeys = extractKeys(enBlock);
const esKeys = extractKeys(esBlock);
const frKeys = extractKeys(frBlock);

console.log('KEY COUNTS:');
console.log('-'.repeat(80));
console.log(`English (en): ${enKeys.size} keys`);
console.log(`Spanish (es): ${esKeys.size} keys`);
console.log(`French (fr):  ${frKeys.size} keys`);
console.log();

// Find missing and extra keys
const missingInEs = [...enKeys].filter(k => !esKeys.has(k)).sort();
const missingInFr = [...enKeys].filter(k => !frKeys.has(k)).sort();
const extraInEs = [...esKeys].filter(k => !enKeys.has(k)).sort();
const extraInFr = [...frKeys].filter(k => !enKeys.has(k)).sort();

console.log('MISSING KEYS:');
console.log('-'.repeat(80));
console.log(`Missing in Spanish: ${missingInEs.length} keys`);
console.log(`Missing in French:  ${missingInFr.length} keys`);
console.log();

console.log('EXTRA KEYS (not in English):');
console.log('-'.repeat(80));
console.log(`Extra in Spanish: ${extraInEs.length} keys`);
console.log(`Extra in French:  ${extraInFr.length} keys`);
console.log();

// Get key-value pairs for detailed report
const enKeyValues = extractKeyValues(enBlock);

// Generate detailed report
console.log('='.repeat(80));
console.log('DETAILED REPORT: MISSING KEYS IN SPANISH');
console.log('='.repeat(80));
console.log();
console.log(`Total: ${missingInEs.length} keys\n`);

if (missingInEs.length > 0) {
  missingInEs.forEach((key, index) => {
    console.log(`${index + 1}. Key: "${key}"`);
    console.log(`   English value: "${enKeyValues[key] || 'NOT FOUND'}"`);
    console.log();
  });
}

console.log('='.repeat(80));
console.log('DETAILED REPORT: MISSING KEYS IN FRENCH');
console.log('='.repeat(80));
console.log();
console.log(`Total: ${missingInFr.length} keys\n`);

if (missingInFr.length > 0) {
  missingInFr.forEach((key, index) => {
    console.log(`${index + 1}. Key: "${key}"`);
    console.log(`   English value: "${enKeyValues[key] || 'NOT FOUND'}"`);
    console.log();
  });
}

console.log('='.repeat(80));
console.log('DETAILED REPORT: EXTRA KEYS IN SPANISH (not in English)');
console.log('='.repeat(80));
console.log();
console.log(`Total: ${extraInEs.length} keys\n`);

if (extraInEs.length > 0) {
  const esKeyValues = extractKeyValues(esBlock);
  extraInEs.forEach((key, index) => {
    console.log(`${index + 1}. Key: "${key}"`);
    console.log(`   Spanish value: "${esKeyValues[key] || 'NOT FOUND'}"`);
    console.log();
  });
}

console.log('='.repeat(80));
console.log('DETAILED REPORT: EXTRA KEYS IN FRENCH (not in English)');
console.log('='.repeat(80));
console.log();
console.log(`Total: ${extraInFr.length} keys\n`);

if (extraInFr.length > 0) {
  const frKeyValues = extractKeyValues(frBlock);
  extraInFr.forEach((key, index) => {
    console.log(`${index + 1}. Key: "${key}"`);
    console.log(`   French value: "${frKeyValues[key] || 'NOT FOUND'}"`);
    console.log();
  });
}

console.log('='.repeat(80));
console.log('SUMMARY OF ACTIONS NEEDED');
console.log('='.repeat(80));
console.log();
console.log('TO SYNCHRONIZE ALL THREE LANGUAGES:');
console.log();
console.log(`1. ADD ${missingInEs.length} keys to Spanish (es) block`);
console.log(`2. ADD ${missingInFr.length} keys to French (fr) block`);
console.log(`3. REMOVE ${extraInEs.length} keys from Spanish (es) block`);
console.log(`4. REMOVE ${extraInFr.length} keys from French (fr) block`);
console.log();
console.log(`After synchronization, all languages will have ${enKeys.size} keys.`);
console.log();

// Save report to file
const reportPath = '/Users/akorn/Desktop/ITERM PROJECTS/ISRS/translation_analysis_report.txt';
const reportContent = `
TRANSLATION ANALYSIS REPORT FOR ISRS
Generated: ${new Date().toISOString()}
${'='.repeat(80)}

KEY COUNTS:
- English (en): ${enKeys.size} keys
- Spanish (es): ${esKeys.size} keys
- French (fr):  ${frKeys.size} keys

MISMATCHES:
- Missing in Spanish: ${missingInEs.length} keys
- Missing in French:  ${missingInFr.length} keys
- Extra in Spanish:   ${extraInEs.length} keys
- Extra in French:    ${extraInFr.length} keys

${'='.repeat(80)}
MISSING IN SPANISH (${missingInEs.length} keys):
${'='.repeat(80)}

${missingInEs.map((key, i) => `${i + 1}. ${key}\n   EN: "${enKeyValues[key] || 'NOT FOUND'}"`).join('\n\n')}

${'='.repeat(80)}
MISSING IN FRENCH (${missingInFr.length} keys):
${'='.repeat(80)}

${missingInFr.map((key, i) => `${i + 1}. ${key}\n   EN: "${enKeyValues[key] || 'NOT FOUND'}"`).join('\n\n')}

${'='.repeat(80)}
EXTRA IN SPANISH (${extraInEs.length} keys):
${'='.repeat(80)}

${extraInEs.join(', ')}

${'='.repeat(80)}
EXTRA IN FRENCH (${extraInFr.length} keys):
${'='.repeat(80)}

${extraInFr.join(', ')}

${'='.repeat(80)}
ACTION PLAN:
${'='.repeat(80)}

1. ADD ${missingInEs.length} keys to Spanish (es) block
2. ADD ${missingInFr.length} keys to French (fr) block
3. REMOVE ${extraInEs.length} keys from Spanish (es) block
4. REMOVE ${extraInFr.length} keys from French (fr) block

Target: All languages will have ${enKeys.size} keys
`;

fs.writeFileSync(reportPath, reportContent);
console.log(`Full report saved to: ${reportPath}`);
console.log();
