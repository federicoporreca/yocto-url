import { insertVisit, selectUrl } from "../database.js";

export const handleRedirect = async (req, res) => {
  const { slug } = req.params;
  const url = await selectUrl(slug);

  if (!url) {
    return res.status(404).send("Not found");
  }

  await insertVisit(slug);
  res.redirect(url.original_url);
};
