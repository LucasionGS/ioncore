#!/usr/bin/env node
import sequelize, { Role } from "./sequelize";
import rl from "readline";
import util from "util";

commandline(process.argv.slice(2))
.then(() => {
  process.exit(0);
})
.catch((err) => {
  console.error(err);
  process.exit(1);
});

async function commandline(args: string[]) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    // Split -XYZ into -X -Y -Z
    if (arg.startsWith("-") && arg.length > 2) {
      args.splice(i, 1, ...arg.slice(1).split("").map((arg) => "-" + arg));
    }
  }
  
  if (args.length === 0) {
    console.log("Usage: yarn ic <command> [options]");
    console.log("Commands:");
    console.log("  sync - Sync database");
    return;
  }
  const command = args[0];
  if (command === "sync") {
    // Alter
    let alter: boolean | null = args.includes("--alter") || args.includes("-a") || null;
    alter ??= !args.includes("--no-alter") && null;
    
    // Force
    let force: boolean | null = args.includes("--force") || args.includes("-f") || null;
    force ??= !args.includes("--no-force") && null;
    
    const readline = rl.createInterface(process.stdin, process.stdout);
    const question = util.promisify(readline.question).bind(readline) as unknown as (question: string) => Promise<string>;
    alter ??= (await question("Alter database? (y/N): ")).toLowerCase().startsWith("y");
    force ??= (await question("Force database? This will clear the database entirely (y/N): ")).toLowerCase().startsWith("y");
    // const firstLoginCreateDefaultUser = true;


    await sequelize.sync({ alter, force });
    console.log("Database synced");
    let userRole = await Role.getRoleByName("user");
    const adminRole = await Role.getRoleByName("admin");

    if (!userRole) {
      console.log("Creating default user role");
      userRole = await Role.registerRole({ name: "user" });
    }

    if (!adminRole) {
      console.log("Creating default admin role");
    }
  }
}