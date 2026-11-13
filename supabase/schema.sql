-- =============================================================================
-- SELENS (Society of Electrical Engineering Students - MSU-GSC)
-- Live Supabase Database Schema, Triggers, RLS Policies & Storage Setup
-- Project ID: hcdfeogjlattjrdgztzy
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. PROFILES, SIGNUP ALLOWLIST & AUTH TRIGGERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.allowed_signup_emails (
  email text PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'student'
    CHECK (role = ANY (ARRAY['student'::text, 'officer'::text, 'pubrel'::text, 'admin_affairs'::text, 'admin'::text])),
  student_id text
    CHECK (student_id IS NULL OR student_id ~ '^[0-9]{4}-[0-9]{4}$'::text),
  year_level text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = (SELECT auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_officer()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role IN ('officer', 'pubrel', 'admin_affairs', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_delete()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role IN ('pubrel', 'admin_affairs', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role IN ('admin', 'admin_affairs')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_own_person_row(p_email text, p_full_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_officer()
    AND EXISTS (
      SELECT 1
      FROM auth.users u
      LEFT JOIN public.profiles pr ON pr.id = u.id
      WHERE u.id = (SELECT auth.uid())
        AND (
          (
            nullif(btrim(coalesce(p_email, '')), '') IS NOT NULL
            AND lower(regexp_replace(btrim(p_email), '\s+', ' ', 'g')) =
                lower(regexp_replace(btrim(coalesce(u.email, '')), '\s+', ' ', 'g'))
          )
          OR (
            nullif(btrim(coalesce(p_full_name, '')), '') IS NOT NULL
            AND lower(regexp_replace(btrim(p_full_name), '\s+', ' ', 'g')) IN (
              lower(regexp_replace(btrim(coalesce(pr.full_name, '')), '\s+', ' ', 'g')),
              lower(regexp_replace(btrim(coalesce(u.raw_user_meta_data->>'full_name', '')), '\s+', ' ', 'g'))
            )
          )
        )
    );
$$;

CREATE OR REPLACE FUNCTION public.enforce_people_officer_photo_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NOT NULL AND NOT public.is_admin() THEN
    IF NEW.full_name IS DISTINCT FROM OLD.full_name
       OR NEW.position IS DISTINCT FROM OLD.position
       OR NEW.committee IS DISTINCT FROM OLD.committee
       OR NEW.category IS DISTINCT FROM OLD.category
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.display_order IS DISTINCT FROM OLD.display_order
       OR NEW.academic_year IS DISTINCT FROM OLD.academic_year THEN
      RAISE EXCEPTION 'Non-admin officers may only update their own photo_url.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_signup_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(coalesce(new.email, ''));
  v_id    text := new.raw_user_meta_data->>'student_id';
BEGIN
  IF EXISTS (SELECT 1 FROM public.allowed_signup_emails WHERE email = v_email) THEN
    RETURN new;
  END IF;
  IF v_email !~ '^[^@[:space:]]+@msugensan\.edu\.ph$' THEN
    RAISE EXCEPTION 'Sign-ups are limited to @msugensan.edu.ph emails.';
  END IF;
  IF v_id IS NULL OR v_id !~ '^[0-9]{4}-[0-9]{4}$' THEN
    RAISE EXCEPTION 'A valid student ID (YYYY-NNNN) is required.';
  END IF;
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, student_id, year_level)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'student',
    nullif(new.raw_user_meta_data->>'student_id', ''),
    nullif(new.raw_user_meta_data->>'year_level', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.lock_student_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF old.student_id IS NOT NULL
     AND new.student_id IS DISTINCT FROM old.student_id
     AND auth.uid() IS NOT NULL
     AND coalesce(public.get_my_role(), '') <> 'admin' THEN
    RAISE EXCEPTION 'Student ID cannot be changed.';
  END IF;
  RETURN new;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_signup_rules() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lock_student_id() FROM PUBLIC, anon, authenticated;

-- =============================================================================
-- 2. PUBLIC CMS & DIRECTORY TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  position text NOT NULL,
  committee text,
  category text NOT NULL DEFAULT 'officer'
    CHECK (category = ANY (ARRAY[
      'executive_board'::text,
      'councilor'::text,
      'year_representative'::text,
      'undersecretary'::text,
      'comelec'::text,
      'judiciary'::text,
      'adviser'::text,
      'officer'::text,
      'committee_lead'::text
    ])),
  photo_url text,
  email text,
  display_order integer DEFAULT 0,
  academic_year text NOT NULL DEFAULT '2026-2027',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  body text,
  category text NOT NULL DEFAULT 'news_events'
    CHECK (category = ANY (ARRAY['news_events'::text, 'student_activities'::text])),
  thumbnail_url text,
  published_at timestamptz NOT NULL DEFAULT now(),
  author_id uuid REFERENCES public.profiles(id),
  academic_year text NOT NULL DEFAULT '2026-2027',
  committee text NOT NULL DEFAULT 'General',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accomplishments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text,
  body text,
  category text NOT NULL DEFAULT 'organizational'
    CHECK (category = ANY (ARRAY['academic'::text, 'competition'::text, 'community_outreach'::text, 'organizational'::text, 'other'::text])),
  accomplished_on date,
  image_url text,
  academic_year text NOT NULL DEFAULT '2026-2027',
  committee text NOT NULL DEFAULT 'General',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text DEFAULT 'ongoing'
    CHECK (status = ANY (ARRAY['ongoing'::text, 'completed'::text, 'upcoming'::text])),
  cover_image_url text,
  link_url text,
  academic_year text NOT NULL DEFAULT '2026-2027',
  committee text NOT NULL DEFAULT 'General',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  awarding_body text,
  date_awarded date,
  image_url text,
  academic_year text NOT NULL DEFAULT '2026-2027',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.topnotchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  exam_year text NOT NULL,
  rank integer,
  rating numeric,
  photo_url text,
  batch text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 3. STUDENT SERVICES TABLES & VIEWS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.document_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id),
  user_id uuid DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_id text DEFAULT '',
  full_name text DEFAULT '',
  document_type text NOT NULL,
  purpose text,
  urgency text NOT NULL DEFAULT 'regular',
  status text NOT NULL DEFAULT 'pending',
  admin_notes text DEFAULT '',
  file_url text DEFAULT '',
  requested_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teechpoints_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  points integer NOT NULL,
  reason text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  activity_name text,
  awarded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE VIEW public.teechpoints_logs
WITH (security_invoker = true)
AS
SELECT
  id,
  student_id AS user_id,
  student_id,
  category,
  COALESCE(activity_name, reason) AS activity_name,
  reason,
  points,
  awarded_by,
  created_at
FROM public.teechpoints_ledger;

-- =============================================================================
-- 4. FOREIGN KEY INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_document_requests_requester_id ON public.document_requests (requester_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_user_id ON public.document_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_news_posts_author_id ON public.news_posts (author_id);
CREATE INDEX IF NOT EXISTS idx_teechpoints_ledger_awarded_by ON public.teechpoints_ledger (awarded_by);
CREATE INDEX IF NOT EXISTS idx_teechpoints_ledger_student_id ON public.teechpoints_ledger (student_id);

-- =============================================================================
-- 5. STORAGE BUCKET CONFIGURATION
-- =============================================================================

UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 1048576,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'site-images';
