#!/usr/bin/env node

/**
 * OAuth Setup Script
 * Run this once to authenticate and generate token
 */

const { authenticate } = require('./auth');

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║   AI Insights Gmail Automation - OAuth Setup            ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

console.log('This script will:');
console.log('1. Open your browser for Google authentication');
console.log('2. Ask you to sign in with: groupfaire@gmail.com');
console.log('3. Request permissions for Gmail and Sheets access');
console.log('4. Save an authentication token locally\n');

console.log('Prerequisites:');
console.log('✓ Gmail API enabled in Google Cloud Console');
console.log('✓ OAuth Client credentials downloaded as credentials.json');
console.log('✓ groupfaire@gmail.com added as test user\n');

async function setup() {
  try {
    console.log('Starting authentication flow...\n');
    
    const auth = await authenticate();
    
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║   ✓ SETUP COMPLETE!                                      ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    
    console.log('Next steps:');
    console.log('1. Test the connection: npm run test');
    console.log('2. Process emails manually: npm run process');
    console.log('3. Set up GitHub Actions for daily automation\n');
    
    console.log('Your token has been saved to token.json');
    console.log('Keep this file secure - do NOT commit it to GitHub!\n');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure credentials.json exists in this directory');
    console.error('2. Check that Gmail API is enabled in Google Cloud Console');
    console.error('3. Verify groupfaire@gmail.com is added as a test user');
    console.error('4. Ensure redirect URI http://localhost:3000 is in OAuth settings\n');
    process.exit(1);
  }
}

setup();
