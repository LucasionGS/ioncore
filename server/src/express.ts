import express from "express";
import https from "https";
import fs from "fs";
import { createProxyMiddleware } from "http-proxy-middleware";
import fetch from "cross-fetch";
import ApiController from "./controllers/ApiController";

import Path from "path";
// import { MySharedInterface } from "@shared/shared"; // Shared code between Client and Server

export const app = express();
const port = +(process.env.PORT || 3080);
const portSSL = +(process.env.PORT_HTTPS || 3443);

const certificatePath = process.env.CERTIFICATE_PATH || Path.resolve(__dirname, "../certificate.pfx");
if (fs.existsSync(certificatePath)) {
  const https_options: https.ServerOptions = {
    pfx: fs.readFileSync(certificatePath),
    passphrase: process.env.CERTIFICATE_PASSPHRASE
  };
  https.createServer(https_options, app).listen(portSSL);
  console.log(`HTTPS server started at https://localhost:${portSSL}`);
}

const redirectHTTPS = (process.env.REDIRECT_HTTPS || "false").toLowerCase() === "true";
if (redirectHTTPS) {
  app.use((req, res, next) => {
    if (req.secure) {
      next();
    }
    else {
      res.redirect(`https://${req.headers.host.split(":")[0]}:${portSSL}${req.url}`);
    }
  });
}

app.use("/api", express.json(), ApiController.router);

if (process.env.NODE_ENV === "development") {
  // Proxy React from port 12463 to port {port} (ioncore-server)
  const reactPort = 12463;
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