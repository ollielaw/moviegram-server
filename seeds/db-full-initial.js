const usersData = require("../seed-data/users");
const postsData = require("../seed-data/posts");
const moviesData = require("../seed-data/movies");
const commentsData = require("../seed-data/comments");
const likesData = require("../seed-data/likes");
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("likes").del();
  await knex("comments").del();
  await knex("posts").del();
  await knex("movies").del();
  await knex("users").del();
  await knex("users").insert(usersData);
  await knex("movies").insert(moviesData);
  await knex("posts").insert(postsData);
  await knex("comments").insert(commentsData);
  await knex("likes").insert(likesData);
};
