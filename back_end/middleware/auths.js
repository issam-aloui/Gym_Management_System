const jwt = require("jsonwebtoken");

exports.getuserfromjwt = (request, response, next) => {
  const token = request.cookies.token || request.headers.authorization?.split(" ")[1];
  if (!token) return response.redirect("/ad");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded; 
    next();
  } catch {
    return response.status(401).send("Unauthorized");
  }
};

