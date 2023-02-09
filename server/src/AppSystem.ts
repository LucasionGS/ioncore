import os from "os";
import fs from "fs";
import Path from "path";

namespace AppSystem {
  export const friendlyAppName = "Ioncore App";
  export const appName = "ioncore_app";
  export const debug = process.env.NODE_ENV === "development";

  export const platform = os.platform();
  export const isWindows = platform === "win32";
  export const isMac = platform === "darwin";
  export const isLinux = platform === "linux";

  export function createDir(path: string): boolean {
    try {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
    } catch (error) {
      console.error(error);
      return false;
    }
    return true;
  }

  export function getHomeDirectory(): string {
    return os.homedir();
  }

  export function getUserDataDirectory(): string {
    const home = getHomeDirectory();
    if (isWindows) {
      return Path.join(home, "AppData", "Roaming", appName);
    } else {
      return Path.join(home, ".icconfig", "userdata", appName);
    }
  }

  /**
   * Gets `main.db` path
   */
  export function getSqliteDatabasePath(): string;
  /**
   * Gets `{dbname}.db` path
   */
  export function getSqliteDatabasePath(dbname: string): string;
  export function getSqliteDatabasePath(dbname?: string): string {
    const main = getUserDataDirectory();
    return Path.join(main, dbname ?? "main.db");
  }

  export function getApplicationDirectory(): string {
    const home = getHomeDirectory();
    if (isWindows) {
      return Path.join(home, "AppData", "Local", appName);
    } else {
      return Path.join(home, ".icconfig", "userdata", appName);
    }
  }
}

export default AppSystem;