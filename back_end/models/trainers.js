const mongoose = require("mongoose");

const TrainersSchema = new mongoose.Schema(
  {
    totalNum: {
      type: Number,
      default: 0,
    },
    trainers: [ // lowercase property name for consistency
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // assuming trainers are just Users with role: "trainer"
      },
    ],
  },
  { timestamps: true }
);

const trainers = mongoose.model("trainers", TrainersSchema);
module.exports = trainers;
