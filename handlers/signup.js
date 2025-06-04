import { createHash } from "node:crypto";
import { ConstraintViolationError, insertUser } from "../database.js";

export const validateSignupInput = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.error("[validateSignupInput] Missing username or password");
    return res.status(400).send("Bad request");
  }

  next();
};

export const handleSignup = async (req, res) => {
  const { username, password } = req.body;

  try {
    await insertUser({
      username,
      password: createHash("sha256").update(password).digest("hex"),
    });
  } catch (err) {
    let error;

    if (err instanceof ConstraintViolationError) {
      console.warn("[handleSignup] Constraint violation error", err);
      error = { field: "username", message: "Username already taken" };
    } else {
      console.error("[handleSignup]", err);
      error = { message: "Something went wrong" };
    }

    return res.render("signup", { username, error });
  }

  req.session.isAuthenticated = true;
  req.session.username = username;

  res.redirect("/");
};
