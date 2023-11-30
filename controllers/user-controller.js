const knex = require("knex")(require("../knexfile"));
require("dotenv").config();
const axios = require("axios");

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
      .select(
        "c.*",
        "s.created_at",
        { last_sender: "s.sender_id" },
        "s.sendee_id",
        "s.has_seen"
      )
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
          .where({ sender_id: id })
          .orWhere({ sendee_id: id })
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

const findOneConversation = async (req, res) => {
  const { id } = req.decoded;
  const { userId } = req.params;
  try {
    const conversation = await knex
      .select("c.*", "u.name", "u.username", "u.avatar_url")
      .from({ u: "users" })
      .join(
        knex
          .select(
            "s.*",
            "m.movie_name",
            "m.tmdb_id",
            "m.poster_url",
            "m.backdrop_url",
            "m.release_date"
          )
          .from({ m: "movies" })
          .rightJoin(
            knex("shares")
              .where(function () {
                this.where({ sender_id: id }).andWhere({ sendee_id: userId });
              })
              .orWhere(function () {
                this.where({ sender_id: userId }).andWhere({ sendee_id: id });
              })
              .as("s"),
            "m.id",
            "=",
            "s.movie_id"
          )
          .as("c"),
        "u.id",
        "=",
        "c.sender_id"
      )
      .orderBy("c.id", "asc");
    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching conversation with user ${userId}`,
    });
  }
};

const shareMessage = async (req, res) => {
  const { id } = req.decoded;
  const { userId } = req.params;
  const { tmdb_id, message } = req.body;
  try {
    if (tmdb_id) {
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
          backdrop_url: data.backdrop_path,
          release_date: data.release_date,
        };
        await knex("movies").insert(newMovie);
      }
      const usersFound = await knex("users").where({ id: userId });
      if (!usersFound.length) {
        return res.status(404).json({
          message: `Target user ${userId} not found`,
        });
      }
      const newShare = {
        movie_id: moviesFound[0].id,
        sender_id: id,
        sendee_id: userId,
        message: "",
        has_seen: false,
      };
      const newShareIds = await knex("shares").insert(newShare);
      const share_id = newShareIds[0];
      const resShare = {
        id: share_id,
        ...newShare,
      };
      return res.status(201).json(resShare);
    }
    const usersFound = await knex("users").where({ id: userId });
    if (!usersFound.length) {
      return res.status(404).json({
        message: `Target user ${userId} not found`,
      });
    }
    const newShare = {
      sender_id: id,
      sendee_id: userId,
      message,
      has_seen: false,
    };
    const newShareIds = await knex("shares").insert(newShare);
    const share_id = newShareIds[0];
    const resShare = await knex("shares").where({ id: share_id }).first();
    return res.status(201).json(resShare);
  } catch (error) {
    return res.status(500).json({
      message: `Error sending message to user ${userId}: ${error}`,
    });
  }
};

const viewMessage = async (req, res) => {
  const { messageId } = req.params;
  try {
    const messagesFound = await knex("shares").where({ id: messageId });
    if (!messagesFound.length) {
      return res.status(404).json({
        message: `Message ${messageId} not found.`,
      });
    }
    const updatedMsg = {
      id: messagesFound[0].id,
      movie_id: messagesFound[0].movie_id,
      sender_id: messagesFound[0].sender_id,
      sendee_id: messagesFound[0].sendee_id,
      message: messagesFound[0].message,
      has_seen: true,
    };
    await knex("shares").where({ id: messageId }).update(updatedMsg);
    return res.status(200).json(updatedMsg);
  } catch (error) {
    return res.status(500).json({
      message: `Error updating message to viewed: ${error}`,
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
  findOneConversation,
  shareMessage,
  viewMessage,
};
