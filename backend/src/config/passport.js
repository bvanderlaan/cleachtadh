'use strict';

const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');

const nconf = require('../config');
const { User } = require('../users')();

function generateJwt() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    id: this.id,
    displayName: this.displayName,
    exp: parseInt(expiry.getTime() / 1000, 10),
  }, nconf.get('jwt_secret'));
}

module.exports = () => {
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => (
    User.findById(id)
      .then(user => done(null, user))
      .catch(done)
    ));

  const signupOptions = {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  };
  passport.use('local-signup', new LocalStrategy(signupOptions, (req, email, password, done) => {
    if (!req.body.displayName) {
      return done(new Error('Missing Parameter displayName'));
    }

    return User.findOne({ 'local.email': email })
      .then((user) => {
        if (user) {
          return done(null, false);
        }

        const newUser = new User();
        newUser.local.email = email;
        newUser.local.password = password;
        newUser.displayName = req.body.displayName;
        newUser.generateJwt = generateJwt.bind(newUser);

        return newUser.save();
      })
      .then(user => done(null, user))
      .catch(done);
  }));

  const loginOptions = {
    usernameField: 'email',
    passwordField: 'password',
  };
  passport.use('local-login', new LocalStrategy(loginOptions, (email, password, done) => (
    User.findOne({ 'local.email': email })
      .then((user) => {
        if (!user || (user.state === User.States().PENDING) || !user.validatePassword(password)) {
          return done(null, false);
        }

        Object.assign(user, {
          generateJwt: generateJwt.bind(user),
        });

        return done(null, user);
      })
      .catch(done)
  )));

  const jwtOptions = {
    secretOrKey: nconf.get('jwt_secret'),
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  };
  passport.use('jwt', new JwtStrategy(jwtOptions, (payload, done) => {
    User.findOne({ _id: payload.id })
      .then((user) => {
        if (user) {
          return done(null, user);
        }

        return done(null, false);
      })
      .catch(done);
  }));

  return passport;
};
