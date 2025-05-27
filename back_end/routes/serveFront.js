const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  serveowner,
  serveHome,
  servePage,
  handleNotFound,
  serveGymPage,
  serveSettings,
  serveSearch,
} = require("../controllers/viewController");
const { verifyJWT, verifymember } = require("../middleware/Security");
const { getuserfromjwt } = require("../middleware/auths");
const Announcement = require("../models/Announcement");
const router = express.Router();

router.get("/", getuserfromjwt, serveHome);

router.get("/home-user", getuserfromjwt, serveHome);

router.get("/gym/:id?/:thing?", verifyJWT, verifymember, serveGymPage);

router.get("/owner/:thing", getuserfromjwt, serveowner);
router.get("/settings", getuserfromjwt, serveSettings);
router.get("/results", getuserfromjwt, serveSearch);

router.get("/:page", async (req, res) => {
  let { page } = req.params;
  
  if (page == "classes") {
   const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    const user = await User.findById(userId).populate("Gymsjoined");
    if (!user) return res.status(401).json({ message: "User not found" });
    const joinedGyms = user.Gymsjoined || [];
    const announcements = await Announcement.find({ gym: { $in: joinedGyms } });

    const gyms = user.Gymsjoined;

    return res.render("classes", {
      gyms,
      role: decoded.role,
      username: decoded.username,
      LA: announcements,
      joinedGyms:user.Gymsjoined,
    });
  }

  if (page == "memerships") {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    const user = await User.findById(userId).populate("Gymsjoined");
    if (!user) return res.status(401).json({ message: "User not found" });
    const joinedGyms = user.Gymsjoined || [];
    const announcements = await Announcement.find({ gym: { $in: joinedGyms } });

    const gyms = user.Gymsjoined;

    gyms.forEach((gym) => {
      if (!gym.reviews) {
        gym.reviews = { totalreviews: 0, totalstars: 0 };
      }
    });

    return res.render("memerships", {
      gyms,
      role: decoded.role,
      username: decoded.username,
      LA: announcements,
    });
  }
  if (page == "settings") {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;
    return res.render("settings", {
      role: decoded.role,
      username: decoded.username,
    });
  }

  if (!page.endsWith(".html")) {
    page += ".html";
  }

  servePage(page)(req, res);
});

router.use(express.static(path.resolve(__dirname, "../../front_end")));

// 404 fallback
router.all("*", handleNotFound);

module.exports = router;
