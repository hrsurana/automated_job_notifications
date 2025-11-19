import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// create a email-config.json file and replace the content in the example file with your information

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEmailConfig() {
  const configPath = path.join(__dirname, 'email-config.json');

  if (!fs.existsSync(configPath)) {
    throw new Error(`Email configuration file not found at ${configPath}. Please create email-config.json with your email settings.`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  const required = ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'fromEmail', 'toEmail'];
  for (const field of required) {
    if (!config[field]) {
      throw new Error(`Missing required field "${field}" in email-config.json`);
    }
  }

  return config;
}

function createTransporter(config) {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

function formatJobsHTML(jobs) {
  if (jobs.length === 0) {
    return '<p>No new remote jobs found in the last 2 days.</p>';
  }

  let html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
          }
          .summary {
            background-color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .job {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
            background-color: #fff;
          }
          .job-header {
            font-size: 18px;
            font-weight: bold;
            color: #2980b9;
            margin-bottom: 8px;
          }
          .job-company {
            font-size: 16px;
            color: #27ae60;
            margin-bottom: 5px;
          }
          .job-details {
            color: #555;
            margin-bottom: 10px;
          }
          .apply-button {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 10px;
          }
          .apply-button:hover {
            background-color: #2980b9;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #777;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>Remote Job Opportunities - Last 2 Days</h1>
        <div class="summary">
          <strong>Summary:</strong> Found ${jobs.length} new remote job${jobs.length === 1 ? '' : 's'} posted in the last 2 days.
        </div>
  `;

  jobs.forEach((job, index) => {
    let applicationUrl = job.application;
    const urlMatch = job.application.match(/href="([^"]+)"/);
    if (urlMatch) {
      applicationUrl = urlMatch[1];
    }

    html += `
        <div class="job">
          <div class="job-header">${index + 1}. ${job.role}</div>
          <div class="job-company">🏢 ${job.company}</div>
          <div class="job-details">
            <strong>Location:</strong> ${job.location}<br>
            <strong>Posted:</strong> ${job.age} ago
          </div>
          <a href="${applicationUrl}" class="apply-button">Apply Now</a>
        </div>
    `;
  });

  html += `
        <div class="footer">
          <p>This is an automated email from your Job Scraper service.</p>
          <p>Jobs sourced from <a href="https://github.com/SimplifyJobs/New-Grad-Positions">SimplifyJobs/New-Grad-Positions</a></p>
        </div>
      </body>
    </html>
  `;

  return html;
}

function formatJobsText(jobs) {
  if (jobs.length === 0) {
    return 'No new remote jobs found in the last 2 days.';
  }

  let text = `REMOTE JOB OPPORTUNITIES - LAST 2 DAYS\n`;
  text += `${'='.repeat(50)}\n\n`;
  text += `Found ${jobs.length} new remote job${jobs.length === 1 ? '' : 's'}:\n\n`;

  jobs.forEach((job, index) => {
    let applicationUrl = job.application;
    const urlMatch = job.application.match(/href="([^"]+)"/);
    if (urlMatch) {
      applicationUrl = urlMatch[1];
    }

    text += `${index + 1}. ${job.role}\n`;
    text += `   Company: ${job.company}\n`;
    text += `   Location: ${job.location}\n`;
    text += `   Posted: ${job.age} ago\n`;
    text += `   Apply: ${applicationUrl}\n\n`;
  });

  text += `${'='.repeat(50)}\n`;
  text += `This is an automated email from your Job Scraper service.\n`;
  text += `Jobs sourced from SimplifyJobs/New-Grad-Positions\n`;

  return text;
}

export async function sendEmailNotification(jobs) {
  try {
    const config = loadEmailConfig();
    const transporter = createTransporter(config);

    const subject = jobs.length === 0
      ? 'Remote Jobs Update - No New Positions'
      : `${jobs.length} New Remote Job${jobs.length === 1 ? '' : 's'} - Last 2 Days`;

    const mailOptions = {
      from: `"Job Scraper" <${config.fromEmail}>`,
      to: config.toEmail,
      subject: subject,
      text: formatJobsText(jobs),
      html: formatJobsHTML(jobs),
    };

    console.log(`\nSending email to ${config.toEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully! Message ID: ${info.messageId}`);

    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
}

export async function testEmailConfig() {
  try {
    const config = loadEmailConfig();
    const transporter = createTransporter(config);

    console.log('Testing email configuration...');
    await transporter.verify();
    console.log('Email configuration is valid!');
    return true;
  } catch (error) {
    console.error('Email configuration test failed:', error.message);
    return false;
  }
}
