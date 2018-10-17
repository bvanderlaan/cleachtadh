'use strict';

const { URL } = require('url');

const nconf = require('../config');

module.exports = {
  adminGuard(req, res, next) {
    if (req.user.admin) {
      return next();
    }

    const helpURL = new URL('/docs', nconf.get('app_public_path'));

    return res.status(401).json({
      message: 'Error: Not Authorized to perform this request',
      moreInfo: helpURL.toString(),
    });
  },
};
