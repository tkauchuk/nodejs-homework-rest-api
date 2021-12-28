const Joi = require('joi');

const defaultSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/).required(),
  favorite: Joi.boolean().default(false)
});

module.exports = defaultSchema;