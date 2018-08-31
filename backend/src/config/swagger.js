'use strict';

const { oneLine } = require('common-tags');
const swaggerJSDoc = require('swagger-jsdoc');

const nconf = require('./index');
const { description, version } = require('../../package.json');

const title = 'cleachtadh';

const options = {
  definition: {
    openapi: '3.0.1',
    servers: [
      { url: nconf.get('app_public_path') },
    ],
    info: {
      description,
      version,
      title,
    },
  },
  apis: ['./src/config/swagger.js', './**/*.controller.js', './**/*.model.js'],
};


/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: A human readable description of what went wrong
 *           example: The passed in parameter limit must be a number
 *         moreInfo:
 *           type: string
 *           description: A link to this help documentation
 *           example: http://mysite.com/docs#/katas/get_api_v1_katas
 *   responses:
 *     ServerError:
 *       description: |
 *         If something goes wrong and the service can not perform the requested
 *         operation it will return a 500 response; the body will include a
 *         description of what went wrong and a link to the help documentation.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Error"
 *           example:
 *             message: Failed to retrieve Katas from database
 *             moreInfo: http://mysite.com/docs/#/katas/get_api_v1_katas
 *     BadRequest:
 *       description: |
 *         If one of the required parameters (body, query, header) is missing then
 *         the service will not be able to fulfill the requested operation. It will
 *         return a 400 response; the body will include a description indicating
 *         which required parameter was missing and a link to the help documentation.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Error"
 *           example:
 *             message: Missing the required parameters - name
 *             moreInfo: http://mysite.com/docs/#/katas/post_api_v1_katas
 *     NotFound:
 *       description: |
 *         If the resource specified by the ID was not found the service will
 *         return a 404 response; the body will include a description indicating
 *         that the resource was not found and a link to the help documentation.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Error"
 *           example:
 *             message: The Kata was not found
 *             moreInfo: http://mysite.com/docs/#/katas/get_api_v1_katas
 */

module.exports = {
  options: {
    customSiteTitle: title,
    customCss: oneLine`
    .topbar { display: none }
    tr.response:not(:last-child) { border-bottom: 1px solid rgba(59,65,81,.2) }
    tr.response td.response-col_description { padding-bottom: 5px; }
    .swagger-ui .response-col_description__inner div.markdown,
    .swagger-ui .response-col_description__inner div.renderedMarkdown {
      background-color: transparent;
    }
    .swagger-ui .opblock-description-wrapper {
      font-size: 10.5pt;
    }
    .swagger-ui .response-col_description__inner div.markdown,
    .swagger-ui .response-col_description__inner div.markdown p,
    .swagger-ui .response-col_description__inner div.renderedMarkdown,
    .swagger-ui .response-col_description__inner div.renderedMarkdown p {
      color: #000000;
      font-size: 12pt;
      font-style: normal;
      font-weight: normal;
      font-family: Open Sans,sans-serif;
      padding: 0px;
    }
    .swagger-ui .parameters-col_description dev.markdown p {
      margin: 0px;
    }
    .swagger-ui .model-box {
      display: block;
    }
    .swagger-ui table.model tbody tr td {
      padding-bottom: 8px;
    }`,
  },

  spec() {
    const securitySpec = {
      securitySchemes: {
        bearerToken: {
          description: 'The authorization header is expected to contain the Bearer token (a JWT with out the \'Bearer \' prefixed) of the user whose is making the request.',
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    };
    const oas = swaggerJSDoc(options);
    oas.components = oas.components || {};
    Object.assign(oas.components, securitySpec);
    return oas;
  },
};
