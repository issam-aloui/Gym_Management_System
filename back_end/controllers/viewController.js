const path = require("path");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

exports.serveHome = (req, res) => {
  let token = req.cookies.token; // Get the token from cookies

  if (!token) {
    return res.sendFile(path.resolve(__dirname, "../../front_end/pages/ad.html"));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.sendFile(path.resolve(__dirname, "../../front_end/pages/home.html"));
  } catch (err) {
    logger.error("Couldn't serve frontend: Invalid token");
    return res.sendFile(path.resolve(__dirname, "../../front_end/pages/ad.html"));
  }
};

exports.servePage = (page) => (req, res) => {
  res.sendFile(path.resolve(__dirname, `../../front_end/pages/${page}`));
};

exports.handleNotFound = (req, res) => {
  res.status(404).send("Error: Incorrect URL");
};
