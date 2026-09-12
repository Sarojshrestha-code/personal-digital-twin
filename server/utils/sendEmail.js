const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (email, token) => {
  try {
    // Test SMTP connection
    await transporter.verify();

    console.log("Email server connection successful.");

    const verificationUrl =
      `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: `"AI-Twin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your AI-Twin account",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        ">

          <h2 style="color: #2563eb;">
            Welcome to AI-Twin
          </h2>

          <p>
            Thank you for creating your AI-Twin account.
          </p>

          <p>
            Please verify your email address to activate your account.
          </p>

          <a
            href="${verificationUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              margin: 15px 0;
            "
          >
            Verify Email
          </a>

          <p style="color: #6b7280; font-size: 13px;">
            This verification link will expire after 24 hours.
          </p>

          <p style="color: #6b7280; font-size: 13px;">
            If you did not create this account, you can ignore this email.
          </p>

        </div>
      `,
    });

    console.log(`Verification email sent to ${email}`);

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw error;
  }
};

module.exports = sendVerificationEmail;