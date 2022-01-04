const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../../models");
const { authSchema } = require("../../schemas");

const { SECRET_KEY } = process.env;

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = authSchema.validate(req.body);
    if (error) {
      error.status = 400;
      throw error;
    }

    const { password, email } = req.body;
    const userInExistence = await User.findOne({ email });
    if (userInExistence) {
      const error = new Error("Email in use");
      error.status = 409;
      throw error;
    }

    const newUser = await User.create({
      password: await bcrypt.hash(password, 10),
      email,
    });
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = authSchema.validate(req.body);
    if (error) {
      error.status = 400;
      throw error;
    }

    const { email, password } = req.body;
    const userInExistence = await User.findOne({ email });
    if (!userInExistence) {
      const error = new Error("Email or password is wrong");
      error.status = 401;
      throw error;
    }

    const isPasswordCorrect = await bcrypt.compare(password, userInExistence.password);
    if (!isPasswordCorrect) {
      const error = new Error("Email or password is wrong");
      error.status = 401;
      throw error;
    }

    const token = jwt.sign({ id: userInExistence._id }, SECRET_KEY, { expiresIn: "1h" });
    await User.findByIdAndUpdate(userInExistence._id, { token });
    res.json({
      token,
      user: {
        email: userInExistence.email,
        subscription: userInExistence.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", async (req, res, next) => {});
router.post("/current", async (req, res, next) => {});

module.exports = router;
