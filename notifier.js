import notifier from 'node-notifier';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function sendNotification(job) {
  notifier.notify({
    title: `🚀 New Remote Job: ${job.company}`,
    message: `${job.role}\nLocation: ${job.location}\nPosted: ${job.age} ago`,
    sound: true,
    wait: false,
    timeout: 10
  });

  console.log(`✓ Notification sent: ${job.company} - ${job.role}`);
}

export function sendNotifications(jobs) {
  if (jobs.length === 0) {
    console.log('No new jobs to notify');
    return;
  }

  if (jobs.length > 5) {
    notifier.notify({
      title: '🎯 Multiple New Remote Jobs!',
      message: `Found ${jobs.length} new remote positions. Check console for details.`,
      sound: true,
      wait: false,
      timeout: 10
    });
  }

  jobs.forEach((job, index) => {
    setTimeout(() => {
      sendNotification(job);
    }, index * 2000);
  });

  console.log('\n=== New Remote Job Postings ===');
  jobs.forEach((job, idx) => {
    console.log(`\n${idx + 1}. ${job.company} - ${job.role}`);
    console.log(`   Location: ${job.location}`);
    console.log(`   Posted: ${job.age} ago`);
  });
  console.log('\n===============================\n');
}
