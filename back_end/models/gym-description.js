const mongoose = require("mongoose");


const GymdesSchema = new mongoose.Schema(
  {
    Gymid : {
      required:true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
    },
    openingHours: {  
        type: String, 
        default: "6 AM - 10 PM",
      },
      
      contact: { 
        phone: { type: String, required: true },
        email: { type: String, required: true },
      },
       facilities: [ 
          {
            type: String, 
            enum: [
              "Weights",
              "Cardio",
              "Swimming Pool",
              "Sauna",
              "Showers",
              "Lockers",
            ],
          },
        ],
  },
  { timestamps: true }
);

const Gymdes = mongoose.model("Gymdes", GymdesSchema);
module.exports = Gymdes;