'use strict';

const { name, version } = require('../../package.json');

/**
 * @swagger
 * tags:
 *   - name: status
 *     description: Is the service in a good state
 */

module.exports = {
  /**
   * @swagger
   * /api/status:
   *   get:
   *     description: |
   *       The service will offer a status endpoint which can be accessed via a HTTP GET request.
   *       It will return a status 200 and a body message if the service is in a good state.
   *     tags:
   *       - status
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 name:
   *                   type: string
   *                   description: The name of the service.
   *                   example: "@vanderlaan/cleachtadh"
   *                 version:
   *                   type: string
   *                   description: The version of the service.
   *                   example: "1.0.0"
   *                 message:
   *                   type: string
   *                   description: The status message describing the state of the service.
   *                   example: "up and running"
   */
  get(req, res) {
    res.status(200).json({
      name,
      version,
      message: 'up and running',
    });
  },
};
