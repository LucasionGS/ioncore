import { Router } from "express";
import { User } from "../sequelize";

namespace UserController {
  export const router = Router();

  router.get("/", (req, res) => {
    res.json({ message: "Hello from the API!" });
  });

  // Login
  router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    User.authenticateUser({ username, password }).then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password." });
      }
      
      return res.json({
        user: user.toJSON()
      });
    });
  });
}

export default UserController;