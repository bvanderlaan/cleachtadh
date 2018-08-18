'use strict';

module.exports = {
  signup(req, res) {
    const token = req.user.generateJwt();
    res.status(201)
      .json({ token });
  },
};
