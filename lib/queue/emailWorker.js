import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import { sendEmail } from '../email/sendEmail';
import SmtpConfig from '@/models/SmtpConfig';
import EmailLog from '@/models/EmailLog';
import User from '@/models/User';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

const worker = new Worker('email-queue', async job => {
  const { userId, to, subject, html, type = 'direct' } = job.data;
  
  try {
    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
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
}, { connection });

// Handle job completion
worker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

// Handle job failures
worker.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
});

export default worker;