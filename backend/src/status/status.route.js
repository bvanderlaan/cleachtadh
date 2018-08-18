'use strict';

const express = require('express');

const statusController = require('./status.controller');

const router = express.Router();

router.get('/status', statusController.get);

module.exports = router;
