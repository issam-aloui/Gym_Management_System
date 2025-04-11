const rateLimit = require("express-rate-limit");

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
  windowMs: 10 * 60 * 1000, //10 minutes
  max: 3, 
  message: { error: "Too many code sending attempts. Please try again later." },
  headers: true,
});

const jwt = require("jsonwebtoken");

exports.verifyJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.redirect('/');
    return res.status(401).json({ message: "Unauthorized: No token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.redirect('/');
      return res.status(401).json({ message: "Unauthorized: Token expired or invalid" });
    }

    req.user = decoded; 
    
    const expiresIn = 10 * 60; 
    const currentTime = Math.floor(Date.now() / 1000); 

    if (decoded.exp - currentTime < expiresIn) {
      const newToken = jwt.sign(
        { id: decoded.id, username: decoded.username, role: decoded.role },
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

