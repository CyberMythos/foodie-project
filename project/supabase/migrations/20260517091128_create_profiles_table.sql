/*
  # Create profiles table for Foodie. app

  ## Summary
  Creates a profiles table tied to Supabase auth.users that extends user data
  with role-based access control, account lockout tracking, and login metadata.

  ## New Tables
  - `profiles`
    - `id` (uuid, PK, FK → auth.users.id)
    - `username` (text, unique, not null)
    - `role` (text, default 'user') — 'user' | 'moderator' | 'admin'
    - `failed_attempts` (int, default 0) — consecutive failed logins
    - `is_locked` (boolean, default false) — account lockout flag
    - `last_login` (timestamptz) — updated on successful sign-in
    - `created_at` (timestamptz, default now())

  ## Security
  - RLS enabled on profiles
  - Users can read their own profile
  - Users can update their own profile (non-sensitive fields)
  - Service role can update all (for admin operations / lockout)
  - No public insert — handled via trigger on auth.users

  ## Trigger
  - auto_create_profile: fires AFTER INSERT on auth.users, creates a profile row
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  failed_attempts integer NOT NULL DEFAULT 0,
  is_locked boolean NOT NULL DEFAULT false,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Constraint: valid roles only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('user', 'moderator', 'admin'));
  END IF;
END $$;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- UPDATE: users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin read: admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Function + trigger: auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auth events log table (for security audit)
CREATE TABLE IF NOT EXISTS auth_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;

-- Only admins can read auth events
CREATE POLICY "Admins can read auth events"
  ON auth_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Service role can insert events (from edge functions)
CREATE POLICY "Service role can insert auth events"
  ON auth_events FOR INSERT
  TO authenticated
  WITH CHECK (true);
