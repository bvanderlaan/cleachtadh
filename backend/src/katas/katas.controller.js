'use strict';

const { URL } = require('url');
const sanitize = require('mongo-sanitize');
const { Types: { ObjectId } } = require('mongoose');

const nconf = require('../config');
const Kata = require('./kata.model').getModel();

const presentKata = kata => ({
  id: kata._id.toString(),
  name: kata.name,
  description: kata.description,
  addedBy: {
    id: kata.addedById,
    name: kata.addedByName,
  },
  created_at: kata.created_at,
});

/**
 * @swagger
 * tags:
 *   - name: katas
 *     description: Routes related the Coding Katas
 */

module.exports = {
  /**
   * @swagger
   * /api/v1/katas:
   *   get:
   *     description: |
   *       This route returns a collection of coding katas which exist in the registry.
   *     tags:
   *       - katas
   *     responses:
   *       200:
   *         description: |
   *           This route returns a 200 on success and the body of the response
   *           will include an array of Coding Katas.
   *
   *           If no katas exist then an empty array will be returned.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 katas:
   *                   type: array
   *                   items:
   *                     $ref: "#/components/schemas/Kata"
   *       500:
   *         $ref: "#/components/responses/ServerError"
   */
  find(req, res) {
    return Kata.find({})
      .then((response) => {
        const katas = response.map(presentKata);

        return res.status(200).json({ katas });
      })
      .catch((err) => {
        const helpURL = new URL('/docs/#/katas/get_api_v1_katas', nconf.get('app_public_path'));

        req.log.error({ err }, 'Failed to retrieve katas');
        res.status(500).json({
          message: 'Error: Failed to retrieve katas',
          moreInfo: helpURL.toString(),
        });
      });
  },

  /**
   * @swagger
   * /api/v1/katas/{id}:
   *   get:
   *     description: |
   *       This route returns a kata which exist in the registry.
   *     tags:
   *       - katas
   *     parameters:
   *       - in: path
   *         name: id
   *         description: The unique ID for the Kata to fetch
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: |
   *           This route returns a 200 on success and the body of the response
   *           will include the Coding Katas.
   *
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/Kata"
   *       400:
   *         $ref: "#/components/responses/BadRequest"
   *       404:
   *         $ref: "#/components/responses/NotFound"
   *       500:
   *         $ref: "#/components/responses/ServerError"
   */
  findOne(req, res) {
    const helpURL = new URL('/docs/#/katas/get_api_v1_katas__id_', nconf.get('app_public_path'));

    if (!req.params.id) {
      res.status(400).json({
        message: 'Error: Missing the Kata ID',
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    if (!ObjectId.isValid(req.params.id)) {
      req.log.info({ kataId: req.params.id }, 'Invalid Kata ID provided');

      // Don't leak the ID schema, simply say the Kata wasn't found
      res.status(404).json({
        message: 'Error: The Kata was not found',
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    return Kata.findById(sanitize(req.params.id))
      .then(kata => (
        !kata
          ? res.status(404)
              .json({
                message: 'Error: The Kata was not found',
                moreInfo: helpURL.toString(),
              })
          : res.status(200)
              .json(presentKata(kata))
      ))
      .catch((err) => {
        req.log.error({ err, kataId: req.params.id }, 'Failed to retrieve the kata');
        res.status(500).json({
          message: 'Error: Failed to retrieve the kata',
          moreInfo: helpURL.toString(),
        });
      });
  },

  /**
   * @swagger
   * /api/v1/katas:
   *   post:
   *     description: |
   *       This route inserts a new Kata into the registry
   *     tags:
   *       - katas
   *     security:
   *       - bearerToken: []
   *     requestBody:
   *       description: The Kata to add to the registry
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Kata'
   *     responses:
   *       201:
   *         description: |
   *           This route returns a 201 on success and the body of the response
   *           will be the kata just created.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/Kata"
   *       400:
   *         $ref: "#/components/responses/BadRequest"
   *       401:
   *         $ref: "#/components/responses/NotAuthenticated"
   *       500:
   *         $ref: "#/components/responses/ServerError"
   */
  create(req, res) {
    const helpURL = new URL('/docs/#/katas/post_api_v1_katas', nconf.get('app_public_path'));

    if (!req.body.name) {
      res.status(400).json({
        message: 'Error: Missing the Kata Name',
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    if (!req.body.description) {
      res.status(400).json({
        message: 'Error: Missing the Kata Description',
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    const kata = new Kata();
    kata.name = sanitize(req.body.name);
    kata.description = sanitize(req.body.description);
    kata.addedById = req.user._id;
    kata.addedByName = req.user.displayName;

    return kata.save()
      .then(() => res.status(201).json(presentKata(kata)))
      .catch((err) => {
        req.log.error({ err }, 'Failed to add the kata');
        res.status(500).json({
          message: 'Error: Failed to add the kata',
          moreInfo: helpURL.toString(),
        });
      });
  },

  /**
   * @swagger
   * /api/v1/katas/{id}:
   *   delete:
   *     description: |
   *       This route deletes a kata which exist in the registry.
   *     tags:
   *       - katas
   *     security:
   *       - bearerToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *         description: The unique ID for the Kata to delete
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: |
   *           This route returns a 204 on success. If the Kata was not found
   *           the service will still return a 204.
   *       400:
   *         $ref: "#/components/responses/BadRequest"
   *       401:
   *         $ref: "#/components/responses/NotAuthenticated"
   *       500:
   *         $ref: "#/components/responses/ServerError"
   */
  destroy(req, res) {
    const helpURL = new URL('/docs/#/katas/delete_api_v1_katas__id_', nconf.get('app_public_path'));

    if (!req.params.id) {
      res.status(400).json({
        message: 'Error: Missing the Kata ID',
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    if (!ObjectId.isValid(req.params.id)) {
      req.log.info({ kataId: req.params.id }, 'Invalid Kata ID provided');

      // Don't leak the ID schema, simply say the Kata does not exist
      res.status(204).end();
      return Promise.resolve();
    }

    return Kata.findById(sanitize(req.params.id))
      .then((kata) => {
        if (!kata) {
          return Promise.resolve();
        }

        if (!req.user.admin && (kata.addedById !== req.user.id)) {
          res.status(401).json({
            message: 'Error: Failed to delete the kata',
            moreInfo: helpURL.toString(),
          });
          return Promise.resolve();
        }

        return kata.remove();
      })
      .then(() => {
        if (!res.headersSent) {
          res.status(204).end()
        }
      })
      .catch((err) => {
        req.log.error({ err, kataId: req.params.id }, 'Failed to delete the kata');
        res.status(500).json({
          message: 'Error: Failed to delete the kata',
          moreInfo: helpURL.toString(),
        });
      });
  },

  /**
   * @swagger
   * /api/v1/katas/{id}:
   *   patch:
   *     description: |
   *       This route updates a Kata
   *     tags:
   *       - katas
   *     security:
   *       - bearerToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *         description: The unique ID for the Kata to update
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       description: |
   *         The properties of the Kata to update,
   *         only the properties you provide will be updated
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Kata'
   *     responses:
   *       200:
   *         description: |
   *           This route returns a 200 on success and the body of the response
   *           will be the updated kata.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/Kata"
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
    const helpURL = new URL('/docs/#/katas/patch_api_v1_katas__id_', nconf.get('app_public_path'));
    const kataId = sanitize(req.params.id);
    const data = {};

    if (!kataId) {
      res.status(400).json({
        message: 'Error: Missing the Kata ID',
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    if (!ObjectId.isValid(kataId)) {
      req.log.info({ kataId }, 'Invalid Kata ID provided');

      // Don't leak the ID schema, simply say the Kata does not exist
      res.status(404).json({
        message: `Error: Kata ${req.params.id} was not found`,
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    if (req.body.name) {
      data.name = sanitize(req.body.name);
    }

    if (req.body.description) {
      data.description = sanitize(req.body.description);
    }

    if (!data.name && !data.description) {
      res.status(400).json({
        message: 'Error: No values provided, nothing to update',
        moreInfo: helpURL.toString(),
      });
      return Promise.resolve();
    }

    return Kata.findByIdAndUpdate(kataId, data, { new: true })
      .then((kata) => {
        if (!kata) {
          return res.status(404).json({
            message: `Error: Kata ${req.params.id} was not found`,
            moreInfo: helpURL.toString(),
          });
        }

        return res.status(200).json(presentKata(kata));
      })
      .catch((err) => {
        req.log.error({ err, kataId }, 'Failed to update the kata');
        res.status(500).json({
          message: 'Error: Failed to update the kata',
          moreInfo: helpURL.toString(),
        });
      });
  },
};
