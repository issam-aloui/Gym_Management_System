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


router.get("/", serveHome);

router.get("/home-user", serveHome);

router.get("/gym/:id?/:thing?",verifyJWT ,serveGymPage);

router.get("/:page", (req, res) => {
  let { page } = req.params;


  if (!page.endsWith(".html")) {
    page += ".html";
  }

  servePage(page)(req, res);
});


router.use(express.static(path.resolve(__dirname, "../../front_end")));

// 404 fallback
router.all("*", handleNotFound);

module.exports = router;
