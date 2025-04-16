const express = require("express");
const path = require("path");
const {
  serveHome,
  servePage,
  handleNotFound,
  serveGymPage
} = require("../controllers/viewController");
const { verifyJWT } = require("../middleware/Security");

const router = express.Router();

// Home (based on JWT)
router.get("/", serveHome);

router.get("/home-user", serveHome);

// Gym-related pages
router.get("/gym/:thing/:id?", verifyJWT, serveGymPage);

// Static HTML pages (home-user.html, ad.html, etc.)
router.get("/:page",  (req, res) => {
  servePage(req.params.page)(req, res);
});

// Serve static files like CSS, JS, images
router.use(express.static(path.resolve(__dirname, "../../front_end")));

// 404 fallback
router.all("*", handleNotFound);

module.exports = router;
