const express = require("express");
const router = express.Router();
const { BadRequest, NotFound } = require("http-errors");
const { Contact } = require("../../models");
const { defaultSchema, modifySchema } = require("../../schemas");

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, favorite } = req.query;
    const query = favorite ? { favorite } : {};
    const skip = (page - 1) * limit;
    const contacts = await Contact.find(query, "", { skip, limit: parseInt(limit) });
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const soughtContact = await Contact.findById(id);

    if (!soughtContact) {
      throw new NotFound();
    }
    res.json(soughtContact);
  } catch (error) {
    const idError = "Cast to ObjectId failed";
    if (error.message.includes(idError)) {
      error.status = 404;
    }

    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = defaultSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }

    const newContact = await Contact.create(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    const validationError = "contact validation failed";
    if (error.message.includes(validationError)) {
      error.status = 400;
    }
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedContact = await Contact.findByIdAndRemove(id);

    if (!deletedContact) {
      throw new NotFound();
    }

    res.json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { error } = modifySchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { id } = req.params;
    const renewedContact = await Contact.findByIdAndUpdate(id, req.body, { new: true });

    if (!renewedContact) {
      throw new NotFound();
    }

    res.json(renewedContact);
  } catch (error) {
    const validationError = "contact validation failed";
    if (error.message.includes(validationError)) {
      error.status = 400;
    }
    next(error);
  }
});

router.patch("/:id/favorite", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { favorite } = req.body;
    if (!favorite) {
      throw new BadRequest("Missing field favorite");
    }

    const renewedContact = await Contact.findByIdAndUpdate(id, { favorite }, { new: true });
    if (!renewedContact) {
      throw new NotFound();
    }

    res.json(renewedContact);
  } catch (error) {
    const validationError = "contact validation failed";
    if (error.message.includes(validationError)) {
      error.status = 400;
    }
    next(error);
  }
});

module.exports = router;
