'use strict';

const { URL } = require('url');

const nconf = require('../config');
const Kata = require('./kata.model').getModel();

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
        const katas = response.map(kata => ({
          id: kata._id,
          name: kata.name,
          description: kata.description,
          created_at: kata.created_at,
        }));

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
   * /api/v1/katas:
   *   post:
   *     description: |
   *       This route inserts a new Kata into the registry
   *     tags:
   *       - katas
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
    kata.name = req.body.name;
    kata.description = req.body.description;

    return kata.save()
      .then(() => res.status(201).json({
        id: kata._id.toString(),
        name: kata.name,
        description: kata.description,
        created_at: kata.created_at,
      }))
      .catch((err) => {
        req.log.error({ err }, 'Failed to add the kata');
        res.status(500).json({
          message: 'Error: Failed to add the kata',
          moreInfo: helpURL.toString(),
        });
      });
  },
};
