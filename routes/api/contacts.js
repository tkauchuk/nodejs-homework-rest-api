const express = require('express');
const router = express.Router();
const Joi = require('joi');
const operations = require('../../model');

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}/).required()
});

router.get('/', async (req, res, next) => {
  try {
    const contacts = await operations.listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const soughtContact = await operations.getContactById(id);
    
    if (!soughtContact) {
      const error = new Error('Not found.');
      error.status = 404;
      throw error;
    }
    res.json(soughtContact);
  } catch (error) {
    next(error);
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      error.status = 400;
      throw error;
    }

    const newContact = await operations.addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedContact = await operations.removeContact(id);

    if (!deletedContact) {
      const error = new Error('Not found');
      error.status = 404;
      throw error;
    }

    res.json({message: "contact deleted"});
  } catch (error) {
    next(error);
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      error.status = 400;
      error.message = 'missing fields.';
      throw error;
    }
    const { id } = req.params;
    const renewedContact = await operations.updateContact(id, req.body);
    
    if (!renewedContact) {
      const err = new Error('Not found.');
      err.status = 404;
      throw err;
    }
    
     res.json(renewedContact);
  } catch (error) {
    next(error);
  }
})

module.exports = router
