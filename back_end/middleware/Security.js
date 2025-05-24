const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const path = require("path");


// Rate Limiters
exports.signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many signup attempts. Please try again later." },
  headers: true,
});

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Please try again later." },
  headers: true,
});

exports.codeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { error: "Too many code sending attempts. Please try again later." },
  headers: true,
});

// JWT Middleware
exports.verifyJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });
      return res.redirect("/");
    }

    req.user = decoded;

    // Refresh token if less than 10 mins left
    const expiresIn = 10 * 60; // 10 minutes
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp - currentTime < expiresIn) {
      const newToken = jwt.sign(
        {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("token", newToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });
    }

    next();
  });
};

// Admin-only access middleware
exports.verifyAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// Gym member access middleware
exports.verifymember = async (req, res, next) => {
  const { id,thing } = req.params;
  const publicThings = ["reviews", "annoucements"];
 if (!thing || publicThings.includes(thing)) {

  const token = req.cookies.token;

  if (!id || !token) {
    return res.status(400).json({ message: "Gym ID and token are required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    const isMember = user.Gymsjoined?.some(gymId => gymId.toString() === id);

    if (!isMember) {
    return res
  .status(403)
  .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));

    }

    req.user = decoded;
    next();
  } catch (err) {

return res
  .status(403)
  .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));


  }
}
else {
  next();
}
};
