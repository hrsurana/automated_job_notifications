# Quick Setup Guide

Get your job scraper running with email notifications in 5 minutes!

## Step 1: Install Dependencies

```bash
cd ~/job-scraper
npm install
```

## Step 2: Configure Email

### 2.1 Create your email configuration file:
```bash
cp email-config.example.json email-config.json
```

### 2.2 Edit the configuration:
```bash
nano email-config.json
```

### 2.3 Fill in your email settings:

#### For Gmail Users:
```json
{
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpUser": "your-email@gmail.com",
  "smtpPass": "your-16-char-app-password",
  "fromEmail": "your-email@gmail.com",
  "toEmail": "your-email@gmail.com"
}
```

**Important:** For Gmail, you MUST use an App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Sign in to your Google Account
3. Select "Mail" and your device
4. Click "Generate"
5. Copy the 16-character password (no spaces)
6. Use this in the `smtpPass` field

#### For Other Email Providers:
- **Outlook/Hotmail:** `smtp.office365.com`, port 587
- **Yahoo:** `smtp.mail.yahoo.com`, port 587
- **Custom SMTP:** Use your provider's SMTP settings

### 2.4 Test your configuration:
```bash
npm run test-email
```

You should see:
```
Testing email configuration...
✅ Email configuration is valid!
```

## Step 3: Start the Watcher

```bash
npm run watch
```

This will:
- ✅ Run an immediate check and send a test email
- ✅ Schedule checks every alternate day at 9:00 AM Central Time
- ✅ Keep running until you press Ctrl+C

## Step 4: Keep it Running (Optional)

To run the job scraper 24/7 in the background:

### Option A: Using screen (recommended for remote servers)
```bash
screen -S job-scraper
npm run watch
# Press Ctrl+A, then D to detach
# To reattach: screen -r job-scraper
```

### Option B: Using nohup
```bash
nohup npm run watch > job-scraper.log 2>&1 &
```

### Option C: Using pm2 (process manager)
```bash
npm install -g pm2
pm2 start watcher.js --name job-scraper
pm2 save
pm2 startup  # Follow the instructions
```

## Customizing the Schedule

Want to change when emails are sent?

```bash
# Every day at 9 AM CT
node watcher.js "0 9 * * *"

# Every Monday and Thursday at 9 AM CT
node watcher.js "0 9 * * 1,4"

# Every 3 days at 9 AM CT
node watcher.js "0 9 */3 * *"
```

## Troubleshooting

### "Email configuration file not found"
```bash
# Make sure you created the config file:
ls -la email-config.json

# If it doesn't exist, copy from example:
cp email-config.example.json email-config.json
```

### "Invalid login" or "Authentication failed"
- Gmail users: Make sure you're using an App Password, not your regular password
- Other providers: Check your username/password are correct
- Some providers require "less secure apps" to be enabled

### "No emails received"
1. Check spam/junk folder
2. Verify the `toEmail` address is correct
3. Run `npm run test-email` to test configuration
4. Check console for error messages

### "ECONNREFUSED" or connection errors
- Check your firewall allows outbound SMTP connections
- Verify the SMTP host and port are correct
- Try port 465 with SSL if 587 with TLS doesn't work

## What's Next?

- Check your email for the initial job listings
- The next scheduled email will arrive at 9:00 AM CT on the alternate day
- Monitor the console output for any errors
- Adjust the schedule if needed using custom cron syntax

## Need Help?

- See [README.md](README.md) for full documentation
- Check troubleshooting section above
- Review console output for specific error messages
