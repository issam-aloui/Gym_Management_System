const express = require("express");
const { signup, login, logout } = require("../controllers/auth-controller");
const { validateSignup, validateLogin } = require("../middleware/authchecker");
const { signupLimiter, loginLimiter } = require("../middleware/security");

const router = express.Router();

router.post("/signup", signupLimiter, validateSignup, signup);
router.post("/login", loginLimiter, validateLogin, login);
router.post("/logout", logout);

module.exports = router;
