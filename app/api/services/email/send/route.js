import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/service_utils/validateApiKey';
import { applyTemplate } from '@/lib/email/sendEmail';
import { parseRequest } from '@/lib/service_utils/parseRequest';
import { checkEmailUsage } from '@/lib/service_utils/usageManager';
import emailQueue from '@/lib/queue/emailQueue';
import EmailTemplate from '@/models/EmailTemplate';
import SmtpConfig from '@/models/SmtpConfig';
import { handleError } from '@/lib/service_utils/errorHandler';
import { successResponse, errorResponse } from '@/lib/service_utils/response';

export async function POST(request) {
  try {
    // Validate API key using the simplified function
    const user = await validateApiKey(request);
    if (!user) {
      return errorResponse({
        message: 'Invalid API key',
        status: 401
      });
    }

    // Parse request body using parseRequest
    const { templateId, to, data = {} } = await parseRequest(request);

    // Validate required fields
    if (!templateId || !to) {
      return errorResponse({
        message: 'Required fields missing: templateId and to are required',
        status: 400
      });
    }

    // Check email usage against plan limit
    const usageCheck = await checkEmailUsage(user, 1);
    if (!usageCheck.success) {
      return errorResponse({
        message: usageCheck.error.message || 'Usage check failed',
        status: usageCheck.error.status || 500,
        error: usageCheck.error.error || null
      });
    }

    // Get template
    const template = await EmailTemplate.findOne({ 
      _id: templateId, 
      user: user._id 
    });

    if (!template) {
      return errorResponse({
        message: 'Template not found',
        status: 404
      });
    }

    // Get SMTP config
    const smtpConfig = await SmtpConfig.findById(user.smtp);
    if (!smtpConfig) {
      return errorResponse({
        message: 'SMTP configuration not found',
        status: 404
      });
    }

    // Apply template variables
    const html = applyTemplate(template.body, data);

    // Add job to email queue instead of sending directly
    const job = await emailQueue.add('send-email', {
      userId: user._id.toString(),
      to,
      subject: template.subject,
      html,
      type: template.type
    });

    return successResponse({
      message: 'Email queued successfully',
      data: {
        jobId: job.id,
        emailQueued: {
          to,
          subject: template.subject,
          templateId
        },
        usage: {
          sent: usageCheck.sent + 1,
          limit: usageCheck.limit,
          remaining: usageCheck.remaining
        }
      }
    });
    
  } catch (error) {
    return handleError(error);
  }
}
