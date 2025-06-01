import { createHash } from "node:crypto";
import { ConstraintViolationError, insertUser } from "../database.js";

export const handleSignup = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.error("[handleSignup] Missing username or password");
    return res.status(400).send("Bad request");
  }

  try {
    await insertUser({
      username,
      password: createHash("sha256").update(password).digest("hex"),
    });
  } catch (err) {
    console.error("[handleSignup] Database error", err);

    let error;

    if (err instanceof ConstraintViolationError) {
      error = "Username already taken";
    } else {
      error = "Something went wrong";
    }

    return res.render("signup", { error });
  }

  req.session.isAuthenticated = true;
  req.session.username = username;

  res.redirect("/");
};
