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

const update = async (req, res) => {
  const { id } = req.decoded;
  const { bio, password, newPassword } = req.body;

  try {
    const user = await knex("users").where({ id }).first();

    if (password && newPassword) {
      const isPasswordCorrect = bcrypt.compareSync(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Incorrect password." });
      }

      const hashedPassword = bcrypt.hashSync(newPassword);

      const uptUser = {
        name: user.name,
        username: user.username,
        email: user.email,
        password: hashedPassword,
        bio: user.bio,
        avatar_url: user.avatar_url,
      };

      const rowsUpdated = await knex("users").where({ id }).update(uptUser);

      if (!rowsUpdated) {
        return res.status(404).json({
          message: `User not found`,
        });
      }

      const updatedUser = await knex("users").where({ id }).first();
      delete updatedUser.password;
      res.status(200).json(updatedUser);
    }

    if (bio !== user.bio) {
      const uptUser = {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        bio: bio,
        avatar_url: user.avatar_url,
      };
      const rowsUpdated = await knex("users").where({ id }).update(uptUser);
      if (!rowsUpdated) {
        return res.status(404).json({
          message: `User not found`,
        });
      }
      const updatedUser = await knex("users").where({ id }).first();
      delete updatedUser.password;
      res.status(200).json(updatedUser);
    }
    delete user.password;
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: `Error updating user: ${error}`,
    });
  }
};

const fetchConversations = async (req, res) => {
  const { id } = req.decoded;
  try {
    const conversations = await knex
      .select("c.*", "s.created_at")
      .from({ s: "shares" })
      .join(
        knex
          .select(
            { conversation_id: "u.id" },
            "u.name",
            "u.username",
            "u.avatar_url"
          )
          .max({ order_key: "s.id" })
          .from({ s: "shares" })
          .join(knex("users").whereNot({ id }).as("u"), function () {
            this.on("s.sender_id", "=", "u.id").orOn(
              "s.sendee_id",
              "=",
              "u.id"
            );
          })
          .groupBy("u.id")
          .as("c"),
        "s.id",
        "=",
        "c.order_key"
      )
      .orderBy("c.order_key", "desc");
    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching user's conversations: ${error}`,
    });
  }
};

module.exports = {
  index,
  fetchProfilePosts,
  fetchFeed,
  findOnePost,
  fetchFavorites,
  update,
  fetchConversations,
};
