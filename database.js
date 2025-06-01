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

  await dbInstance.run(`CREATE TABLE IF NOT EXISTS urls (
    slug TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL,
    original_url TEXT NOT NULL,
    visits INT DEFAULT 0
  )`);

  db = dbInstance;
};

export const insertUser = async ({ username, password }) => {
  try {
    await db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      username,
      password
    );
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      throw new ConstraintViolationError();
    } else {
      throw new DatabaseError();
    }
  }
};

export const selectUser = async (username) => {
  try {
    return await db.get("SELECT * FROM users WHERE username = ?", [username]);
  } catch (err) {
    throw new DatabaseError();
  }
};

export const insertUrl = async ({ slug, username, originalUrl }) => {
  try {
    await db.run(
      "INSERT INTO urls (slug, username, original_url) VALUES (?, ?, ?);",
      slug,
      username,
      originalUrl
    );
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      throw new ConstraintViolationError();
    } else {
      throw new DatabaseError();
    }
  }
};

export const selectUrl = async (slug) => {
  try {
    return await db.get("SELECT * FROM urls WHERE slug = ?", [slug]);
  } catch (err) {
    throw new DatabaseError();
  }
};

export const selectUrls = async (username) => {
  try {
    return await db.all("SELECT * FROM urls WHERE username = ?", [username]);
  } catch (err) {
    throw new DatabaseError();
  }
};

export const incrementUrlVisits = async (slug) => {
  try {
    await db.run("UPDATE urls SET visits = visits + 1 WHERE slug = ?", [slug]);
  } catch (err) {
    throw new DatabaseError();
  }
};
