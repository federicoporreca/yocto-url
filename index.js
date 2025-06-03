import express from "express";
import session from "express-session";
import { initDb, selectUrls } from "./database.js";
import { handleSignup, validateSignupInput } from "./handlers/signup.js";
import { handleLogin, validateLoginInput } from "./handlers/login.js";
import {
  handleUrlCreation,
  validateUrlCreationInput,
} from "./handlers/urlCreation.js";
import { handleRedirect } from "./handlers/redirect.js";
import { formatUrlsWithStats } from "./utils.js";

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

app.use(express.static("public"));

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

  res.render("index", {
    username,
    urls: formatUrlsWithStats(urls),
    error: null,
  });
});

app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

app.post("/signup", express.urlencoded(), validateSignupInput, handleSignup);

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", express.urlencoded(), validateLoginInput, handleLogin);

app.listen(PORT, () => {
  console.log(`[app] Listening on port ${PORT}`);
});

app.post(
  "/urls",
  checkAuthentication,
  express.urlencoded(),
  validateUrlCreationInput,
  handleUrlCreation
);

app.get("/:slug", handleRedirect);
