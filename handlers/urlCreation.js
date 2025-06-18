import { ConstraintViolationError, insertUrl } from "../database.js";

const SLUG_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

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

const validateSlug = (str) => {
  if (str.length < 4 || str.length > 12) {
    return "Length must be within 4 and 12 characters";
  }

  for (let i = 0; i < str.length; i++) {
    if (!SLUG_CHARSET.includes(str[i])) {
      return "Only alphanumeric characters are allowed";
    }
  }
};

export const validateUrlCreationInput = async (req, res, next) => {
  const { url, slug, random, expiry, offset, permanent } = req.body;

  if (!url || (!random && !slug) || (!permanent && !expiry && !offset)) {
    console.error("[validateUrlCreationInput] Missing parameters");
    return res.status(400).send("Bad request");
  }

  const errors = {};

  if (!isValidUrl(url)) {
    console.error("[validateUrlCreationInput] Invalid URL");
    errors.url = "Invalid URL";
  }

  if (!permanent && !isValidDate(expiry + offset)) {
    console.error("[validateUrlCreationInput] Invalid expiry");
    errors.expiry = "Invalid expiry";
  }

  if (slug) {
    const slugError = validateSlug(slug);

    if (slugError) {
      console.error("[validateUrlCreationInput] Invalid slug");
      errors.slug = slugError;
    }
  }

  if (Object.entries(errors).length > 0) {
    req.session.errors = errors;
    req.session.formData = { url, slug, random, expiry, offset, permanent };
    return res.redirect("/");
  }

  next();
};

const generateSlug = (length = 8) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    const randIndex = Math.floor(Math.random() * SLUG_CHARSET.length);
    result += SLUG_CHARSET[randIndex];
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

      return res.redirect("/");
    } catch (err) {
      if (err instanceof ConstraintViolationError) {
        console.warn("[handleUrlCreation] Constraint violation error", err);
        req.session.errors = { slug: "Slug already taken" };
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
