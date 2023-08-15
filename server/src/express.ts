import express from "express";
import https from "https";
import fs from "fs";
import { createProxyMiddleware } from "http-proxy-middleware";
import fetch from "cross-fetch";
import ApiController from "./controllers/ApiController";
import AppSystem from "./AppSystem";
import type swaggerUiType from "swagger-ui-express";
import type swaggerJsdocType from "swagger-jsdoc";

import Path from "path";
// import { MySharedInterface } from "@shared/shared"; // Shared code between Client and Server

export const app = express();
const port = +(process.env.PORT || 3080);
const portSSL = +(process.env.PORT_HTTPS || 3443);
const swaggerEnabled = (process.env.SWAGGER || "true").toLowerCase() === "true";

const certificatePath = process.env.CERTIFICATE_PATH || Path.resolve(__dirname, "../certificate.pfx");
let httpsEnabled = false;
if (fs.existsSync(certificatePath)) {
  const https_options: https.ServerOptions = {
    pfx: fs.readFileSync(certificatePath),
    passphrase: process.env.CERTIFICATE_PASSPHRASE
  };
  https.createServer(https_options, app).listen(portSSL);
  console.log(`HTTPS server started at https://localhost:${portSSL}`);
  httpsEnabled = true;
}

const redirectHTTPS = (process.env.REDIRECT_HTTPS || "false").toLowerCase() === "true";
if (redirectHTTPS) {
  app.use((req, res, next) => {
    if (req.secure) {
      next();
    }
    else if (req.headers.host) {
      res.redirect(`https://${req.headers.host.split(":")[0]}:${portSSL}${req.url}`);
    }
    else {
      res.status(500).send("req.headers.host is not available.");
    }
  });
}

app.use("/api", ApiController.router);

if (process.env.NODE_ENV === "development") {
  // Proxy React from port 12463 to port {port} (ioncore-server)
  const reactPort = 12463;
  if (swaggerEnabled) {
    swagger();
  }
  (async () => {
    console.log(`Waiting for React to start on port ${reactPort}...`);
    while (await fetch(`http://localhost:${reactPort}`).then(() => false).catch(() => true)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log(`React started on port ${reactPort}`);
    app.use("/", createProxyMiddleware({
      target: `http://localhost:${reactPort}`,
      changeOrigin: true,

      // This is required to avoid CORS issues
      onProxyRes: (proxyRes, req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
      }
    }));

    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port} in DEVELOPMENT mode`);
    });
  })();
}
else {
  // Serve static files from the build folder
  app.use(express.static("public"), (req, res) => res.sendFile("index.html", { root: "public" }));
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port} in PRODUCTION mode`);
  });
}
/**
 * Sets up Swagger
 */
function swagger() {
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