import { incrementUrlVisits, selectUrl } from "../database.js";

export const handleRedirectToOriginalUrl = async (req, res) => {
  const { slug } = req.params;
  const url = await selectUrl(slug);

  if (!url) {
    res.status(404).send("Not found");
  }

  await incrementUrlVisits(slug);
  res.redirect(url.original_url);
};
