// eslint-disable-next-line import/no-extraneous-dependencies
const swaggerJSDoc = require('swagger-jsdoc');
const packageJson = require('../package.json');
const path = require('path');
const fs = require('fs');

const options = {
  format: '.json',
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    components: {},
    info: {
      title: 'Money Split - API',
      version: packageJson.version,
    },
    servers: [
      {
        url: 'https://someip.com',
        description: 'deployed environment',
      },
      {
        url: 'https://localhost:3000',
        description: 'Local environment',
      },
    ],
  },
  apis: [
    path.join(__dirname, 'authentication.yml'),
    path.join(__dirname, './../src/', '**', '*.ts'),
  ],
};

const openapiSpecification = swaggerJSDoc(options);
if (require.main === module) {
  fs.writeFileSync(
    path.join(__dirname, 'openapi.json'),
    JSON.stringify(openapiSpecification, null, 2),
  );
} else {
  module.exports = openapiSpecification;
}
