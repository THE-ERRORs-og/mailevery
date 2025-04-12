import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ApiKey from '@/models/ApiKey';
import User from '@/models/User';
import SmtpConfig from '@/models/SmtpConfig';
import EmailTemplate from '@/models/EmailTemplate';
import EmailLog from '@/models/EmailLog';
import { createTransporter, sendEmail } from '@/lib/mailer';

export async function POST(req) {
  try {
    await connectDB();

    const { to, templateId, variables } = await req.json();

    if (!to || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the template
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Get user from template
    const user = await User.findById(template.user);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get SMTP config
    const smtpConfig = await SmtpConfig.findById(user.smtp);
    if (!smtpConfig) {
      return NextResponse.json(
        { error: 'SMTP configuration not found' },
        { status: 404 }
      );
    }

    // Replace variables in template
    let subject = template.subject;
    let body = template.body;
    
    if (template.type === 'dynamic' && variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{${key}}`, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      });
    }

    // Create transporter and send email
    const transporter = await createTransporter(smtpConfig);
    const result = await sendEmail(transporter, {
      from: smtpConfig.username,
      to,
      subject,
      text: body,
    });

    // Log the email attempt
    await EmailLog.create({
      user: user._id,
      template: template._id,
      to,
      subject,
      body,
      type: template.type,
      status: result.success ? "success" : "failed",
      error: result.error || null,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 