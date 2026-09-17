// src/config/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Management API standard v1",
      version: "1.0.0",
      description: "Tài liệu hệ thống API quản lý thành viên tích hợp Phân trang, Bộ lọc, Transaction và JWT Security",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Dán mã JWT Token của ní vào đây (bỏ chữ Bearer đi nhé)",
        },
      },
    },
  },
  // Đường dẫn quét các file chú thích API trong cụm module
  apis: ["./src/modules/**/*.js", "./src/modules/users/*.js"], 
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📝 API Documentation available at http://localhost:3000/api-docs");
};

module.exports = setupSwagger;
