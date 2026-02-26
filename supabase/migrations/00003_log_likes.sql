-- ============================================================================
-- VinylX: Phase 6 — Log Likes + Denormalized Counter
-- ============================================================================

-- 1. Add denormalized likes_count to album_logs
ALTER TABLE public.album_logs
  ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;

-- 2. Create log_likes table
CREATE TABLE public.log_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_id      UUID NOT NULL REFERENCES public.album_logs(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_log_like UNIQUE (user_id, log_id)
);

CREATE INDEX idx_log_likes_log ON public.log_likes (log_id);

-- 3. Triggers: atomic counter maintenance (no SELECT COUNT)

CREATE OR REPLACE FUNCTION public.fn_increment_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.album_logs
  SET likes_count = likes_count + 1
  WHERE id = NEW.log_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_increment_likes
  AFTER INSERT ON public.log_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_increment_likes_count();

CREATE OR REPLACE FUNCTION public.fn_decrement_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.album_logs
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = OLD.log_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_decrement_likes
  AFTER DELETE ON public.log_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_decrement_likes_count();

-- 4. RLS
ALTER TABLE public.log_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "log_likes_select_public"
  ON public.log_likes FOR SELECT
  USING (true);

CREATE POLICY "log_likes_insert_owner"
  ON public.log_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "log_likes_delete_owner"
  ON public.log_likes FOR DELETE
  USING (auth.uid() = user_id);
