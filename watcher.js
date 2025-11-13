import cron from 'node-cron';
import { scrape, markAsNotified } from './scraper.js';
import { sendEmailNotification } from './email-notifier.js';

async function checkForNewJobs() {
  try {
    const results = await scrape();
    await sendEmailNotification(results.filteredJobs);

    if (results.newJobs.length > 0) {
      await markAsNotified(results.newJobs, results.notifiedJobs);
    }
  } catch (error) {
    console.error('Error checking for jobs:', error.message);
  }
}

export function startWatcher(cronSchedule = '0 9 */2 * *') {
  console.log('📧 Email Job Watcher Started!');
  console.log('Schedule: Every alternate day at 9:00 AM Central Time');
  console.log('Sends email with all remote jobs posted in the last 2 days');
  console.log('Press Ctrl+C to stop.\n');

  console.log(`⏰ Cron schedule: ${cronSchedule}`);
  console.log(`📅 Next run will be at the scheduled time.\n`);

  console.log('Running initial check...');
  checkForNewJobs();

  cron.schedule(cronSchedule, () => {
    console.log(`\n--- Scheduled email at ${new Date().toLocaleString()} ---`);
    checkForNewJobs();
  }, {
    timezone: "America/Chicago"
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const schedule = args[0] || '0 9 */2 * *';
  startWatcher(schedule);
}
