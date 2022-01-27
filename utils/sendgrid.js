const sendgrid = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_API_KEY, SENDER_EMAIL } = process.env;
sendgrid.setApiKey(SENDGRID_API_KEY);

const sender = async (data) => {
  try {
    const email = { ...data, from: SENDER_EMAIL };
    await sendgrid.send(email);
    return true;
  } catch (error) {
    console.log(error);
  }
};

module.exports = sender;
