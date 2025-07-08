const express = require("express");
const {
  addReview,
  getReviews,
  deleteReview,
} = require("../controllers/review-controller");
const { verifyJWT } = require("../middleware/security");

const router = express.Router();

router.post("/", verifyJWT, addReview);

router.get("/:gymId", getReviews);

router.delete("/:reviewId", verifyJWT, deleteReview);
module.exports = router;
