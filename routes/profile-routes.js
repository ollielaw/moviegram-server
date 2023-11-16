const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profile-controller");

router.route("/:userId").get(profileController.findOne);

module.exports = router;
