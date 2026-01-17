// File: src/config/email.js
const nodemailer = require("nodemailer");
const { env } = require("./env");

function isEmailConfigured() {
  return !!(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS);
}

function createTransporter() {
  // secure true عادة لمنفذ 465
  const secure = env.SMTP_PORT === 465;

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
}

async function sendEmail({ to, subject, text, html }) {
  if (!isEmailConfigured()) {
    throw new Error("Email service is not configured. Please set SMTP_* in .env");
  }

  const transporter = createTransporter();

  return transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    html
  });
}

module.exports = { sendEmail, isEmailConfigured };
