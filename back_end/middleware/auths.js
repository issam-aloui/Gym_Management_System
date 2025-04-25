const jwt = require("jsonwebtoken");

exports.getuserfromjwt = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.redirect("/ad");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized");
  }
};

