const mongoose = require("mongoose");
const Counter = require("./counter"); // Import Counter model

const UserSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["member", "owner", "admin","trainer"],
      default: "member",
    },
    
    //ADD A TABLE OF GYMS JOINED
    Gymsjoined:[ 
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Gym",
        },
      ],
    //ADD MEMBERSHIP.js and membership object id
    Membership:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "membership",
    },
    Qrcode:{
      type: String, // Storing the QR code image URL
      required: false, // Optional field, only if you generate a QR code
    },
  },
  { timestamps: true }


);

// ✅ Ensure ID is assigned before saving
UserSchema.pre("validate", async function (next) {
  if (this.id) return next(); // If ID is already set, skip

  try {
    const counter = await Counter.findOneAndUpdate(
      { model: "User" }, 
      { $inc: { count: 1 } }, 
      { new: true, upsert: true }
    );

    this.id = counter.count; // Assign new ID
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
