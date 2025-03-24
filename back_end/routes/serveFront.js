const express = require("express");
const path = require("path");
const { serveHome, servePage, handleNotFound } = require("../controllers/viewController");

const router = express.Router();

// Serve home or ad page based on authentication
router.get("/", serveHome);

// Serve static files from front_end
router.use(express.static(path.join(__dirname, "../../front_end")));

// Define routes for specific pages
router.get("/signup", servePage("signup.html"));
router.get("/login", servePage("login.html"));
router.get("/datachange", servePage("datachange.html"));
router.get("/accountdeletion", servePage("accountdeletion.html"));
router.get("/creategym", servePage("creategym.html"));
router.get("/joingym", servePage("joingym.html"));

// Handle incorrect routes
router.all("*", handleNotFound);

module.exports = router;
