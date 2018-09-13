'use strict';

module.exports = {
  /**
   * @swagger
   * /api/v1/signup:
   *   post:
   *     description: |
   *       The service will offer a way to signup for an account.
   *       If the signup request is successful the service will respond with a 201 and return
   *       the users display name and their newly generated Json Web Token (JWT).
   *     tags:
   *       - Authentication
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName:
   *                 type: string
   *                 description: The users given name
   *                 example: "Tony"
   *               lastName:
   *                 type: string
   *                 description: The users family name
   *                 example: "Stark"
   *               email:
   *                 type: string
   *                 description: The users email they will use to uniquely identify themselves with
   *                 example: "tony.stark@avengers.org"
   *               password:
   *                 type: string
   *                 description: |
   *                   The users password, this will not be stored but used to generate a one way
   *                   hash that will be used on future validation of the users credentials.
   *                 example: "pa$$word"
   *     responses:
   *       201:
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
   *       400:
   *         $ref: "#/components/responses/BadRequest"
   *       500:
   *         $ref: "#/components/responses/ServerError"
   */
  signup(req, res) {
    const token = req.user.generateJwt();
    const displayName = req.user.displayName;

    res.status(201)
      .json({ displayName, token });
  },
};
