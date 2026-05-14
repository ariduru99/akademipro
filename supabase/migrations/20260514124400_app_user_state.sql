-- User-scoped application state for product modules that are not yet first-class tables.
-- This keeps state tied to authenticated Supabase users instead of browser-only storage.

CREATE TABLE IF NOT EXISTS public.app_user_state (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state_key TEXT NOT NULL,
  state_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, state_key)
);

CREATE OR REPLACE FUNCTION public.touch_app_user_state_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_app_user_state_updated_at ON public.app_user_state;
CREATE TRIGGER touch_app_user_state_updated_at
  BEFORE UPDATE ON public.app_user_state
  FOR EACH ROW
  EXECUTE PROCEDURE public.touch_app_user_state_updated_at();

ALTER TABLE public.app_user_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_user_state_select_own" ON public.app_user_state;
CREATE POLICY "app_user_state_select_own"
  ON public.app_user_state
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "app_user_state_insert_own" ON public.app_user_state;
CREATE POLICY "app_user_state_insert_own"
  ON public.app_user_state
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "app_user_state_update_own" ON public.app_user_state;
CREATE POLICY "app_user_state_update_own"
  ON public.app_user_state
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "app_user_state_delete_own" ON public.app_user_state;
CREATE POLICY "app_user_state_delete_own"
  ON public.app_user_state
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
