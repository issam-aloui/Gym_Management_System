const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middleware/Security");
const { handleCreatePlan } = require("../controllers/paypalController");

router.post("/create-plan", verifyJWT, handleCreatePlan);

module.exports = router;
