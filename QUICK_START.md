# Quick Start Guide

## ⚡ Get Started in 3 Steps

### 1. Open Terminal and navigate to the project:
```bash
cd ~/job-scraper
```

### 2. Start the watcher:
```bash
./start.sh
```

Or manually:
```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use default && npm run watch
```

### 3. Let it run!
The scraper will:
- Check immediately for new jobs
- Send desktop notifications for any new remote positions (Age ≤ 2d)
- Continue checking every 30 minutes
- Keep running until you press `Ctrl+C`

## 🔔 First Run

On the first run, you'll receive notifications for all current remote jobs posted within 2 days. After that, you'll only get notified about NEW positions.

## 📱 Testing Notifications

To test if notifications work, you can:

1. Delete the tracking file to reset:
```bash
rm notified_jobs.json
```

2. Run the scraper again - you should see notifications!

## 🎯 What Gets Notified

Jobs that meet BOTH criteria:
- ✅ Location contains "Remote" (case-insensitive)
- ✅ Posted within last 2 days (0d, 1d, or 2d)

## 🛑 Stopping the Watcher

Press `Ctrl+C` in the terminal to stop monitoring.

## 💡 Tips

- Keep the terminal window open while the watcher runs
- If you close the terminal, the watcher stops
- To run in the background, use: `nohup ./start.sh > output.log 2>&1 &`
- Check `notified_jobs.json` to see which jobs you've been notified about

## 🔧 Customize Check Frequency

Edit the cron schedule in watcher.js or pass as argument:
```bash
# Check every 15 minutes
node watcher.js "*/15 * * * *"

# Check every hour
node watcher.js "0 * * * *"
```

## ❓ Troubleshooting

**No notifications showing?**
- Check macOS System Preferences → Notifications → Terminal
- Make sure notifications are enabled

**Getting errors?**
- Make sure you ran `npm install` first
- Check that Node.js is installed: `node --version`

**Want to see all jobs (not just new ones)?**
- Run: `npm start` for a one-time check without notifications
