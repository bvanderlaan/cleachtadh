'use strict';

const nconf = require('./config');

require('./config/monitoring')();

// Configuration
const log = require('./config/logger').init();
const passport = require('./config/passport')();
const { url: mongoURL } = require('./config/mongo');
const { options: swaggerOptions, spec } = require('./config/swagger');

// Plugins
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const requestAuditor = require('express-bunyan-logger');
const addRequestId = require('express-request-id');
const helmet = require('helmet');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const { URL } = require('url');
const yaml = require('js-yaml');

const { name } = require('../package.json');
const { create: createServer, protocol } = require('./createServer');

// Routes
const { route: statusRoute } = require('./status');
const { route: authenticate } = require('./authenticate')(passport);
const { route: signup } = require('./signup')(passport);
const { route: katas } = require('./katas')(passport);

const swaggerSpec = spec();
const swaggerSpecYaml = yaml.dump(swaggerSpec);

mongoose.connect(mongoURL, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

// Connect Application
const app = express();
app.use(helmet());
app.set('etag', false);

app.use('/docs/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
app.get('/docs.json', (req, res) => {
  res.status(200).json(swaggerSpec);
});
app.get('/docs.yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(swaggerSpecYaml);
});

app.use(cors({
  origin: 'http://localhost:7292',
  operationSuccessStatus: 200,
}));

app.use('/api', statusRoute);

app.use(addRequestId({ attributeName: 'requestId' }));
app.use(passport.initialize());

const auditOptions = {
  genReqId(req) {
    return req.requestId;
  },
  logger: log,
  obfuscate: ['req-headers.authorization', 'req-headers.cookie'],
  format: ':method :url HTTP/:http-version :status-code :response-time ms',
};
app.use(requestAuditor(auditOptions));
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());

app.use('/api', authenticate, signup, katas);

// Default Handler
app.use('*', (req, res) => (
  res.status(404).json({
    moreInfo: new URL('/docs/', nconf.get('app_public_path')),
    message: `Not Found: Cannot ${req.method} ${req.originalUrl}`,
  })
));

// Default Error Handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  req.log.warn({ err }, 'Unable to handle request');

  return res.status(400).json({
    moreInfo: new URL('/docs/', nconf.get('app_public_path')),
    message: `Bad Request: ${err.message}`,
  });
});

const server = createServer(app);

function beforeTerminate(cause, level = 'info', err = undefined) {
  log[level]({ err, cause, url: server.url }, `----- ${name} server shut down -----`);
  const exitCode = err ? 1 : 0;
  setTimeout(() => process.exit(exitCode), 1000);
}

server.once('close', () => beforeTerminate('closed'));
process.once('SIGTERM', () => beforeTerminate('SIGTERM'));
process.once('uncaughtException', err => beforeTerminate('uncaughtException', 'fatal', err));
process.once('unhandledRejection', err => beforeTerminate('unhandledRejection', 'fatal', err));

const port = nconf.get('app_port');

Promise.resolve()
  .then(() => {
    server.listen(port, '0.0.0.0', () => {
      const { address, port: p } = server.address();
      server.url = `${protocol}://${address}:${p}`;
      log.info({ url: server.url }, `----- ${name} server is online -----`);
      server.emit('ready');
    });
  });

module.exports = server;
