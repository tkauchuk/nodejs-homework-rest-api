const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs/promises");
const { BadRequest, Conflict, Unauthorized, NotFound } = require("http-errors");
const gravatar = require("gravatar");
const { v4: uuidv4 } = require("uuid");
const { User } = require("../../models");
const { authSchema, subscriptionSchema } = require("../../schemas");
const { authenticate, upload } = require("../../middlewares");
const resizer = require("../../service");
const sender = require("../../utils");

const { SECRET_KEY, VERIFICATION_DOMAIN } = process.env;
const avatarsPath = path.join(__dirname, "../../", "public", "avatars");

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = authSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }

    const { password, email } = req.body;
    const userInExistence = await User.findOne({ email });
    if (userInExistence) {
      throw new Conflict("Email in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = uuidv4();
    const newUser = await User.create({ password: hashedPassword, verificationToken, email, avatarURL });

    const emailSample = {
      to: email,
      subject: "Email verification",
      html: `<a target="_blank" href="${VERIFICATION_DOMAIN}/users/verify/${verificationToken}">Verify your email!</a>`,
    };
    await sender(emailSample);

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
      throw new BadRequest(error.message);
    }

    const { email, password } = req.body;
    const userInExistence = await User.findOne({ email });
    if (!userInExistence) {
      throw new Unauthorized("Email or password is wrong");
    }

    if (!userInExistence.verify) {
      throw new Unauthorized("Email hasn't been verified yet");
    }

    const isPasswordCorrect = await bcrypt.compare(password, userInExistence.password);
    if (!isPasswordCorrect) {
      throw new Unauthorized("Email or password is wrong");
    }

    const token = jwt.sign({ id: userInExistence._id }, SECRET_KEY, { expiresIn: "1h" });
    await User.findByIdAndUpdate(userInExistence._id, { token });
    res.json({
      token,
      user: {
        id: userInExistence._id,
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
      throw new BadRequest("Missing field subscription");
    }
    const { error } = subscriptionSchema.validate({ subscription });
    if (error) {
      throw new BadRequest(error.message);
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

router.patch("/avatars", authenticate, upload.single("avatar"), async (req, res) => {
  const { path: tmpUpload, filename } = req.file;
  await resizer({ path: tmpUpload, height: 250, width: 250 });
  const extension = path.extname(filename);
  const { _id: userId } = req.user;
  const uniqueFilename = `${userId}${extension}`;
  const finalUpload = path.join(avatarsPath, uniqueFilename);
  await fs.rename(tmpUpload, finalUpload);
  const avatarURL = path.join("avatars", uniqueFilename);
  await User.findByIdAndUpdate({ _id: userId }, { avatarURL }, { new: true });
  res.json({ avatarURL });
});

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      throw new NotFound("User not found");
    }
    await User.findByIdAndUpdate(user._id, { verificationToken: null, verify: true });
    res.json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequest("Missing required field email");
    }
    const user = User.findOne({ email });
    if (!user) {
      throw new NotFound();
    }
    if (user.verify) {
      throw new BadRequest("Verification has already been passed");
    }
    const { verificationToken } = user;
    const emailSample = {
      to: email,
      subject: "Email verification",
      html: `<a target="_blank" href="${VERIFICATION_DOMAIN}/users/verify/${verificationToken}">Verify your email!</a>`,
    };
    await sender(emailSample);
    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
