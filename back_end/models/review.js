const mongoose = require("mongoose");
const ReviewSchema = mongoose.Schema(
    {
user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true,

},
gym:{
type:mongoose.Schema.Types.ObjectId,
ref:"Gym",
required:true,

},
rating:{
type:Number,
min:1,
max:5,
required:true,
},
comment:{
    type:String,
    trim:true,
    required:true,
    maxlength:1000,
},
    },
    {timestamps:true});
const review = mongoose.model("Review",ReviewSchema);
module.exports = review;