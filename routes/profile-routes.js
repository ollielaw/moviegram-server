const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profile-controller");

router.route("/").get(profileController.index);
router.route("/:userId").get(profileController.findOne);
router.route("/:userId/posts").get(profileController.fetchProfilePosts);
router.route("/:userId/favorites").get(profileController.fetchFavorites);

module.exports = router;
