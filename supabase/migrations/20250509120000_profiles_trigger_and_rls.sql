-- Yeni auth.users kaydı için public.profiles satırı üretir (user_metadata: role, full_name, city).
-- Kayıt API'si admin.createUser ile bu metadata alanlarını doldurur.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_text text;
  full_nm text;
  prefix text;
  attempts int := 0;
  new_code text;
  inserted boolean := false;
BEGIN
  role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  IF role_text NOT IN ('admin', 'teacher', 'student', 'parent') THEN
    role_text := 'student';
  END IF;

  full_nm := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), '');
  IF full_nm = '' THEN
    full_nm := COALESCE(split_part(NEW.email, '@', 1), 'Kullanıcı');
  END IF;

  prefix := CASE role_text
    WHEN 'teacher' THEN 'TCH'
    WHEN 'student' THEN 'STD'
    WHEN 'parent' THEN 'PAR'
    WHEN 'admin' THEN 'ADM'
    ELSE 'USR'
  END;

  WHILE attempts < 50 AND NOT inserted LOOP
    attempts := attempts + 1;
    new_code := prefix || '-' || LPAD((floor(random() * 10000))::int::text, 4, '0');
    BEGIN
      INSERT INTO public.profiles (id, role, profile_code, full_name, city)
      VALUES (
        NEW.id,
        role_text::user_role,
        new_code,
        full_nm,
        NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'city', '')), '')
      );
      inserted := true;
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END LOOP;

  IF NOT inserted THEN
    RAISE EXCEPTION 'Profil kodu üretilemedi';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
