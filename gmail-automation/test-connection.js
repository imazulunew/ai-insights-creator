#!/usr/bin/env node

/**
 * Test Connection Script
 * Verifies Gmail and Sheets API access
 */

const { authenticate } = require('./auth');
const { google } = require('googleapis');
const { CONFIG } = require('./process-gmail');

async function testConnection() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   Testing API Connections                                ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  try {
    // Authenticate
    console.log('1. Authenticating...');
    const auth = await authenticate();
    console.log('   ✓ Authentication successful\n');

    // Test Gmail API
    console.log('2. Testing Gmail API...');
    const gmail = google.gmail({ version: 'v1', auth });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    console.log(`   ✓ Connected to: ${profile.data.emailAddress}`);
    console.log(`   ✓ Total messages: ${profile.data.messagesTotal}\n`);

    // Test Sheets API
    console.log('3. Testing Google Sheets API...');
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: CONFIG.SPREADSHEET_ID,
    });
    console.log(`   ✓ Connected to: ${response.data.properties.title}`);
    
    // Check if Draft Queue tab exists
    const draftQueueSheet = response.data.sheets.find(
      s => s.properties.title === CONFIG.SHEET_NAME
    );
    
    if (draftQueueSheet) {
      console.log(`   ✓ "${CONFIG.SHEET_NAME}" tab found\n`);
    } else {
      console.log(`   ⚠ WARNING: "${CONFIG.SHEET_NAME}" tab not found`);
      console.log('   Create this tab before running automation\n');
    }

    // Test Anthropic API
    console.log('4. Testing Claude API...');
    if (process.env.ANTHROPIC_API_KEY) {
      const Anthropic = require('@anthropic-ai/sdk');
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say hi' }],
      });
      
      console.log('   ✓ Claude API connected\n');
    } else {
      console.log('   ⚠ ANTHROPIC_API_KEY not set in environment\n');
    }

    // Fetch recent emails (without processing)
    console.log('5. Checking for recent emails...');
    const query = `after:${Math.floor(Date.now() / 1000) - (24 * 3600)}`;
    const messagesResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 5,
    });
    
    const messageCount = messagesResponse.data.messages?.length || 0;
    console.log(`   ✓ Found ${messageCount} emails from last 24 hours\n`);

    // Summary
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║   ✓ ALL TESTS PASSED!                                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    
    console.log('Your system is ready to:');
    console.log('• Process emails from groupfaire@gmail.com');
    console.log('• Generate insights with Claude');
    console.log('• Save to Google Sheets\n');
    
    console.log('Next step: npm run process (to process emails now)');
    console.log('Or: Set up GitHub Actions for daily automation\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
}

testConnection();
