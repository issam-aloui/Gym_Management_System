const express = require("express");
const cookieParser = require("cookie-parser");
const { createGym, getGyms } = require("../controllers/gymController");

const router = express.Router();

router.use(cookieParser());
router.use(express.json());

router.post("/creategym", createGym);
router.get("/getgyms", getGyms);

module.exports = router;
