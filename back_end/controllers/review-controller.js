const Review = require("../models/review");
const mongoose = require("mongoose");
const Gym = require("../models/gyms");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const User = require("../models/user");

exports.addReview = async (request, response) => {
  try {
    const { gymId, rating, comment } = request.body;
    const token = request.cookies.token;

    if (!token) {
      return response.status(403).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.Oid;

    const user = await User.findById(userId);
    const gym = await Gym.findById(gymId);

    if (!user || !gym) {
      return response.status(404).json({ message: "User or gym not found" });
    }

    const ratingNumber = Number(rating);
    if (Number.isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      return response.status(400).json({ message: "Invalid rating value" });
    }

    gym.reviews.totalstars = gym.reviews.totalstars || 0;
    gym.reviews.totalreviews = gym.reviews.totalreviews || 0;

    const existingReview = await Review.findOne({ user: user._id, gym: gymId });

    if (existingReview) {
      if (existingReview.rating !== ratingNumber) {
        gym.reviews.totalstars =
          gym.reviews.totalstars - existingReview.rating + ratingNumber;
        existingReview.rating = ratingNumber;
      }
      existingReview.comment = comment;
      await existingReview.save();
      await gym.save();
      return response.status(200).json({
        message: "Review updated successfully",
        review: existingReview,
      });
    }

    // New review
    const review = new Review({
      user: user._id,
      gym: gymId,
      rating: ratingNumber,
      comment,
    });

    gym.reviews.totalstars += ratingNumber;
    gym.reviews.totalreviews += 1;

    await gym.save();
    await review.save();
    response.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    console.error("Error adding/updating review:", error);
    response.status(500).json({ message: "Error", error: error.message });
  }
};

exports.getReviews = async (request, response) => {
  try {
    const { gymId } = request.params;
    const reviews = await Review.find({ gym: gymId }).populate(
      "user",
      "username"
    );
    response.status(200).json(reviews);
  } catch (error) {
    response.status(500).json({ message: "error", error: error.message });
  }
};

exports.deleteReview = async (request, response) => {
  try {
    const { reviewId } = request.params;

    const review = await Review.findOne({
      _id: reviewId,
      user: request.user.id,
    });
    if (!review) {
      return response.status(404).json({ message: "Review not found" });
    }

    await review.remove();
    response.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    response.status(500).json({ message: "error", error: error.message });
  }
};
