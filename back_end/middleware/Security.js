const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const path = require("node:path");

// Rate Limiters
exports.signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many signup attempts. Please try again later." },
  headers: true,
});

exports.sendgLimitter = rateLimit({
  windowMs: 100 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests attempts. Please try again later." },
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
exports.verifyJWT = (request, response, next) => {
  const token = request.cookies.token;

  if (!token) {
    return response.redirect("/");
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      response.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });
      return response.redirect("/");
    }

    request.user = decoded;

    // Refresh token if less than 10 mins left
    const expiresIn = 10 * 60; // 10 minutes
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp - currentTime < expiresIn) {
      const newToken = jwt.sign(
        {
          id: decoded.id,
          Oid: decoded.Oid,
          username: decoded.username,
          role: decoded.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      response.cookie("token", newToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });
    }

    next();
  });
};

// Admin-only access middleware
exports.verifyAdmin = (request, response, next) => {
  if (request.user?.role !== "admin") {
    return response
      .status(403)
      .json({ message: "Access denied. Admins only." });
  }
  next();
};

exports.verifymember = async (request, response, next) => {
  const { id, thing } = request.params;
  const publicThings = ["reviews", "annoucements"];

  // Only protect pages where 'thing' is missing or it's one of the publicThings
  if (thing && !publicThings.includes(thing)) {
    return next(); // e.g., thing = "join" → skip check
  }

  // Proceed with token verification
  const token = request.cookies.token;
  if (!token) {
    return response
      .status(401)
      .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid || decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return response.status(401).json({ message: "User not found." });
    }

    const isMember = user.Gymsjoined?.some((gymId) => gymId.toString() === id);
    if (!isMember) {
      return response
        .status(403)
        .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
    }

    request.user = decoded;
    next();
  } catch {
    return response
      .status(401)
      .sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
  }
};
