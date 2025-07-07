const express = require("express");
const multer = require("multer");
const upload = multer();
const { uploadimg } = require("../controllers/services-controller");

const {
  sendcode,
  verifycode,
  resendcode,
} = require("../controllers/services-controller");
const { codeLimiter } = require("../middleware/security");
const router = express.Router();

router.post("/request-verification", codeLimiter, sendcode);

router.post("/verify-code", verifycode);

router.post("/resend-code", resendcode);

router.post("/upload", upload.single("image"), uploadimg);

module.exports = router;
