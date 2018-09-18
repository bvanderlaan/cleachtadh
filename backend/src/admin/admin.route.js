'use strict';

const express = require('express');
const path = require('path');

const { create, view } = require('./admin.controller');

const router = express.Router();

router.get('/', view);
router.post('/', create);
router.use('/', express.static(path.join(__dirname, 'static')));

module.exports = router;
