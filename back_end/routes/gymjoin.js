const express = require("express");

const router = express.Router();
const {
  sendrequest,
  declinerequest,
  acceptRequest,
} = require("../controllers/gymjoin-controller");
const { verifyJWT, sendgLimitter } = require("../middleware/security");

router.post("/memreq", verifyJWT, sendgLimitter, sendrequest);
router.post("/memreqA", verifyJWT, acceptRequest);
router.post("/memreqD", verifyJWT, declinerequest);

module.exports = router;
