const sgMail = require('@sendgrid/mail');

const sendEmail = async (to, subject, html, attachments = []) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.error("Missing SENDGRID_API_KEY in environment");
    throw new Error("Email configuration error");
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  // Map attachments from Resend format (Buffer content) to SendGrid format (Base64 content)
  const formattedAttachments = attachments.map(att => {
    let type = 'application/pdf'; 
    if (att.filename && (att.filename.endsWith('.jpg') || att.filename.endsWith('.jpeg'))) {
      type = 'image/jpeg';
    }

    return {
      content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
      filename: att.filename,
      type: type,
      disposition: 'attachment'
    };
  });

  const msg = {
    to,
    from: "Walmart Clone <prakyathm411@gmail.com>",
    subject,
    html,
    attachments: formattedAttachments,
  };

  try {
    const data = await sgMail.send(msg);
    console.log("Email sent successfully with SendGrid");
    return data;
  } catch (error) {
    console.error("Error sending email with SendGrid:", error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error("Failed to send email");
  }
};

module.exports = { sendEmail };