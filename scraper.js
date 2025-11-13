import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const README_URL = 'https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/README.md';
const NOTIFIED_JOBS_FILE = path.join(__dirname, 'notified_jobs.json');

async function fetchReadme() {
  try {
    const response = await fetch(README_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching README:', error.message);
    throw error;
  }
}

function parseAge(ageStr) {
  if (!ageStr) return Infinity;

  const match = ageStr.match(/^(\d+)(d|mo|h)$/);
  if (!match) return Infinity;

  const [, value, unit] = match;
  const numValue = parseInt(value, 10);

  switch (unit) {
    case 'h': return 0;
    case 'd': return numValue;
    case 'mo': return numValue * 30;
    default: return Infinity;
  }
}

function isRemoteLocation(location) {
  if (!location) return false;
  return /remote/i.test(location);
}

function parseJobs(markdown) {
  const jobs = [];

  const sectionMatch = markdown.match(/## 💻 Software Engineering New Grad Roles[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/);

  if (!sectionMatch) {
    console.log('Could not find the job table');
    return jobs;
  }

  const tableBody = sectionMatch[1];

  const rowRegex = /<tr>[\s\S]*?<\/tr>/g;
  const rows = tableBody.match(rowRegex) || [];

  for (const row of rows) {
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
    const cells = [];
    let match;

    while ((match = tdRegex.exec(row)) !== null) {
      cells.push(match[1]);
    }

    if (cells.length >= 5) {
      const [company, role, location, application, age] = cells;

      const cleanCompany = company
        .replace(/<[^>]+>/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\*\*/g, '')
        .trim();

      const cleanRole = role
        .replace(/<[^>]+>/g, '')
        .replace(/[🛂🇺🇸🔒🔥🎓]/g, '')
        .trim();

      const cleanLocation = location
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const cleanAge = age
        .replace(/<[^>]+>/g, '')
        .trim();

      if (cleanCompany && cleanRole && cleanLocation && cleanAge) {
        jobs.push({
          company: cleanCompany,
          role: cleanRole,
          location: cleanLocation,
          application,
          age: cleanAge,
          ageInDays: parseAge(cleanAge)
        });
      }
    }
  }

  return jobs;
}

function filterJobs(jobs) {
  return jobs.filter(job => {
    const isRemote = isRemoteLocation(job.location);
    const isRecent = job.ageInDays <= 2;
    return isRemote && isRecent;
  });
}

function getJobId(job) {
  return `${job.company}|${job.role}|${job.location}`.toLowerCase();
}

async function loadNotifiedJobs() {
  try {
    const data = await fs.readFile(NOTIFIED_JOBS_FILE, 'utf-8');
    const jobIds = JSON.parse(data);
    return new Set(jobIds);
  } catch (error) {
    return new Set();
  }
}

async function saveNotifiedJobs(notifiedJobs) {
  const jobIds = Array.from(notifiedJobs);
  await fs.writeFile(NOTIFIED_JOBS_FILE, JSON.stringify(jobIds, null, 2));
}

export async function scrape() {
  console.log(`[${new Date().toLocaleString()}] Starting job scrape...`);

  try {
    const markdown = await fetchReadme();
    const allJobs = parseJobs(markdown);
    console.log(`Found ${allJobs.length} total jobs`);

    const filteredJobs = filterJobs(allJobs);
    console.log(`Found ${filteredJobs.length} remote jobs posted within 2 days`);

    const notifiedJobs = await loadNotifiedJobs();

    const newJobs = filteredJobs.filter(job => {
      const jobId = getJobId(job);
      return !notifiedJobs.has(jobId);
    });

    console.log(`Found ${newJobs.length} new jobs to notify`);

    return {
      allJobs,
      filteredJobs,
      newJobs,
      notifiedJobs
    };

  } catch (error) {
    console.error('Error during scraping:', error.message);
    throw error;
  }
}

export async function markAsNotified(jobs, notifiedJobs) {
  for (const job of jobs) {
    notifiedJobs.add(getJobId(job));
  }
  await saveNotifiedJobs(notifiedJobs);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  scrape()
    .then(results => {
      console.log('\n=== Results ===');
      console.log(`Total jobs: ${results.allJobs.length}`);
      console.log(`Remote jobs (Age <= 2d): ${results.filteredJobs.length}`);
      console.log(`New jobs: ${results.newJobs.length}`);

      if (results.newJobs.length > 0) {
        console.log('\nNew Remote Jobs:');
        results.newJobs.forEach((job, idx) => {
          console.log(`\n${idx + 1}. ${job.company} - ${job.role}`);
          console.log(`   Location: ${job.location}`);
          console.log(`   Age: ${job.age}`);
        });
      }
    })
    .catch(error => {
      console.error('Scrape failed:', error);
      process.exit(1);
    });
}
