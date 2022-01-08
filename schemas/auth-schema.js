const Joi = require("joi");

// eslint-disable-next-line
const emailRegexp = /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/;
const passwordRegexp = /^[A-Za-z0-9]{5,30}$/;

const authSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().pattern(passwordRegexp).required(),
});

module.exports = authSchema;
