import { Worker } from 'bullmq';
import { sendEmail } from '../email/sendEmail';
import SmtpConfig from '@/models/SmtpConfig';
import EmailLog from '@/models/EmailLog';
import User from '@/models/User';

let worker = null;

// Connection config for Redis
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

/**
 * Initialize the email queue worker
 * @returns {Worker} The initialized worker
 */
export function initEmailWorker() {
  if (worker) return worker;
  
  // Set concurrency from environment or default to 1
  const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '1');
  console.log(`Initializing email worker with concurrency: ${concurrency}...`);
  
  worker = new Worker('email-queue', async (job) => {
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
    concurrency
  });

  // Handle job completion
  worker.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed with result:`, result);
  });

  // Handle job failures
  worker.on('failed', (job, error) => {
    console.error(`Job ${job.id} failed with error:`, error);
  });

  return worker;
}

/**
 * Close the worker and clean up resources
 */
export async function closeEmailWorker() {
  if (worker) {
    console.log('Closing email worker...');
    await worker.close();
    worker = null;
  }
}