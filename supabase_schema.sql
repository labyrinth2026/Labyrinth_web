-- =====================================================================
-- LABYRINTH CLUB SIMPLIFIED DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- =====================================================================
-- Execute this script directly in your Supabase SQL Editor.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles Table (Linked to auth.users)
-- Create first to resolve references, add circular FKs later
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MEMBER')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    first_login BOOLEAN NOT NULL DEFAULT true,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    profile_photo TEXT,
    
    -- Designations for display on public website
    designation TEXT,
    department TEXT,

    -- Dynamic assignments
    committee_id UUID,
    vertical_id UUID,
    
    -- Socials & Details
    github TEXT,
    linkedin TEXT,
    reg_no TEXT,
    class_name TEXT,
    created_by UUID,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Core Committees Table
CREATE TABLE IF NOT EXISTS public.core_committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'Users',
    head_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    vertical_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.core_committees ENABLE ROW LEVEL SECURITY;

-- 3. Create Verticals Table
CREATE TABLE IF NOT EXISTS public.verticals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('tech', 'non-tech')),
    icon TEXT DEFAULT 'Brain',
    color TEXT DEFAULT '#CD0000',
    head_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.verticals ENABLE ROW LEVEL SECURITY;

-- Now add the circular Foreign Key references to the profiles table
ALTER TABLE public.profiles 
    ADD CONSTRAINT fk_profiles_committee FOREIGN KEY (committee_id) REFERENCES public.core_committees(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_profiles_vertical FOREIGN KEY (vertical_id) REFERENCES public.verticals(id) ON DELETE SET NULL;

ALTER TABLE public.core_committees
    ADD CONSTRAINT fk_core_committees_vertical FOREIGN KEY (vertical_id) REFERENCES public.verticals(id) ON DELETE SET NULL;

-- 4. Create Events Table (Consolidated for Club, Committees, and Verticals)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    location TEXT,
    banner_url TEXT,
    
    -- Scope targets (if both null, belongs to whole club)
    committee_id UUID REFERENCES public.core_committees(id) ON DELETE SET NULL,
    vertical_id UUID REFERENCES public.verticals(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 5. Create Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- Audience targets
    audience_type TEXT NOT NULL CHECK (audience_type IN ('club', 'committee', 'vertical')),
    audience_id UUID, -- References committee ID or vertical ID, null if club
    
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 6. Create Tasks Table (Consolidated committee tasks & vertical projects)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    
    -- Scopes
    committee_id UUID REFERENCES public.core_committees(id) ON DELETE SET NULL,
    vertical_id UUID REFERENCES public.verticals(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 7. Create Resources Table (Consolidated learning resources & committee assets)
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    
    -- Scopes
    committee_id UUID REFERENCES public.core_committees(id) ON DELETE SET NULL,
    vertical_id UUID REFERENCES public.verticals(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 8. Create Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- DATABASE INDEXES FOR PERFORMANCE
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_scope ON public.profiles(committee_id, vertical_id);
CREATE INDEX IF NOT EXISTS idx_events_scope ON public.events(committee_id, vertical_id);
CREATE INDEX IF NOT EXISTS idx_announcements_audience ON public.announcements(audience_type, audience_id);
CREATE INDEX IF NOT EXISTS idx_tasks_scope ON public.tasks(committee_id, vertical_id);
CREATE INDEX IF NOT EXISTS idx_resources_scope ON public.resources(committee_id, vertical_id);
CREATE INDEX IF NOT EXISTS idx_logs_user ON public.activity_logs(user_id);

-- =====================================================================
-- SECURITY DEFINER HELPERS
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- --- PUBLIC ACCESS READ / ADMIN EDIT POLICIES ---

-- Committees Table Policies
CREATE POLICY "Allow read access to committees for all users"
ON public.core_committees FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow ADMIN to manage committees"
ON public.core_committees FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- Verticals Table Policies
CREATE POLICY "Allow read access to verticals for all users"
ON public.verticals FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow ADMIN to manage verticals"
ON public.verticals FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- Profiles Table Policies
CREATE POLICY "Allow profiles read access for all users"
ON public.profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow users to update their own profile fields"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow ADMIN to manage all profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- Events Table Policies
CREATE POLICY "Allow read access to events for all users"
ON public.events FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow ADMIN to manage events"
ON public.events FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- Announcements Table Policies
CREATE POLICY "Allow read access to announcements for all users"
ON public.announcements FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow ADMIN to manage announcements"
ON public.announcements FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- Tasks Table Policies
CREATE POLICY "Allow read access to tasks for all users"
ON public.tasks FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow ADMIN to manage tasks"
ON public.tasks FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- Resources Table Policies
CREATE POLICY "Allow read access to resources for all users"
ON public.resources FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow ADMIN to manage resources"
ON public.resources FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- Activity Logs Table Policies
CREATE POLICY "Allow ADMIN to view all logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (public.get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Allow users to insert their own logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- TRIGGER FOR AUTO-CREATING PROFILES ON USER SIGNUP
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    name,
    role, 
    status, 
    first_login, 
    committee_id,
    vertical_id,
    created_by
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'MEMBER'),
    'active',
    COALESCE((new.raw_user_meta_data->>'first_login')::boolean, true),
    (new.raw_user_meta_data->>'committee_id')::uuid,
    (new.raw_user_meta_data->>'vertical_id')::uuid,
    (new.raw_user_meta_data->>'created_by')::uuid
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger mapping
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- MOCK SEED DATA FOR SUPABASE SQL EDITOR
-- =====================================================================

-- Seed Committees
INSERT INTO public.core_committees (id, name, description, icon) VALUES
('cc000000-0000-0000-0000-000000000000', 'Publicity Committee', 'Handles fest teasers, public relations, and branding.', 'Megaphone')
ON CONFLICT DO NOTHING;

-- Seed Verticals
INSERT INTO public.verticals (id, name, description, category, icon, color) VALUES
('ab000000-0000-0000-0000-000000000000', 'AI Creator''s Lab', 'Where creativity meets intelligence! Machine Learning & Generative AI.', 'tech', 'Brain', '#3b82f6'),
('ab000000-0000-0000-0000-000000000002', 'GameNova', 'Game development and e-sports tournaments.', 'tech', 'Gamepad2', '#ef4444'),
('ab000000-0000-0000-0000-000000000003', 'CodeCraft', 'Competitive programming and problem-solving arena.', 'tech', 'Code2', '#10b981'),
('ab000000-0000-0000-0000-000000000004', 'CipherGuard', 'Ethical hacking and security battleground.', 'tech', 'Shield', '#f59e0b')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- =====================================================================
-- CUSTOM FORMS SCHEMA
-- =====================================================================

-- Custom Forms Table
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
    cover_image TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Custom Form Fields Table
CREATE TABLE IF NOT EXISTS public.form_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE,
    field_type VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    placeholder TEXT,
    required BOOLEAN DEFAULT false NOT NULL,
    options JSONB, -- For select, radio, checkbox choices
    order_num INTEGER DEFAULT 0 NOT NULL,
    default_value TEXT,
    validation VARCHAR(255)
);

-- Custom Form Responses Table
CREATE TABLE IF NOT EXISTS public.form_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'selected', 'rejected', 'interview_scheduled', 'completed')),
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Custom Response Answers Table
CREATE TABLE IF NOT EXISTS public.response_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    response_id UUID REFERENCES public.form_responses(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.form_fields(id) ON DELETE CASCADE,
    value JSONB NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_answers ENABLE ROW LEVEL SECURITY;

-- Forms RLS policies
DROP POLICY IF EXISTS "Public read active forms" ON public.forms;
CREATE POLICY "Public read active forms" ON public.forms
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admin full control forms" ON public.forms;
CREATE POLICY "Admin full control forms" ON public.forms
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN'));

-- Form fields RLS policies
DROP POLICY IF EXISTS "Public read fields of active forms" ON public.form_fields;
CREATE POLICY "Public read fields of active forms" ON public.form_fields
    FOR SELECT USING (form_id IN (SELECT id FROM public.forms WHERE status = 'published'));

DROP POLICY IF EXISTS "Admin full control fields" ON public.form_fields;
CREATE POLICY "Admin full control fields" ON public.form_fields
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN'));

-- Form responses RLS policies
DROP POLICY IF EXISTS "Public submit responses" ON public.form_responses;
CREATE POLICY "Public submit responses" ON public.form_responses
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full control responses" ON public.form_responses;
CREATE POLICY "Admin full control responses" ON public.form_responses
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN'));

-- Response answers RLS policies
DROP POLICY IF EXISTS "Public submit answers" ON public.response_answers;
CREATE POLICY "Public submit answers" ON public.response_answers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full control answers" ON public.response_answers;
CREATE POLICY "Admin full control answers" ON public.response_answers
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN'));


-- =====================================================================
-- SEED INITIAL ADMINISTRATOR ACCOUNT (SURYA VM)
-- =====================================================================
-- Default password: Labyrinth@123
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    'd0000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'suryachalam.vm@bsccmh.christuniversity.in',
    '$2a$10$Y5OplUq6K09yTz43P4k4n.Xq2j8fJ9i4tSgP573d6lB8u21m5zK1W', -- Blowfish hash of 'Labyrinth@123'
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Suryachalam VM","role":"ADMIN","first_login":false}',
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'suryachalam.vm@bsccmh.christuniversity.in'
);

-- Update designation and HOD details in public profile
UPDATE public.profiles
SET 
    designation = 'Professor & HOD',
    department = 'Department of Computer Science',
    profile_photo = 'https://ui-avatars.com/api/?name=Suryachalam+VM&background=CD0000&color=fff',
    role = 'ADMIN',
    first_login = false
WHERE email = 'suryachalam.vm@bsccmh.christuniversity.in';


