const express = require("express");
const router = express.Router();

const movieController = require("../controllers/movie-controller");

router.route("/").get(movieController.index);
router.route("/:movieId").get(movieController.findOne);
router.route("/:movieId/posts").get(movieController.fetchPosts);

module.exports = router;
