const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../../models");
const { authSchema, subscriptionSchema } = require("../../schemas");
const authenticate = require("../../middlewares/authenticate");

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

router.get("/logout", authenticate, async (req, res) => {
  const { _id: id } = req.user;
  await User.findByIdAndUpdate(id, { token: null });

  res.status(204).send();
});

router.get("/current", authenticate, async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    user: { email, subscription },
  });
});

router.patch("/", authenticate, async (req, res, next) => {
  try {
    const { subscription } = req.body;
    if (!subscription) {
      const error = new Error("missing field subscription");
      error.status = 400;
      throw error;
    }
    const { error } = subscriptionSchema.validate({ subscription });
    if (error) {
      error.status = 400;
      throw error;
    }

    const { _id: id } = req.user;
    const renewedUser = await User.findByIdAndUpdate(id, { subscription }, { new: true });
    res.json({
      user: {
        email: renewedUser.email,
        subscription: renewedUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
