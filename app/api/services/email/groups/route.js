import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/service_utils/validateApiKey';
import { parseRequest } from '@/lib/service_utils/parseRequest';
import { checkEmailUsage } from '@/lib/service_utils/usageManager';
import ContactGroup from '@/models/ContactGroup';
import { handleError } from '@/lib/service_utils/errorHandler';
import { successResponse, errorResponse } from '@/lib/service_utils/response';
import connectDB from '@/lib/mongodb';
import { withCorsProtection } from '@/lib/withCorsProtection';

export const GET = withCorsProtection(async function GET(request) {
  try {
    // Validate API key using the simplified function
    await connectDB();
    const user = await validateApiKey(request);
    if (!user) {
      return errorResponse({
        message: 'Invalid API key',
        status: 401
      });
    }

    // Parse request using the parseRequest utility
    const params = await parseRequest(request);
    
    // Get pagination parameters
    const limit = parseInt(params.limit) || 50;
    const page = parseInt(params.page) || 1;
    const skip = (page - 1) * limit;

    // Get contact groups for the user
    const groups = await ContactGroup.find({ user: user._id })
      .select('_id name emails createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add email count to each group
    const groupsWithCount = groups.map(group => {
      const { _id, name, emails, createdAt, updatedAt } = group;
      return {
        _id,
        name,
        emailCount: emails.length,
        createdAt,
        updatedAt
      };
    });

    // Get total count for pagination
    const total = await ContactGroup.countDocuments({ user: user._id });

    // Get usage information (without incrementing count)
    const usageInfo = await checkEmailUsage(user, 0);

    return successResponse({
      message: 'Contact groups retrieved successfully',
      data: {
        groups: groupsWithCount,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        },
        usage: usageInfo.success ? {
          sent: usageInfo.sent,
          limit: usageInfo.limit,
          remaining: usageInfo.remaining
        } : {
          error: 'Could not retrieve usage information'
        }
      }
    });
    
  } catch (error) {
    return handleError(error);
  }
});