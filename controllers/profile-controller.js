const knex = require("knex")(require("../knexfile"));

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

module.exports = {
  findOne,
};
