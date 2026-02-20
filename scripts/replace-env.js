#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '../src/environments/environment.prod.ts');

// Read environment variables (Vercel pe set karein: NG_APP_API_URL)
// Priority: NG_APP_API_URL > API_URL > default
const apiUrl = process.env.NG_APP_API_URL || process.env.API_URL || 'https://travel-window-backend.vercel.app/api';
const recaptchaSiteKey = process.env.NG_APP_RECAPTCHA_SITE_KEY || process.env.RECAPTCHA_SITE_KEY || '';

// Read the file
let content = fs.readFileSync(envFile, 'utf8');

// Replace apiUrl (handle both single and double quotes, and template literals)
content = content.replace(
  /apiUrl:\s*['"`].*?['"`]/,
  `apiUrl: '${apiUrl}'`
);

// Replace recaptchaSiteKey
content = content.replace(
  /recaptchaSiteKey:\s*['"`].*?['"`]/,
  `recaptchaSiteKey: '${recaptchaSiteKey}'`
);

// Write back
fs.writeFileSync(envFile, content, 'utf8');

console.log('✅ Environment variables replaced:');
console.log(`   API URL: ${apiUrl}`);
console.log(`   reCAPTCHA Site Key: ${recaptchaSiteKey || '(empty)'}`);
