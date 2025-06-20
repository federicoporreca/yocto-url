import bcrypt from "bcrypt";
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
      password: await bcrypt.hash(password, 10),
    });
  } catch (err) {
    const errors = {};

    if (err instanceof ConstraintViolationError) {
      console.warn("[handleSignup] Constraint violation error", err);
      errors.username = "Username already taken";
    } else {
      console.error("[handleSignup]", err);
      errors.general = "Something went wrong";
    }

    return res.render("signup", { username, errors });
  }

  req.session.isAuthenticated = true;
  req.session.username = username;

  res.redirect("/");
};
