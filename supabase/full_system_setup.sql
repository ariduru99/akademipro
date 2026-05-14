-- ==========================================
-- AKADEMI PRO SUPABASE MASTER SCHEMA & POLICIES
-- ==========================================
-- Bu dosyayı Supabase SQL Editor içine yapıştırıp çalıştırın.
-- Bu işlem tüm tabloları, trigger'ları ve RLS politikalarını oluşturur.

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'parent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'teacher_approved', 'parent_approved', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. TABLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role user_role NOT NULL,
  profile_code VARCHAR(10) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  city VARCHAR(100),
  hourly_rate DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0.0,
  is_dnd_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.family_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) NOT NULL,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(parent_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  room_code VARCHAR(15) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_online BOOLEAN DEFAULT false,
  meeting_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.schedules(id),
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  parent_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  teacher_approved_at TIMESTAMP WITH TIME ZONE,
  parent_approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id),
  room_id UUID REFERENCES public.rooms(id),
  content TEXT NOT NULL,
  status message_status DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  color VARCHAR(20) DEFAULT 'yellow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TRIGGER: HANDLE NEW USER
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
  full_nm := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), '');
  IF full_nm = '' THEN full_nm := COALESCE(split_part(NEW.email, '@', 1), 'Kullanıcı'); END IF;

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
      VALUES (NEW.id, role_text::user_role, new_code, full_nm, NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'city', '')), ''));
      inserted := true;
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. RLS POLICIES (GÜVENLİK)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Profiles: Herkes kendi profilini görebilir ve güncelleyebilir.
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles are updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Family Relations: Sadece ilgili ebeveyn veya öğrenci görebilir.
CREATE POLICY "Family relations viewable by members" ON public.family_relations FOR SELECT 
  USING (auth.uid() = parent_id OR auth.uid() = student_id);

-- Rooms: Öğretmen kendi odalarını, üyeler katıldıkları odaları görebilir.
CREATE POLICY "Rooms viewable by teacher or member" ON public.rooms FOR SELECT 
  USING (auth.uid() = teacher_id OR EXISTS (SELECT 1 FROM public.room_members WHERE room_id = public.rooms.id AND user_id = auth.uid()));

-- Messages: Gönderen veya alıcı görebilir.
CREATE POLICY "Messages viewable by sender or receiver" ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR EXISTS (SELECT 1 FROM public.room_members WHERE room_id = public.messages.room_id AND user_id = auth.uid()));

-- Notes: Sadece sahibi görebilir.
CREATE POLICY "Notes are private" ON public.notes FOR ALL USING (auth.uid() = user_id);
