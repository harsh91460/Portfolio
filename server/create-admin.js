import "dotenv/config";
import pool from "./src/config/db.js";
import bcrypt from "bcryptjs";
import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

function askPassword() {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || !process.stdin.setRawMode) {
      reject(new Error("Run this script directly in PowerShell terminal."));
      return;
    }

    process.stdout.write("Admin password (hidden): ");
    process.stdin.setRawMode(true);
    process.stdin.resume();

    let password = "";

    const onData = (key) => {
      if (key[0] === 3) {
        process.stdin.setRawMode(false);
        process.stdin.removeListener("data", onData);
        reject(new Error("Password entry cancelled."));
        return;
      }

      if (key[0] === 13 || key[0] === 10) {
        process.stdin.setRawMode(false);
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(password);
        return;
      }

      if (key[0] === 8 || key[0] === 127) {
        password = password.slice(0, -1);
        return;
      }

      if (key[0] >= 32) {
        password += key.toString();
      }
    };

    process.stdin.on("data", onData);
  });
}

try {
  const name = (await ask("Admin name: ")).trim();
  const email = (await ask("Admin email: ")).trim().toLowerCase();
  const password = await askPassword();

  if (!name || !email || password.length < 12) {
    throw new Error("Name/email required. Password must be at least 12 characters.");
  }

  const [existing] = await pool.execute(
    "SELECT id FROM admins WHERE email = ?",
    [email]
  );

  if (existing.length) {
    throw new Error("An admin with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await pool.execute(
    "INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );

  console.log("Admin account created successfully.");
} catch (error) {
  console.error("Admin setup failed:", error.message);
  process.exitCode = 1;
} finally {
  rl.close();
  await pool.end();
}
