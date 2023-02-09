import { Sequelize, Model, DataTypes, Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppSystem from "./AppSystem";
import { fstat } from "fs";
import fs from "fs";
import Path from "path";

process.env.JWT_SECRET ||= "ioncorejsonwebtokensecret";
if (!AppSystem.createDir(Path.dirname(AppSystem.getSqliteDatabasePath()))) {
  throw new Error("Failed to create database directory");
}
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: AppSystem.getSqliteDatabasePath(),
  logging: false,
});

interface UserAttributes {
  id: string;
  username: string;
  password: string;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public password!: string;

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

  public static async registerUser(data: {
    username: string;
    password: string;
  }) {
    return User.create({
      username: data.username,
      password: await User.hashPassword(data.password),
    });
  }

  public static async authenticateUser(data: {
    username: string;
    password: string;
  }) {
    return User.findOne({
      where: {
        username: data.username,
      },
    }).then((user) => {
      if (!user) {
        return null;
      }

      return user.comparePassword(data.password) ? user : null;
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

  public jwt() {
    return jwt.sign({
      id: this.id,
      username: this.username,
    }, process.env.JWT_SECRET, {
      expiresIn: "21d",
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
}, {
  sequelize,
});

interface RoleAttributes {
  id: string;
  name: string;
  inherit?: string; // Role ID
  permissions: string; // List of permission keys. Example: DASHBOARD_VIEW, DASHBOARD_EDIT, etc.
}

const uniqueList = (list: string[]) => [...new Set(list)].filter(Boolean);

export class Role extends Model<RoleAttributes> implements RoleAttributes {
  public id!: string;
  public name!: string;
  public inherit!: string;
  public permissions: string;

  public setPermissionList = (permissions: string[]) => this.permissions = uniqueList(permissions).join(",");
  public getPermissionList = () => this.permissions.split(",");
  public addPermission = (permission: string) => this.setPermissionList(uniqueList([...this.getPermissionList(), permission]));
  public removePermission = (permission: string) => this.setPermissionList(this.getPermissionList().filter(p => p !== permission));
  public hasPermission = (permission: string) => this.getPermissionList().includes(permission);

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
    let inherit: string = null;
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

interface UserRoleAttributes {
  id: string;
  userId: string;
  roleId: string;
}

export class UserRole extends Model<UserRoleAttributes> implements UserRoleAttributes {
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


export default sequelize;

const syncAlter = true;
const syncForce = false;
const firstLoginCreateDefaultUser = true;

sequelize.sync({ alter: syncAlter, force: syncForce }).then(async () => {
  let userRole = await Role.getRoleByName("user");
  const adminRole = await Role.getRoleByName("admin");

  if (!userRole) {
    userRole = await Role.registerRole({ name: "user" });
  }

  if (!adminRole) {
    await Role.registerRole({ name: "admin" });
  }
});
