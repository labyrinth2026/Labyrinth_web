-- =====================================================================
-- LABYRINTH CLUB SIMPLIFIED DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- =====================================================================
-- Execute this script directly in your Supabase SQL Editor.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Core Committees Table
CREATE TABLE IF NOT EXISTS public.core_committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'Users',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.core_committees ENABLE ROW LEVEL SECURITY;

-- 2. Create Verticals Table
CREATE TABLE IF NOT EXISTS public.verticals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('tech', 'non-tech')),
    icon TEXT DEFAULT 'Brain',
    color TEXT DEFAULT '#CD0000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.verticals ENABLE ROW LEVEL SECURITY;

-- 3. Create Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('HOD', 'COORDINATOR', 'ASSOCIATE', 'CORE_HEAD', 'VERTICAL_HEAD', 'SUB_HEAD', 'MEMBER', 'USER')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    first_login BOOLEAN NOT NULL DEFAULT true,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Additional fields consolidated from profile templates
    phone TEXT,
    profile_photo TEXT,
    department TEXT,
    year_of_study TEXT,
    register_number TEXT,
    
    -- Unified Scope Assignments (Nullable: belongs to at most one committee and one vertical)
    committee_id UUID REFERENCES public.core_committees(id) ON DELETE SET NULL,
    vertical_id UUID REFERENCES public.verticals(id) ON DELETE SET NULL,
    is_head BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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
    task_type TEXT NOT NULL DEFAULT 'committee' CHECK (task_type IN ('committee', 'vertical', 'project')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    due_date DATE,
    assigned_to TEXT, -- Name or ID
    
    -- Scopes
    committee_id UUID REFERENCES public.core_committees(id) ON DELETE SET NULL,
    vertical_id UUID REFERENCES public.verticals(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
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
    type TEXT NOT NULL CHECK (type IN ('document', 'link', 'video')),
    
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

CREATE OR REPLACE FUNCTION public.get_user_committee(user_uuid UUID)
RETURNS UUID AS $$
  SELECT committee_id FROM public.profiles WHERE id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_vertical(user_uuid UUID)
RETURNS UUID AS $$
  SELECT vertical_id FROM public.profiles WHERE id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_user_head(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_head, false) FROM public.profiles WHERE id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- --- CORE COMMITTEES POLICIES ---
CREATE POLICY "Allow read access to committees for authenticated users"
ON public.core_committees FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow HOD to manage committees"
ON public.core_committees FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'HOD');

-- --- VERTICALS POLICIES ---
CREATE POLICY "Allow read access to verticals for authenticated users"
ON public.verticals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow HOD to manage verticals"
ON public.verticals FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'HOD');

-- --- PROFILES POLICIES ---
CREATE POLICY "Allow profiles read access for authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to update their own profile fields"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow staff and HOD to manage all profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('HOD', 'COORDINATOR', 'ASSOCIATE'));

-- --- EVENTS POLICIES ---
CREATE POLICY "Allow read access to events for authenticated users"
ON public.events FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow staff and HOD to manage events"
ON public.events FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('HOD', 'COORDINATOR', 'ASSOCIATE'));

CREATE POLICY "Allow heads to manage events in their scope"
ON public.events FOR ALL
TO authenticated
USING (
  (committee_id = public.get_user_committee(auth.uid()) AND public.is_user_head(auth.uid())) OR
  (vertical_id = public.get_user_vertical(auth.uid()) AND public.is_user_head(auth.uid()))
);

-- --- ANNOUNCEMENTS POLICIES ---
CREATE POLICY "Allow read access to announcements for authenticated users"
ON public.announcements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow staff and HOD to manage announcements"
ON public.announcements FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('HOD', 'COORDINATOR', 'ASSOCIATE'));

CREATE POLICY "Allow heads to manage announcements in their scope"
ON public.announcements FOR ALL
TO authenticated
USING (
  (audience_type = 'committee' AND audience_id = public.get_user_committee(auth.uid()) AND public.is_user_head(auth.uid())) OR
  (audience_type = 'vertical' AND audience_id = public.get_user_vertical(auth.uid()) AND public.is_user_head(auth.uid()))
);

-- --- TASKS POLICIES ---
CREATE POLICY "Allow read access to tasks for scoped members"
ON public.tasks FOR SELECT
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('HOD', 'COORDINATOR', 'ASSOCIATE') OR
  committee_id = public.get_user_committee(auth.uid()) OR
  vertical_id = public.get_user_vertical(auth.uid())
);

CREATE POLICY "Allow heads and staff to manage tasks"
ON public.tasks FOR ALL
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('HOD', 'COORDINATOR', 'ASSOCIATE') OR
  (committee_id = public.get_user_committee(auth.uid()) AND public.is_user_head(auth.uid())) OR
  (vertical_id = public.get_user_vertical(auth.uid()) AND public.is_user_head(auth.uid()))
);

-- --- RESOURCES POLICIES ---
CREATE POLICY "Allow read access to resources for scoped members"
ON public.resources FOR SELECT
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('HOD', 'COORDINATOR', 'ASSOCIATE') OR
  committee_id = public.get_user_committee(auth.uid()) OR
  vertical_id = public.get_user_vertical(auth.uid())
);

CREATE POLICY "Allow heads and staff to manage resources"
ON public.resources FOR ALL
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('HOD', 'COORDINATOR', 'ASSOCIATE') OR
  (committee_id = public.get_user_committee(auth.uid()) AND public.is_user_head(auth.uid())) OR
  (vertical_id = public.get_user_vertical(auth.uid()) AND public.is_user_head(auth.uid()))
);

-- --- ACTIVITY LOGS POLICIES ---
CREATE POLICY "Allow HOD to view all logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (public.get_user_role(auth.uid()) = 'HOD');

CREATE POLICY "Allow users to view and insert their own logs"
ON public.activity_logs FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================================
-- TRIGGER FOR AUTO-CREATING PROFILES ON USER SIGNUP
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    role, 
    status, 
    first_login, 
    created_by,
    committee_id,
    vertical_id,
    is_head
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'USER'),
    'active',
    COALESCE((new.raw_user_meta_data->>'first_login')::boolean, true),
    (new.raw_user_meta_data->>'created_by')::uuid,
    (new.raw_user_meta_data->>'committee_id')::uuid,
    (new.raw_user_meta_data->>'vertical_id')::uuid,
    COALESCE((new.raw_user_meta_data->>'is_head')::boolean, false)
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
('ab000000-0000-0000-0000-000000000000', 'AI Creator''s Lab', 'Where creativity meets intelligence! From building smart chatbots to designing websites, posters, and storytelling tools, this lab is your space to experiment with the magic of generative AI.', 'tech', 'Brain', '#3b82f6'),
('ab000000-0000-0000-0000-000000000002', 'GameNova', 'For those who live to play and dream to create! GameNova is all about building games, hosting e-sports tournaments, and turning gaming passion into real experiences.', 'tech', 'Gamepad2', '#ef4444'),
('ab000000-0000-0000-0000-000000000003', 'CodeCraft', 'Think. Code. Conquer. CODECRAFT is the arena for competitive programming, hackathons, and problem-solving challenges that sharpen your coding skills.', 'tech', 'Code2', '#10b981'),
('ab000000-0000-0000-0000-000000000004', 'CipherGuard', 'Step into the digital battlefield! CIPHERGUARD trains you in ethical hacking, system security, and CTFs to defend and outsmart cyber threats.', 'tech', 'Shield', '#f59e0b'),
('ab000000-0000-0000-0000-000000000005', 'BitOps', 'From terminals to cloud, BITOPS is where code comes alive. Explore Linux, scripting, deployment tools, and CI/CD—taking projects from local to live.', 'tech', 'Server', '#8b5cf6'),
('ab000000-0000-0000-0000-000000000006', 'FieldOps', 'The energy hub of Labyrinth! FIELDOPS organizes matches, leads teams, and represents the department in sports, building team spirit both on and off the ground.', 'non-tech', 'MapPin', '#06b6d4'),
('ab000000-0000-0000-0000-000000000007', 'CrossCode', 'Breaking barriers between branches! CROSSCODE helps non-CS students dive into tech through events, mentorship, and collaborations—because innovation has no boundaries.', 'non-tech', 'Shuffle', '#ec4899'),
('ab000000-0000-0000-0000-000000000008', 'The RoundTable', 'Speak smart, think sharp! THE ROUNDTABLE is for debates, discussions, and idea battles where logic, voice, and confidence take center stage.', 'non-tech', 'MessageCircle', '#f97316'),
('ab000000-0000-0000-0000-000000000009', 'The Aesthetic Lab', 'The vibe-makers of Labyrinth! From media, design, and content to event branding and coordination, this vertical ensures creativity powers every move.', 'non-tech', 'Palette', '#a855f7'),
('ab000000-0000-0000-0000-000000000010', 'Startovate', 'Dream. Build. Lead. STARTOVATE inspires startup culture, innovation talks, and trend-spotting sessions—where business ideas meet tech minds.', 'non-tech', 'Rocket', '#14b8a6')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- Seed Events
INSERT INTO public.events (id, title, description, date, location, vertical_id) VALUES
('e0000000-0000-0000-0000-000000000013', 'THWS- Labyrinth Media Team Colab', 'Resource Person Details / Collaboration: Dr Pronab Mohanti, IPS, Dr Manoj Kashyap (Chief Guests)', '2025-07-28', 'Christ University Campus', 'ab000000-0000-0000-0000-000000000009'),
('e0000000-0000-0000-0000-000000000014', 'Peer Session Series-1', 'Resource Person Details / Collaboration: Ruchak Khatri, 5BCA A', '2025-09-10', 'Christ University Campus', 'ab000000-0000-0000-0000-000000000002'),
('e0000000-0000-0000-0000-000000000015', 'InnoPitch', 'Resource Person Details / Collaboration: CHRIST incubation Centre and Labyrinth', '2025-11-11', 'CHRIST Incubation Centre', 'ab000000-0000-0000-0000-000000000010'),
('e0000000-0000-0000-0000-000000000016', 'Peer Session Series-2', 'Resource Person Details / Collaboration:\n- Chandresh Bishit, 4BScCM\n- Krupa M, 4BScCM', '2025-11-19', 'Christ University Campus', 'ab000000-0000-0000-0000-000000000000'),
('e0000000-0000-0000-0000-000000000017', 'Peer Session Series-3', 'Resource Person Details / Collaboration: - Nejiya K S, 2MSc AIML', '2025-11-22', 'Christ University Campus', 'ab000000-0000-0000-0000-000000000000'),
('e0000000-0000-0000-0000-000000000018', 'Outreach program', 'Resource Person Details / Collaboration: Franciscan Institute High School Thavarakare', '2025-11-17', 'Franciscan Institute High School', null),
('e0000000-0000-0000-0000-000000000019', 'THWS- Labyrinth Media Team Colab', 'Resource Person Details / Collaboration: THWS media students and Labyrinth media team', '2025-11-25', 'Christ University Campus', 'ab000000-0000-0000-0000-000000000009'),
('e0000000-0000-0000-0000-000000000020', 'Constitution day', 'Resource Person Details / Collaboration:\n- Spoorthi Gowda 4BscCS\n- Balavalikar Shubha Shankar Sanidhya 4BScCM\n- Vidhi Shah 4 BscCM\n- Krupa M 4BScCS\n- S Keerthana 4BScCS', '2025-11-26', 'Christ University Campus', null),
('e0000000-0000-0000-0000-000000000021', 'Resume Building- 1', 'Resource Person Details / Collaboration:\n- Md Kamran S Rashisd, 6BScCS\n- Praygya Jain, 6BScCS\n- Utkarsh Thakur, 6BScCS', '2025-11-26', 'Christ University Campus', null),
('e0000000-0000-0000-0000-000000000022', 'Resume Building- 2', 'Resource Person Details / Collaboration:\n- KS Shreya, 6BScCM\n- Anoop Rajesh, 6BScCM', '2025-11-26', 'Christ University Campus', null),
('e0000000-0000-0000-0000-000000000023', 'World Computer Literacy Day', 'Resource Person Details / Collaboration:\n- Krupa M, 4BScCS\n- Spoorthi S Gowda, 4BScCS\n- Sreeshma Chowdary, 4BCA A\n- Praveena Vyas, 4BCA A\n- Balavalikar Shubha Shankar Sanidhya, 4BScCM\n- Vidhi Shah, 4BScCM', '2025-12-03', 'Christ University Campus', null),
('e0000000-0000-0000-0000-000000000024', 'Peer Session series- 4', 'Resource Person Details / Collaboration: Utkarsh Thakur, 6BScCS', '2026-01-25', 'Christ University Campus', 'ab000000-0000-0000-0000-000000000003'),
('e0000000-0000-0000-0000-000000000025', 'Peer Session series- 4', 'Resource Person Details / Collaboration: Sherly Lance H, 4BScCM', '2026-01-28', 'Christ University Campus', 'ab000000-0000-0000-0000-000000000007'),
('e0000000-0000-0000-0000-000000000026', 'Peer Session series- 5', 'Resource Person Details / Collaboration: S Keerthana, 4BScCS', '2026-01-31', 'Christ University Campus', 'ab000000-0000-0000-0000-000000000003'),
('e0000000-0000-0000-0000-000000000027', 'Labyrinth - Fieldops(Sport tournament)', 'Resource Person Details / Collaboration:\n- Shreyas S, 4 BScCS\n- Gautham, 4BScCS\nHeld from 08-02-2026 to 15-02-2026.', '2026-02-08', 'University Grounds', 'ab000000-0000-0000-0000-000000000006'),
('e0000000-0000-0000-0000-000000000028', 'Peer Session series- 5', 'Resource Person Details / Collaboration:\n- M Ashica, 4BScCM\n- Pavitra M, 4BScCM', '2026-02-20', 'Christ University Campus', 'ab000000-0000-0000-0000-000000000007')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  date = EXCLUDED.date,
  location = EXCLUDED.location,
  vertical_id = EXCLUDED.vertical_id;
