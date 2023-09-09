import AppSystem from "./AppSystem";
import type swaggerUiType from "swagger-ui-express";
import type swaggerJsdocType from "swagger-jsdoc";
import Path from "path";
import { httpsEnabled, portSSL, redirectHTTPS, port, app } from "./express";

/**
 * Sets up Swagger
 */
export function swagger() {
  const swaggerUi: typeof swaggerUiType = require("swagger-ui-express");
  const swaggerJsdoc: typeof swaggerJsdocType = require("swagger-jsdoc");
  // Swagger
  const options: swaggerJsdocType.Options = {
    definition: {
      openapi: "3.1.0",
      info: {
        // title: `Ioncore Express API`,
        title: `${AppSystem.friendlyAppName} Express API (${AppSystem.appName})`,
        version: "0.1.0",
        description: "This is a simple CRUD API application made with Express and documented with Swagger",
      },
      servers: [
        ...(httpsEnabled ? [{
          url: "https://localhost:" + portSSL,
        }] : []),
        ...(!(httpsEnabled && redirectHTTPS) ? [{
          url: "http://localhost:" + port,
        }] : []),
      ],
    },
    apis: [Path.resolve(__dirname, "controllers") + "/*.ts"],
  };

  const specs = swaggerJsdoc(options);

  app.use("/swagger", swaggerUi.serve as any, swaggerUi.setup(specs, {
    explorer: true,
    customSiteTitle: `${AppSystem.friendlyAppName} - Swagger UI`,
    customfavIcon: "/favicon.ico",
  }) as any);
}
