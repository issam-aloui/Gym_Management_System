const express = require("express")

const{

    createAnnouncement,
    getAllAnnouncements,
    deleteAnnouncement,

}=require("../controllers/AnnouncementsController.js")

const { verifyJWT }= require("../middleware/Security")

const router = express.Router()

router.post("/",verifyJWT,createAnnouncement)
router.get("/:gymId",verifyJWT,getAllAnnouncements)
router.delete("/:id",verifyJWT,deleteAnnouncement)

module.exports = router;