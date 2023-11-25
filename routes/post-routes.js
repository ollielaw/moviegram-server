const express = require("express");
const router = express.Router();

const postController = require("../controllers/post-controller");

router.route("/").post(postController.add);
router
  .route("/:postId")
  .get(postController.findOne)
  .delete(postController.remove);
router.route("/:movieId").patch(postController.update);
router
  .route("/:postId/like")
  .post(postController.addLike)
  .delete(postController.removeLike);
router
  .route("/:postId/comments")
  .get(postController.fetchComments)
  .post(postController.addComment);
router
  .route("/:postId/comments/:commentId")
  .delete(postController.removeComment);

module.exports = router;
