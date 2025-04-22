const express = require('express');

const router = express.Router();
const {createMembershipRequest} = require('../controllers/gymjoinController');
const {verifyJWT} = require("../middleware/Security")


router.post("/memreq",verifyJWT ,createMembershipRequest);


module.exports = router;
