const express = require("express");
const path = require("node:path");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  serveowner,
  serveHome,
  servePage,
  handleNotFound,
  serveGymPage,
  serveSettings,
  serveSearch,
  serveDashboard,
} = require("../controllers/view-controller");
const { verifyJWT, verifymember } = require("../middleware/security");
const { getuserfromjwt } = require("../middleware/auths");
const Announcement = require("../models/announcement");
const router = express.Router();

// API config endpoint for frontend
router.get("/api/config", (request, response) => {
  response.json({
    BASE_URL: process.env.BASE_URL || "http://localhost:5000",
  });
});

router.get("/", getuserfromjwt, serveHome);

router.get("/home-user", getuserfromjwt, serveHome);

router.get("/gym/:id?/:thing?", verifyJWT, verifymember, serveGymPage);

router.get("/settings", getuserfromjwt, verifyJWT, serveSettings);
router.get("/results", getuserfromjwt, verifyJWT, serveSearch);
router.get("/owner/dashboard", getuserfromjwt, verifyJWT, serveDashboard);
router.get("/owner/:thing", getuserfromjwt, verifyJWT, serveowner);

router.get("/:page", async (request, response) => {
  let { page } = request.params;

  if (page == "classes") {
    const token = request.cookies.token;
    if (!token) return response.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    const user = await User.findById(userId).populate("Gymsjoined");
    if (!user) return response.status(401).json({ message: "User not found" });
    const joinedGyms = user.Gymsjoined || [];
    const announcements = await Announcement.find({ gym: { $in: joinedGyms } });

    const gyms = user.Gymsjoined;

    return response.render("classes", {
      gyms,
      role: decoded.role,
      username: decoded.username,
      LA: announcements,
      joinedGyms: user.Gymsjoined,
    });
  }

  if (page == "memerships") {
    const token = request.cookies.token;
    if (!token) return response.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    const user = await User.findById(userId).populate("Gymsjoined");
    if (!user) return response.status(401).json({ message: "User not found" });
    const joinedGyms = user.Gymsjoined || [];
    const announcements = await Announcement.find({ gym: { $in: joinedGyms } });

    const gyms = user.Gymsjoined;

    for (const gym of gyms) {
      if (!gym.reviews) {
        gym.reviews = { totalreviews: 0, totalstars: 0 };
      }
    }

    return response.render("memerships", {
      gyms,
      role: decoded.role,
      username: decoded.username,
      LA: announcements,
    });
  }
  if (page == "settings") {
    const token = request.cookies.token;
    if (!token) return response.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;
    return response.render("settings", {
      role: decoded.role,
      username: decoded.username,
    });
  }

  if (!page.endsWith(".html")) {
    page += ".html";
  }

  servePage(page)(request, response);
});

router.use(express.static(path.resolve(__dirname, "../../front_end")));

// 404 fallback
router.all("*", handleNotFound);

module.exports = router;
