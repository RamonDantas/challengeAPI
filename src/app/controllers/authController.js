const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const authConfig = require("../../config/auth.json");

const User = require("../models/user");
const router = express.Router();

//creating token whtw one day expiration
function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const name = email.split("@")[0];
  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ erro: "User already exists" });

    const user = await User.create({ email, password, name });
    user.password = undefined;

    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch {
    return res.status(400).send({ errp: "Registration failed" });
  }
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) return res.status(400).send({ error: "User not found" });

  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({ error: "Invalid password" });

  user.password = undefined;

  res.send({ user, token: generateToken({ id: user.id }) });
});

module.exports = (app) => app.use("/auth", router);
