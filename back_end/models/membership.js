/*
Membership {
  id: ObjectId,
  type: String, // "monthly", "yearly", etc.
  price: Number,
  durationDays: Number,
  perks: [String],
}
*/ 


const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    userid : {
      required:true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type:{
      type:String,
      enum: ["normal", "premium", "admin"],
      required:true,
    },
    timetoexpire:{
      type:Number,
      required:true,
    },
    certificateUrl: {
      type: String, 
    },
  },
  { timestamps: true }
);

const membership = mongoose.model("membership", membershipSchema);
module.exports = membership;