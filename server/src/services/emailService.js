/**
 * emailService.js — Nodemailer SMTP wrapper.
 * All credentials come from environment variables — never hardcoded.
 */
const nodemailer = require("nodemailer");

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  return _transporter;
}

/**
 * sendOtpEmail — sends a 6-digit OTP to the recipient.
 * The OTP is passed in; this service only sends — it does not generate it.
 * @param {string} to   recipient email address
 * @param {string} otp  plaintext 6-digit OTP (logged NOWHERE after this point)
 */
async function sendOtpEmail(to, otp) {
  const transporter = getTransporter();

  const maskedEmail = to.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(b.length) + c);

  const mailOptions = {
    from:    process.env.EMAIL_FROM || `"RoomieMatch" <no-reply@roomiematch.com>`,
    to,
    subject: "Your RoomieMatch Verification Code",
    text: `
RoomieMatch — Verification Code

Your one-time verification code is:

  ${otp}

This code expires in 5 minutes. Do not share it with anyone.

If you did not request this code, please ignore this email.

— The RoomieMatch Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Manrope', Arial, sans-serif; background: #f6fafe; margin: 0; padding: 0; }
    .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; border: 1px solid #c2c7d0; overflow: hidden; }
    .header { background: #325e8c; padding: 28px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .body { padding: 32px; text-align: center; }
    .otp-box { display: inline-block; background: #f0f4f8; border: 2px solid #325e8c; border-radius: 10px; padding: 16px 40px; margin: 20px 0; }
    .otp-code { font-size: 40px; font-weight: 700; letter-spacing: 10px; color: #325e8c; }
    .note { font-size: 13px; color: #727780; margin-top: 16px; line-height: 1.6; }
    .footer { background: #f0f4f8; padding: 16px 32px; text-align: center; font-size: 11px; color: #727780; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 RoomieMatch</h1>
    </div>
    <div class="body">
      <p style="font-size:16px; color:#171c1f; font-weight:600;">Verify Your Identity</p>
      <p style="font-size:14px; color:#42474f;">Enter the following code to complete your sign-in.</p>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
      </div>
      <p class="note">This code expires in <strong>5 minutes</strong>.<br/>Do not share this code with anyone.</p>
    </div>
    <div class="footer">
      If you did not request this code, you can safely ignore this email.<br/>
      &copy; ${new Date().getFullYear()} RoomieMatch. All rights reserved.
    </div>
  </div>
</body>
</html>
    `.trim()
  };

  await transporter.sendMail(mailOptions);
  // Intentionally NOT logging the OTP
  console.log(`[Email] OTP sent to ${maskedEmail}`);
}

module.exports = { sendOtpEmail };
