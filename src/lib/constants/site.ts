// The hosting configuration redirects kampus.homes to this canonical origin.
export const WEBSITE_URL = "https://www.kampus.homes";

export function listingUrl(id: string) {
  return `${WEBSITE_URL}/lodges/${encodeURIComponent(id)}`;
}
