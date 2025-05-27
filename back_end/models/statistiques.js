//possible add trainers

/*
Analytics {
  id: ObjectId,
  gymId: ObjectId,
  date: Date,
  totalMembers: Number,
  dailyCheckIns: Number,
  newSignUps: Number,
  classesAttended: Number,
}
*/

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
    newSignUps: {
      type: Number,
      required: true,
      default: 0,
    },
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
