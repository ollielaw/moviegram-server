const knex = require("knex")(require("../knexfile"));
require("dotenv").config();
const axios = require("axios");

const add = async (req, res) => {
  const { id } = req.decoded;
  const { tmdb_id, caption, rating, is_post } = req.body;
  try {
    const moviesFound = await knex("movies").where({ tmdb_id });
    if (!moviesFound.length) {
      const { data } = await axios.get(
        `${process.env.TMDB_API_URL}/movie/${tmdb_id}?language=en-US`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
          },
        }
      );
      const newMovie = {
        movie_name: data.title,
        tmdb_id,
        poster_url: data.poster_path,
        release_date: data.release_date,
      };
      const newMovieIds = await knex("movies").insert(newMovie);
      const movie_id = newMovieIds[0];

      const newReview = {
        user_id: id,
        movie_id,
        caption,
        rating,
        is_post,
      };

      const newReviewIds = await knex("posts").insert(newReview);
      const post_id = newReviewIds[0];
      const newPost = { id: post_id, ...newReview };
      return res.status(201).json(newPost);
    } else {
      const newReview = {
        user_id: id,
        movie_id: moviesFound[0].id,
        caption,
        rating,
        is_post,
      };
      const newReviewIds = await knex("posts").insert(newReview);
      const post_id = newReviewIds[0];
      const newPost = { id: post_id, ...newReview };
      return res.status(201).json(newPost);
    }
  } catch (error) {
    return res.status(500).json({
      message: `Error uploading review of movie with TMDB ID ${tmdb_id}: ${error}`,
    });
  }
};

const findOne = async (req, res) => {
  const { id } = req.decoded;
  const { postId } = req.params;
  try {
    const post = await knex
      .select(
        "p.*",
        "m.movie_name",
        "m.tmdb_id",
        "m.poster_url",
        "u.username",
        "u.avatar_url"
      )
      .count({ num_likes: "l.id", user_liked: "lu.id" })
      .from({ p: "posts" })
      .join({ m: "movies" }, "p.movie_id", "=", "m.id")
      .join({ u: "users" }, "p.user_id", "=", "u.id")
      .leftJoin({ l: "likes" }, "p.id", "=", "l.post_id")
      .leftJoin(
        knex("likes").where("user_id", id).as("lu"),
        "p.id",
        "=",
        "lu.post_id"
      )
      .groupBy("p.id")
      .where("p.id", postId)
      .andWhere("p.is_post", 1)
      .first();
    if (!post) {
      return res
        .status(404)
        .json({ message: `Post with ID ${postId} not found` });
    }
    return res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving post with ID ${postId}: ${error}`,
    });
  }
};

const update = async (req, res) => {
  const { movieId } = req.params;
  const { id } = req.decoded;
  const { caption, rating, is_post } = req.body;
  try {
    const prevPost = await knex
      .select("p.*", "m.tmdb_id")
      .from({ p: "posts" })
      .join({ m: "movies" }, "p.movie_id", "=", "m.id")
      .where("m.tmdb_id", movieId)
      .andWhere("p.user_id", id)
      .first();
    const updatedRev = {
      user_id: id,
      movie_id: prevPost.movie_id,
      caption: caption ? caption : prevPost.caption,
      rating: rating ? rating : prevPost.rating,
      is_post: is_post ? is_post : prevPost.is_post,
    };
    const rowsUpdated = await knex("posts")
      .where({ id: prevPost.id })
      .update(updatedRev);
    if (rowsUpdated === 0) {
      return res.status(404).json({
        message: `Post with ID ${prevPost.id} not found`,
      });
    }
    const updatedPost = await knex("posts").where({ id: prevPost.id }).first();
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({
      message: `Error updating post: ${error}`,
    });
  }
};

const addLike = async (req, res) => {
  const { id } = req.decoded;
  const { postId } = req.params;
  try {
    const postsFound = await knex("posts").where({ id: postId });
    if (!postsFound.length) {
      return res.status(404).json({
        message: `Post with ID ${postId} not found`,
      });
    }
    const likesFound = await knex("likes")
      .where({ post_id: postId })
      .andWhere({ user_id: id });
    if (likesFound.length > 0) {
      return res.status(400).json({
        message: `User has already liked post with ID ${postId}`,
      });
    }
    const newLikeId = await knex("likes").insert({
      user_id: id,
      post_id: postId,
    });
    const newLike = await knex("likes").where({ id: newLikeId[0] }).first();
    return res.status(201).json(newLike);
  } catch (error) {
    return res.status(500).json({
      message: `Error liking post with ID ${postId}: ${error}`,
    });
  }
};

const removeLike = async (req, res) => {
  const { id } = req.decoded;
  const { postId } = req.params;
  try {
    const rowsDeleted = await knex("likes")
      .where({ post_id: postId })
      .andWhere({ user_id: id })
      .delete();
    if (!rowsDeleted) {
      return res.status(404).json({
        message: `Like on post with ID ${postId} not found`,
      });
    }
    return res.status(204).json({
      message: `Successfully removed like from post with ID ${postId}`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Unable to remove like from post: ${error}`,
    });
  }
};

const fetchComments = async (req, res) => {
  const { postId } = req.params;
  try {
    const postFound = await knex("posts").where({ id: postId });
    if (!postFound.length) {
      return res.status(404).json({
        message: `Post with ID ${postId} not found`,
      });
    }
    const comments = await knex
      .select("c.*", "u.username", "u.avatar_url")
      .from({ c: "comments" })
      .join({ u: "users" }, "c.user_id", "=", "u.id")
      .where("c.post_id", postId)
      .orderBy("c.id", "desc");
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({
      message: `Failed to fetch comments for post with ID ${postId}: ${error}`,
    });
  }
};

const addComment = async (req, res) => {
  const { id } = req.decoded;
  const { postId } = req.params;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({
      message: "Must provide content to post a comment",
    });
  }
  try {
    const postFound = await knex("posts").where({ id: postId });
    if (!postFound.length) {
      return res.status(404).json({
        message: `Post with ID ${postId} not found`,
      });
    }
    const newComment = {
      user_id: id,
      post_id: postId,
      content,
    };
    const newCommentId = await knex("comments").insert(newComment);
    return res.status(201).json({ id: newCommentId[0], ...newComment });
  } catch (error) {
    return res.status(500).json({
      message: `Failed to add comment to post with ID ${postId}: ${error}`,
    });
  }
};

const removeComment = async (req, res) => {
  const { postId, commentId } = req.params;
  try {
    const rowsDeleted = await knex("comments")
      .where({ id: commentId })
      .delete();
    if (!rowsDeleted) {
      return res.status(404).json({
        message: `Comment with ID ${commentId} on post with ID ${postId} not found`,
      });
    }
    return res.status(204).json({
      message: `Successfully deleted comment on post with ID ${postId}`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Unable to remove comment with ID ${commentId}: ${error}`,
    });
  }
};

module.exports = {
  findOne,
  add,
  update,
  addLike,
  removeLike,
  fetchComments,
  addComment,
  removeComment,
};
