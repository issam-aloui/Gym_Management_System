const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      minlength: 4,
    },
    yap: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1500,
    },
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Gym",
    },
    gymname:{type: String,},
  },
  {
    timestamps: true, 
  }
);

const Announcement = mongoose.model("Announcement", AnnouncementSchema);
module.exports = Announcement;
