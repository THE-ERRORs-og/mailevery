import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { validateApiKey } from '@/lib/service_utils/validateApiKey';
import { successResponse, errorResponse } from '@/lib/service_utils/response';
import { handleError } from '@/lib/service_utils/errorHandler';

// Redis connection config
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

export async function GET(request) {
  try {
    // Validate API key
    const user = await validateApiKey(request);
    if (!user) {
      return errorResponse({
        message: 'Invalid API key',
        status: 401
      });
    }

    // Create queue instance to query stats
    const emailQueue = new Queue('email-queue', { connection });
    
    // Get queue stats
    const jobCounts = await emailQueue.getJobCounts(
      'active', 
      'completed', 
      'failed', 
      'delayed', 
      'waiting'
    );
    
    // Get jobs by userId (for this specific user)
    const waitingJobs = await emailQueue.getJobs(['waiting', 'active', 'delayed']);
    const userJobs = waitingJobs.filter(job => job.data.userId === user._id.toString());
    
    return successResponse({
      message: 'Queue status retrieved successfully',
      data: {
        globalStats: jobCounts,
        userStats: {
          pendingJobs: userJobs.length,
          jobs: userJobs.map(job => ({
            id: job.id,
            state: job.state,
            createdAt: job.timestamp,
            data: {
              to: job.data.to,
              subject: job.data.subject,
            }
          }))
        }
      }
    });
  } catch (error) {
    return handleError(error);
  }
}