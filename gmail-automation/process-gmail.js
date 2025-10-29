// AI Insights Gmail Automation
// Processes emails from groupfaire@gmail.com and generates insights

const { google } = require('googleapis');
const Anthropic = require('@anthropic-ai/sdk');

// Configuration
const CONFIG = {
  GMAIL_USER: 'groupfaire@gmail.com',
  SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  SHEET_NAME: 'Draft Queue',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  LOOKBACK_HOURS: 24,
  MAX_EMAILS_TO_PROCESS: 20,
};

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: CONFIG.ANTHROPIC_API_KEY,
});

// Gmail API setup
async function getGmailClient(auth) {
  return google.gmail({ version: 'v1', auth });
}

// Google Sheets API setup
async function getSheetsClient(auth) {
  return google.sheets({ version: 'v4', auth });
}

// Fetch emails from last 24 hours
async function fetchRecentEmails(gmail) {
  const query = `after:${Math.floor(Date.now() / 1000) - (CONFIG.LOOKBACK_HOURS * 3600)} -label:processed`;
  
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: CONFIG.MAX_EMAILS_TO_PROCESS,
    });

    const messages = response.data.messages || [];
    console.log(`Found ${messages.length} unprocessed emails from last ${CONFIG.LOOKBACK_HOURS} hours`);
    
    return messages;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

// Get full email content
async function getEmailContent(gmail, messageId) {
  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const message = response.data;
    const headers = message.payload.headers;
    
    // Extract headers
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    
    // Extract body
    let body = '';
    if (message.payload.body.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload.parts) {
      const textPart = message.payload.parts.find(part => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    }

    // Extract URLs from body
    const urlRegex = /https?:\/\/[^\s<>"]+/g;
    const urls = body.match(urlRegex) || [];
    
    return {
      id: messageId,
      subject,
      from,
      date,
      body: stripHtml(body),
      urls: urls.filter(url => !url.includes('unsubscribe') && !url.includes('tracking')),
    };
  } catch (error) {
    console.error(`Error getting email ${messageId}:`, error);
    return null;
  }
}

// Strip HTML tags and clean text
function stripHtml(html) {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract main article URL from email
function extractMainArticleUrl(email) {
  // Look for common newsletter patterns
  const { urls, body } = email;
  
  if (urls.length === 0) return null;
  
  // Prefer URLs that appear near "Read more", "Continue reading", etc.
  const readMoreRegex = /read more|continue reading|full article|view article/i;
  const bodyLower = body.toLowerCase();
  
  for (const url of urls) {
    const urlIndex = bodyLower.indexOf(url.toLowerCase());
    if (urlIndex > 0) {
      const surroundingText = bodyLower.substring(
        Math.max(0, urlIndex - 100),
        Math.min(bodyLower.length, urlIndex + 100)
      );
      if (readMoreRegex.test(surroundingText)) {
        return url;
      }
    }
  }
  
  // Otherwise, return first substantial URL (not homepage)
  const substantialUrl = urls.find(url => {
    const path = new URL(url).pathname;
    return path.length > 1 && !url.includes('homepage');
  });
  
  return substantialUrl || urls[0];
}

// Fetch article content from URL
async function fetchArticleContent(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Basic content extraction (can be enhanced with libraries like readability)
    const body = stripHtml(html);
    
    // Extract first 3000 characters as article preview
    return body.substring(0, 3000);
  } catch (error) {
    console.error(`Error fetching URL ${url}:`, error);
    return null;
  }
}

// Score email relevance using Claude
async function scoreRelevance(email) {
  const prompt = `Score the relevance of this email for AI industry insights curation (0-10):

Subject: ${email.subject}
From: ${email.from}
Preview: ${email.body.substring(0, 500)}

Return ONLY a number 0-10, where:
- 0-3: Not relevant (spam, promotions, non-AI content)
- 4-6: Somewhat relevant (tangentially related to AI)
- 7-8: Relevant (AI news, updates, analysis)
- 9-10: Highly relevant (important AI developments, strategic insights)`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: prompt }],
    });

    const score = parseInt(message.content[0].text.trim());
    return isNaN(score) ? 0 : score;
  } catch (error) {
    console.error('Error scoring relevance:', error);
    return 5; // Default to middle score if error
  }
}

// Generate insight using Claude
async function generateInsight(email, articleContent) {
  const content = articleContent || email.body;
  const sourceUrl = extractMainArticleUrl(email);
  
  const prompt = `Analyze this AI-related content and generate a structured insight:

SOURCE: ${email.from}
SUBJECT: ${email.subject}
DATE: ${email.date}
${sourceUrl ? `URL: ${sourceUrl}` : ''}

CONTENT:
${content.substring(0, 2000)}

Generate a structured insight with the following format (respond ONLY with valid JSON):

{
  "title": "Concise, descriptive headline (60 chars max)",
  "summary": "Objective 100-200 word summary of what happened",
  "analysis": "Expert 100-300 word analysis covering: why this matters, business implications, what customers should do, connection to broader trends",
  "category": "One of: Horizon Scanning, Brand Use Cases, Technology Digest",
  "section": "Appropriate section within the category",
  "subsection": "Appropriate subsection",
  "relevanceTags": ["Array of applicable tags: Travel, Loyalty, Adjacent, Broader"],
  "impactPotential": "One of: Low, Medium, High, Transformational",
  "timeHorizon": "One of: Immediate (0-3 months), Near-term (3-12 months), Mid-term (12-24 months), Long-term (24+ months)",
  "recommendedAction": "One of: Monitor, Investigate, Pilot, Implement",
  "relatedEntities": "Comma-separated list of companies, products, technologies mentioned",
  "signalStrength": "One of: Weak, Medium, Strong",
  "sourceCredibility": "One of: High, Medium, Low",
  "confidenceLevel": "One of: High, Medium, Low"
}

IMPORTANT: 
- Use the full taxonomy structure for category/section/subsection
- Analysis should be strategic and actionable, not just a summary
- Consider travel and loyalty industry implications
- Your entire response must be valid JSON only.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    let responseText = message.content[0].text.trim();
    // Strip markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const insight = JSON.parse(responseText);
    
    // Add metadata
    insight.sourceName = email.from.split('<')[0].trim();
    insight.sourceUrl = sourceUrl || '';
    insight.date = new Date(email.date).toISOString().split('T')[0];
    insight.status = 'Draft';
    insight.creatorNotes = 'Auto-generated from email - needs review';
    insight.emailId = email.id;
    
    return insight;
  } catch (error) {
    console.error('Error generating insight:', error);
    return null;
  }
}

// Append insight to Google Sheets
async function appendToSheet(sheets, insight) {
  const values = [[
    insight.date,
    insight.sourceName,
    insight.sourceUrl,
    insight.category,
    insight.section,
    insight.subsection,
    insight.title,
    insight.summary,
    insight.analysis,
    insight.relevanceTags.join(', '),
    insight.signalStrength,
    insight.timeHorizon,
    insight.impactPotential,
    insight.recommendedAction,
    insight.relatedEntities,
    insight.sourceCredibility,
    insight.confidenceLevel,
    insight.creatorNotes,
    insight.status,
  ]];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: CONFIG.SPREADSHEET_ID,
      range: `${CONFIG.SHEET_NAME}!A:S`,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });
    console.log(`✓ Added insight: ${insight.title}`);
    return true;
  } catch (error) {
    console.error('Error appending to sheet:', error);
    return false;
  }
}

// Mark email as processed
async function markAsProcessed(gmail, messageId) {
  try {
    // Get or create "processed" label
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
    let processedLabel = labelsResponse.data.labels.find(l => l.name === 'processed');
    
    if (!processedLabel) {
      const createResponse = await gmail.users.labels.create({
        userId: 'me',
        resource: {
          name: 'processed',
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });
      processedLabel = createResponse.data;
    }

    // Add label to message
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      resource: {
        addLabelIds: [processedLabel.id],
      },
    });
  } catch (error) {
    console.error(`Error marking email ${messageId} as processed:`, error);
  }
}

// Main processing function
async function processEmails(auth) {
  const gmail = await getGmailClient(auth);
  const sheets = await getSheetsClient(auth);
  
  console.log('Starting email processing...');
  
  // Fetch recent emails
  const messages = await fetchRecentEmails(gmail);
  
  if (messages.length === 0) {
    console.log('No new emails to process');
    return { processed: 0, insights: 0 };
  }

  let processedCount = 0;
  let insightsCount = 0;

  // Process each email
  for (const message of messages) {
    console.log(`\nProcessing email ${message.id}...`);
    
    // Get email content
    const email = await getEmailContent(gmail, message.id);
    if (!email) continue;

    console.log(`Subject: ${email.subject}`);
    
    // Score relevance
    const relevanceScore = await scoreRelevance(email);
    console.log(`Relevance score: ${relevanceScore}/10`);
    
    if (relevanceScore < 7) {
      console.log('Skipping - low relevance');
      await markAsProcessed(gmail, message.id);
      processedCount++;
      continue;
    }

    // Try to fetch article content if URL found
    const articleUrl = extractMainArticleUrl(email);
    let articleContent = null;
    
    if (articleUrl) {
      console.log(`Fetching article: ${articleUrl}`);
      articleContent = await fetchArticleContent(articleUrl);
    }

    // Generate insight
    console.log('Generating insight with Claude...');
    const insight = await generateInsight(email, articleContent);
    
    if (insight) {
      // Append to sheet
      const success = await appendToSheet(sheets, insight);
      if (success) {
        insightsCount++;
      }
    }

    // Mark as processed
    await markAsProcessed(gmail, message.id);
    processedCount++;
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✓ Processing complete!`);
  console.log(`Emails processed: ${processedCount}`);
  console.log(`Insights generated: ${insightsCount}`);
  
  return { processed: processedCount, insights: insightsCount };
}

// Export for use in other scripts
module.exports = {
  processEmails,
  CONFIG,
};

// Run if called directly
if (require.main === module) {
  const { authenticate } = require('./auth');
  
  authenticate()
    .then(auth => processEmails(auth))
    .then(results => {
      console.log('\nFinal results:', results);
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
