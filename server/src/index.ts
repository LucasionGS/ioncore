import dotenv from "dotenv"; dotenv.config(); // Load .env file
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import fetch from "cross-fetch";

const app = express();
const port = process.env.PORT || 3080;

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
  app.use(express.static("public"));
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port} in PRODUCTION mode`);
  });
}