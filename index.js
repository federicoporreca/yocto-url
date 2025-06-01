import express from "express";
import session from "express-session";
import { initDb, selectUrls } from "./database.js";
import { handleSignup } from "./handlers/handleSignup.js";
import { handleLogin } from "./handlers/handleLogin.js";
import { handleUrlCreation } from "./handlers/handleUrlCreation.js";
import { handleRedirectToOriginalUrl } from "./handlers/handleRedirectToOriginalUrl.js";

const PORT = 3000;

await initDb();
console.log("[app] Database initialized");

const checkAuthentication = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  }

  res.status(401).send("Unauthorized");
};

const app = express();

app.use(
  session({ secret: "keyboard cat", resave: false, saveUninitialized: false })
);

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const { username } = req.session;
  let urls = [];

  if (username) {
    urls = await selectUrls(username);
  }

  res.render("index", { username, urls, error: null });
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

app.post("/urls", checkAuthentication, express.urlencoded(), handleUrlCreation);

app.get("/:slug", handleRedirectToOriginalUrl);
