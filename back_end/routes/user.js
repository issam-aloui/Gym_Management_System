const express = require("express");
const cookieParser = require("cookie-parser");
const {
  getUsername,
  changeUsername,
  changeEmail,
  changePassword,
  deleteAccount,
} = require("../controllers/accountController");

const router = express.Router();

router.use(cookieParser());
router.use(express.json());

router.get("/username", getUsername);
router.put("/changename", changeUsername);
router.put("/changeemail", changeEmail);
router.put("/changepassword", changePassword);
router.delete("/accountdeletion", deleteAccount);

module.exports = router;
