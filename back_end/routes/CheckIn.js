const express = require("express");
const { handleCheckin } = require("../controllers/checkinController");
const router = express.Router();
const { verifyJWT } = require("../middleware/Security");


router.post("/checkin",verifyJWT, handleCheckin); 

module.exports = router;