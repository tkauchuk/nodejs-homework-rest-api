const jwt = require("jsonwebtoken");
const { Unauthorized } = require("http-errors");
const { User } = require("../models");
const { SECRET_KEY } = process.env;

const authenticate = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new Unauthorized("Not authorized");
    }

    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      throw new Unauthorized("Not authorized");
    }

    jwt.verify(token, SECRET_KEY, (error, _) => {
      if (error) {
        throw new Unauthorized("Not authorized");
      }
    });

    const userInExistence = await User.findOne({ token });
    if (!userInExistence) {
      throw new Unauthorized("Not authorized");
    }
    req.user = userInExistence;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
