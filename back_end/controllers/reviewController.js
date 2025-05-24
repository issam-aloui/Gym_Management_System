const Review = require("../models/review");
const mongoose = require("mongoose");
const Gym = require("../models/Gyms");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const User = require('../models/User');


exports.addReview = async (req, res) => {
  try {
      const { gymId, rating, comment } = req.body;
      const token = req.cookies.token;  

      if (!token) {
          return res.status(403).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.Oid;

      const user = await User.findById(userId);
      const gym = await Gym.findById(gymId);

      if (!user || !gym) {
          return res.status(404).json({ message: "User or gym not found" });
      }

      const ratingNum = Number(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
          return res.status(400).json({ message: "Invalid rating value" });
      }

      gym.reviews.totalstars = gym.reviews.totalstars || 0;
      gym.reviews.totalreviews = gym.reviews.totalreviews || 0;

      const existingReview = await Review.findOne({ user: user._id, gym: gymId });

      if (existingReview) {
          if (existingReview.rating !== ratingNum) {
              gym.reviews.totalstars = gym.reviews.totalstars - existingReview.rating + ratingNum;
              existingReview.rating = ratingNum;
          }
          existingReview.comment = comment;
          await existingReview.save();
          await gym.save();
          return res.status(200).json({ message: "Review updated successfully", review: existingReview });
      }

      // New review
      const review = new Review({
          user: user._id,
          gym: gymId,
          rating: ratingNum,
          comment,
      });

      gym.reviews.totalstars += ratingNum;
      gym.reviews.totalreviews += 1;

      await gym.save();
      await review.save();
      res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
      console.error("Error adding/updating review:", error);
      res.status(500).json({ message: "Error", error: error.message });
  }
};




exports.getReviews = async (req, res) => {
  try {
      const { gymId } = req.params; 
      const reviews = await Review.find({ gym: gymId }).populate("user", "username");
      res.status(200).json(reviews);
  } catch (error) {
      res.status(500).json({ message: "error", error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findOne({ _id: reviewId, user: req.user.id });
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        await review.remove();
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "error", error: error.message });
    }
};