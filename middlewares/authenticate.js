const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { SECRET_KEY } = process.env;

const authenticate = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      const error = new Error("Not authorized");
      error.status = 401;
      throw error;
    }

    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      const error = new Error("Not authorized");
      error.status = 401;
      throw error;
    }

    jwt.verify(token, SECRET_KEY, (error, _) => {
      error.status = 401;
      error.message = "Not authorized";
    });

    const userInExistence = await User.findOne({ token });
    if (!userInExistence) {
      const error = new Error("Not authorized");
      error.status = 401;
      throw error;
    }
    req.user = userInExistence;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
