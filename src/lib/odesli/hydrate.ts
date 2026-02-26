"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getStreamingUrlFromRelease } from "@/lib/musicbrainz/client";
import { getStreamingLinks, extractPlatformLinks } from "./client";

export async function hydrateStreamingLinks(
  albumId: string,
  releaseId: string
): Promise<void> {
  try {
    const streamingUrl = await getStreamingUrlFromRelease(releaseId);
    if (!streamingUrl) return;

    const odesliResponse = await getStreamingLinks(streamingUrl);
    if (!odesliResponse) return;

    const links = extractPlatformLinks(odesliResponse);
    if (Object.keys(links).length === 0) return;

    const supabase = createAdminClient();
    await supabase
      .from("albums")
      .update({ streaming_links: links })
      .eq("id", albumId);
  } catch {
    console.warn("[Odesli] Streaming links hydration deferred");
  }
}
