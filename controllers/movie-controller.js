const knex = require("knex")(require("../knexfile"));
require("dotenv").config();
const axios = require("axios");

const findUserRating = async (userId, movieId) => {
  const isRating = await knex
    .select("p.rating", "p.user_id", "m.tmdb_id")
    .from({ p: "posts" })
    .join({ m: "movies" }, "p.movie_id", "=", "m.id")
    .where("p.user_id", userId)
    .andWhere("m.tmdb_id", movieId)
    .first();
  return isRating ? isRating.rating : null;
};

const findAvgRating = async (movieId) => {
  const isAvgRating = await knex
    .select("m.tmdb_id")
    .avg({ avg_rating: "p.rating" })
    .from({ p: "posts" })
    .join({ m: "movies" }, "p.movie_id", "=", "m.id")
    .groupBy("m.tmdb_id")
    .where({ tmdb_id: movieId })
    .first();
  return isAvgRating ? isAvgRating.avg_rating : null;
};

const index = async (req, res) => {
  const { s, p } = req.query;
  const { id } = req.decoded;
  if (!s) {
    return res.status(400);
  }
  const page = p ? p : 1;
  try {
    const { data } = await axios.get(
      `${process.env.TMDB_API_URL}/search/movie?query=${s}&include_adult=false&language=en-US&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
        },
      }
    );
    const movieList = data.results;
    const movies = [];
    for (let i = 0; i < movieList.length; i++) {
      const rating = await findUserRating(id, movieList[i].id);
      const avg_rating = await findAvgRating(movieList[i].id);
      movies.push({ ...movieList[i], rating, avg_rating });
    }
    data.results = movies;
    return res.status(200).json(data);
  } catch (error) {
    res
      .send(500)
      .json({ message: `Error retreiving movie search list: ${error}` });
  }
};

const findOne = async (req, res) => {
  const { movieId } = req.params;
  const { id } = req.decoded;
  try {
    const { data } = await axios.get(
      `${process.env.TMDB_API_URL}/movie/${movieId}?language=en-US`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
        },
      }
    );
    const rating = await findUserRating(id, movieId);
    const avg_rating = await findAvgRating(movieId);
    const movieData = { ...data, avg_rating, rating };
    return res.status(200).json(movieData);
  } catch (error) {
    return res.status(500).json({
      message: `Error retrieving movie with TMDB ID ${movieId}: ${error}`,
    });
  }
};

const fetchPosts = async (req, res) => {
  const { movieId } = req.params;
  try {
    const posts = await knex
      .select("p.*", "m.movie_name", "m.tmdb_id", "m.poster_url")
      .count({ num_likes: "l.id" })
      .from({ p: "posts" })
      .join({ m: "movies" }, "p.movie_id", "=", "m.id")
      .leftJoin({ l: "likes" }, "p.id", "=", "l.post_id")
      .groupBy("p.id")
      .where("m.tmdb_id", movieId)
      .andWhere("p.is_post", 1)
      .orderBy("p.id", "desc");
    return res.status(200).json(posts);
  } catch (error) {
    return res
      .status(500)
      .send(`Error retrieving posts for movie with ID ${movieId}: ${error}`);
  }
};

module.exports = {
  index,
  findOne,
  fetchPosts,
};
