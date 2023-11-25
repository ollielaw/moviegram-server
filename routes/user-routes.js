const express = require("express");
const router = express.Router();

const userController = require("../controllers/user-controller");

router.route("/").get(userController.index);
router.route("/posts").get(userController.fetchProfilePosts);
router.route("/feed").get(userController.fetchFeed);
router.route("/posts/:movieId").get(userController.findOnePost);

module.exports = router;
