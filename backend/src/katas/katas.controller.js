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
      .then(katas => res.status(200).json({ katas }))
      .catch((err) => {
        const helpURL = new URL('/docs/#/katas/get_api_v1_katas', nconf.get('app_public_path'));

        req.log.error({ err }, 'Failed to retrieve katas');
        res.status(500).json({
          message: 'Error: Failed to retrieve katas',
          moreInfo: helpURL.toString(),
        });
      });
  },
};
