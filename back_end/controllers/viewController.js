const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// Serve the home page based on the presence of a valid token
exports.serveHome = (req, res) => {
  const token = req.cookies.token; // Get the token from cookies
  const filePath = token
    ? "../../front_end/pages/home.html" // If token exists, serve the home page
    : "../../front_end/pages/ad.html"; // Otherwise, serve the ad page

  try {
    if (token) {
      // Verify the token using the secret key
      jwt.verify(token, process.env.JWT_SECRET);
    }
    // Send the appropriate file
    return res.sendFile(path.resolve(__dirname, filePath));
  } catch (err) {
    // Log the error and redirect to the ad page if the token is invalid
    logger.error("Invalid token: Redirecting to ad page");
    return res.sendFile(path.resolve(__dirname, "../../front_end/pages/ad.html"));
  }
};

// Serve a specific page dynamically
exports.servePage = (page) => (req, res) => {
  if (!page.endsWith(".html")) {
    page += ".html"; // Ensure the file has a .html extension
  }

  const filePath = path.resolve(__dirname, `../../front_end/pages/${page}`);

  // Check if the file exists before sending it
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Log a warning if the page is not found
      logger.warn(`Page not found: ${page}`);
      return res.status(404).send("Page not found");
    }
    // Send the requested file
    res.sendFile(filePath);
  });
};

// Handle requests to undefined routes
exports.handleNotFound = (req, res) => {
  res.status(404).send("Error: Incorrect URL"); // Send a 404 error response
};
