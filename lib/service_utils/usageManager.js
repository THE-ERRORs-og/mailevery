import User from '@/models/User';
import Plan from "@/models/Plan";
import EmailLog from '@/models/EmailLog';
import { errorResponse } from './response';

/**
 * Check if user has reached their daily email limit based on plan
 * @param {Object} user - User object with populated plan
 * @param {Number} emailCount - Number of emails to send (default: 1)
 * @returns {Promise<Object>} - Result with success and optional error message
 */
export async function checkEmailUsage(user, emailCount = 1) {
  try {
    // Populate the plan if not already populated
    const populatedUser = user.plan.maxEmailsPerDay ? 
      user : 
      await User.findById(user._id).populate('plan');
    
    if (!populatedUser.plan) {
      return {
        success: false,
        error: errorResponse({
          message: 'User plan not found',
          status: 403
        })
      };
    }

    // Get the daily limit from the plan
    const { maxEmailsPerDay } = populatedUser.plan;
    
    // Calculate today's date range (start of day to now)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Count emails sent today
    const emailsSentToday = await EmailLog.countDocuments({
      user: user._id,
      status: 'success',
      createdAt: { $gte: startOfDay, $lte: today }
    });

    // Check if sending these emails would exceed the limit
    if (emailsSentToday + emailCount > maxEmailsPerDay) {
      return {
        success: false,
        error: errorResponse({
          message: `Daily email limit reached (${emailsSentToday}/${maxEmailsPerDay})`,
          error: {
            limit: maxEmailsPerDay,
            sent: emailsSentToday,
            remaining: Math.max(0, maxEmailsPerDay - emailsSentToday)
          },
          status: 429 // Too Many Requests
        })
      };
    }

    // User has sufficient quota
    return {
      success: true,
      sent: emailsSentToday,
      limit: maxEmailsPerDay,
      remaining: maxEmailsPerDay - emailsSentToday - emailCount
    };
  } catch (error) {
    console.error('Error checking email usage:', error);
    return {
      success: false,
      error: errorResponse({
        message: 'Failed to check email usage',
        status: 500
      })
    };
  }
}