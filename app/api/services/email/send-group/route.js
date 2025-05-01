import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/service_utils/validateApiKey";
import { applyTemplate, sendEmail } from "@/lib/email/sendEmail";
import { parseRequest } from "@/lib/service_utils/parseRequest";
import { checkEmailUsage } from "@/lib/service_utils/usageManager";
import EmailTemplate from "@/models/EmailTemplate";
import ContactGroup from "@/models/ContactGroup";
import SmtpConfig from "@/models/SmtpConfig";
import EmailLog from "@/models/EmailLog";
import { handleError } from "@/lib/service_utils/errorHandler";
import { successResponse, errorResponse } from "@/lib/service_utils/response";

export async function POST(request) {
  try {
    // Validate API key using the simplified function
    const user = await validateApiKey(request);
    if (!user) {
      return errorResponse({
        message: "Invalid API key",
        status: 401,
      });
    }

    // Parse request body using parseRequest
    const { templateName, groupName, data = {} } = await parseRequest(request);

    // Validate required fields
    if (!templateName || !groupName) {
      return errorResponse({
        message:
          "Required fields missing: templateName and groupName are required",
        status: 400,
      });
    }

    // Get template
    const template = await EmailTemplate.findOne({
      user: user._id,
      name: { $regex: new RegExp(`^${templateName}$`, "i") },
    });

    if (!template) {
      return errorResponse({
        message: "Template not found",
        status: 404,
      });
    }

    // Get contact group
    const group = await ContactGroup.findOne({
      name: groupName,
      user: user._id,
    });

    if (!group) {
      return errorResponse({
        message: "Contact group not found",
        status: 404,
      });
    }

    // Check if there are any emails in the group
    if (!group.emails || group.emails.length === 0) {
      return errorResponse({
        message: "The contact group is empty",
        status: 400,
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
        message: "SMTP configuration not found",
        status: 404,
      });
    }
    const html =
      template.type === "static"
        ? template.body
        : applyTemplate(template.body, data);

    // Send emails directly instead of using a queue
    const results = [];
    const succeededEmails = [];
    const failedEmails = [];

    for (const email of group.emails) {
      try {
        const emailResult = await sendEmail(smtpConfig, {
          to: email,
          subject: template.subject,
          html,
          from: smtpConfig.username
        });
        
        // Log the email attempt
        await EmailLog.create({
          user: user._id,
          to: email,
          subject: template.subject,
          body: html,
          type: template.type,
          group: group._id,
          status: emailResult.messageId ? 'success' : 'failed',
          error: !emailResult.messageId ? 'Failed to send email' : null
        });

        results.push({
          email,
          success: !!emailResult.messageId,
          messageId: emailResult.messageId || null
        });

        if (emailResult.messageId) {
          succeededEmails.push(email);
        } else {
          failedEmails.push(email);
        }
      } catch (error) {
        // Log failed email
        await EmailLog.create({
          user: user._id,
          to: email,
          subject: template.subject,
          body: html,
          type: template.type,
          group: group._id,
          status: 'failed',
          error: error.message || 'Unknown error'
        });
        
        results.push({
          email,
          success: false,
          error: error.message || 'Unknown error'
        });
        failedEmails.push(email);
      }
    }

    return successResponse({
      message: "Group email processed",
      data: {
        results,
        emailsSent: succeededEmails.length,
        emailsFailed: failedEmails.length,
        templateName,
        groupName,
        usage: {
          sent: usageCheck.sent + succeededEmails.length,
          limit: usageCheck.limit,
          remaining: usageCheck.remaining,
        },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
