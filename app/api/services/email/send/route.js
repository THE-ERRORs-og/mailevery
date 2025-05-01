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

    // Apply template variables
    const html = applyTemplate(template.body, data);

    // Send email directly instead of using a queue
    const emailResult = await sendEmail(smtpConfig, {
      to,
      subject: template.subject,
      html,
      from: smtpConfig.username
    });

    // Log the email attempt
    await EmailLog.create({
      user: user._id,
      to,
      subject: template.subject,
      body: html,
      type: template.type,
      status: emailResult.messageId ? 'success' : 'failed',
      error: !emailResult.messageId ? 'Failed to send email' : null
    });

    if (!emailResult.messageId) {
      return errorResponse({
        message: 'Failed to send email',
        status: 500
      });
    }

    return successResponse({
      message: "Email sent successfully",
      data: {
        messageId: emailResult.messageId,
        emailSent: {
          to,
          subject: template.subject,
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
}
