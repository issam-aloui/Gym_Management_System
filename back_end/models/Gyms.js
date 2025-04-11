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
  gpsLocation: { //DELETE
    type: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    required: true,
  },
  owner: { // TURN IT INTO OBJECT ID
    type: Number,
    ref: "User",
    required: true,
  },
  members: [ //TRANSFER TO ANALITIQUES
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  facilities: [ //TRANSFER TO analitiques
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
  openingHours: {  //gym descreption
    type: String, 
    default: "6 AM - 10 PM",
  },
  pricePerMonth: { //analitiques 
    type: Number,
    required: true,
    min: 0,
  },
  contact: { //gym descreption
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  createdAt: { 
    type: Date,
    default: Date.now,
  },
  },
  { timestamps: true }
);

GymSchema.index({ name: 1, town: 1 }, { unique: true });

const Gym = mongoose.model("Gym", GymSchema);
module.exports = Gym;
