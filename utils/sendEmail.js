const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();


// Function to send login credentials when a new user is created
const sendLoginCredentials = async ({ to,email, name, phone, password }) => {
  try {
    // SMTP Transporter (Office365)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // TLS (STARTTLS)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Mail Options
    const mailOptions = {
      from: '"Mediversal Support" <no-reply@mediversal.in>',
      to,
      subject: 'Your Login Credentials - Mediversal',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0066cc;">Welcome to Mediversal</h2>
          <p>Dear ${name}</p>
          <p>Your login credentials are as follows:</p>
          <table style="border-collapse: collapse;">
            <tr><td><strong>Username:</strong></td><td>${name}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>${phone}</td></tr>
            <tr><td><strong>Password:</strong></td><td>${password}</td></tr>
          </table>
          <p>You can log in using the following link:</p>
          <p><a href="https://admin.mediversal.in/login" target="_blank" style="color: #0066cc;">https://admin.mediversal.in/login</a></p>
          
          <p>Regards,<br>Mediversal Support Team</p>
        </div>
      `,
    };

    // Send Email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent: " + info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

// Function to send password reset request to admin
const sendPasswordResetRequestToAdmin = async ({to, userId, name, email, phone }) => {
  try {
    // SMTP Transporter (Office365)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false, // TLS (STARTTLS)
      auth: {
        user: to,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email body to admin with user details
    const mailOptions = {
      from: '"Mediversal Support" <no-reply@mediversal.in>',
      to,
      subject: 'Password Reset Request - Mediversal',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0066cc;">Password Reset Request</h2>
          <p>An employee has requested to reset their login password. Please find the details below:</p>
          
          <table style="border-collapse: collapse;">
            <tr><td><strong>User ID:</strong></td><td>${userId}</td></tr>
            <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>${phone}</td></tr>
          </table>

          <p>You can reset their password from the admin dashboard:</p>
          <p><a href="https://admin.mediversal.in/reset-password/${userId}" target="_blank" style="color: #0066cc;">Reset Password</a></p>
          
          <p>Regards,<br>${name}</p>
        </div>
      `,
    };

    // Send Email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset request email sent to admin:", info.response);
  } catch (error) {
    console.error("❌ Error sending password reset email to admin:", error);
  }
};

// Function to send updated login credentials to the user
const sendUpdatedLoginCredentials = async ({ to, email, name, phone, password, updatedFields = [] }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // TLS (STARTTLS)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Use .env in production
      },
    });

    const mailOptions = {
      from: `"Mediversal Support" <${"no-reply@mediversal.in"}>`,
      to,
      subject: 'Your Updated Account Information - Mediversal',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0066cc;">Account Information Updated</h2>
          <p>Dear ${name},</p>
          <p>The following parts of your account have been updated:</p>
          
          <ul>
            ${Array.isArray(updatedFields) && updatedFields.length > 0 
              ? updatedFields.map(field => `<li><strong>${field}</strong></li>`).join('')
              : '<li><em>No specific fields listed</em></li>'}
          </ul>

          <p>Here are your current login details:</p>
          <table style="border-collapse: collapse;">
            <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>${phone}</td></tr>
            <tr><td><strong>Password:</strong></td><td>${password}</td></tr>
          </table>

          <p>You can log in at:</p>
          <p><a href="https://admin.mediversal.in/login" target="_blank">https://admin.mediversal.in/login</a></p>

          <p>Regards,<br>Mediversal Support Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent: " + info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

module.exports = {
  sendLoginCredentials,
  sendPasswordResetRequestToAdmin,
  sendUpdatedLoginCredentials,
};