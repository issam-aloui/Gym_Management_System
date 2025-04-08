const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

exports.serveHome = (req, res) => {
  const token = req.cookies.token; // Get the token from cookies
  const filePath = token
    ? "../../front_end/pages/home-user.html"
    : "../../front_end/pages/ad.html";

  try {
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET);
    }
    return res.sendFile(path.resolve(__dirname, filePath));
  } catch (err) {
    logger.error("Invalid token: Redirecting to ad page");
    return res.sendFile(path.resolve(__dirname, "../../front_end/pages/ad.html"));
  }
};

exports.servePage = (page) => (req, res) => {
  if (!page.endsWith(".html")) {
    page += ".html"; // Ensure .html extension
  }

  const filePath = path.resolve(__dirname, `../../front_end/pages/${page}`);

  // Check if the file exists before sending
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      logger.warn(`Page not found: ${page}`);
      return res.status(404).send("Page not found");
    }
    res.sendFile(filePath);
  });
};

exports.handleNotFound = (req, res) => {
  res.status(404).send("Error: Incorrect URL");
};
