const express = require("express");
const knex = require("knex")(require("./knexfile"));
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { createServer } = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 8080;
const ORIGIN = process.env.CORS_ORIGIN;
const SECRET_KEY = process.env.JWT_SECRET_KEY;

const userRoutes = require("./routes/user-routes");
const movieRoutes = require("./routes/movie-routes");
const postRoutes = require("./routes/post-routes");
const profileRoutes = require("./routes/profile-routes");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ORIGIN,
  },
});

app.use(express.json());

app.use(
  cors({
    options: ORIGIN,
  })
);

app.use((req, res, next) => {
  if (req.url === "/api/register" || req.url === "/api/login") {
    next();
  } else {
    try {
      const token = getToken(req);
      if (token) {
        if (jwt.verify(token, SECRET_KEY)) {
          req.decoded = jwt.decode(token);
          next();
        } else {
          return res.status(403).json({ error: "Not Authorized." });
        }
      } else {
        return res.status(403).json({ error: "No token. Unauthorized." });
      }
    } catch (error) {
      return res.status(500).json({ error: `${error}` });
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
  const { name, username, email, password, bio } = req.body;
  if (!(name && email && username && password)) {
    return res
      .status(400)
      .json({ message: "Please enter all required fields" });
  }

  const hashedPassword = bcrypt.hashSync(password);

  const usernamesFound = await knex("users").where({ username });

  if (usernamesFound.length) {
    return res.status(400).json({ message: "Username taken." });
  }

  const emailsFound = await knex("users").where({ email });

  if (emailsFound.length) {
    return res.status(400).json({
      message: `An account with email address ${email} already exists.`,
    });
  }

  const newUser = {
    name,
    username,
    email,
    bio,
    avatar_url: `https://source.boringavatars.com/beam/40/${username}?colors=323232,0095ff,afafaf,0065ad,e1e1e1`,
    password: hashedPassword,
  };
  try {
    await knex("users").insert(newUser);
    res.status(201).json({ message: "Registration successful." });
  } catch (error) {
    res.status(500).json({ message: "Registration failed." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter all required fields" });
    }

    const user = await knex("users").where({ email: email }).first();

    if (!user) {
      return res
        .status(400)
        .json({ message: "User with that email address does not exist." });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, {
      expiresIn: "24h",
    });

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Login failed." });
  }
});

io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  socket.userId = userId;
  next();
});

io.on("connection", (socket) => {
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      socketId: id,
      userId: socket.userId,
    });
  }
  console.log(users);
  socket.emit("users", users);
  socket.broadcast.emit("user connected", {
    socketId: socket.id,
    userId: socket.userId,
  });

  socket.join(socket.userId);

  socket.on("message", (data) => {
    console.log(data);
    socket.to(data.socketId).emit("message", {
      data,
      from: socket.socketId,
    });
  });

  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userId).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user disconnected", socket.userId);
    }
  });
});

app.use("/api/user", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/profiles", profileRoutes);

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
