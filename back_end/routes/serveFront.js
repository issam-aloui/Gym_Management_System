const express = require("express");
const path = require("path");
const { serveHome, servePage, handleNotFound } = require("../controllers/viewController");
const {verifyJWT} = require("../middleware/Security");

const router = express.Router();

// Serve home or ad page based on authentication
router.get("/",serveHome);

// Dynamic route to serve any HTML page inside `/pages`
router.get("/:page" , (req, res) => {
  let page = req.params.page;
  servePage(page)(req, res);
});

// Serve static files correctly from `front_end`
router.use(express.static(path.resolve(__dirname, "../../front_end")));

// Handle incorrect routes
router.all("*", handleNotFound);

module.exports = router;
