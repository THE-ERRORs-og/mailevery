import nodemailer from 'nodemailer';

/**
 * Sends an email using the provided SMTP configuration
 * @param {Object} smtpConfig - SMTP configuration for the email provider
 * @param {Object} emailDetails - Details of the email to be sent
 * @returns {Promise<Object>} - Information about the sent email
 */
export async function sendEmail(smtpConfig, emailDetails) {
  const { to, subject, html, from, attachments = [] } = emailDetails;
  
  // Create transporter with user's SMTP settings
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.username,
      pass: smtpConfig.password,
    },
  });
  
  // Set default sender if not provided
  const sender = from || smtpConfig.username;
  
  // Send email
  const info = await transporter.sendMail({
    from: sender,
    to,
    subject,
    html,
    attachments,
  });
  
  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  };
}

/**
 * Applies template data to an HTML template string
 * @param {String} template - HTML template with placeholders like {{variableName}}
 * @param {Object} data - Key-value pairs to inject into the template
 * @returns {String} - The processed HTML with replaced values
 */
export function applyTemplate(template, data = {}) {
  let html = template;
  
  // Replace all occurrences of {{variableName}} with corresponding values
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    html = html.replace(regex, value || '');
  });
  
  return html;
}