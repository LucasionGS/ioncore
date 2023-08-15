import { Router, json } from "express";
import UserController from "./UserController";
import AssetController from "./AssetController";
import AppSystem from "../AppSystem";

namespace ApiController {
  export const router = Router();
  export const jsonMw = json();

  router.get("/", (req, res) => {
    res.json({ message: "Hello from the API!" });
  });

  router.use("/user", jsonMw, UserController.router);
  router.use("/asset", AssetController.router);
}

export default ApiController;