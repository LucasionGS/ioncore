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
  if (args.length === 0) {
    console.log("Usage: yarn \"ic <command>\"");
    return;
  }
  const command = args[0];
  if (command === "sync") {
    const readline = rl.createInterface(process.stdin, process.stdout);
    const question = util.promisify(readline.question).bind(readline) as unknown as (question: string) => Promise<string>;
    const syncAlter = (await question("Alter database? (y/N): ")).toLowerCase().startsWith("y");
    const syncForce = (await question("Force database? This will clear the database entirely (y/N): ")).toLowerCase().startsWith("y");
    // const firstLoginCreateDefaultUser = true;


    await sequelize.sync({ alter: syncAlter, force: syncForce });
    console.log("Database synced");
    let userRole = await Role.getRoleByName("user");
    const adminRole = await Role.getRoleByName("admin");

    if (!userRole) {
      console.log("Creating default user role");
      userRole = await Role.registerRole({ name: "user" });
    }

    if (!adminRole) {
      console.log("Creating default admin role");
      await Role.registerRole({ name: "admin" });
    }
  }
}