import {
  ConstraintViolationError,
  insertUrl,
  selectUrls,
} from "../database.js";

const isValidUrl = (str) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
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
  const { url } = req.body;

  if (!url) {
    console.error("[handleUrlCreation] Missing url");
    return res.status(400).send("Bad request");
  }

  const { username } = req.session;

  if (!isValidUrl(url)) {
    const urls = await selectUrls(username);
    return res.render("index", { username, urls, error: "Invalid URL" });
  }

  let created = false;

  while (!created) {
    const slug = generateSlug();

    try {
      await insertUrl({
        slug,
        username,
        originalUrl: url,
      });
      created = true;
    } catch (err) {
      if (err instanceof ConstraintViolationError) {
        console.warn("[handleUrlCreation] Constraint violation error", err);
        continue;
      }

      console.error("[handleUrlCreation] Database error", err);
      return res.status(500).send("Internal server error");
    }
  }

  const urls = await selectUrls(username);
  res.render("index", { username, urls, error: null });
};
