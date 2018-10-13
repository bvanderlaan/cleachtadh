'use strict';

const { URL } = require('url');
const sanitize = require('mongo-sanitize');
const { Types: { ObjectId } } = require('mongoose');

const nconf = require('../config');
const User = require('./user.model').getModel();

const presentUser = user => ({
  id: user._id.toString(),
  displayName: user.displayName,
  admin: user.admin,
  state: user.state,
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

  /**
   * @swagger
   * /api/v1/users/{id}:
   *   get:
   *     description: |
   *       This route returns a user which exist in the system.
   *     tags:
   *       - users
   *     security:
   *       - bearerToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *         description: The unique ID for the User to fetch
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: |
   *           This route returns a 200 on success and the body of the response
   *           will include the User.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/User"
   *       400:
   *         $ref: "#/components/responses/BadRequest"
   *       401:
   *         $ref: "#/components/responses/NotAuthenticated"
   *       404:
   *         $ref: "#/components/responses/NotFound"
   *       500:
   *         $ref: "#/components/responses/ServerError"
   */
  findOne(req, res) {
    const helpURL = new URL('/docs/#/users/get_api_v1_users__id_', nconf.get('app_public_path'));

    if (!req.params.id) {
      res.status(400).json({
        message: 'Error: Missing the User ID',
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    if (!ObjectId.isValid(req.params.id)) {
      req.log.info({ userId: req.params.id }, 'Invalid User ID provided');

      // Don't leak the ID schema, simply say the User wasn't found
      res.status(404).json({
        message: 'Error: The User was not found',
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    return User.findById(sanitize(req.params.id))
      .then(user => (
        !user
          ? res.status(404)
              .json({
                message: 'Error: The User was not found',
                moreInfo: helpURL.toString(),
              })
          : res.status(200)
              .json(presentUser(user))
      ))
      .catch((err) => {
        req.log.error({ err, userId: req.params.id }, 'Failed to retrieve the user');
        res.status(500).json({
          message: 'Error: Failed to retrieve the user',
          moreInfo: helpURL.toString(),
        });
      });
  },

  /**
   * @swagger
   * /api/v1/users/{id}:
   *   delete:
   *     description: |
   *       This route deletes a user which exist in the system.
   *     tags:
   *       - users
   *     security:
   *       - bearerToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *         description: The unique ID for the User to delete
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: |
   *           This route returns a 204 on success. If the User was not found
   *           the service will still return a 204.
   *       400:
   *         $ref: "#/components/responses/BadRequest"
   *       401:
   *         $ref: "#/components/responses/NotAuthenticated"
   *       500:
   *         $ref: "#/components/responses/ServerError"
   */
  destroy(req, res) {
    const helpURL = new URL('/docs/#/users/delete_api_v1_users__id_', nconf.get('app_public_path'));

    if (!req.params.id) {
      res.status(400).json({
        message: 'Error: Missing the User ID',
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    if (!ObjectId.isValid(req.params.id)) {
      req.log.info({ userId: req.params.id }, 'Invalid User ID provided');

      // Don't leak the ID schema, simply say the User does not exist
      res.status(204).end();
      return Promise.resolve();
    }

    if (req.params.id === req.user.id) {
      res.status(400).json({
        message: 'Error: Can not delete your self',
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    return User.findByIdAndDelete(sanitize(req.params.id))
      .then(() => res.status(204).end())
      .catch((err) => {
        req.log.error({ err, userId: req.params.id }, 'Failed to delete the user');
        res.status(500).json({
          message: 'Error: Failed to delete the user',
          moreInfo: helpURL.toString(),
        });
      });
  },

  /**
   * @swagger
   * /api/v1/users/{id}:
   *   patch:
   *     description: |
   *       This route updates a User
   *     tags:
   *       - users
   *     security:
   *       - bearerToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *         description: The unique ID for the User to update
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       description: |
   *         The properties of the User to update,
   *         only the properties you provide will be updated
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       200:
   *         description: |
   *           This route returns a 200 on success and the body of the response
   *           will be the updated user.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/User"
   *       400:
   *         $ref: "#/components/responses/BadRequest"
   *       401:
   *         $ref: "#/components/responses/NotAuthenticated"
   *       404:
   *         $ref: "#/components/responses/NotFound"
   *       500:
   *         $ref: "#/components/responses/ServerError"
   */
  update(req, res) {
    const helpURL = new URL('/docs/#/users/patch_api_v1_users__id_', nconf.get('app_public_path'));
    const userId = sanitize(req.params.id);
    const data = {};

    if (!userId) {
      res.status(400).json({
        message: 'Error: Missing the User ID',
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    if (!ObjectId.isValid(userId)) {
      req.log.info({ userId }, 'Invalid User ID provided');

      // Don't leak the ID schema, simply say the User does not exist
      res.status(404).json({
        message: `Error: User ${req.params.id} was not found`,
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    if (req.body.displayName) {
      data.displayName = sanitize(req.body.displayName);
    }

    if (req.body.admin !== undefined) {
      if (typeof req.body.admin !== 'boolean') {
        res.status(400).json({
          message: `Error: Invalid Admin Flag provided: ${req.body.admin}`,
          moreInfo: helpURL.toString(),
        });
        return Promise.resolve();
      }
      data.admin = sanitize(req.body.admin);
    }

    if (req.body.state !== undefined) {
      const state = sanitize(req.body.state);
      if ((typeof req.body.state !== 'number') || (!Object.values(User.States()).includes(state))) {
        res.status(400).json({
          message: `Error: Invalid User state provided: ${req.body.state}`,
          moreInfo: helpURL.toString(),
        });
        return Promise.resolve();
      }

      data.state = state;
    }

    if (!data.displayName && data.admin === undefined && data.state === undefined) {
      res.status(400).json({
        message: 'Error: No values provided, nothing to update',
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    return User.findByIdAndUpdate(userId, data, { new: true })
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            message: `Error: User ${req.params.id} was not found`,
            moreInfo: helpURL.toString(),
          });
        }

        return res.status(200).json(presentUser(user));
      })
      .catch((err) => {
        req.log.error({ err, userId }, 'Failed to update the user');
        res.status(500).json({
          message: 'Error: Failed to update the user',
          moreInfo: helpURL.toString(),
        });
      });
  },
};
