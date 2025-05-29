import express from "express";
import session from "express-session";
import { initDb } from "./database.js";
import { handleSignup } from "./handlers/signup.js";
import { handleLogin } from "./handlers/login.js";

const PORT = 3000;

await initDb();

const app = express();

app.use(
  session({ secret: "keyboard cat", resave: false, saveUninitialized: false })
);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

app.post("/signup", express.urlencoded(), handleSignup);

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", express.urlencoded(), handleLogin);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
