export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      albums: {
        Row: {
          id: string;
          musicbrainz_id: string;
          title: string;
          artist_name: string;
          release_date: string | null;
          cover_url: string | null;
          genres: string[];
          streaming_links: Json;
          log_count: number;
          avg_rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          musicbrainz_id: string;
          title: string;
          artist_name: string;
          release_date?: string | null;
          cover_url?: string | null;
          genres?: string[];
          streaming_links?: Json;
          log_count?: number;
          avg_rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          musicbrainz_id?: string;
          title?: string;
          artist_name?: string;
          release_date?: string | null;
          cover_url?: string | null;
          genres?: string[];
          streaming_links?: Json;
          log_count?: number;
          avg_rating?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      tracks: {
        Row: {
          id: string;
          album_id: string;
          musicbrainz_track_id: string | null;
          title: string;
          track_number: number;
          duration_ms: number | null;
        };
        Insert: {
          id?: string;
          album_id: string;
          musicbrainz_track_id?: string | null;
          title: string;
          track_number: number;
          duration_ms?: number | null;
        };
        Update: {
          album_id?: string;
          musicbrainz_track_id?: string | null;
          title?: string;
          track_number?: number;
          duration_ms?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "tracks_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
        ];
      };
      album_logs: {
        Row: {
          id: string;
          user_id: string;
          album_id: string;
          rating: number;
          review_text: string | null;
          trinity_tracks: string[];
          is_pioneer: boolean;
          listened_at: string;
          created_at: string;
          likes_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          album_id: string;
          rating: number;
          review_text?: string | null;
          trinity_tracks: string[];
          is_pioneer?: boolean;
          listened_at?: string;
          created_at?: string;
          likes_count?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          album_id?: string;
          rating?: number;
          review_text?: string | null;
          trinity_tracks?: string[];
          is_pioneer?: boolean;
          listened_at?: string;
          created_at?: string;
          likes_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "album_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "album_logs_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
        ];
      };
      listenlists: {
        Row: {
          id: string;
          user_id: string;
          album_id: string;
          priority: number;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          album_id: string;
          priority?: number;
          added_at?: string;
        };
        Update: {
          priority?: number;
        };
        Relationships: [
          {
            foreignKeyName: "listenlists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listenlists_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
        ];
      };
      log_likes: {
        Row: {
          id: string;
          user_id: string;
          log_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          log_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          log_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "log_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "log_likes_log_id_fkey";
            columns: ["log_id"];
            isOneToOne: false;
            referencedRelation: "album_logs";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
