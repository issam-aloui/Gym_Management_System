const express = require("express");
const router = express.Router();
const { handleCreatePlan } = require("../controllers/paypalController");

router.post("/create-plan", handleCreatePlan);

module.exports = router;
