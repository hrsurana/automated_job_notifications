# Job Scraper - GitHub New Grad Remote Positions

Automatically scrapes the [SimplifyJobs New-Grad-Positions](https://github.com/SimplifyJobs/New-Grad-Positions) repository and sends email notifications for remote positions posted within the last 2 days.

## Features

- 🔍 Scrapes job postings from GitHub README
- 🌍 Filters for **Remote** locations only
- ⏰ Only shows positions posted within the last **2 days**
- 📧 Email notifications with all remote jobs from the last 2 days
- 💾 Tracks notified jobs to avoid duplicates
- ⚡ Automatic scheduled checks (default: every alternate day at 9:00 AM Central Time)

## Installation

1. Navigate to the project directory:
```bash
cd ~/job-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Set up email configuration:
```bash
# Copy the example configuration file
cp email-config.example.json email-config.json

# Edit the configuration with your email settings
nano email-config.json
```

**Email Configuration Fields:**
- `smtpHost`: Your SMTP server (e.g., `smtp.gmail.com` for Gmail)
- `smtpPort`: SMTP port (587 for TLS, 465 for SSL)
- `smtpUser`: Your email address
- `smtpPass`: Your email password or app-specific password
- `fromEmail`: Email address to send from (usually same as smtpUser)
- `toEmail`: Email address to receive notifications

**Gmail Users:** You'll need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

4. Test your email configuration:
```bash
npm run test-email
```

## Usage

### One-time Check

Run a single scrape to see current remote positions:

```bash
npm start
```

This will:
- Fetch all job postings
- Filter for remote positions posted within 2 days
- Display results in the console
- NOT send notifications (use watcher for notifications)

### Continuous Monitoring (Recommended)

Start the watcher to automatically check for new jobs and receive email notifications:

```bash
npm run watch
```

This will:
- Run an immediate check and send a test email
- Schedule checks every alternate day at 9:00 AM Central Time
- Send email notifications with ALL remote jobs posted in the last 2 days
- Track notified jobs for reference
- Continue running until you stop it (Ctrl+C)

**Note:** The watcher uses `America/Chicago` timezone for scheduling. The initial run happens immediately when you start the watcher.

### Custom Check Frequency

You can customize how often the scraper runs using cron syntax:

```bash
# Check every day at 9 AM CT
node watcher.js "0 9 * * *"

# Check every 3 days at 9 AM CT
node watcher.js "0 9 */3 * *"

# Check every Monday at 9 AM CT
node watcher.js "0 9 * * 1"

# Check twice a week (Monday and Thursday) at 9 AM CT
node watcher.js "0 9 * * 1,4"
```

**Cron Format:** `minute hour day month day-of-week`

**Important:** The scheduler uses Central Time (America/Chicago) timezone.

## How It Works

1. **Scraper** ([scraper.js](scraper.js))
   - Fetches the README from the GitHub repository
   - Parses the markdown table for job listings
   - Filters jobs by:
     - Location contains "Remote" (case-insensitive)
     - Age is 2 days or less (0d, 1d, 2d)
   - Tracks which jobs have been notified

2. **Email Notifier** ([email-notifier.js](email-notifier.js))
   - Sends HTML-formatted email notifications
   - Includes all remote jobs posted in the last 2 days
   - Displays: Company, Role, Location, Age, and Apply link
   - Professional email formatting with styled layout
   - Uses nodemailer for reliable email delivery

3. **Watcher** ([watcher.js](watcher.js))
   - Schedules periodic checks using cron with timezone support
   - Runs scraper and email notifier automatically
   - Default: Every alternate day at 9:00 AM Central Time
   - Marks jobs as notified for tracking

## Files

- `scraper.js` - Core scraping and filtering logic
- `email-notifier.js` - Email notification system with HTML formatting
- `watcher.js` - Scheduled monitoring service with timezone support
- `email-config.json` - Email configuration (create from example)
- `email-config.example.json` - Example email configuration template
- `notified_jobs.json` - Tracks previously notified jobs (auto-generated)
- `package.json` - Project dependencies and scripts

## Filter Criteria

Jobs must meet BOTH conditions:
- **Location:** Contains "Remote" (case-insensitive)
- **Age:** 2 days or less (0d, 1d, 2d)

Jobs with the following ages are **excluded:**
- 3d or more
- 1mo, 2mo, etc.

## Troubleshooting

### Not receiving emails?

1. Check your email configuration:
```bash
npm run test-email
```

2. Common issues:
   - **Gmail users:** Make sure you're using an App Password, not your regular password
   - **SMTP settings:** Verify your SMTP host and port are correct
   - **Firewall:** Ensure outbound SMTP connections are allowed
   - **Spam folder:** Check if emails are being filtered as spam

3. Check console output for error messages

### Email configuration errors?

- Make sure `email-config.json` exists and has all required fields
- Verify JSON syntax is valid (no trailing commas, proper quotes)
- Test with `npm run test-email` before starting the watcher

### Getting rate limited?

- Reduce check frequency to daily or less
- The GitHub raw content URL is usually not rate limited

### Want to reset notified jobs?

Delete the tracking file to start fresh:
```bash
rm notified_jobs.json
```

### Timezone issues?

The watcher uses Central Time (America/Chicago). If you're in a different timezone:
- The cron schedule will still run at 9 AM Central Time
- Adjust the cron schedule if you need a different time
- Or modify the timezone in [watcher.js:51](watcher.js#L51)

## Example Output

### Console Output
```
📧 Email Job Watcher Started!
Schedule: Every alternate day at 9:00 AM Central Time
Sends email with all remote jobs posted in the last 2 days
Press Ctrl+C to stop.

⏰ Cron schedule: 0 9 */2 * *
📅 Next run will be at the scheduled time.

Running initial check...
[11/13/2025, 9:00:00 PM] Starting job scrape...
Found 305 total jobs
Found 12 remote jobs posted within 2 days
Found 3 new jobs to notify

=== Remote Jobs (Last 2 Days) ===

1. CommonLit - Junior Software Engineer
   Location: Remote in USA
   Posted: 0d ago

2. GitHub - Software Engineer, New Grad
   Location: Remote
   Posted: 1d ago

3. Stripe - New Grad Software Engineer
   Location: Remote (US)
   Posted: 2d ago

... (9 more jobs)

====================================

📧 Sending email to recipient@example.com...
✅ Email sent successfully! Message ID: <abc123@mail.gmail.com>
```

### Email Preview
The email will include:
- Subject: "🚀 12 New Remote Jobs - Last 2 Days"
- HTML-formatted job listings with:
  - Job title and company name
  - Location and posting age
  - Clickable "Apply Now" buttons
  - Professional styling and layout

## Notes

- The scraper reads from the `dev` branch of the repository
- Emails are sent with ALL remote jobs from the last 2 days (not just new ones)
- The tracking file (`notified_jobs.json`) persists between runs for reference
- Emails are sent every alternate day at 9:00 AM Central Time by default
- The watcher runs immediately when started for testing purposes

## License

ISC
