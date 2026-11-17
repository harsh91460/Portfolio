import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import readline from "node:readline";

dotenv.config({ path: "server/.env" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

async function main() {
  let connection;

  try {
    const name = (await ask("Admin name: ")).trim();
    const email = (await ask("Admin email: ")).trim().toLowerCase();
    const password = (await ask("Admin password (input visible): "));

    if (!name || !email || password.length < 12) {
      throw new Error("Name/email required. Password must be at least 12 characters.");
    }

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [existing] = await connection.execute(
      "SELECT id FROM admins WHERE email = ?",
      [email]
    );

    if (existing.length) {
      throw new Error("An admin with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await connection.execute(
      "INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );

    console.log("Admin account created successfully.");
  } finally {
    if (connection) await connection.end();
    rl.close();
  }
}

main().catch((error) => {
  console.error("Setup failed:", error.message);
  process.exitCode = 1;
});

