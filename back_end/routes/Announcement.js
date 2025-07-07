const express = require("express");

const {
  createAnnouncement,
  getAllAnnouncements,
  deleteAnnouncement,
} = require("../controllers/announcements-controller.js");

const { verifyJWT } = require("../middleware/security.js");

const router = express.Router();

router.post("/", verifyJWT, createAnnouncement);
router.get("/:gymId", verifyJWT, getAllAnnouncements);
router.delete("/:id", verifyJWT, deleteAnnouncement);

module.exports = router;
