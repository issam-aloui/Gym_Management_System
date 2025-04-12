const express = require("express");
const { handleCheckin } = require("../controllers/checkinController");
const router = express.Router();

router.get("/checkin", handleCheckin); // Accessed via QR code scan

module.exports = router;