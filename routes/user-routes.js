const express = require("express");
const router = express.Router();

const userController = require("../controllers/user-controller");

router.route("/").get(userController.index).patch(userController.update);
router.route("/posts").get(userController.fetchProfilePosts);
router.route("/feed").get(userController.fetchFeed);
router.route("/favorites").get(userController.fetchFavorites);
router.route("/posts/:movieId").get(userController.findOnePost);
router.route("/conversations").get(userController.fetchConversations);
// router.route("/conversations/:userId").get(userController.findOneConversation).post(userController.shareMovie);

module.exports = router;
