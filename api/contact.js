// Vercel serverless function — handles POST /api/contact
// Sends the submission straight to your inbox via Gmail SMTP.
// Requires two environment variables set in the Vercel dashboard:
//   GMAIL_EMAIL         — the Gmail address to send from
//   GMAIL_APP_PASSWORD  — a Gmail App Password (not your normal password)
// See: https://myaccount.google.com/apppasswords

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, email, phone, company, subject, message } = req.body || {};

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: 'musaratechnologies@gmail.com',
      replyTo: email,
      subject: `New Contact Form Submission: ${subject}`,
      text:
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Phone: ${phone || ''}\n` +
        `Company: ${company || ''}\n\n` +
        `Message:\n${message}`
    });

    return res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Email sending failed:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
};
