const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
  time: { type: Date, default: Date.now },
});

const Checkin = mongoose.model("Checkin", checkinSchema);
module.exports = Checkin;