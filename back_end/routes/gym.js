const express = require("express");
const cookieParser = require("cookie-parser");
const {
  createGym,
  getGyms,
  getgym,
  leaveGym,
  changegymname,
  changegymemail,
  changegymphone,
  changegympriceBymounth,
  changegympass,
} = require("../controllers/gymController");
const { validateGym } = require("../middleware/authchecker");
const { verifyJWT } = require("../middleware/Security");

const router = express.Router();

router.use(cookieParser());
router.use(express.json());

router.post("/creategym", verifyJWT, validateGym, createGym);
router.get("/:gymId/leave", verifyJWT, leaveGym);
router.get("/getgyms", verifyJWT, getGyms);
router.get("/getgym", verifyJWT, getgym);

// Update gym data routes
router.put("/:gymid/name", verifyJWT, changegymname);
router.put("/:gymid/email", verifyJWT, changegymemail);
router.put("/:gymid/phone", verifyJWT, changegymphone);
router.put("/:gymid/price", verifyJWT, changegympriceBymounth);
router.put("/:gymid/password", verifyJWT, changegympass);

module.exports = router;
