import { Router } from "express";
import UserController from "./UserController";

namespace ApiController {
  export const router = Router();
  
  router.get("/", (req, res) => {
    res.json({ message: "Hello from the API!" });
  });

  router.use("/user", UserController.router);
}

export default ApiController;