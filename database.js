import sqlite3 from "sqlite3";
import { open } from "sqlite";

export class DatabaseError extends Error {
  constructor(err) {
    super(err.message);
    this.name = "DatabaseError";
    this.stack = err.stack;
  }
}

export class ConstraintViolationError extends DatabaseError {
  constructor(err) {
    super(err);
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
    expiry TEXT
  )`);

  await dbInstance.run(`CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
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
      throw new ConstraintViolationError(err);
    } else {
      throw new DatabaseError(err);
    }
  }
};

export const selectUser = async (username) => {
  try {
    return await db.get("SELECT * FROM users WHERE username = ?", [username]);
  } catch (err) {
    throw new DatabaseError(err);
  }
};

const formatDate = (date) => {
  return date.toISOString().replace("T", " ").substring(0, 19);
};

export const insertUrl = async ({ slug, username, originalUrl, expiry }) => {
  try {
    await db.run(
      "INSERT INTO urls (slug, username, original_url, expiry) VALUES (?, ?, ?, ?)",
      slug,
      username,
      originalUrl,
      expiry ? formatDate(expiry) : null
    );
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      throw new ConstraintViolationError(err);
    } else {
      throw new DatabaseError(err);
    }
  }
};

export const selectUrl = async (slug) => {
  try {
    return await db.get(
      "SELECT * FROM urls WHERE slug = ? AND (expiry IS NULL OR expiry > datetime('now'))",
      [slug]
    );
  } catch (err) {
    throw new DatabaseError(err);
  }
};

export const selectUrls = async (username) => {
  try {
    return await db.all(
      `SELECT
        urls.slug,
        urls.original_url,
        expiry,
        date(visits.timestamp) as visits_date,
        COUNT(*) as visits_count
      FROM urls
      LEFT JOIN visits ON visits.slug = urls.slug
      WHERE urls.username = 'asd'
      GROUP BY urls.slug, visits_date
      ORDER BY urls.slug, visits_date`
    );
  } catch (err) {
    throw new DatabaseError(err);
  }
};

export const insertVisit = async (slug) => {
  try {
    await db.run("INSERT INTO visits (slug) VALUES (?);", [slug]);
  } catch (err) {
    throw new DatabaseError(err);
  }
};
