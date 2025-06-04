import {
  ConstraintViolationError,
  insertUrl,
  selectUrls,
} from "../database.js";
import { formatUrlsWithStats } from "../utils.js";

const isValidUrl = (str) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

const isValidDate = (str) => {
  const date = new Date(str);

  if (isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() > Date.now();
};

export const validateUrlCreationInput = async (req, res, next) => {
  const { url, slug, random, expiry, offset, permanent } = req.body;

  if (!url || (!random && !slug) || (!permanent && !expiry && !offset)) {
    console.error("[validateUrlCreationInput] Missing parameters");
    return res.status(400).send("Bad request");
  }

  if (!isValidUrl(url)) {
    console.error("[validateUrlCreationInput] Invalid URL");
    req.session.error = { field: "url", message: "Invalid URL" };
    req.session.formData = { url, slug, random, expiry, offset, permanent };
    return res.redirect("/");
  }

  if (!permanent && !isValidDate(expiry + offset)) {
    console.error("[validateUrlCreationInput] Invalid expiry");
    req.session.error = { field: "expiry", message: "Invalid expiry" };
    req.session.formData = { url, slug, random, expiry, offset, permanent };
    return res.redirect("/");
  }

  next();
};

const generateSlug = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randIndex = Math.floor(Math.random() * chars.length);
    result += chars[randIndex];
  }
  return result;
};

export const handleUrlCreation = async (req, res) => {
  const { url, slug, random, expiry, offset, permanent } = req.body;
  const { username } = req.session;

  const expiryWithOffset = expiry + offset;

  if (!random) {
    try {
      await insertUrl({
        slug,
        username,
        originalUrl: url,
        expiry: permanent ? null : new Date(expiryWithOffset),
      });

      res.redirect("/");
    } catch (err) {
      if (err instanceof ConstraintViolationError) {
        console.warn("[handleUrlCreation] Constraint violation error", err);
        req.session.error = { field: "slug", message: "Slug already taken" };
        req.session.formData = { url, slug, random, expiry, offset, permanent };
        return res.redirect("/");
      }

      console.error("[handleUrlCreation]", err);
      return res.status(500).send("Internal server error");
    }
  }

  let created = false;

  while (!created) {
    const randomSlug = generateSlug();

    try {
      await insertUrl({
        slug: randomSlug,
        username,
        originalUrl: url,
        expiry: permanent ? null : new Date(expiryWithOffset),
      });

      created = true;
    } catch (err) {
      if (err instanceof ConstraintViolationError) {
        console.warn("[handleUrlCreation] Constraint violation error", err);
        continue;
      }

      console.error("[handleUrlCreation]", err);
      return res.status(500).send("Internal server error");
    }
  }

  res.redirect("/");
};
