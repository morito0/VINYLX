-- Upgrade rating from SMALLINT (1-10) to NUMERIC(3,1) (0.0-10.0)
-- Existing integer values are cast losslessly (e.g. 7 → 7.0)

ALTER TABLE public.album_logs
  ALTER COLUMN rating TYPE NUMERIC(3,1) USING rating::NUMERIC(3,1);

ALTER TABLE public.album_logs
  DROP CONSTRAINT chk_rating;

ALTER TABLE public.album_logs
  ADD CONSTRAINT chk_rating CHECK (rating >= 0 AND rating <= 10);
