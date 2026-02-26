-- ============================================================================
-- VinylX: Phase 4 — Public READ for listenlists
-- Enables profile listenlist pages to be viewed by any user.
-- ============================================================================

-- Drop owner-only select and replace with public read
DROP POLICY IF EXISTS "listenlists_select_owner" ON public.listenlists;

CREATE POLICY "listenlists_select_public"
  ON public.listenlists FOR SELECT
  USING (true);
