const knex = require("knex")(require("../knexfile"));

const index = async (req, res) => {
  const { s, p } = req.query;
  const { id } = req.decoded;
  const page = p ? p - 1 : 0;
  try {
    if (!s) {
      const data = await knex
        .select("u.id", "u.name", "u.username", "u.avatar_url")
        .sum({ num_posts: "p.is_post" })
        .from({ u: "users" })
        .leftJoin({ p: "posts" }, "u.id", "=", "p.user_id")
        .whereNot("u.id", id)
        .groupBy("u.id")
        .orderBy("u.name", "asc")
        .limit(20)
        .offset(page * 20);

      return res.status(200).json(data);
    } else {
      const data = await knex
        .select("u.id", "u.name", "u.username", "u.avatar_url")
        .sum({ num_posts: "p.is_post" })
        .from({ u: "users" })
        .leftJoin({ p: "posts" }, "u.id", "=", "p.user_id")
        .whereNot("u.id", id)
        .andWhere(function () {
          this.whereILike("u.name", `%${s}%`).orWhereILike(
            "u.username",
            `%${s}%`
          );
        })
        .groupBy("u.id")
        .orderBy("u.name", "asc")
        .limit(20)
        .offset(page * 20);
      return res.status(200).json(data);
    }
  } catch (error) {
    return res.status(500).json({
      message: `Error retrieving users with search query ${s}`,
    });
  }
};

const findOne = async (req, res) => {
  const { userId } = req.params;
  try {
    const usersFound = await knex
      .select("u.*")
      .sum({ num_posts: "p.is_post" })
      .from({ u: "users" })
      .leftJoin({ p: "posts" }, "u.id", "=", "p.user_id")
      .where("u.id", userId)
      .groupBy("u.id");
    if (!usersFound.length) {
      return res.status(404).json({
        message: `User with ID ${userId} not found`,
      });
    }
    const user = usersFound[0];
    delete user.password;
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: `Unable to fetch user with ID ${userId}`,
    });
  }
};

const fetchProfilePosts = async (req, res) => {
  const { userId } = req.params;
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
      .where("p.user_id", userId)
      .andWhere("p.is_post", 1)
      .orderBy("p.id", "desc");
    return res.status(200).json(posts);
  } catch (error) {
    return res
      .status(500)
      .send(`Error retrieving posts for user with ID ${userId}: ${error}`);
  }
};

const fetchFavorites = async (req, res) => {
  const { userId } = req.params;
  try {
    const usersFound = await knex("users").where({ id: userId });
    if (!usersFound.length) {
      return res.status(404).json({
        message: `User with ID ${userId} does not exist`,
      });
    }
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
      .rightJoin(
        knex("users").where({ id: userId }).as("u"),
        "p.user_id",
        "=",
        "u.id"
      )
      .where("p.rating", ">=", 8)
      .orderBy([
        { column: "p.rating", order: "desc" },
        { column: "p.id", order: "desc" },
      ])
      .limit(10);
    return res.status(200).json(favs);
  } catch (error) {
    return res.status(500).json({
      message: `Error retrieving favorite movies for user with ID ${userId}`,
    });
  }
};

module.exports = {
  index,
  findOne,
  fetchProfilePosts,
  fetchFavorites,
};
