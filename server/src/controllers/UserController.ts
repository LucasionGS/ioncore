import { Router } from "express";
import { Role, User } from "../sequelize";

namespace UserController {
  export const router = Router();

  router.get("/", User.$middleware({ required: true }), async (req, res) => {
    const user = User.getClientUser(req);
    
    if (user.isAdmin) {
      return res.json({
        users: await Promise.all((await User.findAll()).map(user => user.toClientJSON())),
      });
    }
    else {
      return res.json({
        users: []
      });
    }
  });

  /**
   * @swagger
   *  /api/user/login:
   *  post:
   *    tags: [User]
   *    summary: Login
   *    description: Login to the application
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              username:
   *                type: string
   *              password:
   *                type: string
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                user:
   *                  type: object
   *                  properties:
   *                    id:
   *                      type: string
   *                    username:
   *                      type: string
   *                token:
   *                  type: string
   */
  router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    User.authenticateUser({ username, password }).then(async (user) => {
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password." });
      }

      return res.json({
        user: await user.toClientJSON(),
        token: await user.jwt()
      });
    }).catch((err) => {
      console.error(err);
      return res.status(500).json({ message: err?.message || "An internal server error occurred." });
    });
  });

  /**
   * @swagger
   *  /api/user/register:
   *  post:
   *    tags: [User]
   *    summary: Register
   *    description: Register a new user
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              username:
   *                type: string
   *              password:
   *                type: string
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                user:
   *                  type: object
   *                  properties:
   *                    id:
   *                      type: string
   *                    username:
   *                      type: string
   *                token:
   *                  type: string
   */
  router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    let giveAdmin = false;
    if (!hasFirstUser) {
      hasFirstUser = !!(await User.findOne());
      giveAdmin = !hasFirstUser;
    }

    User.registerUser({ username, password }).then(async (user) => {
      if (giveAdmin) {
        await user.addRole("admin");
        console.log("Gave admin role to first user.");
      }
      return res.json({
        user: await user.toClientJSON(),
        token: await user.jwt()
      });
    }).catch((err) => {
      console.error(err);
      return res.status(500).json({ message: err?.message || "An internal server error occurred." });
    });
  });
  let hasFirstUser = false;

  router.get("/me", User.$middleware({ required: true }), async (req, res) => {
    const user = User.getAuthenticatedUser(req);
    return res.json({
      user: await user.toClientJSON(),
    });
  });

  router.get("/:id", (req, res) => {
    const { id } = req.params;

    User.findByPk(id).then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      return res.json({
        user: user.toClientJSON(),
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