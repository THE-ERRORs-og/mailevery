// This script runs the email worker process independently
require('dotenv').config();
const mongoose = require('mongoose');
const { Worker } = require('bullmq');

// Ensure environment variables
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

if (!process.env.REDIS_HOST) {
  console.error('REDIS_HOST environment variable is required');
  process.exit(1);
}

// Redis connection
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import models (need to use require syntax as this is CommonJS)
const SmtpConfig = require('../models/SmtpConfig');
const EmailLog = require('../models/EmailLog');
const User = require('../models/User');

// Import sendEmail function (need to use require syntax)
const { sendEmail } = require('../lib/email/sendEmail');

// Set concurrency from environment or default to 1
const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '1');
console.log(`Starting email worker with concurrency: ${concurrency}`);

// Create worker
const worker = new Worker('email-queue', async (job) => {
  const { userId, to, subject, html, type = 'direct' } = job.data;
  
  try {
    // Get the user and their SMTP config
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    // Get SMTP config
    const smtpConfig = await SmtpConfig.findById(user.smtp);
    if (!smtpConfig) {
      throw new Error(`SMTP configuration not found for user: ${userId}`);
    }
    
    // Send the email
    const result = await sendEmail(smtpConfig, {
      to,
      subject,
      html
    });
    
    // Log successful email
    await EmailLog.create({
      user: userId,
      to,
      subject,
      body: html,
      type,
      status: 'success'
    });
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    // Log failed email
    await EmailLog.create({
      user: userId,
      to,
      subject,
      body: html,
      type,
      status: 'failed',
      error: error.message || 'Unknown error'
    });
    
    // Rethrow to trigger job failure
    throw error;
  }
}, { 
  connection,
  concurrency: concurrency
});

// Handle job completion
worker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

// Handle job failures
worker.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
});

console.log('Email worker started, processing jobs from email-queue...');

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker and connections...');
  await worker.close();
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing worker and connections...');
  await worker.close();
  await mongoose.disconnect();
  process.exit(0);
});