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

const findAvgRating = async (movieId, defaultRating) => {
  const isAvgRating = await knex
    .select("m.tmdb_id")
    .avg({ avg_rating: "p.rating" })
    .from({ p: "posts" })
    .join({ m: "movies" }, "p.movie_id", "=", "m.id")
    .groupBy("m.tmdb_id")
    .where({ tmdb_id: movieId })
    .first();
  return isAvgRating ? isAvgRating.avg_rating : defaultRating;
};

const findNumPosts = async (movieId) => {
  const movie = await knex
    .select("m.tmdb_id")
    .count({ num_posts: "p.id" })
    .from({ m: "movies" })
    .leftJoin(
      knex("posts").where({ is_post: 1 }).as("p"),
      "m.id",
      "=",
      "p.movie_id"
    )
    .where("m.tmdb_id", movieId)
    .groupBy("m.tmdb_id")
    .first();
  return movie ? movie.num_posts : 0;
};

const index = async (req, res) => {
  const { s, p } = req.query;
  const { id } = req.decoded;
  const page = p ? p : 1;
  try {
    if (!s) {
      const { data } = await axios.get(
        `${process.env.TMDB_API_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
          },
        }
      );
      const movieList = data.results;
      if (!movieList.length) {
        return res.status(200).json([]);
      }
      const movies = [];
      for (let i = 0; i < movieList.length; i++) {
        const rating = await findUserRating(id, movieList[i].id);
        const avg_rating = await findAvgRating(
          movieList[i].id,
          movieList[i].vote_average
        );
        movies.push({ ...movieList[i], rating, avg_rating });
      }
      return res.status(200).json(movies);
    }
    const { data } = await axios.get(
      `${process.env.TMDB_API_URL}/search/movie?query=${s}&include_adult=false&language=en-US&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
        },
      }
    );
    const movieList = data.results;
    if (!movieList.length) {
      return res.status(200).json([]);
    }
    const movies = [];
    for (let i = 0; i < movieList.length; i++) {
      const rating = await findUserRating(id, movieList[i].id);
      const avg_rating = await findAvgRating(
        movieList[i].id,
        movieList[i].vote_average
      );
      movies.push({ ...movieList[i], rating, avg_rating });
    }
    return res.status(200).json(movies);
  } catch (error) {
    return res
      .send(500)
      .json({ message: `Error retreiving movie search list: ${error}` });
  }
};

const findOne = async (req, res) => {
  const { movieId } = req.params;
  const { id } = req.decoded;
  try {
    const { data } = await axios.get(
      `${process.env.TMDB_API_URL}/movie/${movieId}?append_to_response=credits%2Cvideos&language=en-US`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
        },
      }
    );
    const rating = await findUserRating(id, movieId);
    const avg_rating = await findAvgRating(movieId, data.vote_average);
    const num_posts = await findNumPosts(movieId);
    const movieData = { ...data, avg_rating, rating, num_posts };
    return res.status(200).json(movieData);
  } catch (error) {
    return res.status(500).json({
      message: `Error retrieving movie with TMDB ID ${movieId}: ${error}`,
    });
  }
};

const fetchPosts = async (req, res) => {
  const { id } = req.decoded;
  const { movieId } = req.params;
  try {
    const posts = await knex
      .select(
        "p.*",
        "m.movie_name",
        "m.tmdb_id",
        "m.poster_url",
        "m.backdrop_url",
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

// REMOVE THIS FUNCTION
const getBackdropUrl = async (tmdbId) => {
  const { data } = await axios.get(
    `${process.env.TMDB_API_URL}/movie/${tmdbId}?language=en-US`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
      },
    }
  );
  if (data) {
    return data.backdrop_path;
  }
  return null;
};

// REMOVE THIS FUNCTION
const fetchMovieSeed = async (_req, res) => {
  const data = await knex("movies").select(
    "id",
    "movie_name",
    "tmdb_id",
    "poster_url",
    "release_date"
  );
  const seedData = [];
  for (let i = 0; i < data.length; i++) {
    const backdrop_url = await getBackdropUrl(data[i].tmdb_id);
    seedData.push({ ...data[i], backdrop_url });
  }
  return res.status(200).json(seedData);
};

module.exports = {
  index,
  findOne,
  fetchPosts,
  // REMOVE THIS LINE
  fetchMovieSeed,
};
