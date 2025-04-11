/*
  id: ObjectId,
  title: String,
  gymId: ObjectId,
  trainerId: ObjectId, // references User
  startTime: Date,
  endTime: Date,
  capacity: Number,
  enrolledUsers: [ObjectId], // references User
}
*/

const mongoose = require("mongoose");

const classesSchema = new mongoose.Schema(
  {
    trainerid : {
      required:true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "HIIT",
        "Yoga",
        "Spin",
        "Zumba",
        "Pilates",
        "CrossFit",
        "Boxing",
        "BodyPump",
        "Bootcamp",
        "Dance",
        "TRX",
        "Strength Training",
        "Stretching",
        "Martial Arts"
      ],
      required: true,
    },
    startTime:{
      type:Date,
      required:true,
    },
    endTime:{
      type:Date,
      required:true,
    },
    certificateUrl: {
      type: String, 
    },
    capacity: {type:Number},
    enrolledUsers:[ 
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
    ],
    
  },
  { timestamps: true }
);

const classes = mongoose.model("classes", classesSchema);
module.exports = classes;