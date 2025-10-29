# Gmail Automation - Quick Reference

## ⚡ Commands

```bash
npm install          # Install dependencies (first time)
npm run auth         # Authenticate with Google (one-time)
npm run test         # Test all connections
npm run process      # Process emails now (manual)
```

## 🔗 Important Links

- **Gmail Inbox:** https://mail.google.com/ (groupfaire@gmail.com)
- **Google Sheet:** https://docs.google.com/spreadsheets/d/1ikVeCPQiYA-SWgaHuViai9qv6BeiJAFODPpkeg5jbfI/
- **GitHub Actions:** [Your repo]/actions
- **Anthropic Console:** https://console.anthropic.com/
- **Google Cloud Console:** https://console.cloud.google.com/

## 📅 Schedule

**Automated Run:** Every day at 6:00 AM GMT

**Manual Trigger:**
1. Go to GitHub → Actions
2. Click "Daily Gmail Insights Curation"
3. Click "Run workflow"

## ✅ Daily Checklist

- [ ] Check GitHub Action ran successfully (6:05am GMT)
- [ ] Open Google Sheet → "Draft Queue" tab
- [ ] Review new insights (10 minutes)
- [ ] Approve/edit/reject insights
- [ ] Move approved to "Insights Data" tab

## 🎯 What Gets Processed

**Included:**
- Emails to groupfaire@gmail.com
- From last 24 hours
- Relevance score ≥ 7/10
- Max 20 emails per run

**Excluded:**
- Already processed (has "processed" label)
- Low relevance (score < 7)
- Unsubscribe/tracking links

## 🔧 Quick Fixes

**Action failed?**
→ Check logs in GitHub Actions tab

**No insights generated?**
→ Check if there are new emails in inbox

**Token expired?**
→ Run `npm run auth` locally and upload new token

**Wrong insights quality?**
→ Tune prompts in `process-gmail.js`

## 📊 Key Metrics

- **Processing time:** ~30-60 seconds per email
- **Cost:** ~$0.02 per insight
- **Expected daily:** 10-20 insights
- **Monthly cost:** ~$6-12

## 🎨 Output Format

Each insight includes:
```
✓ Title (60 chars)
✓ Summary (100-200 words)
✓ Analysis (100-300 words)  
✓ Category/Section/Subsection
✓ Impact, Horizon, Action
✓ Related Entities
✓ Source URL
```

## 🚨 Red Flags

**Watch out for:**
- ❌ Action failing repeatedly
- ❌ No new insights for 2+ days
- ❌ Claude API errors (rate limit/quota)
- ❌ Duplicate insights
- ❌ Poor quality summaries

**Fix:** Check logs, verify credentials, review prompts

## 💡 Tips

1. **Subscribe quality sources** to groupfaire@gmail.com
2. **Check inbox periodically** to ensure emails arriving
3. **Review first week daily** to tune quality
4. **Adjust relevance threshold** if too many/few insights
5. **Update prompts** to match your analysis style

## 📞 Emergency Contacts

**If automation breaks:**
1. Check GitHub Action logs
2. Run `npm run test` locally
3. Verify APIs enabled in Google Cloud
4. Check Anthropic API credits

**Quick diagnostics:**
```bash
npm run test  # Shows exactly what's broken
```

## 🎉 Success Looks Like

- ✓ Green checkmark in GitHub Actions
- ✓ 10-20 new rows in Draft Queue daily
- ✓ Insights match your quality standards
- ✓ Only 10 minutes of review time needed
- ✓ You're spending time on analysis, not data entry

---

**Keep this handy for daily operations!** 📋
