import express from "express";
import http from "http";
import https from "https";
import { Server as IoServer} from "socket.io";
import fs from "fs";
import { createProxyMiddleware } from "http-proxy-middleware";
import fetch from "cross-fetch";
import ApiController from "./controllers/ApiController";
import Path from "path";
import { swagger } from "./swagger";
import { User } from "./sequelize";
import AppSystem from "./AppSystem";
// import { MySharedInterface } from "@shared/shared"; // Shared code between Client and Server

export const app = express();
export const io = new IoServer();
export const port = +(process.env.PORT || 3080);
export const portSSL = +(process.env.PORT_HTTPS || 3443);
const swaggerEnabled = (process.env.SWAGGER || "true").toLowerCase() === "true";

const certificatePath = process.env.CERTIFICATE_PATH || Path.resolve(__dirname, "../certificate.pfx");
export let httpsEnabled = false;
let httpServer: https.Server | http.Server;
if (fs.existsSync(certificatePath)) {
  const https_options: https.ServerOptions = {
    pfx: fs.readFileSync(certificatePath),
    passphrase: process.env.CERTIFICATE_PASSPHRASE
  };
  httpServer = https.createServer(https_options, app);
  httpServer.listen(portSSL);
  const _httpServer = http.createServer(app)
  _httpServer.listen(port);

  io.listen(httpServer);
  io.listen(_httpServer);

  console.log(`HTTPS server started at https://localhost:${portSSL}`);
  httpsEnabled = true;
}
else {
  httpServer = http.createServer(app);
  httpServer.listen(port);

  io.listen(httpServer);
  
  console.log(`HTTP server started at http://localhost:${port}`);
}

export const redirectHTTPS = (process.env.REDIRECT_HTTPS || "false").toLowerCase() === "true";
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

if (AppSystem.isDev) {
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
  })();
}
else {
  // Serve static files from the build folder
  app.use(express.static("public"), (req, res) => res.sendFile("index.html", { root: "public" }));
}


/**************************
 * Socket.io Server handler
 **************************/
io.on("connection", (socket) => {
  socket.on("subscribe", async (id: string, token?: string) => {
    const user = token ? await User.fromToken(token) : null;
    if (user) {
      console.log(`User ${user.username} subscribed to ${id}`);
    }
  });

  // Example with socket channel
  socket.on("__echo", (...data) => {
    console.log(...data);
    socket.emit("__echo", ...data);
  });
});