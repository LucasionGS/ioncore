import { Sequelize, Model, DataTypes, Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppSystem from "./AppSystem";
import { fstat } from "fs";
import fs from "fs";
import Path from "path";
import { NextFunction, Request, Response } from "express";
import { ClientUser } from "@shared/models";

process.env.JWT_SECRET ||= "ioncore_json_web_token_secret_please_change_me";
if (!AppSystem.createDir(Path.dirname(AppSystem.getSqliteDatabasePath()))) {
  throw new Error("Failed to create database directory");
}
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: AppSystem.getSqliteDatabasePath(),
  logging: false,
});

export interface UserAttributesCreation {
  username: string;
  password: string;
  profilePicture?: string;
}

export interface UserAttributes {
  id: string;
  username: string;
  password: string;
  profilePicture: string;
}

export class User extends Model<UserAttributes, UserAttributesCreation> implements UserAttributes {
  public id!: string;
  public username!: string;
  public password!: string;
  public profilePicture!: string;

  public async getRoles() {
    return Role.findAll({
      where: {
        id: {
          [Op.in]: (await UserRole.findAll({
            where: {
              userId: this.id,
            },
          })).map(userRole => userRole.roleId)
        }
      }
    });
  }

  public static async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  };

  public static async comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  public async comparePassword(password: string) {
    return User.comparePassword(password, this.password);
  }

  /**
   * Verifies that the username is valid. Throws an error if it is not.
   * @param username Username to verify
   */
  private static verifyUsername(username: string) {
    if (username.length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }
    if (username.length > 32) {
      throw new Error("Username must be at most 32 characters long");
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      throw new Error("Username must only contain letters and numbers");
    }
  }

  public static async registerUser(data: {
    username: string;
    password: string;
  }) {
    User.verifyUsername(data.username);
    
    // check if username is taken
    if (await User.findOne({
      where: {
        username: {
          [Op.like]: data.username
        },
      },
    })) {
      throw new Error("Username is already taken");
    }
    
    return User.create({
      username: data.username,
      password: await User.hashPassword(data.password),
    });
  }

  /**
   *  Checks if the user has a permission.
   * 
   * If the user is an admin, this will always return true.
   * @param permission Permission key to check
   * @returns 
   */
  public async hasPermission(permission: string) {
    const roles = await this.getRoles();
    const isAdmin = roles.some(role => role.name.toLowerCase() === "admin");
    if (isAdmin) {
      return true;
    }
    for (const role of roles) {
      if (await role.hasPermissionInherit(permission)) {
        return true;
      }
    }
    return false;
  }

  public static $middleware(options?: {
    /**
     * Whether or not authentication is required. Defaults to true.  
     * If false, it is possible for the user to be null and all other options will be ignored.
     * @default true
     */
    required?: boolean;
    /**
     * Whether or not the user must be an admin. Defaults to false.  
     * @default false
     */
    admin?: boolean;
    /**
     * List of permissions required. If the user does not have any of these permissions, the request will be rejected.  
     * If the user is an admin, this will be ignored.
     * @default undefined
     */
    permissions?: string[];
  }) {
    options ??= {};
    const { required = true, admin = false, permissions } = options;
    return async (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        if (required) {
          res.status(401).json({
            error: "Authentication required",
          });
        } else {
          next();
        }
        return;
      }

      try {
        const clientUser = jwt.verify(token, process.env.JWT_SECRET!) as ClientUser;
        const user = await User.findByPk(clientUser.id);
        if (!user) {
          throw new Error("User not found");
        }
        if (admin && !clientUser.isAdmin) {
          res.status(401).json({
            error: "Admin authentication required",
          });
          return;
        }

        if (permissions && !clientUser.isAdmin) {
          const hasPermission = await Promise.all(permissions.map(permission => user.hasPermission(permission)));
          if (!hasPermission.some(Boolean)) {
            res.status(401).json({
              error: "Permissions required: " + permissions.join(", "),
            });
            return;
          }
        }
        
        (req as any).user = user;
        (req as any).clientUser = clientUser;
        next();
      } catch (e) {
        res.status(401).json({
          error: "Invalid token",
        });
      }
    };
  }

  public static async fromToken(token: string) {
    const clientUser = jwt.verify(token, process.env.JWT_SECRET!) as ClientUser;
    const user = await User.findByPk(clientUser.id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
  
  public static getAuthenticatedUser(req: Request) {
    return ((req as any).user as User) || null;
  }

  public static getClientUser(req: Request) {
    return ((req as any).clientUser as ClientUser) || null;
  }

  public static async authenticateUser(data: {
    username: string;
    password: string;
  }) {
    User.verifyUsername(data.username);
    return User.findOne({
      where: {
        username: {
          [Op.like]: data.username
        }
      },
    }).then(async user => {
      if (!user) {
        return null;
      }

      return await user.comparePassword(data.password) ? user : null;
    });
  }

  public toJSON() {
    return {
      id: this.id,
      username: this.username,
    };
  }

  public async toFullJSON() {
    return {
      id: this.id,
      username: this.username,
      roles: (await this.getRoles()).map(role => role.toJSON()),
    };
  }
  public async toClientJSON(): Promise<ClientUser> {
    const roles = (await this.getRoles()).map(role => role.name);
    return {
      id: this.id,
      username: this.username,
      profilePicture: this.profilePicture,
      roles: roles,
      isAdmin: roles.some(role => role.toLowerCase() === "admin")
    };
  }

  public async jwt() {
    return jwt.sign(await this.toClientJSON(), process.env.JWT_SECRET!, {
      expiresIn: "21d",
    });
  }

  public async addRole(role: string | Role) {
    if (typeof role === "string") {
      role = (await Role.getRoleByName(role))!;
    }
    if (!role) {
      throw new Error("Role not found");
    }
    return UserRole.create({
      userId: this.id,
      roleId: role.id,
    });
  }

  public async updateRoles(roles: string[]) {
    return UserRole.destroy({
      where: {
        userId: this.id,
      },
    }).then(() => {
      return Promise.all(roles.map(role => this.addRole(role)));
    });
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
}, {
  sequelize,
});

export interface RoleAttributesCreation {
  name: string;
  inherit?: string; // Role ID
  permissions?: string; // List of permission keys. Example: DASHBOARD_VIEW, DASHBOARD_EDIT, etc.
}

export interface RoleAttributes {
  id: string;
  name: string;
  inherit?: string; // Role ID
  permissions: string; // List of permission keys. Example: DASHBOARD_VIEW, DASHBOARD_EDIT, etc.
}

export interface RoleAttributesObject {
  id: string;
  name: string;
  inherit?: string; // Role ID
  permissions: string[]; // List of permission keys. Example: DASHBOARD_VIEW, DASHBOARD_EDIT, etc.
}

export const uniqueList = (list: string[]) => [...new Set(list)].filter(Boolean);

export class Role extends Model<RoleAttributes, RoleAttributesCreation> implements RoleAttributes {
  public id!: string;
  public name!: string;
  public inherit?: string;
  public permissions!: string;

  public setPermissionList = (permissions: string[]) => this.permissions = uniqueList(permissions).join(",");
  public getPermissionList = () => this.permissions.split(",").filter(Boolean);
  public addPermission = (...permissions: string[]) => this.setPermissionList(uniqueList([...this.getPermissionList(), ...permissions]));
  public removePermission = (permission: string) => this.setPermissionList(this.getPermissionList().filter(p => p !== permission));
  public hasPermission = (permission: string) => this.getPermissionList().includes(permission);
  public hasPermissionInherit = async (permission: string) => (await this.getFullPermissionList()).includes(permission);

  /**
   * Returns an array of permissions including inherited permissions.
   */
  public async getFullPermissionList(): Promise<string[]> {
    const permissions = this.getPermissionList();
    if (this.inherit) {
      const parent = await Role.getRoleById(this.inherit);
      if (parent) {
        return uniqueList([...permissions, ...await parent.getFullPermissionList()]);
      }
    }

    return permissions;
  }


  public static async registerRole(data: {
    name: string;
    inheritById?: string;
    inheritByName?: string;
  }) {
    let inherit: string | undefined;
    if (data.inheritByName) {
      inherit = (await Role.getRoleByName(data.inheritByName))?.id;
      if (!inherit) {
        throw new Error(`Role with name ${data.inheritByName} not found`);
      }
    }
    if (data.inheritById) {
      inherit = (await Role.getRoleById(data.inheritById))?.id;
      if (!inherit) {
        throw new Error(`Role with id ${data.inheritById} not found`);
      }
    }

    return Role.create({
      name: data.name,
      inherit,
    });
  }

  public static async getRoleByName(name: string) {
    return Role.findOne({
      where: {
        name: {
          [Op.like]: name,
        },
      },
    });
  }

  public static async getRoleById(id: string) {
    return Role.findByPk(id);
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      inherit: this.inherit,
      permissions: this.getPermissionList(),
    };
  }

  /**
   * Checks if this role inherits from another role. This will check recursively.  
   * This can also be used to check if a role inherits from itself.
   * @param role Role to check
   * @returns 
   */
  public async inheritsFrom(role: Role | string): Promise<boolean> {
    if (typeof role === "string") {
      return Role.getRoleByName(role).then(role => {
        if (!role) {
          return false;
        }
        return this.inheritsFrom(role);
      });
    }
    if (this.id === role.id) {
      return true;
    }
    if (this.inherit) {
      return Role.getRoleById(this.inherit).then(parent => {
        if (!parent) {
          return false;
        }
        return parent.inheritsFrom(role);
      });
    }
    return false;
  }
}

Role.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  inherit: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  permissions: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "",
  },
}, {
  sequelize,
});

interface UserRoleAttributesCreation {
  userId: string;
  roleId: string;
}

interface UserRoleAttributes {
  id: string;
  userId: string;
  roleId: string;
}

export class UserRole extends Model<UserRoleAttributes, UserRoleAttributesCreation> implements UserRoleAttributes {
  public id!: string;
  public userId!: string;
  public roleId!: string;
}

UserRole.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  sequelize,
});

export interface AssetAttributesCreation {
  name: string;
  size: number;
  type: string;
}

export interface AssetAttributes {
  id: string;
  name: string;
  size: number;
  type: string;
}

/**
 * Represents an asset in the database. Each entry represents a file on the disk in the `assets` directory.
 * 
 * Asset directory can be accessed on `AppSystem.folders.assetFolder`.
 */
export class Asset extends Model<AssetAttributes, AssetAttributesCreation> implements AssetAttributes {
  public id!: string;
  public name!: string;
  public size!: number;
  public type!: string;

  /**
   * @param file File to set
   * Register and add an asset. This will move the file to the assets folder.
   */
  public static async registerAsset(file: Express.Multer.File) {
    const asset = await Asset.create({
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    });

    // Move the file to the assets folder
    fs.renameSync(file.path, Path.join(AppSystem.folders.assetFolder, asset.name));
  }

  public sendFile(res: Response) {
    res.sendFile(this.name, {
      root: AppSystem.folders.assetFolder,
    });
  }

  public getFullPath() {
    return Path.join(AppSystem.folders.assetFolder, this.name);
  }
  
  /**
   * Returns the file for this asset. This deletes the file from the assets folder and removes the asset from the database.
   * 
   * Do not use this object after calling this method.
   */
  public async deleteAsset() {
    await Promise.all([fs.promises.unlink(this.getFullPath()).catch(a => Promise.resolve()), this.destroy()]);
  }
}

Asset.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
});

export default sequelize;
