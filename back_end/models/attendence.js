/*
  Attendance {
  id: ObjectId,
  userId: ObjectId,
  gymId: ObjectId,
  date: Date,
  checkInTime: Date,
  checkOutTime: Date,
} */

  const mongoose = require("mongoose");

  const AttendanceSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gym",
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      checkInTime: {
        type: Date,
        required: true,
      },
      checkOutTime: {
        type: Date, // optional at first, can be filled on checkout
      },
    },
    { timestamps: true }
  );
  
  const Attendance = mongoose.model("Attendance", AttendanceSchema);
  module.exports = Attendance;
  