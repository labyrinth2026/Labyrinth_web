-- =====================================================================
-- LABYRINTH CLUB DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
-- Execute this script in your Supabase SQL Editor.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('HOD', 'COORDINATOR', 'ASSOCIATE', 'CORE_HEAD', 'VERTICAL_HEAD', 'MEMBER', 'USER')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Core Committees Table
CREATE TABLE IF NOT EXISTS public.core_committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Core Committees
ALTER TABLE public.core_committees ENABLE ROW LEVEL SECURITY;

-- 3. Create Verticals Table
CREATE TABLE IF NOT EXISTS public.verticals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('tech', 'non-tech')),
    icon TEXT DEFAULT 'Brain',
    color TEXT DEFAULT '#CD0000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Verticals
ALTER TABLE public.verticals ENABLE ROW LEVEL SECURITY;

-- 4. Create Committee Assignments Table
CREATE TABLE IF NOT EXISTS public.committee_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    committee_id UUID NOT NULL REFERENCES public.core_committees(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, committee_id)
);

-- Enable RLS on Committee Assignments
ALTER TABLE public.committee_assignments ENABLE ROW LEVEL SECURITY;

-- 5. Create Vertical Assignments Table
CREATE TABLE IF NOT EXISTS public.vertical_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vertical_id UUID NOT NULL REFERENCES public.verticals(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, vertical_id)
);

-- Enable RLS on Vertical Assignments
ALTER TABLE public.vertical_assignments ENABLE ROW LEVEL SECURITY;

-- 6. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'past')),
    featured BOOLEAN DEFAULT false,
    committee_id UUID REFERENCES public.core_committees(id) ON DELETE SET NULL,
    vertical_id UUID REFERENCES public.verticals(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 7. Create Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_type TEXT NOT NULL DEFAULT 'all' CHECK (target_type IN ('all', 'committee', 'vertical')),
    target_id UUID, -- References core_committees.id or verticals.id depending on target_type
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 8. Create Committee Tasks Table
CREATE TABLE IF NOT EXISTS public.committee_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES public.core_committees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    assigned_to TEXT,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Committee Tasks
ALTER TABLE public.committee_tasks ENABLE ROW LEVEL SECURITY;

-- 9. Create Committee Resources Table
CREATE TABLE IF NOT EXISTS public.committee_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES public.core_committees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'link',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Committee Resources
ALTER TABLE public.committee_resources ENABLE ROW LEVEL SECURITY;

-- 10. Create Vertical Projects Table
CREATE TABLE IF NOT EXISTS public.vertical_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vertical_id UUID NOT NULL REFERENCES public.verticals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in-progress', 'completed')),
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Vertical Projects
ALTER TABLE public.vertical_projects ENABLE ROW LEVEL SECURITY;

-- 11. Create Vertical Resources Table
CREATE TABLE IF NOT EXISTS public.vertical_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vertical_id UUID NOT NULL REFERENCES public.verticals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'link',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Vertical Resources
ALTER TABLE public.vertical_resources ENABLE ROW LEVEL SECURITY;

-- 12. Create Vertical Attendance Table
CREATE TABLE IF NOT EXISTS public.vertical_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vertical_id UUID NOT NULL REFERENCES public.verticals(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    member_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    member_name TEXT,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Vertical Attendance
ALTER TABLE public.vertical_attendance ENABLE ROW LEVEL SECURITY;

-- 13. Create Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Activity Logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;


-- =====================================================================
-- HELPER FUNCTIONS FOR SECURITY RULES (RLS)
-- =====================================================================

-- Get User Role from Profile
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Get User Committee Assignment
CREATE OR REPLACE FUNCTION public.get_user_committee()
RETURNS UUID AS $$
  SELECT committee_id FROM public.committee_assignments WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Get User Vertical Assignment
CREATE OR REPLACE FUNCTION public.get_user_vertical()
RETURNS UUID AS $$
  SELECT vertical_id FROM public.vertical_assignments WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;


-- =====================================================================
-- SECURITY POLICIES (RLS RULES)
-- =====================================================================

-- --- PROFILES POLICIES ---
CREATE POLICY "Allow read access to active profiles" ON public.profiles
    FOR SELECT USING (status = 'active' OR auth.uid() = id);

CREATE POLICY "Allow profile update for self or admins" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.get_user_role() IN ('HOD', 'COORDINATOR'));

CREATE POLICY "Allow signup triggers to insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow HOD to delete profiles" ON public.profiles
    FOR DELETE USING (public.get_user_role() = 'HOD');

-- --- CORE COMMITTEES POLICIES ---
CREATE POLICY "Allow read access to all committees" ON public.core_committees
    FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage committees" ON public.core_committees
    FOR ALL USING (public.get_user_role() IN ('HOD', 'COORDINATOR'));

-- --- VERTICALS POLICIES ---
CREATE POLICY "Allow read access to all verticals" ON public.verticals
    FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage verticals" ON public.verticals
    FOR ALL USING (public.get_user_role() IN ('HOD', 'COORDINATOR'));

-- --- COMMITTEE ASSIGNMENTS POLICIES ---
CREATE POLICY "Allow read access to assignments" ON public.committee_assignments
    FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage assignments" ON public.committee_assignments
    FOR ALL USING (public.get_user_role() IN ('HOD', 'COORDINATOR'));

-- --- VERTICAL ASSIGNMENTS POLICIES ---
CREATE POLICY "Allow read access to assignments" ON public.vertical_assignments
    FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage assignments" ON public.vertical_assignments
    FOR ALL USING (public.get_user_role() IN ('HOD', 'COORDINATOR'));

-- --- EVENTS POLICIES ---
CREATE POLICY "Allow read access to events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Allow write access for admins or scope heads" ON public.events
    FOR ALL USING (
        public.get_user_role() IN ('HOD', 'COORDINATOR') OR
        (public.get_user_role() = 'CORE_HEAD' AND committee_id = public.get_user_committee()) OR
        (public.get_user_role() = 'VERTICAL_HEAD' AND vertical_id = public.get_user_vertical())
    );

-- --- ANNOUNCEMENTS POLICIES ---
CREATE POLICY "Allow read access to announcements" ON public.announcements
    FOR SELECT USING (true);

CREATE POLICY "Allow write access for admins or scope heads" ON public.announcements
    FOR ALL USING (
        public.get_user_role() IN ('HOD', 'COORDINATOR') OR
        (public.get_user_role() = 'CORE_HEAD' AND target_type = 'committee' AND target_id = public.get_user_committee()) OR
        (public.get_user_role() = 'VERTICAL_HEAD' AND target_type = 'vertical' AND target_id = public.get_user_vertical())
    );

-- --- COMMITTEE TASKS POLICIES ---
CREATE POLICY "Allow select for assigned committee heads and admins" ON public.committee_tasks
    FOR SELECT USING (
        public.get_user_role() IN ('HOD', 'COORDINATOR') OR
        (public.get_user_role() = 'CORE_HEAD' AND committee_id = public.get_user_committee())
    );

CREATE POLICY "Allow write for assigned committee heads and admins" ON public.committee_tasks
    FOR ALL USING (
        public.get_user_role() IN ('HOD', 'COORDINATOR') OR
        (public.get_user_role() = 'CORE_HEAD' AND committee_id = public.get_user_committee())
    );

-- --- COMMITTEE RESOURCES POLICIES ---
CREATE POLICY "Allow select for assigned committee heads and admins" ON public.committee_resources
    FOR SELECT USING (
        public.get_user_role() IN ('HOD', 'COORDINATOR') OR
        (public.get_user_role() = 'CORE_HEAD' AND committee_id = public.get_user_committee())
    );

CREATE POLICY "Allow write for assigned committee heads and admins" ON public.committee_resources
    FOR ALL USING (
        public.get_user_role() IN ('HOD', 'COORDINATOR') OR
        (public.get_user_role() = 'CORE_HEAD' AND committee_id = public.get_user_committee())
    );

-- --- VERTICAL PROJECTS POLICIES ---
CREATE POLICY "Allow select for vertical heads and admins" ON public.vertical_projects
    FOR SELECT USING (
        public.get_user_role() IN ('HOD', 'COORDINATOR') OR
        (public.get_user_role() = 'VERTICAL_HEAD' AND vertical_id = public.get_user_vertical())
    );

CREATE POLICY "Allow write for vertical heads and admins" ON public.vertical_projects
    FOR ALL USING (
        public.get_user_role() IN ('HOD', 'COORDINATOR') OR
        (public.get_user_role() = 'VERTICAL_HEAD' AND vertical_id = public.get_user_vertical())
    );

-- --- VERTICAL RESOURCES POLICIES ---
CREATE POLICY "Allow select for vertical heads and admins" ON public.vertical_resources
    FOR SELECT USING (
        public.get_user_role() IN ('HOD', 'COORDINATOR') OR
        (public.get_user_role() = 'VERTICAL_HEAD' AND vertical_id = public.get_user_vertical())
    );

CREATE POLICY "Allow write for vertical heads and admins" ON public.vertical_resources
    FOR ALL USING (
        public.get_user_role() IN ('HOD', 'COORDINATOR') OR
        (public.get_user_role() = 'VERTICAL_HEAD' AND vertical_id = public.get_user_vertical())
    );

-- --- VERTICAL ATTENDANCE POLICIES ---
CREATE POLICY "Allow select for vertical heads and admins" ON public.vertical_attendance
    FOR SELECT USING (
        public.get_user_role() IN ('HOD', 'COORDINATOR') OR
        (public.get_user_role() = 'VERTICAL_HEAD' AND vertical_id = public.get_user_vertical())
    );

CREATE POLICY "Allow write for vertical heads and admins" ON public.vertical_attendance
    FOR ALL USING (
        public.get_user_role() IN ('HOD', 'COORDINATOR') OR
        (public.get_user_role() = 'VERTICAL_HEAD' AND vertical_id = public.get_user_vertical())
    );

-- --- ACTIVITY LOGS POLICIES ---
CREATE POLICY "Allow read access to activity logs for admins" ON public.activity_logs
    FOR SELECT USING (public.get_user_role() IN ('HOD', 'COORDINATOR'));

CREATE POLICY "Allow anyone to create activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true);


-- =====================================================================
-- TRIGGER FOR AUTO-CREATING PROFILES ON USER SIGNUP
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'USER',
    'pending'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger mapping
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
