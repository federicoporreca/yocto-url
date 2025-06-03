export const formatUrlsWithStats = (rows) => {
  const grouped = {};

  for (const row of rows) {
    const { slug, original_url, expiry, visits_date, visits_count } = row;

    if (!grouped[slug]) {
      grouped[slug] = { slug, original_url, expiry, visits: [] };
    }

    if (visits_date) {
      grouped[slug].visits.push({ date: visits_date, count: visits_count });
    }
  }

  return Object.values(grouped);
};
