const bcrypt = require("bcryptjs");

module.exports = [
  {
    id: 1,
    name: "Ollie Law",
    username: "ollie_law4",
    email: "ollielaw@moviegram.com",
    password: bcrypt.hashSync("Password123"),
    bio: "Action Movie Enthusiast",
    avatar_url:
      "https://source.boringavatars.com/beam/40/ollie_law4?colors=323232,0095ff,afafaf,0065ad,e1e1e1",
  },
  {
    id: 2,
    name: "John Smith",
    username: "johnnysmith4",
    email: "johnsmith@moviegram.com",
    password: bcrypt.hashSync("Password123"),
    bio: "",
    avatar_url:
      "https://source.boringavatars.com/beam/40/johnnysmith4?colors=323232,0095ff,afafaf,0065ad,e1e1e1",
  },
  {
    id: 3,
    name: "Harry Robinson",
    username: "harryrobo01",
    email: "harryrobinson@moviegram.com",
    password: bcrypt.hashSync("Password123"),
    bio: "",
    avatar_url:
      "https://source.boringavatars.com/beam/40/harryrobo01?colors=323232,0095ff,afafaf,0065ad,e1e1e1",
  },
  {
    id: 4,
    name: "Sharon Ng",
    username: "sharon_ng",
    email: "sharonng@moviegram.com",
    password: bcrypt.hashSync("Password123"),
    bio: "",
    avatar_url:
      "https://source.boringavatars.com/beam/40/sharon_ng?colors=323232,0095ff,afafaf,0065ad,e1e1e1",
  },
  {
    id: 5,
    name: "Alana Thomas",
    username: "alanat3",
    email: "alanathomas@moviegram.com",
    password: bcrypt.hashSync("Password123"),
    bio: "",
    avatar_url:
      "https://source.boringavatars.com/beam/40/alana3?colors=323232,0095ff,afafaf,0065ad,e1e1e1",
  },
  {
    id: 6,
    name: "Vanessa Mendoza",
    username: "vmendoza",
    email: "vanessamendoza@moviegram.com",
    password: bcrypt.hashSync("Password123"),
    bio: "",
    avatar_url:
      "https://source.boringavatars.com/beam/40/vmendoza?colors=323232,0095ff,afafaf,0065ad,e1e1e1",
  },
];
