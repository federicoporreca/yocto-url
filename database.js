import sqlite3 from "sqlite3";
import { open } from "sqlite";

export class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class ConstraintViolationError extends DatabaseError {
  constructor(message) {
    super(message);
    this.name = "ConstraintViolationError";
  }
}

let db;

export const initDb = async () => {
  if (db) {
    return;
  }

  const dbInstance = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  await dbInstance.run(`CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY NOT NULL,
    password TEXT NOT NULL
  )`);

  db = dbInstance;

  console.log("[initDb] Database initialized");
};

export const insertUser = async ({ username, password }) => {
  try {
    await db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      username,
      password
    );
  } catch (err) {
    console.error("[insertUser]", err);

    if (err.code === "SQLITE_CONSTRAINT") {
      throw new ConstraintViolationError();
    } else {
      throw new DatabaseError();
    }
  }
};

export const selectUser = async (username) => {
  try {
    await db.get("SELECT * FROM users WHERE username = ?", [username]);
  } catch (err) {
    console.error("[selectUser]", err);
    throw new DatabaseError();
  }
};
