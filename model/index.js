const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const renewFile = require('./service');

const location = path.join(__dirname, './contacts.json');

const listContacts = async () => {
    const contacts = await fs.readFile(location);
    const parsedContacts = JSON.parse(contacts);
    return parsedContacts;
}

const getContactById = async (contactId) => {
    const contacts = await listContacts();
    const soughtContact = contacts.find(({ id }) => id === contactId);
    
    if (!soughtContact) {
      return null;
    }
    
    return soughtContact;  
}

const removeContact = async (contactId) => {
    const contacts = await listContacts();
    const soughtIdx = contacts.findIndex(({ id }) => id === contactId);

    if (soughtIdx < 0) {
      return null;
    }

    const renewedContacts = contacts.filter((_, idx) => idx !== soughtIdx);
    const removedContact = contacts[soughtIdx];
    await renewFile(location, renewedContacts);
    return removedContact;
}

const addContact = async (body) => {
    const contacts = await listContacts();
    const newContact = { id: uuidv4(), ...body };
    const renewedContacts = [...contacts, newContact];
    await renewFile(location, renewedContacts);
    return newContact;
}

const updateContact = async (contactId, body) => {
    const contacts = await listContacts();
    const soughtIdx = contacts.findIndex(({ id }) => id === contactId);
    
    if (soughtIdx < 0) {
      return null;
  }

    contacts[soughtIdx] = {id: contactId,...body};
    const renewedContact = contacts[soughtIdx];
    await renewFile(location, contacts);
    return renewedContact;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
