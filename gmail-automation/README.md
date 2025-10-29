# AI Insights Gmail Automation

Automated daily curation of AI insights from your Gmail inbox.

## 🎯 Overview

This system automatically:
- Monitors `groupfaire@gmail.com` inbox
- Processes AI-related emails daily at 6am GMT
- Extracts and analyzes content using Claude API
- Generates structured insights
- Populates Google Sheets "Draft Queue"
- Saves you 3 hours/day of manual curation

## 📊 Results

**Without automation:** 3.5 hours/day
**With automation:** 10 minutes/day review

**Time saved:** 14+ hours/week! ⚡

## 🚀 Quick Start

See **[SETUP-GUIDE.md](./SETUP-GUIDE.md)** for complete setup instructions.

### Prerequisites

- Node.js 18+
- Google Cloud project with Gmail & Sheets APIs enabled
- Anthropic API key
- OAuth credentials

### Installation

```bash
npm install
npm run auth      # One-time OAuth setup
npm run test      # Verify connections
npm run process   # Process emails manually
```

## 📁 File Structure

```
gmail-automation/
├── package.json           # Dependencies
├── process-gmail.js       # Main processing script
├── auth.js               # OAuth authentication
├── auth-setup.js         # Initial setup script
├── test-connection.js    # Connection testing
├── SETUP-GUIDE.md        # Complete setup guide
└── .gitignore            # Ignore sensitive files
```

## 🔄 How It Works

```
Gmail Inbox (groupfaire@gmail.com)
    ↓
Filter last 24 hours
    ↓
Score relevance (Claude API)
    ↓
Extract content
    ↓
Generate insight (Claude API)
  - Title, summary, analysis
  - Taxonomy classification
  - Impact assessment
    ↓
Append to Google Sheets "Draft Queue"
    ↓
Mark email as "processed"
```

## ⚙️ Configuration

Edit `process-gmail.js`:

```javascript
const CONFIG = {
  GMAIL_USER: 'groupfaire@gmail.com',
  SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  SHEET_NAME: 'Draft Queue',
  LOOKBACK_HOURS: 24,           // Change lookback period
  MAX_EMAILS_TO_PROCESS: 20,    // Change max emails
};
```

## 🤖 GitHub Actions

Runs daily at 6am GMT via `.github/workflows/daily-curation.yml`

Can also trigger manually:
1. Go to Actions tab in GitHub
2. Select "Daily Gmail Insights Curation"
3. Click "Run workflow"

## 📊 Expected Output

Each processed email generates:
- **Title:** Concise headline
- **Summary:** 100-200 word objective summary
- **Analysis:** 100-300 word expert analysis
- **Taxonomy:** Category → Section → Subsection
- **Metadata:** Impact, time horizon, recommended action
- **Entities:** Companies, products, technologies

## 💰 Costs

- **Gmail API:** FREE
- **Sheets API:** FREE
- **GitHub Actions:** FREE
- **Claude API:** ~$0.02/insight = ~$9/month

## 🐛 Troubleshooting

See [SETUP-GUIDE.md - Troubleshooting section](./SETUP-GUIDE.md#-troubleshooting)

Common issues:
- OAuth credentials not found
- Gmail API not enabled
- Token expired
- Draft Queue tab missing

## 🔐 Security

**Never commit:**
- `credentials.json` (OAuth credentials)
- `token.json` (Access token)
- `.env` (Environment variables)

These are in `.gitignore`

**Use GitHub Secrets for:**
- `GOOGLE_OAUTH_CREDENTIALS`
- `ANTHROPIC_API_KEY`
- `GOOGLE_SHEETS_SPREADSHEET_ID`

## 📈 Next Steps

1. Subscribe `groupfaire@gmail.com` to your AI news sources
2. Let automation run for 3-5 days
3. Review generated insights
4. Tune Claude prompts if needed
5. Build Review Queue UI (next phase)

## 📞 Support

Questions? Check:
1. [SETUP-GUIDE.md](./SETUP-GUIDE.md)
2. GitHub Action logs
3. Run `npm run test` locally

## 🎉 Success Criteria

You'll know it's working when:
- ✓ GitHub Action runs daily without errors
- ✓ Insights appear in Draft Queue
- ✓ Emails marked as "processed"
- ✓ Quality matches your standards

**Ready for Phase 2: Customer Interface!** 🚀
