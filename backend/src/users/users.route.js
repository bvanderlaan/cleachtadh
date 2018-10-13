'use strict';

const express = require('express');

const { destroy, find, findOne, update } = require('./users.controller');
const { adminGuard } = require('./admin.guard');

const router = express.Router();

module.exports = (passport) => {
  router.get('/v1/users', passport.authenticate('jwt', { session: false }), adminGuard, find);
  router.get('/v1/users/:id', passport.authenticate('jwt', { session: false }), adminGuard, findOne);
  router.delete('/v1/users/:id', passport.authenticate('jwt', { session: false }), adminGuard, destroy);
  router.put('/v1/users/:id', passport.authenticate('jwt', { session: false }), adminGuard, update);
  router.patch('/v1/users/:id', passport.authenticate('jwt', { session: false }), adminGuard, update);

  return router;
};
