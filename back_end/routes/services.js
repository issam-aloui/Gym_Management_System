const express = require("express");
const multer = require('multer');
const upload = multer(); 
const { uploadimg } = require('../controllers/servicesController');


const {
  sendcode,
  verifycode,
  resendcode,
} = require("../controllers/servicesController");
const { codeLimiter } = require("../middleware/Security");
const router = express.Router();

router.post("/request-verification", codeLimiter, sendcode);

router.post("/verify-code", verifycode);

router.post("/resend-code", resendcode);

router.post('/upload', upload.single('image'), uploadimg);


module.exports = router;
