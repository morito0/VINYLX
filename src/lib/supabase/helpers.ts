import type { Database } from "./types";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Album = Tables<"albums">;
export type Profile = Tables<"profiles">;
export type Track = Tables<"tracks">;
export type AlbumLog = Tables<"album_logs">;
export type Listenlist = Tables<"listenlists">;
export type Follow = Tables<"follows">;
export type LogLike = Tables<"log_likes">;
