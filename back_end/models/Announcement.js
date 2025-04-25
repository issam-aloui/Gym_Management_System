const mongoose = require("mongoose")
const AnnouncementSchema = new mongoose.Schema({
title:{
type:String,
required:true,
trim:true,
maxlength:200,
minlength:8,
},
yap:{
   type:String,
   required:true,
   minlength:10,
   maxlength:1500,
},
gym:{
required:true,
ref:"gym",
type:mongoose.Schema.Types.ObjextId,
},
Createdat:{
type:Date,
default:Date.now,
},})
const Announcement = mongoose.module("Announcement",AnnouncementSchema)
module.exports = Announcement