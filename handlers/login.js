import { createHash } from "node:crypto";
import { selectUser } from "../database.js";

export const handleLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.error("[handleLogin] Missing username or password");
    return res.status(400).send("Bad request");
  }

  let user;

  try {
    user = await selectUser(username);
  } catch (err) {
    console.error("[handleLogin] Failed to select user");
    return res.render("login", { error: "Something went wrong" });
  }

  if (
    user &&
    user.password === createHash("sha256").update(password).digest("hex")
  ) {
    req.session.isAuthenticated = true;
    req.session.username = username;

    return res.redirect("/");
  }

  res.render("login", { error: "Wrong credentials" });
};
