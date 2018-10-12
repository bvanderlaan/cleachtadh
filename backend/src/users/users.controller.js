'use strict';

const { URL } = require('url');

const nconf = require('../config');
const User = require('./user.model').getModel();

const presentUser = user => ({
  id: user._id.toString(),
  displayName: user.displayName,
  admin: user.admin,
});

/**
 * @swagger
 * tags:
 *  - name: users
 *    description: Routes related to site users
 */
module.exports = {
  /**
   * @swagger
   * /api/v1/users:
   *   get:
   *     description: |
   *       This route returns a collection of registered users.
   *     tags:
   *       - users
   *     security:
   *       - bearerToken: []
   *     responses:
   *       200:
   *         description: |
   *           This route returns a 200 on success and the body of the response
   *           will include an array of users.
   *
   *           If no users exist then an empty array will be returned.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 users:
   *                   type: array
   *                   items:
   *                     $ref: "#/components/schemas/User"
   *       401:
   *         $ref: "#/components/responses/NotAuthenticated"
   *       500:
   *         $ref: "#/components/responses/ServerError"
   */
  find(req, res) {
    return User.find({})
      .then((response) => {
        const users = response.map(presentUser);

        return res.status(200).json({ users });
      })
      .catch((err) => {
        const helpURL = new URL('/docs/#/users/get_api_v1_users', nconf.get('app_public_path'));

        req.log.error({ err }, 'Failed to retrieve users');
        res.status(500).json({
          message: 'Error: Failed to retrieve users',
          moreInfo: helpURL.toString(),
        });
      });
  },
};
