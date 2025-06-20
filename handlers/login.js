import bcrypt from "bcrypt";
import { selectUser } from "../database.js";

export const validateLoginInput = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.error("[validateLoginInput] Missing username or password");
    return res.status(400).send("Bad request");
  }

  next();
};

export const handleLogin = async (req, res) => {
  const { username, password } = req.body;

  let user;

  try {
    user = await selectUser(username);
  } catch (err) {
    console.error("[handleLogin]", err);
    return res.render("login", { error: "Something went wrong" });
  }

  if (user?.password && (await bcrypt.compare(password, user.password))) {
    req.session.isAuthenticated = true;
    req.session.username = username;

    return res.redirect("/");
  }

  res.render("login", { error: "Wrong credentials" });
};
