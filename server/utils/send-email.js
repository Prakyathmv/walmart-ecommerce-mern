const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY in .env");
    throw new Error("Email configuration error");
  }

  try {
    const data = await resend.emails.send({
      from: "Walmart Clone <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    console.log("Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendEmail };