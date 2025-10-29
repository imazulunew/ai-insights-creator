# Gmail Automation - Setup Guide

Complete guide to set up automated daily email curation for AI insights.

---

## 🎯 What This Does

Every day at 6am GMT:
1. **Checks `groupfaire@gmail.com`** inbox
2. **Finds new AI-related emails** from last 24 hours
3. **Scores relevance** (only processes emails scoring 7+/10)
4. **Extracts content** from articles/newsletters
5. **Generates insights** using Claude API:
   - Title, summary, analysis
   - Taxonomy classification
   - Impact assessment
6. **Appends to Google Sheets** "Draft Queue" tab
7. **Marks emails as processed**

You then spend 10 minutes reviewing and approving!

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] Google Cloud project ("AI Insights Creator")
- [ ] Gmail API enabled
- [ ] Google Sheets API enabled
- [ ] OAuth Client ID created
- [ ] `groupfaire@gmail.com` added as test user
- [ ] Anthropic API key
- [ ] GitHub repository (`ai-insights-creator`)
- [ ] Node.js 18+ installed locally (for initial setup)

---

## 🚀 Step-by-Step Setup

### **Step 1: Download OAuth Credentials** (3 minutes)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click the **download icon** (↓) on the right
4. Save as `credentials.json`
5. Keep this file handy

---

### **Step 2: Add GitHub Secret** (2 minutes)

1. Open the `credentials.json` file
2. Copy the entire contents
3. Go to your GitHub repo: Settings → Secrets → Actions
4. Click "New repository secret"
5. Name: `GOOGLE_OAUTH_CREDENTIALS`
6. Value: (paste the JSON)
7. Click "Add secret"

---

### **Step 3: Create "Draft Queue" Tab** (1 minute)

1. Open your Google Sheet:
   - ID: `1ikVeCPQiYA-SWgaHuViai9qv6BeiJAFODPpkeg5jbfI`
2. Click the **+** at bottom to add new tab
3. Name it exactly: **`Draft Queue`**
4. Copy the headers from "Insights Data" tab to row 1:
   ```
   Date | Source Name | Source URL | Category | Section | Subsection | 
   Title/Headline | Summary | Creator Analysis | Relevance Tags | 
   Signal Strength | Time Horizon | Impact Potential | Recommended Action | 
   Related Entities | Source Credibility | Confidence Level | Creator Notes | Status
   ```

---

### **Step 4: Upload Code to GitHub** (5 minutes)

1. Download all files from the `gmail-automation` folder
2. In your GitHub repo, create a folder: `gmail-automation`
3. Upload these files to that folder:
   - `package.json`
   - `process-gmail.js`
   - `auth.js`
   - `auth-setup.js`
   - `test-connection.js`
4. Create folder: `.github/workflows`
5. Upload: `daily-curation.yml` to that folder

Your repo structure should look like:
```
ai-insights-creator/
├── .github/
│   └── workflows/
│       └── daily-curation.yml
├── gmail-automation/
│   ├── package.json
│   ├── process-gmail.js
│   ├── auth.js
│   ├── auth-setup.js
│   └── test-connection.js
├── index.html
└── README.md
```

---

### **Step 5: Initial OAuth Authentication** (5 minutes)

This step creates the OAuth token. You'll do this ONCE locally, then upload the token.

1. **On your computer, navigate to the gmail-automation folder:**
   ```bash
   cd path/to/gmail-automation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Place your `credentials.json` in this folder**

4. **Run the authentication setup:**
   ```bash
   npm run auth
   ```

5. **Browser will open automatically:**
   - Sign in with: `groupfaire@gmail.com`
   - Click "Advanced" (if you see "App isn't verified")
   - Click "Go to AI Insights Creator (unsafe)"
   - Grant all permissions
   - You'll see "Authentication Successful!"

6. **A file `token.json` is created**

---

### **Step 6: Test Locally** (3 minutes)

Before deploying, test that everything works:

1. **Set environment variables:**
   ```bash
   export ANTHROPIC_API_KEY="your-key-here"
   export GOOGLE_SHEETS_SPREADSHEET_ID="1ikVeCPQiYA-SWgaHuViai9qv6BeiJAFODPpkeg5jbfI"
   ```

2. **Run connection test:**
   ```bash
   npm run test
   ```

3. **You should see:**
   ```
   ✓ Authentication successful
   ✓ Connected to: groupfaire@gmail.com
   ✓ Connected to: [Your sheet name]
   ✓ "Draft Queue" tab found
   ✓ Claude API connected
   ✓ Found X emails from last 24 hours
   ✓ ALL TESTS PASSED!
   ```

4. **Process some test emails:**
   ```bash
   npm run process
   ```

5. **Check your Google Sheet's "Draft Queue" tab** - you should see insights!

---

### **Step 7: Upload Token to GitHub** (2 minutes)

The token needs to be in GitHub for automation to work:

1. **Convert token to base64:**
   ```bash
   cat token.json | base64
   ```

2. **Copy the output**

3. **Add to GitHub Secrets:**
   - Go to: Settings → Secrets → Actions
   - Click "New repository secret"
   - Name: `GMAIL_OAUTH_TOKEN`
   - Value: (paste the base64 string)
   - Click "Add secret"

---

### **Step 8: Enable GitHub Actions** (1 minute)

1. In your GitHub repo, go to **Actions** tab
2. If prompted, click "Enable Actions"
3. You should see the workflow: "Daily Gmail Insights Curation"

---

### **Step 9: Test the Automation** (2 minutes)

Don't wait until 6am - test it now!

1. Go to **Actions** tab
2. Click "Daily Gmail Insights Curation"
3. Click "Run workflow" dropdown (top right)
4. Click green "Run workflow" button
5. Wait 1-2 minutes
6. Click on the running workflow to see logs
7. Check your Google Sheet - new insights should appear!

---

## ✅ Verification Checklist

After setup, verify:

- [ ] GitHub Action runs successfully
- [ ] No errors in workflow logs
- [ ] New insights appear in "Draft Queue" tab
- [ ] Emails are marked with "processed" label in Gmail
- [ ] Insights have proper taxonomy classification
- [ ] Analysis quality is good (if not, we'll tune prompts)

---

## 📅 Daily Workflow (10 Minutes)

Once set up, here's your daily routine:

### **Morning (Automated - 6am GMT):**
- ✓ Automation runs automatically
- ✓ Processes 15-20 emails
- ✓ Generates insights
- ✓ Populates Draft Queue

### **Your Review (10 minutes):**
1. Open your insights app
2. Go to "Review Queue" tab (we'll add this)
3. Scan auto-generated insights
4. Approve good ones ✓
5. Edit to add your expertise ✏️
6. Reject irrelevant ones ✗
7. Done!

---

## 🐛 Troubleshooting

### **"No module named googleapis"**
```bash
cd gmail-automation
npm install
```

### **"OAuth credentials not found"**
- Make sure `credentials.json` is in the gmail-automation folder
- Or check that `GOOGLE_OAUTH_CREDENTIALS` secret is set in GitHub

### **"Failed to read sheets"**
- Verify "Draft Queue" tab exists
- Check tab name is exactly "Draft Queue" (case-sensitive)
- Verify headers in row 1

### **"Anthropic API error"**
- Check API key is correct
- Verify you have credits: https://console.anthropic.com/settings/billing
- Check key is set in GitHub Secrets

### **"Gmail API not enabled"**
- Go to: https://console.cloud.google.com/apis/library/gmail.googleapis.com
- Click "Enable"

### **GitHub Action fails**
- Check the workflow logs in Actions tab
- Look for specific error messages
- Verify all secrets are set correctly

---

## 🔧 Configuration Options

### **Change Schedule:**
Edit `.github/workflows/daily-curation.yml`:
```yaml
schedule:
  - cron: '0 8 * * *'  # 8am GMT instead of 6am
```

### **Change Lookback Period:**
Edit `process-gmail.js`:
```javascript
LOOKBACK_HOURS: 48,  // Check last 48 hours instead of 24
```

### **Change Max Emails:**
Edit `process-gmail.js`:
```javascript
MAX_EMAILS_TO_PROCESS: 30,  // Process up to 30 emails
```

### **Adjust Relevance Threshold:**
Edit `process-gmail.js`, find:
```javascript
if (relevanceScore < 7) {  // Change to 6 for more permissive
```

---

## 💰 Cost Tracking

### **Expected Costs:**
- Gmail API: **FREE** ✅
- Sheets API: **FREE** ✅
- GitHub Actions: **FREE** ✅
- Claude API: **~$0.02 per insight**
  - 15 insights/day = $0.30/day
  - **~$9/month**

### **Monitor Usage:**
- Anthropic: https://console.anthropic.com/settings/billing
- GitHub Actions: Repo → Settings → Actions → Usage

---

## 🎯 Next Steps

Once automation is working:

1. **Subscribe `groupfaire@gmail.com` to your sources:**
   - TechCrunch newsletters
   - VentureBeat AI
   - OpenAI updates
   - Industry reports
   - (Your 10-15 sources)

2. **Let it run for 3-5 days** to collect insights

3. **Review quality and tune:**
   - Adjust relevance scoring
   - Refine Claude prompts
   - Update source priorities

4. **Add Review Queue to web app** (next phase)

5. **Start new chat for Customer Interface** (Phase 2)

---

## 📞 Support

If you get stuck:
1. Check the troubleshooting section above
2. Look at GitHub Action logs for specific errors
3. Test locally first with `npm run test`
4. Share error messages for help

---

## 🎉 Success!

When you see:
- ✓ Daily GitHub Action running successfully
- ✓ Insights appearing in Draft Queue
- ✓ Emails marked as processed
- ✓ Quality insights auto-generated

**You're done with Phase 1! 🚀**

Ready to build the Review Queue interface next!
