'use strict';

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - displayName
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: A unique ID for the user
 *           example: 7b52608f-897b-41d4-8599-fef76dcaecf1
 *         displayName:
 *           type: string
 *           description: The users display name, the name we show in the app
 *         email:
 *           type: string
 *           description: The users email, used for notifications
 *         password:
 *           type: string
 *           description: The users password, used for logging in and not stored in plain text
 */

const schema = mongoose.Schema({
  display_name: {
    type: String,
    unique: false,
    required: true,
  },
  local: {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
});

schema.pre('save', function(next) {
  if (this.isModified('local.password')) {
    return bcrypt.genSalt(8)
      .then(salt => bcrypt.hash(this.local.password, salt, null))
      .then((hash) => {
        this.local.password = hash;
        next();
      })
      .catch(next);
  }
  return next();
});

schema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
}

module.exports = {
  createModel() {
    return mongoose.model('User', schema);
  },

  getModel() {
    return mongoose.model('User');
  },
};
