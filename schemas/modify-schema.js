const Joi = require('joi');

const modifySchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/),
    favorite: Joi.boolean()
});

module.exports = modifySchema;