import { BASE_URL } from "./constants.js";

const isPastDate = (str) => new Date(str) < new Date();

const formatDate = (str) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(new Date(str));

export const formatUrlsWithStats = (rows) => {
  const grouped = {};

  for (const row of rows) {
    const { slug, original_url, expiry, visits_date, visits_count } = row;

    const expiryAsIso = expiry ? expiry.replace(" ", "T") + "Z" : null;

    if (!grouped[slug]) {
      grouped[slug] = {
        short_url: `${BASE_URL}/${slug}`,
        original_url,
        expiry: expiry ? formatDate(expiryAsIso) : "Permanent",
        is_expired: expiry && isPastDate(expiryAsIso),
        total_visits: 0,
        visits: [],
      };
    }

    if (visits_date) {
      grouped[slug].total_visits += visits_count;
      grouped[slug].visits.push({ date: visits_date, count: visits_count });
    }
  }

  return Object.values(grouped);
};
