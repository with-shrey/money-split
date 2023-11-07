import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import fs from 'fs';

const options = {
  format: '.json',
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    components: {},
    info: {
      title: 'Money Split - API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local environment',
      },
      {
        url: 'http://someip.com',
        description: 'deployed environment',
      },
    ],
  },
  apis: [
    path.join(__dirname, 'authentication.yml'),
    path.join(__dirname, './../../', '**', '*.ts'),
  ],
};

const openapiSpecification = swaggerJSDoc(options);
export default openapiSpecification;

if (require.main === module) {
  fs.writeFileSync(
    path.join(__dirname, 'openapi.json'),
    JSON.stringify(openapiSpecification, null, 2),
  );
}
