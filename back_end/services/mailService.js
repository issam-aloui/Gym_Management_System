const nodemailer = require("nodemailer");
const express = require("express");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const logger = require("../utils/logger");
dotenv.config();

// Function to send email
async function sendEmail(to, subject, text, emailTemplate) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODE_MAILER_USER, // Your Gmail email address
      pass: process.env.NODE_MAILER_PASS, // Your Gmail password or App Password
    },
  });

  const mailOptions = {
    from: process.env.NODE_MAILER_USER, // Your email
    to: to, // Recipient's email
    subject: subject, // Subject of the email
    text: text,
    html: emailTemplate, // HTML content of the email
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ` + info.response);
    return { status: 200, message: "Email sent successfully" };
  } catch (error) {
    console.log("Error sending email:", error);
    return { status: 500, message: "Error sending email" };
  }
}

// Function to send email verification with a random code
async function sendEmailVerification(username, to) {
  const code = [...Array(6)]
    .map(() => Math.random().toString(36).charAt(2).toUpperCase())
    .join(""); // Generate a random 6-character code

  // Read and replace placeholders in the email template
  let template = fs.readFileSync(
    path.join(__dirname, "../templates/verification.html"),
    "utf-8"
  );
  template = template.replace("user", username); // Replace placeholder with actual username
  template = template.replace("123456", code); // Replace placeholder with actual code

  // Send the email and await the result
  const info = await sendEmail(to, "Email Verification", "", template);

  // If the email was sent successfully, return the code
  if (info.status === 200) {
    return { status: 200, code: code };
  }

  // If there was an issue, return the error response
  return info;
}
module.exports = {
  sendEmail,
  sendEmailVerification,
};
