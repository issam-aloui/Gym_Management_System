

const mongoose = require("mongoose");

const StatistiquesSchema = new mongoose.Schema(
  {
    Gymid: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
    },
    totalMembers: {
      type: Number,
      required: true,
      default: 0,
    },
    newMembers: {
      type: Number,
      default: 0,
    },
    dailyCheckIns: {
      type: Number,
      required: true,
      default: 0,
    },
    checkInsHistory: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
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
      },
    ],
    newSignUps: {
      type: Number,
      required: true,
      default: 0,
    },
    monthlyRevenue: {
      type: Number,
      required: true,
      default: 0,
    },
    TotalRevenue: {
      type: Number,
      required: true,
      default: 0,
    },
    revenueHistory: [
      {
        month: { type: String, required: true },
        year: { type: Number, required: true },
        revenue: { type: Number, required: true, default: 0 },
      },
    ],
    classes: {
      allclasses: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "classes",
        },
      ],
      Totalclasses: { type: Number, required: true, default: 0 },
      classesattended: { type: Number, required: true, default: 0 },
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    trainers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "trainers",
      },
    ],
  },
  { timestamps: true }
);

const statistiques = mongoose.model("statistiques", StatistiquesSchema);
module.exports = statistiques;
