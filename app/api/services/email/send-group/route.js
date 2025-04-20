import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/service_utils/validateApiKey';
import { applyTemplate } from '@/lib/email/sendEmail';
import { parseRequest } from '@/lib/service_utils/parseRequest';
import { checkEmailUsage } from '@/lib/service_utils/usageManager';
import emailQueue from '@/lib/queue/emailQueue';
import EmailTemplate from '@/models/EmailTemplate';
import ContactGroup from '@/models/ContactGroup';
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
    const { templateId, groupName, data = {} } = await parseRequest(request);

    // Validate required fields
    if (!templateId || !groupName) {
      return errorResponse({
        message: 'Required fields missing: templateId and groupName are required',
        status: 400
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

    // Get contact group
    const group = await ContactGroup.findOne({
      name: groupName,
      user: user._id
    });

    if (!group) {
      return errorResponse({
        message: 'Contact group not found',
        status: 404
      });
    }

    // Check if there are any emails in the group
    if (!group.emails || group.emails.length === 0) {
      return errorResponse({
        message: 'The contact group is empty',
        status: 400
      });
    }

    // Check email usage against plan limit based on number of emails in the group
    const emailCount = group.emails.length;
    const usageCheck = await checkEmailUsage(user, emailCount);
    
    if (!usageCheck.success) {
      return usageCheck.error;
    }

    // Get SMTP config to verify it exists
    const smtpConfig = await SmtpConfig.findById(user.smtp);
    if (!smtpConfig) {
      return errorResponse({
        message: 'SMTP configuration not found',
        status: 404
      });
    }

    // Apply template variables
    const html = applyTemplate(template.body, data);
    
    // Add each email to the queue
    const jobIds = [];
    for (const email of group.emails) {
      const job = await emailQueue.add('send-email', {
        userId: user._id.toString(),
        to: email,
        subject: template.subject,
        html,
        type: template.type
      }, {
        priority: 2, // Slightly lower priority than single emails
      });
      
      jobIds.push(job.id);
    }

    return successResponse({
      message: 'Group email queued successfully',
      data: {
        jobIds,
        emailsQueued: group.emails.length,
        templateId,
        groupName,
        usage: {
          sent: usageCheck.sent + emailCount,
          limit: usageCheck.limit,
          remaining: usageCheck.remaining
        }
      }
    });
    
  } catch (error) {
    return handleError(error);
  }
}