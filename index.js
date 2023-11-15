const express = require("express");
const knex = require("knex")(require("./knexfile"));
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const userRoutes = require("./routes/user-routes");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8080;
const ORIGIN = process.env.CORS_ORIGIN;
const SECRET_KEY = process.env.JWT_SECRET_KEY;

app.use(
  cors({
    options: ORIGIN,
  })
);

app.use((req, res, next) => {
  if (req.url === "/api/register" || req.url === "/api/login") {
    next();
  } else {
    const token = getToken(req);
    if (token) {
      if (jwt.verify(token, SECRET_KEY)) {
        req.decoded = jwt.decode(token);
        next();
      } else {
        res.status(403).json({ error: "Not Authorized." });
      }
    } else {
      res.status(403).json({ error: "No token. Unauthorized." });
    }
  }
});

function getToken(req) {
  if (!req.headers.authorization) {
    return;
  } else {
    return req.headers.authorization.split(" ")[1];
  }
}

app.post("/api/register", async (req, res) => {
  const { name, username, email, password, bio, avatar_url } = req.body;
  if (!(name && email && username && password)) {
    return res.status(400).send("Please enter all required fields");
  }
  const hashedPassword = bcrypt.hashSync(password);

  const newUser = {
    name,
    username,
    email,
    bio,
    avatar_url,
    password: hashedPassword,
  };
  try {
    await knex("users").insert(newUser);
    res.status(201).send("Registration successful");
  } catch (error) {
    res.status(400).send("Registration failed");
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Please enter all required fields");
  }

  const user = await knex("users").where({ email: email }).first();

  if (!user) {
    return res.status(400).send("User with that email address does not exist");
  }

  const isPasswordCorrect = bcrypt.compareSync(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(400).send("Incorrect password");
  }

  const token = jwt.sign({ id: user.id }, SECRET_KEY);

  res.json({ token });
});

app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
