const mongoose = require("mongoose");

const GymSchema = new mongoose.Schema(
  {
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

    coordinates: {
      lng: { type: Number, required: true },
      lat: { type: Number, required: true },
    },

    pricePerMonth: {
      type: Number,
      required: true,
    },
    contact: {
      phonenumber: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    statistiques: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "statistiques",
    },

    GymDescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gymdes",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    Secretpass:{
      type:String,
      required:true,
    },
    reviews:{
      totalreviews:{type:Number,default:0},
      totalstars:{type:Number,default:0},
    }
  },
  { timestamps: true }
);

GymSchema.index({ name: 1, town: 1 }, { unique: true });

const Gym = mongoose.model("Gym", GymSchema);
module.exports = Gym;
