import sqlite3 from "sqlite3";
import { open } from "sqlite";

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
};

export const insertUser = ({ username, password }) => {
  if (!db) {
    return;
  }

  return db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    username,
    password
  );
};

export const selectUser = (username) => {
  if (!db) {
    return;
  }

  return db.get("SELECT * FROM users WHERE username = ?", [username]);
};
