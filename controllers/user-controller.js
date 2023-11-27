const knex = require("knex")(require("../knexfile"));

const index = async (req, res) => {
  const { id } = req.decoded;
  try {
    const user = await knex
      .select("u.*")
      .sum({ num_posts: "p.is_post" })
      .from({ u: "users" })
      .leftJoin({ p: "posts" }, "u.id", "=", "p.user_id")
      .where("u.id", id)
      .groupBy("u.id")
      .first();
    delete user.password;
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: `Unable to fetch current user with ID ${id}`,
    });
  }
};

const fetchFavorites = async (req, res) => {
  const { id } = req.decoded;
  try {
    const favs = await knex
      .select(
        "p.*",
        "m.movie_name",
        "m.tmdb_id",
        "m.poster_url",
        "m.backdrop_url"
      )
      .from({ p: "posts" })
      .join({ m: "movies" }, "p.movie_id", "=", "m.id")
      .rightJoin(knex("users").where({ id }).as("u"), "p.user_id", "=", "u.id")
      .where("p.rating", ">=", 8)
      .orderBy([
        { column: "p.rating", order: "desc" },
        { column: "p.id", order: "desc" },
      ])
      .limit(10);
    return res.status(200).json(favs);
  } catch (error) {
    return res.status(500).json({
      message: `Unable to fetch favorite movies for current user with ID ${id}`,
    });
  }
};

const fetchProfilePosts = async (req, res) => {
  const { id } = req.decoded;
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
      .where("p.user_id", id)
      .andWhere("p.is_post", 1)
      .orderBy("p.id", "desc");
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).send(`Error retrieving user's posts: ${error}`);
  }
};

const fetchFeed = async (req, res) => {
  const { p } = req.query;
  const { id } = req.decoded;
  const page = p ? p - 1 : 0;
  try {
    const feed = await knex
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
      .where("p.is_post", 1)
      .orderBy("p.id", "desc")
      .limit(5)
      .offset(page * 5);
    return res.status(200).json(feed);
  } catch (error) {
    return res.status(500).send(`Error retreiving user's feed: ${error}`);
  }
};

const findOnePost = async (req, res) => {
  const { id } = req.decoded;
  const { movieId } = req.params;
  try {
    const post = await knex
      .select("p.*", "m.*")
      .from({ p: "posts" })
      .join({ m: "movies" }, "p.movie_id", "=", "m.id")
      .where("m.tmdb_id", movieId)
      .andWhere("p.user_id", id)
      .first();
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({
      message: `Error retrieving user's post for movie ${movieId}: ${error}`,
    });
  }
};

module.exports = {
  index,
  fetchProfilePosts,
  fetchFeed,
  findOnePost,
  fetchFavorites,
};
