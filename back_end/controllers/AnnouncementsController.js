const Announcement = require("../models/Announcement")
const logger = require("../utils/logger")
//creating:
exports.createAnnouncement = async(req,res)=>{
try{
const{title,yap,gym} = req.body

if(!title||!yap||!gym){
return res.status(400).json({
    message:"some fialds are missing!"
})
}
const Announcement = new Announcement({
title,
yap,
gym :gymId,
})

await Announcement.save()
//seccess:
logger.info("announcement created:D,gym id is:${gymId}")
res.status(201).json({

    message:"announcement created",
    Announcement,
})
}
catch(error){//if smth went wrong:
logger.error('failed to create the announcement:( : ${error.message}')

res.status(500).json({
message:"internal server error",
})
}
}
exports.getAllAnnouncements = async(req,res)=>{
try{
const {gymId}=req.params
//the annoucements are sorted discending order by createdAt date:
const announcements = await Announcement.find({gym:gymId}).sort({createdAt :-1})

res.status(200).json(announcements)

}catch(error){

logger.error('failed to fetch all announcements from the gum :${error.message}')
res.status(500).json({
    message:"internal server error",
})
}
}
//deleating the an
exports.deleteAnnouncement = async(req,res)=>{
try{

const{id}=req.params
const deleted = await Announcement.findByIdAndDelete(id)
if(!deleted){
    return res.status(404).json({
message:"annoucement not found!"

    })
}
logger.info('announcement deleted!: ${id}')
res.status(200).json({
    message:"announcement deleted!",
})
}catch(error){
logger.error('failed to delet the announcement: ${error.message}')
res.status(500).jsom({
    message:"internal server error"
})
}
}









