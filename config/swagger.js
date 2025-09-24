const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'E-commerce Express API',
      version: '1.0.0',
      description: 'REST API documentation for the e-commerce backend.'
    },
    servers: [
      {
        url: 'http://localhost:' + (process.env.PORT || 5000)
      },
      { url: 'https://e-commerce-api-b7ci.onrender.com/' }

    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [
    './routes/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;


