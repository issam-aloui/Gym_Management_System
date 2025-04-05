const rateLimit = require("express-rate-limit");

// Rate limiter for signup requests
exports.signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // Limit each IP to 5 signup requests per window
  message: { error: "Too many signup attempts. Please try again later." }, // Response message for rate limit
  headers: true, // Include rate limit headers in the response
});

// Rate limiter for login requests
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Limit each IP to 10 login requests per window
  message: { error: "Too many login attempts. Please try again later." }, // Response message for rate limit
  headers: true, // Include rate limit headers in the response
});

const jwt = require("jsonwebtoken");

// Middleware to verify JSON Web Token (JWT)
exports.verifyJWT = (req, res, next) => {
  const token = req.cookies.token; // Retrieve token from cookies
  if (!token) {
    // If no token is found, return unauthorized response
    return res.status(401).json({ message: "Unauthorized: No token" });
  }

  // Verify the token using the secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // If token is invalid or expired, return unauthorized response
      return res.status(401).json({ message: "Unauthorized: Token expired or invalid" });
    }

    req.user = decoded; // Attach decoded token payload to the request object

    // Check if the token is about to expire (less than 10 minutes remaining)
    const expiresIn = 10 * 60; // 10 minutes in seconds
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    if (decoded.exp - currentTime < expiresIn) {
      // If token is close to expiration, issue a new token
      const newToken = jwt.sign(
        { id: decoded.id, username: decoded.username, role: decoded.role }, // Payload
        process.env.JWT_SECRET, // Secret key
        { expiresIn: "1h" } // New token expiration time
      );

      // Set the new token in the cookies
      res.cookie("token", newToken, {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: true, // Ensure the cookie is sent over HTTPS
        sameSite: "Strict", // Restrict cross-site cookie sharing
      });
    }

    next(); // Proceed to the next middleware or route handler
  });
};
