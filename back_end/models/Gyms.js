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

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  statistiques:{
    required:true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "statistiques",
  },

  GymDescription:{
    required:true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gymdes",
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
