-- ============================================================================
-- VinylX: Initial Schema
-- PostgreSQL / Supabase Migration
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. EXTENSIONS
-- --------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------------
-- 2. TABLES
-- --------------------------------------------------------------------------

-- profiles: extends Supabase auth.users
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL
              CONSTRAINT chk_username CHECK (
                char_length(username) BETWEEN 3 AND 30
                AND username ~ '^[a-zA-Z0-9_]+$'
              ),
  display_name TEXT,
  avatar_url  TEXT,
  bio         TEXT CONSTRAINT chk_bio CHECK (char_length(bio) <= 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- albums: canonical MusicBrainz matrix
CREATE TABLE public.albums (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musicbrainz_id  TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  artist_name     TEXT NOT NULL,
  release_date    DATE,
  cover_url       TEXT,
  genres          TEXT[] DEFAULT '{}',
  streaming_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  log_count       INTEGER NOT NULL DEFAULT 0,
  avg_rating      NUMERIC(3,1) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_albums_musicbrainz ON public.albums (musicbrainz_id);
CREATE INDEX idx_albums_artist      ON public.albums (artist_name);

-- tracks: album tracklist
CREATE TABLE public.tracks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id              UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  musicbrainz_track_id  TEXT UNIQUE,
  title                 TEXT NOT NULL,
  track_number          INTEGER NOT NULL,
  duration_ms           INTEGER,
  CONSTRAINT uq_album_track UNIQUE (album_id, track_number)
);

CREATE INDEX idx_tracks_album ON public.tracks (album_id, track_number);

-- album_logs: immutable reviews (multiple per user-album allowed)
CREATE TABLE public.album_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  album_id        UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  rating          SMALLINT NOT NULL CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 10),
  review_text     TEXT CONSTRAINT chk_review CHECK (char_length(review_text) <= 5000),
  trinity_tracks  UUID[] NOT NULL CONSTRAINT chk_trinity CHECK (array_length(trinity_tracks, 1) = 3),
  is_pioneer      BOOLEAN NOT NULL DEFAULT false,
  listened_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_logs_user    ON public.album_logs (user_id, created_at DESC);
CREATE INDEX idx_logs_album   ON public.album_logs (album_id, created_at DESC);

-- listenlists: curated watchlist
CREATE TABLE public.listenlists (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  album_id  UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  priority  SMALLINT NOT NULL DEFAULT 0,
  added_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_listenlist_entry UNIQUE (user_id, album_id)
);

CREATE INDEX idx_listenlist_user ON public.listenlists (user_id, priority DESC);

-- follows: social graph
CREATE TABLE public.follows (
  follower_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT chk_no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_following ON public.follows (following_id);

-- --------------------------------------------------------------------------
-- 3. TRIGGERS (PL/pgSQL)
-- --------------------------------------------------------------------------

-- 3a. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.fn_create_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'username')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_create_profile_on_signup();

-- 3b. Pioneer badge evaluation (BEFORE INSERT on album_logs)
-- Reads denormalized log_count via FOR UPDATE SKIP LOCKED to avoid deadlocks.
-- If count < threshold (10), marks the log as pioneer.
CREATE OR REPLACE FUNCTION public.fn_evaluate_pioneer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_count INTEGER;
  _PIONEER_THRESHOLD CONSTANT INTEGER := 10;
BEGIN
  SELECT log_count INTO _log_count
  FROM public.albums
  WHERE id = NEW.album_id
  FOR UPDATE SKIP LOCKED;

  IF _log_count IS NOT NULL AND _log_count < _PIONEER_THRESHOLD THEN
    NEW.is_pioneer := true;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_evaluate_pioneer
  BEFORE INSERT ON public.album_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_evaluate_pioneer();

-- 3c. Increment log_count and recalculate avg_rating (AFTER INSERT on album_logs)
CREATE OR REPLACE FUNCTION public.fn_increment_log_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_avg NUMERIC(3,1);
BEGIN
  SELECT ROUND(AVG(rating)::numeric, 1) INTO _new_avg
  FROM public.album_logs
  WHERE album_id = NEW.album_id;

  UPDATE public.albums
  SET
    log_count  = log_count + 1,
    avg_rating = COALESCE(_new_avg, 0),
    updated_at = now()
  WHERE id = NEW.album_id;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_increment_log_count
  AFTER INSERT ON public.album_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_increment_log_count();

-- 3d. Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION public.fn_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_timestamp();

CREATE TRIGGER trg_albums_updated
  BEFORE UPDATE ON public.albums
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_timestamp();

-- --------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------------------------

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listenlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows     ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_update_owner"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- albums (read-only for anon/authenticated; writes via service_role only)
CREATE POLICY "albums_select_public"
  ON public.albums FOR SELECT
  USING (true);

-- tracks (read-only for anon/authenticated; writes via service_role only)
CREATE POLICY "tracks_select_public"
  ON public.tracks FOR SELECT
  USING (true);

-- album_logs (immutable: insert only, no update/delete)
CREATE POLICY "logs_select_public"
  ON public.album_logs FOR SELECT
  USING (true);

CREATE POLICY "logs_insert_authenticated"
  ON public.album_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- listenlists (CRUD owner only)
CREATE POLICY "listenlists_select_owner"
  ON public.listenlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "listenlists_insert_owner"
  ON public.listenlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "listenlists_delete_owner"
  ON public.listenlists FOR DELETE
  USING (auth.uid() = user_id);

-- follows
CREATE POLICY "follows_select_public"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "follows_insert_owner"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_delete_owner"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);
