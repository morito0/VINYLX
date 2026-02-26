import type { OdesliResponse } from "./types";

const BASE_URL = "https://api.song.link/v1-alpha.1/links";

export async function getStreamingLinks(
  platformUrl: string
): Promise<OdesliResponse | null> {
  try {
    const res = await fetch(
      `${BASE_URL}?url=${encodeURIComponent(platformUrl)}&userCountry=US`,
      { next: { revalidate: 604800 } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function extractPlatformLinks(
  response: OdesliResponse
): Record<string, string> {
  const links: Record<string, string> = {};

  if (response.pageUrl) {
    links.songlink = response.pageUrl;
  }

  for (const [platform, data] of Object.entries(response.linksByPlatform)) {
    if (data?.url) {
      links[platform] = data.url;
    }
  }

  return links;
}
