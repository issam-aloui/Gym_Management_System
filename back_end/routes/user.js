const express = require("express");
 const cookieParser = require("cookie-parser");
 const {
   getUsername,
   changeUsername,
   changeEmail,
   changePassword,
   deleteAccount,
 } = require("../controllers/accountController");
 
 const router = express.Router();
 
 const { verifyJWT } = require("../middleware/Security");

 router.use(cookieParser());
 router.use(express.json());
 
 router.get("/username",verifyJWT ,getUsername);
 router.put("/changename",verifyJWT ,changeUsername);
 router.put("/changeemail",verifyJWT , changeEmail);
 router.put("/changepassword",verifyJWT , changePassword);
 router.delete("/accountdeletion",verifyJWT , deleteAccount);
 
 module.exports = router;