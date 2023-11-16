const knex = require("knex")(require("../knexfile"));

const index = async (req, res) => {
  const { id } = req.decoded;
  try {
    const user = await knex("users").where({ id: id }).first();
    delete user.password;
    delete user.updated_at;
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: `Unable to fetch current user with ID ${id}`,
    });
  }
};

const fetchProfilePosts = async (req, res) => {
  const { id } = req.decoded;
  try {
    const posts = await knex
      .select("p.*", "m.movie_name", "m.tmdb_id", "m.poster_url")
      .count({ num_likes: "l.id" })
      .from({ p: "posts" })
      .join({ m: "movies" }, "p.movie_id", "=", "m.id")
      .leftJoin({ l: "likes" }, "p.id", "=", "l.post_id")
      .groupBy("p.id")
      .where("p.user_id", id)
      .andWhere("p.is_post", 1)
      .orderBy("p.id", "desc");
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).send(`Error retrieving user's posts: ${error}`);
  }
};

const fetchFeed = async (_req, res) => {
  try {
    const feed = await knex
      .select("p.*", "m.movie_name", "m.tmdb_id", "m.poster_url")
      .count({ num_likes: "l.id" })
      .from({ p: "posts" })
      .join({ m: "movies" }, "p.movie_id", "=", "m.id")
      .leftJoin({ l: "likes" }, "p.id", "=", "l.post_id")
      .groupBy("p.id")
      .where("p.is_post", 1)
      .orderBy("p.id", "desc");
    return res.status(200).json(feed);
  } catch (error) {
    return res.status(500).send(`Error retreiving user's feed: ${error}`);
  }
};

module.exports = {
  index,
  fetchProfilePosts,
  fetchFeed,
};
