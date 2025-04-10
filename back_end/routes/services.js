const express = require("express");
const {sendcode,verifycode,resendcode} = require("../controllers/servicesController")
const {codeLimiter} = require("../middleware/Security");
const router = express.Router();

router.post("/request-verification",codeLimiter ,sendcode);

router.post("/verify-code" ,verifycode);

router.post("/resend-code" ,resendcode);

module.exports = router;