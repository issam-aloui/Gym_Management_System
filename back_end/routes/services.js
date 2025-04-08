const express = require("express");
const {sendcode,verifycode} = require("../controllers/servicesController")
const router = express.Router();

router.post("/request-verification", sendcode);

router.post("/verify-code", verifycode);

module.exports = router;