const express = require('express');
const router = express.Router();
const Contact = require('../../model');
const { defaultSchema, modifySchema } = require('../../schemas');


router.get('/', async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const soughtContact = await Contact.findById(id);
    
    if (!soughtContact) {
      const error = new Error('Not found.');
      error.status = 404;
      throw error;
    }
    res.json(soughtContact);
  } catch (error) {
    const idError = 'Cast to ObjectId failed';
    if (error.message.includes(idError)) {
      error.status = 404;
    }

    next(error);
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { error } = defaultSchema.validate(req.body);
    if (error) {
      error.status = 400;
      throw error;
    }

    const newContact = await Contact.create(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    const validationError = 'contact validation failed';
    if (error.message.includes(validationError)) {
      error.status = 400;
    }
    next(error);
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedContact = await Contact.findByIdAndRemove(id);

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
    const { error } = modifySchema.validate(req.body);
    if (error) {
      error.status = 400;
      throw error;
    }
    const { id } = req.params;
    const renewedContact = await Contact.findByIdAndUpdate(id, req.body, {new: true});
    
    if (!renewedContact) {
      const err = new Error('Not found.');
      err.status = 404;
      throw err;
    }
    
     res.json(renewedContact);
  } catch (error) {
    const validationError = 'contact validation failed';
    if (error.message.includes(validationError)) {
      error.status = 400;
    }
    next(error);
  }
})

router.patch('/:id/favorite', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { favorite } = req.body;
      if (!favorite) {
        const err = new Error('missing field favorite');
        err.status = 400;
        throw err;
      }

      const renewedContact = await Contact.findByIdAndUpdate(id, {favorite}, {new: true});
      if (!renewedContact) {
        const error = new Error('Not found.');
        error.status = 404;
        throw error;
      }

      res.json(renewedContact);
    } catch (error) {
      const validationError = 'contact validation failed';
      if (error.message.includes(validationError)) {
        error.status = 400;
      }
      next(error);
    }
});

module.exports = router
