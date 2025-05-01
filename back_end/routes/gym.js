const express = require("express");
const cookieParser = require("cookie-parser");
const { createGym, getGyms , getgym } = require("../controllers/gymController");
const { validateGym } = require("../middleware/authchecker");
const { verifyJWT } = require("../middleware/Security");

const router = express.Router();

router.use(cookieParser());
router.use(express.json());

router.post("/creategym",verifyJWT,validateGym, createGym);

router.get("/getgyms",verifyJWT ,getGyms);

router.get("/getgym",verifyJWT ,getgym);


module.exports = router;
