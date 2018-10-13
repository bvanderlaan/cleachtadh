'use strict';

const path = require('path');

const { User } = require('../users')();

const doesAdminExist = () => (
  User.find({ admin: true })
    .then(admins => (admins.length > 0))
);


module.exports = {
  create(req, res) {
    if (!req.body.displayName) {
      res.status(400)
        .json({
          message: 'Error: Missing admin display name',
        });
      return Promise.resolve();
    }

    if (!req.body.email) {
      res.status(400)
        .json({
          message: 'Error: Missing admin email address',
        });
      return Promise.resolve();
    }

    if (!req.body.password) {
      res.status(400)
        .json({
          message: 'Error: Missing admin password',
        });
      return Promise.resolve();
    }

    const newAdmin = new User();
    newAdmin.local.email = req.body.email;
    newAdmin.local.password = req.body.password;
    newAdmin.displayName = req.body.displayName;
    newAdmin.admin = true;
    newAdmin.state = User.States().ACTIVE;

    return newAdmin.save()
      .then(() => res.status(201).end())
      .catch((err) => {
        req.log.error({ err }, 'Failed to create Admin');
        res.status(500).json({ message: 'Error: Failed to create Admin' });
      });
  },

  view(req, res) {
    doesAdminExist()
      .then((exists) => {
        if (exists) {
          return res.status(404)
            .json({
              message: `Not Found: Cannot ${req.method} ${req.originalUrl}`,
            });
        }

        return res.sendFile(path.join(__dirname, 'admin.html'));
      })
      .catch((err) => {
        req.log.error({ err }, 'Failed to fetch Admin view');
        res.status(500).json({
          message: 'Error: Failed to fetch Admin view',
        });
      });
  },
};
