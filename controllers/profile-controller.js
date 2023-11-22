const knex = require("knex")(require("../knexfile"));

const index = async (req, res) => {
  const { s, p } = req.query;
  const page = p ? p : 1;
  try {
    if (!s) {
      const data = await knex("users")
        .select("id", "name", "username", "email", "bio", "avatar_url")
        .orderBy("name", "desc")
        .limit(20)
        .offset((page - 1) * 20);
      return res.status(200).json(data);
    } else {
      const data = await knex("users")
        .select("id", "name", "username", "email", "bio", "avatar_url")
        .whereILike("name", `%${s}%`)
        .orWhereILike("username", `%${s}%`)
        .orderBy("name", "desc")
        .limit(20)
        .offset((page - 1) * 20);
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
    const usersFound = await knex("users").where({ id: userId });
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
  try {
    const posts = await knex
      .select(
        "p.*",
        "m.movie_name",
        "m.tmdb_id",
        "m.poster_url",
        "u.username",
        "u.avatar_url"
      )
      .count({ num_likes: "l.id" })
      .from({ p: "posts" })
      .join({ m: "movies" }, "p.movie_id", "=", "m.id")
      .join({ u: "users" }, "p.user_id", "=", "u.id")
      .leftJoin({ l: "likes" }, "p.id", "=", "l.post_id")
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

module.exports = {
  index,
  findOne,
  fetchProfilePosts,
};
