import os from "os";
import fs from "fs";
import Path from "path";

namespace AppSystem {
  export const FriendlyAppName = "Ioncore App";
  export const appName = "ioncore_app";

  export const platform = os.platform();
  export const isWindows = platform === "win32";
  export const isMac = platform === "darwin";
  export const isLinux = platform === "linux";

  export function getHomeDirectory(): string {
    return os.homedir();
  }

  export function getUserDataDirectory(): string {
    const home = getHomeDirectory();
    if (isWindows) {
      return Path.join(home, "AppData", "Roaming");
    } else {
      return Path.join(home, ".icconfig", appName);
    }
  }

  export function getApplicationDirectory(): string {
    const home = getHomeDirectory();
    if (isWindows) {
      return Path.join(home, "AppData", "Local", appName);
    } else {
      return Path.join(home, ".icconfig", appName);
    }
  }
}

export default AppSystem;