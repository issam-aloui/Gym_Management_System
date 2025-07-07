const { sendEmailVerification, sendEmail } = require("../services/mail-service");
const validator = require("validator");
const { uploadImage } = require("../services/cloud-service");

const verificationCodes = new Map(); // ✅ safer than plain object

// Send initial verification code
exports.sendcode = async (request, response) => {
  const { username, email } = request.body;

  if (!validator.isEmail(email)) {
    return response.status(400).json({ error: "Invalid email" });
  }

  const result = await sendEmailVerification(username, email);

  if (result.status === 200) {
    verificationCodes.set(email, {
      code: result.code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });
    return response.status(200).json({ message: "Code sent to email" });
  }

  return response.status(500).json({ message: "Failed to send email" });
};

// Verify the received code
exports.verifycode = async (request, response) => {
  const { email, code } = request.body;

  if (!validator.isEmail(email)) {
    return response.status(400).json({ error: "Invalid email" });
  }

  const record = verificationCodes.get(email);

  if (!record || Date.now() > record.expiresAt) {
    return response.status(400).json({ message: "Code expired or not found" });
  }

  if (record.code !== code) {
    return response.status(401).json({ message: "Incorrect code" });
  }

  return response.status(200).json({ message: "Code verified successfully" });
};

// Resend code if expired
exports.resendcode = async (request, response) => {
  const { username, email } = request.body;

  if (!validator.isEmail(email)) {
    return response.status(400).json({ error: "Invalid email" });
  }

  const record = verificationCodes.get(email);

  if (!record || Date.now() > record.expiresAt) {
    const result = await sendEmailVerification(username, email);
    if (result.status === 200) {
      verificationCodes.set(email, {
        code: result.code,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
      return response.status(200).json({ message: "Code resent to email" });
    } else {
      return response.status(500).json({ message: "Failed to resend code" });
    }
  }

  return response.status(429).json({
    message:
      "You already have a valid code. Please wait before requesting again.",
  });
};

// Upload image securely
exports.uploadimg = async (request, response) => {
  if (!request.file) {
    return response.status(400).send("No file uploaded.");
  }

  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(request.file.mimetype)) {
    return response.status(400).json({ error: "Invalid file type" });
  }

  try {
    const result = await uploadImage(
      request.file.buffer,
      request.file.originalname
    );
    return response.status(200).json({
      message: "Image uploaded successfully!",
      data: result,
    });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
};
