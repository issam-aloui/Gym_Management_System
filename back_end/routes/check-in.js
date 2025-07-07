const express = require("express");
const { handleCheckin } = require("../controllers/checkin-controller");
const router = express.Router();
const { verifyJWT } = require("../middleware/security");

router.post("/checkin", verifyJWT, handleCheckin);

module.exports = router;
