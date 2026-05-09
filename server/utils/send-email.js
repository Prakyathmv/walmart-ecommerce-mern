const { Resend } = require('resend');

const sendEmail = async (to, subject, html, attachments = []) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY in environment");
    throw new Error("Email configuration error");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Format attachments for Resend
  const formattedAttachments = attachments.map(att => {
    return {
      content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
      filename: att.filename,
    };
  });

  const payload = {
    from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
    to: Array.isArray(to) ? to : [to],
    subject: subject,
    html: html,
  };

  if (formattedAttachments && formattedAttachments.length > 0) {
    payload.attachments = formattedAttachments;
  }

  try {
    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error(error.message || "Failed to send email");
    }

    console.log("Email sent successfully with Resend:", data.id);
    return data;
  } catch (error) {
    console.error("Error sending email with Resend:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendEmail };