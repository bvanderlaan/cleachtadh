'use strict';

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Routes related to authenticating with the service
 */

module.exports = {
  /**
   * @swagger
   * /api/v1/authenticate:
   *   post:
   *     description: |
   *       The service will offer a way to authenticate a user. By providing this route with the
   *       correct credentials it will generate a Json Web Token (JWT) and return it along with
   *       the users display name.
   *     tags:
   *       - Authentication
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 description: The users email they use to uniquely identify themselves with
   *                 example: "tony.stark@avengers.org"
   *               password:
   *                 type: string
   *                 description: |
   *                   The users password, this will not be stored but used to generate a one way
   *                   hash that will be used to validate the users identity.
   *                 example: "pa$$word"
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 displayName:
   *                   type: string
   *                   description: The name of the authenticated user.
   *                   example: "Tony Stark"
   *                 token:
   *                   type: string
   *                   description: |
   *                     The JWT to use when issuing requests to protected routes.
   *                     This is the Bearer token which authorizes the request as coming from
   *                     the user.
   *       401:
   *         $ref: "#/components/responses/NotAuthenticated"
   */
  login(req, res) {
    const token = req.user.generateJwt();
    const user = req.user.present();

    res.status(200)
      .json({ ...user, token });
  },
};
