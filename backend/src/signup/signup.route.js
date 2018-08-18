'use strict';

const express = require('express');

const { signup } = require('./signup.controller');

const router = express.Router();

module.exports = (passport) => {
  router.post('/signup', passport.authenticate('local-signup'), signup);

  return router;
};
