const mongoose = require("mongoose");

const GymSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 5,
    maxlength: 20,
  },
  town: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 10,
  },
  gpsLocation: {
    type: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    required: true,
  },
  owner: {
    type: Number,
    ref: "User",
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  facilities: [
    {
      type: String, 
      enum: [
        "Weights",
        "Cardio",
        "Swimming Pool",
        "Sauna",
        "Showers",
        "Lockers",
      ],
    },
  ],
  openingHours: {
    type: String, 
    default: "6 AM - 10 PM",
  },
  pricePerMonth: {
    type: Number,
    required: true,
    min: 0,
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

GymSchema.index({ name: 1, town: 1 }, { unique: true });

const Gym = mongoose.model("Gym", GymSchema);
module.exports = Gym;
