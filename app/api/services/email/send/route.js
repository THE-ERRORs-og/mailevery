import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/service_utils/validateApiKey';
import { applyTemplate, sendEmail } from '@/lib/email/sendEmail';
import { parseRequest } from '@/lib/service_utils/parseRequest';
import { checkEmailUsage } from '@/lib/service_utils/usageManager';
import EmailTemplate from '@/models/EmailTemplate';
import SmtpConfig from '@/models/SmtpConfig';
import EmailLog from '@/models/EmailLog';
import { handleError } from '@/lib/service_utils/errorHandler';
import { successResponse, errorResponse } from '@/lib/service_utils/response';
import emailQueue from '@/lib/queue/emailQueue';
import connectDB from '@/lib/mongodb';
import { withCorsProtection } from '@/lib/withCorsProtection';

export const POST = withCorsProtection(async function POST(request) {
  try {
    await connectDB();
    // Validate API key using the simplified function
    const user = await validateApiKey(request);
    if (!user) {
      return errorResponse({
        message: 'Invalid API key',
        status: 401
      });
    }
    
    // Parse request body using parseRequest
    const { templateName, to, data = {} } = await parseRequest(request);

    // Validate required fields
    if (!templateName || !to) {
      return errorResponse({
        message: "Required fields missing: templateName and to are required",
        status: 400,
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
      user: user._id,
      name: { $regex: new RegExp(`^${templateName}$`, "i") },
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

    const subject =
      template.type === "static"
        ? template.subject
        : applyTemplate(template.subject, data);

    const html =
      template.type === "static"
        ? template.body
        : applyTemplate(template.body, data);

    // Add job to email queue instead of sending directly
    const job = await emailQueue.add('send-email', {
      userId: user._id.toString(),
      to,
      subject,
      html,
      type: template.type
    });


    if (!job.id) {
      return errorResponse({
        message: 'Failed to send email',
        status: 500
      });
    }

    return successResponse({
      message: "Email queued successfully",
      data: {
        jobId: job.id,
        emailQueued: {
          to,
          subject,
          templateName
        },
        usage: {
          sent: usageCheck.sent + 1,
          limit: usageCheck.limit,
          remaining: usageCheck.remaining,
        },
      },
    });
    
  } catch (error) {
    return handleError(error);
  }
});
