const express = require("express")
const { addReview, getReviews, deleteReview } = require("../controllers/reviewController")
const { verifyJWT } = require("../middleware/Security")

const router = express.Router()

router.post("/", verifyJWT, addReview)

router.get("/:gymId", getReviews)

router.delete("/:reviewId", verifyJWT, deleteReview)

module.exports = router