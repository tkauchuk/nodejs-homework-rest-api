const Joi = require('joi');

// eslint-disable-next-line
const emailRegexp = /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/;
const phoneRegexp = /^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/;

const modifySchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().pattern(emailRegexp),
    phone: Joi.string().pattern(phoneRegexp),
    favorite: Joi.boolean()
});

module.exports = modifySchema;