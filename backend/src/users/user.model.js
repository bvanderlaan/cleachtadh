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
 *         admin:
 *           type: boolean
 *           description: True if the user is an admin user
 *         displayName:
 *           type: string
 *           description: The users display name, the name we show in the app
 *         email:
 *           type: string
 *           description: The users email, used for notifications
 *         password:
 *           type: string
 *           description: The users password, used for logging in and not stored in plain text
 *         state:
 *           description: The state the user is in. 0 == PENDING, 1 == ACTIVE
 *           type: integer
 *           enum: [0, 1]
 */

const schema = mongoose.Schema({
  displayName: {
    type: String,
    unique: false,
    required: true,
  },
  admin: {
    type: Boolean,
    required: false,
    default: false,
  },
  state: {
    type: Number,
    required: false,
    default: 0,
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

schema.pre('save', function (next) {
  if (this.isModified('local.password')) {
    return bcrypt.genSalt(8)
      .then(salt => bcrypt.hash(this.local.password, salt, null))
      .then((hash) => {
        this.local.password = hash;
        return next();
      })
      .catch(next);
  }
  return next();
});

schema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.local.password);
};

schema.methods.present = function () {
  return {
    id: this._id.toString(),
    displayName: this.displayName,
    admin: this.admin,
    state: this.state,
  };
};

schema.statics.States = () => ({
  PENDING: 0,
  ACTIVE: 1,
});

module.exports = {
  getModel() {
    return mongoose.model('User', schema);
  },
};
