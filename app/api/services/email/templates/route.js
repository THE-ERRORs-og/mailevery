import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/service_utils/validateApiKey';
import { parseRequest } from '@/lib/service_utils/parseRequest';
import { checkEmailUsage } from '@/lib/service_utils/usageManager';
import EmailTemplate from '@/models/EmailTemplate';
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
    
    // Check if template name is provided
    if (params.name) {
      // Find template by name (case insensitive)
      const template = await EmailTemplate.findOne({ 
        user: user._id, 
        name: { $regex: new RegExp(`^${params.name}$`, 'i') } 
      });

      if (!template) {
        return errorResponse({
          message: 'Template not found',
          status: 404
        });
      }

      // Get usage information (without incrementing count)
      const usageInfo = await checkEmailUsage(user, 0);
      
      return successResponse({
        message: 'Template retrieved successfully',
        data: {
          template,
          usage: usageInfo.success ? {
            sent: usageInfo.sent,
            limit: usageInfo.limit,
            remaining: usageInfo.remaining
          } : {
            error: 'Could not retrieve usage information'
          }
        }
      });
    }
    
    // Get pagination parameters
    const limit = parseInt(params.limit) || 50;
    const page = parseInt(params.page) || 1;
    const skip = (page - 1) * limit;

    // Get templates for the user
    const templates = await EmailTemplate.find({ user: user._id })
      .select('_id name subject type createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await EmailTemplate.countDocuments({ user: user._id });

    // Get usage information (without incrementing count)
    const usageInfo = await checkEmailUsage(user, 0);
    
    return successResponse({
      message: 'Templates retrieved successfully',
      data: {
        templates,
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