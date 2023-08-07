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
        user: user.toJSON(),
        token: user.jwt()
      });
    }).catch((err) => {
      console.error(err);
      return res.status(500).json({ message: err?.message || "An internal server error occurred." });
    });
  });

  // Register
  router.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
    
    User.registerUser({ username, password }).then((user) => {
      return res.json({
        user: user.toJSON(),
        token: user.jwt()
      });
    }).catch((err) => {
      console.error(err);
      return res.status(500).json({ message: err?.message || "An internal server error occurred." });
    });
  });

  // Get all roles for a user
  router.get("/me", User.middleware({ required: true }), (req, res) => {
    const user = User.getAuthenticatedUser(req);
    return res.json({
      user: user.toJSON(),
    });
  });

  // Get all roles for a user
  router.get("/:id", (req, res) => {
    const { id } = req.params;

    User.findByPk(id).then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      return res.json({
        user: user.toJSON(),
      });
    }).catch((err) => {
      console.error(err);
      return res.status(500).json({ message: "An internal server error occurred." });
    });
  });

  // Get all roles for a user
  router.get("/:id/roles", (req, res) => {
    const { id } = req.params;

    User.findByPk(id).then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      user.getRoles().then((roles) => {
        return res.json({
          roles: roles.map(role => role.toJSON()),
        });
      });
    }).catch((err) => {
      console.error(err);
      return res.status(500).json({ message: "An internal server error occurred." });
    });
  });
}

export default UserController;