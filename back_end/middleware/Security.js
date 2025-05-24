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

// Fixed Gym member access middleware
exports.verifymember = async (req, res, next) => {
  const { id, thing } = req.params;
  const publicThings = ["reviews", "annoucements"];

  console.log("verifymember middleware - params:", { id, thing });

  // If no specific thing is requested or it's a public thing, allow access
  if (!thing || publicThings.includes(thing)) {
    console.log("Public access or no specific thing requested");
    return next();
  }

  // For protected routes, verify membership
  const token = req.cookies.token;
  
  if (!id) {
    console.log("No gym ID provided");
    return res.status(400).json({ message: "Gym ID is required." });
  }

  if (!token) {
    console.log("No token provided");
    return res.status(401).sendFile(
      path.resolve(__dirname, "../../front_end/pages/error.html")
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", { userId: decoded.id || decoded.Oid });

    // Use the correct field name from your JWT payload
    const userId = decoded.id || decoded.Oid;
    
    if (!userId) {
      console.log("No user ID found in token");
      return res.status(401).json({ message: "Invalid token format." });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      console.log("User not found in database:", userId);
      return res.status(401).json({ message: "User not found." });
    }

    console.log("User found:", { 
      userId: user._id, 
      gymsJoined: user.Gymsjoined 
    });

    // Check if user is a member of this gym
    const isMember = user.Gymsjoined?.some(gymId => {
      const gymIdStr = gymId.toString();
      console.log("Comparing gym IDs:", { gymIdStr, requestedId: id });
      return gymIdStr === id;
    });

    console.log("Membership check result:", isMember);

    if (!isMember) {
      console.log("User is not a member of this gym");
      return res.status(403).sendFile(
        path.resolve(__dirname, "../../front_end/pages/error.html")
      );
    }

    // User is a member, allow access
    req.user = decoded;
    console.log("Access granted - user is a member");
    next();

  } catch (err) {
    console.error("Error in verifymember middleware:", err);
    
    if (err.name === 'JsonWebTokenError') {
      console.log("JWT verification failed");
      return res.status(401).sendFile(
        path.resolve(__dirname, "../../front_end/pages/error.html")
      );
    }
    
    if (err.name === 'TokenExpiredError') {
      console.log("JWT expired");
      return res.status(401).sendFile(
        path.resolve(__dirname, "../../front_end/pages/error.html")
      );
    }

    // Database or other errors
    console.log("Database or other error occurred");
    return res.status(500).sendFile(
      path.resolve(__dirname, "../../front_end/pages/error.html")
    );
  }
};