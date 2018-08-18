'use strict';

module.exports = {
  login(req, res) {
    const token = req.user.generateJwt();
    const displayName = req.user.displayName;
    res.status(200)
      .json({ displayName, token });
  },
};
