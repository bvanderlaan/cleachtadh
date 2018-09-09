'use strict';

const express = require('express');

const {
  create,
  destroy,
  find,
  findOne,
  update,
} = require('./katas.controller');

const router = express.Router();

module.exports = (passport) => {
  router.get('/v1/katas', find);
  router.get('/v1/katas/:id', findOne);

  router.post('/v1/katas', create);
  router.delete('/v1/katas/:id', destroy);
  router.patch('/v1/katas/:id', update);
  router.put('/v1/katas/:id', update);

  return router;
};
