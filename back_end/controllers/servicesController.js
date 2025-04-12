const { sendEmailVerification, sendEmail } = require("../services/mailService"); // adjust path as needed
const verificationCodes = {}; // In-memory storage

exports.sendcode = async (req, res) => {
  const { username, email } = req.body;
  const result = await sendEmailVerification(username, email);

  if (result.status === 200) {
    verificationCodes[email] = {
      code: result.code,
      expiresAt: Date.now() + 10 * 60 * 1000, // expires in 10 mins
    };
    return res.status(200).json({ message: "Code sent to email" });
  }

  return res.status(500).json({ message: "Failed to send email" });
};

exports.verifycode = async (req, res) => {
  const { email, code } = req.body;
  const record = verificationCodes[email];

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ message: "Code expired or not found" });
  }

  if (record.code !== code) {
    return res.status(401).json({ message: "Incorrect code" });
  }

  // Code correct — let frontend proceed
  return res.status(200).json({ message: "Code verified successfully" });
};

exports.resendcode = async (req, res) => {

  const { username, email } = req.body;
  const record = verificationCodes[email];

  if (!record || Date.now() > record.expiresAt) {
    const result = await sendEmailVerification(username, email);
    if (result.status === 200) {
      verificationCodes[email] = {
        code: result.code,
        expiresAt: Date.now() + 10 * 60 * 1000,
      };
      return res.status(200).json({ message: "Code resent to email" });
    } else {
      return res.status(500).json({ message: "Failed to resend code" });
    }
  }

  // 🛑 Respond even if the code hasn't expired
  return res.status(429).json({ message: "You already have a valid code. Please wait before requesting again." });
};



exports.uploadimg = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const result = await uploadImage(req.file.buffer, req.file.originalname); 
    res.status(200).json({ message: 'Image uploaded successfully!', data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
