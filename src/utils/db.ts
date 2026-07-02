import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured, getSupabaseAdmin } from './supabase';

const DB_FILE = path.join(process.cwd(), 'src/data/db.json');

// Interface structures
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string; // only used in file-fallback mode
  role: 'HOD' | 'COORDINATOR' | 'ASSOCIATE' | 'CORE_HEAD' | 'VERTICAL_HEAD' | 'SUB_HEAD' | 'USER';
  status: 'active' | 'inactive';
  firstLogin: boolean;
  passwordChangedAt?: string;
  createdBy?: string;
  lastLogin?: string;
  createdAt: string;

  // Simplified additions
  phone?: string;
  profilePhoto?: string;
  department?: string;
  yearOfStudy?: string;
  registerNumber?: string;
  committeeId?: string;
  verticalId?: string;
  isHead?: boolean;
}

export interface CoreCommittee {
  id: string;
  name: string;
  description: string;
}

export interface Vertical {
  id: string;
  name: string;
  description: string;
  category: 'tech' | 'non-tech';
  icon: string;
  color: string;
}

export interface CommitteeAssignment {
  id: string;
  userId: string;
  committeeId: string;
  assignedAt: string;
}

export interface VerticalAssignment {
  id: string;
  userId: string;
  verticalId: string;
  assignedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  status: 'upcoming' | 'past';
  featured: boolean;
  committeeId?: string;
  verticalId?: string;
  createdBy?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetType: 'all' | 'committee' | 'vertical';
  targetId?: string;
  createdBy: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  taskType: 'committee' | 'vertical' | 'project';
  status: 'pending' | 'in-progress' | 'completed' | 'planning';
  dueDate?: string;
  assignedTo?: string;
  committeeId?: string;
  verticalId?: string;
  createdBy?: string;
  url?: string; // for backwards compatibility with verticalProjects
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'document' | 'link' | 'video';
  committeeId?: string;
  verticalId?: string;
  uploadedBy?: string;
}

export type CommitteeTask = Task;
export type CommitteeResource = Resource;
export type VerticalProject = Task;
export type VerticalResource = Resource;

export interface VerticalAttendance {
  id: string;
  verticalId: string;
  date: string;
  memberId: string;
  memberName: string;
  status: 'present' | 'absent';
}

export interface DatabaseSchema {
  users: User[];
  coreCommittees: CoreCommittee[];
  verticals: Vertical[];
  activityLogs: any[];
  events: Event[];
  announcements: Announcement[];
  tasks: Task[];
  resources: Resource[];
  verticalAttendance: VerticalAttendance[];
  forms: any[];
  gallery: any[];
}

const initialSchema: DatabaseSchema = {
  users: [],
  coreCommittees: [],
  verticals: [],
  activityLogs: [],
  events: [],
  announcements: [],
  tasks: [],
  resources: [],
  verticalAttendance: [],
  forms: [],
  gallery: []
};

// =====================================================================
// FILE BACKEND ENGINE (FALLBACK MODE)
// =====================================================================

export function getLocalDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      initializeLocalDb();
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return initialSchema;
  }
}

export function saveLocalDb(db: DatabaseSchema): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write db.json', error);
  }
}

export function initializeLocalDb(): void {
  const db = { ...initialSchema };
  const salt = bcrypt.genSaltSync(10);
  const defaultHash = bcrypt.hashSync('admin123', salt);

  db.users = [
    { id: 'u-hod', email: 'hod@labyrinth.club', name: 'Dr. Suresh Kumar', passwordHash: defaultHash, role: 'HOD', status: 'active', firstLogin: false, isHead: false, createdAt: new Date().toISOString() },
    { id: 'u-coord', email: 'coordinator@labyrinth.club', name: 'Prof. Anjali Menon', passwordHash: defaultHash, role: 'COORDINATOR', status: 'active', firstLogin: false, isHead: false, createdAt: new Date().toISOString() },
    { id: 'u-assoc', email: 'associate@labyrinth.club', name: 'Dr. Rajesh Rajan', passwordHash: defaultHash, role: 'ASSOCIATE', status: 'active', firstLogin: false, isHead: false, createdAt: new Date().toISOString() },
    { id: 'u-core-head', email: 'core@labyrinth.club', name: 'Core Member One', passwordHash: defaultHash, role: 'CORE_HEAD', status: 'active', firstLogin: false, committeeId: 'cc-pub', isHead: true, createdAt: new Date().toISOString() },
    
    // AI Creator's Lab (ab000000-0000-0000-0000-000000000000)
    { id: 'u-vh1', email: 'rishi.raj@mca.christuniversity.in', name: 'Rishi Raj (1 MCA B)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000000', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-vh2', email: 'krupa.m@bsccsh.christuniversity.in', name: 'Krupa (3 BSc CS)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000000', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-sh1', email: 'kapil.maheshwari@bcah.christuniversity.in', name: 'Kapil Maheswari (5 BCA A)', passwordHash: defaultHash, role: 'SUB_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000000', isHead: false, createdAt: new Date().toISOString() },

    // GameNova (ab000000-0000-0000-0000-000000000002)
    { id: 'u-vh3', email: 'ruchak.khatri@bcah.christuniversity.in', name: 'Ruchak Khatri (5BCA A)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000002', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-vh4', email: 'joel.benedict@bcah.christuniversity.in', name: 'Joel Benedict (5BCA B)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000002', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-sh2', email: 'rahul.t@bsccsh.christuniversity.in', name: 'Rahul T (5 BSc CS)', passwordHash: defaultHash, role: 'SUB_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000002', isHead: false, createdAt: new Date().toISOString() },

    // CodeCraft (ab000000-0000-0000-0000-000000000003)
    { id: 'u-vh5', email: 'kanika.jain@mca.christuniversity.in', name: 'Kanika Jain (1 MCA)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000003', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-vh6', email: 'vvedika.m@bsccmh.christuniversity.in', name: 'Vvedika (5 BSc CM)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000003', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-sh3', email: 'himanshi.kansal@bcah.christuniversity.in', name: 'Himanshi Kansal (3 BCA B)', passwordHash: defaultHash, role: 'SUB_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000003', isHead: false, createdAt: new Date().toISOString() },

    // CipherGuard (ab000000-0000-0000-0000-000000000004)
    { id: 'u-vh7', email: 'daksh.chandiramani@bcah.christuniversity.in', name: 'Daksh Sunil (5BCA B)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000004', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-sh4', email: 'meet.garg@bcah.christuniversity.in', name: 'Meet Garg (3BCA B)', passwordHash: defaultHash, role: 'SUB_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000004', isHead: false, createdAt: new Date().toISOString() },

    // BitOps (ab000000-0000-0000-0000-000000000005)
    { id: 'u-vh8', email: 'rida.zafar@bsccsh.christuniversity.in', name: 'Rida Zafar (5 BSc CS)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000005', isHead: true, createdAt: new Date().toISOString() },

    // FieldOps (ab000000-0000-0000-0000-000000000006)
    { id: 'u-vh9', email: 'gautham.s@bsccsh.christuniversity.in', name: 'Gautham S (3BSc CS)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000006', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-vh10', email: 'supal.porwal@bcah.christuniversity.in', name: 'Supal Porwal (5BCA B)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000006', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-sh5', email: 'shreyas.v@bsccsh.christuniversity.in', name: 'Shreyas V (3 BSc CS)', passwordHash: defaultHash, role: 'SUB_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000006', isHead: false, createdAt: new Date().toISOString() },

    // CrossCode (ab000000-0000-0000-0000-000000000007)
    { id: 'u-vh11', email: 'sandhya.m@christuniversity.in', name: 'Sandhya M (5BCA A)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000007', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-vh12', email: 'sreeshma.yetukuri@bcah.christuniversity.in', name: 'Sreeshma Chowdary Yetukuri (3BCA A)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000007', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-sh6', email: 'u.prathikshakini@bcah.christuniversity.in', name: 'U Prathiksha Kini (3BCA A)', passwordHash: defaultHash, role: 'SUB_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000007', isHead: false, createdAt: new Date().toISOString() },

    // The RoundTable (ab000000-0000-0000-0000-000000000008)
    { id: 'u-vh13', email: 'arush.chandra@bcah.christuniversity.in', name: 'Arush (3BCA B)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000008', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-vh14', email: 'purvi.chakarvarti@bcah.christuniversity.in', name: 'Purvi (3BCA B)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000008', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-sh7', email: 'maanya.singh@bsccmh.christuniversity.in', name: 'Maanya (5 BSc CM)', passwordHash: defaultHash, role: 'SUB_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000008', isHead: false, createdAt: new Date().toISOString() },

    // The Aesthetic Lab (ab000000-0000-0000-0000-000000000009)
    { id: 'u-vh15', email: 'nidhi.anil@bsccsh.christuniversity.in', name: 'Nidhi Anil (3 BSc CS)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000009', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-vh16', email: 'alisha.sajeev@bcah.christuniversity.in', name: 'Alisha Sajeev (5BCA B)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000009', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-sh8', email: 'tejas.sujith@bcah.christuniversity.in', name: 'Tejas Sujith (3BCA B)', passwordHash: defaultHash, role: 'SUB_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000009', isHead: false, createdAt: new Date().toISOString() },

    // Startovate (ab000000-0000-0000-0000-000000000010)
    { id: 'u-vh17', email: 'ceyanne.dsouza@bcah.christuniversity.in', name: 'Ceyanne Dsouza (5BCA B)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000010', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-vh18', email: 's.khushal@bcah.christuniversity.in', name: 'Khushal S (3BCA)', passwordHash: defaultHash, role: 'VERTICAL_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000010', isHead: true, createdAt: new Date().toISOString() },
    { id: 'u-sh9', email: 'prasanth.k@bcah.christuniversity.in', name: 'Prashanth (3BCA)', passwordHash: defaultHash, role: 'SUB_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000010', isHead: false, createdAt: new Date().toISOString() },
    { id: 'u-sh10', email: 'adit.madan@bsccsh.christuniversity.in', name: 'Adit (5 BSc CS)', passwordHash: defaultHash, role: 'SUB_HEAD', status: 'active', firstLogin: false, verticalId: 'ab000000-0000-0000-0000-000000000010', isHead: false, createdAt: new Date().toISOString() }
  ];

  // Verticals
  try {
    const vertsPath = path.join(process.cwd(), 'src/data/verticals.json');
    if (fs.existsSync(vertsPath)) {
      db.verticals = JSON.parse(fs.readFileSync(vertsPath, 'utf8'));
    }
  } catch {}

  // Events
  try {
    const evtsPath = path.join(process.cwd(), 'src/data/events.json');
    if (fs.existsSync(evtsPath)) {
      db.events = JSON.parse(fs.readFileSync(evtsPath, 'utf8'));
    }
  } catch {}

  // Committees
  db.coreCommittees = [
    { id: 'cc-pub', name: 'Publicity Committee', description: 'Handles all external marketing and social media.' },
    { id: 'cc-log', name: 'Logistics Committee', description: 'Manages scheduling, venues, tech rider, and refreshments.' },
    { id: 'cc-des', name: 'Design Committee', description: 'Responsible for posters, video editing, and UI themes.' },
    { id: 'cc-spn', name: 'Sponsorship Committee', description: 'Finds and interacts with corporate sponsors.' }
  ];

  db.tasks = [
    { id: 'ct1', committeeId: 'cc-pub', title: 'Design Teaser Poster', description: 'Create teaser graphics for the upcoming CS fest.', status: 'pending', assignedTo: 'Core Member One', dueDate: '2026-07-20', taskType: 'committee' },
    { id: 'vp1', verticalId: 'ab000000-0000-0000-0000-000000000000', title: 'Labyrinth Web Portal', description: 'React application for student workspace coordination.', status: 'in-progress', taskType: 'project', url: 'https://github.com/labyrinth/portal' }
  ];

  db.resources = [
    { id: 'cr1', committeeId: 'cc-pub', title: 'Club Branding Kit', description: 'Official logos and color rules.', url: 'https://example.com/branding.pdf', type: 'document' },
    { id: 'vr1', verticalId: 'ab000000-0000-0000-0000-000000000000', title: 'Deep Learning Lecture 1', description: 'Introduction to neural networks.', url: 'https://youtube.com', type: 'video' }
  ];

  try {
    const formsPath = path.join(process.cwd(), 'src/data/forms.json');
    if (fs.existsSync(formsPath)) {
      db.forms = Object.values(JSON.parse(fs.readFileSync(formsPath, 'utf8')));
    }
  } catch {}

  try {
    const galPath = path.join(process.cwd(), 'src/data/gallery.json');
    if (fs.existsSync(galPath)) {
      db.gallery = JSON.parse(fs.readFileSync(galPath, 'utf8'));
    }
  } catch {}

  db.verticalAttendance = [
    { id: 'at1', verticalId: 'ab000000-0000-0000-0000-000000000000', date: '2026-07-01', memberId: 'u-vert-head1', memberName: 'Rishi Raj', status: 'present' }
  ];

  saveLocalDb(db);
}

// Log actions helper
export async function logActivity(userId: string, action: string, details: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.from('activity_logs').insert({ user_id: userId, action, details });
  } else {
    const db = getLocalDb();
    db.activityLogs.unshift({
      id: `log-${Date.now()}`,
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
    if (db.activityLogs.length > 500) db.activityLogs = db.activityLogs.slice(0, 500);
    saveLocalDb(db);
  }
}

// =====================================================================
// HYBRID INTEGRATED OPERATIONS
// =====================================================================

// --- USERS / PROFILES ---
export async function dbGetUserByEmail(email: string): Promise<any | null> {
  const cleanEmail = email.toLowerCase().trim();
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('profiles').select('*').eq('email', cleanEmail).maybeSingle();
    if (error) throw error;
    if (data) {
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status,
        firstLogin: data.first_login,
        passwordChangedAt: data.password_changed_at,
        createdBy: data.created_by,
        lastLogin: data.last_login,
        committeeId: data.committee_id,
        verticalId: data.vertical_id,
        isHead: data.is_head
      };
    }
    return null;
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    return user || null;
  }
}

export async function dbGetRoles(): Promise<any[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      email: p.email,
      name: p.name,
      role: p.role,
      status: p.status,
      firstLogin: p.first_login,
      passwordChangedAt: p.password_changed_at,
      createdBy: p.created_by,
      lastLogin: p.last_login,
      committeeId: p.committee_id,
      verticalId: p.vertical_id,
      isHead: p.is_head,
      createdAt: p.created_at
    }));
  } else {
    const db = getLocalDb();
    return db.users;
  }
}

export async function dbAddRole(email: string, name: string, role: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  if (isSupabaseConfigured() && supabase) {
    // Check if profile exists
    const { data: existing } = await supabase.from('profiles').select('id').eq('email', cleanEmail).maybeSingle();
    if (existing) {
      const { error } = await supabase.from('profiles').update({ role, status: 'active' }).eq('id', existing.id);
      if (error) throw error;
    } else {
      // Need to invite user or create profile. In Supabase, standard signup creates profiles.
      // Insert profile directly
      const uuid = genRandomUuid();
      const { error } = await supabase.from('profiles').insert({
        id: uuid,
        email: cleanEmail,
        name,
        role,
        status: 'active'
      });
      if (error) throw error;
    }
  } else {
    const db = getLocalDb();
    let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      user = {
        id: `u-${Date.now()}`,
        email: cleanEmail,
        name,
        passwordHash: bcrypt.hashSync('admin123', 10),
        role: role as any,
        status: 'active',
        firstLogin: true,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
    } else {
      user.role = role as any;
      user.status = 'active';
    }
    saveLocalDb(db);
  }
}

export async function dbDeleteRole(userId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('profiles').update({
      role: 'USER',
      committee_id: null,
      vertical_id: null,
      is_head: false
    }).eq('id', userId);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.role = 'USER';
      user.committeeId = undefined;
      user.verticalId = undefined;
      user.isHead = false;
      saveLocalDb(db);
    }
  }
}

export async function dbCreateUser(name: string, email: string, role: string, committeeId?: string, verticalId?: string, adminUserId?: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  const defaultPassword = process.env.DEFAULT_TEMPORARY_PASSWORD || 'Labyrinth@123';

  if (isSupabaseConfigured()) {
    const adminClient = getSupabaseAdmin();
    if (!adminClient) throw new Error('Supabase Service Role credentials not configured.');

    // 1. Create in Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        created_by: adminUserId,
        first_login: true,
        committee_id: committeeId || null,
        vertical_id: verticalId || null,
        is_head: ['CORE_HEAD', 'VERTICAL_HEAD'].includes(role)
      }
    });

    if (authError) throw authError;
    const userId = authData.user?.id;
    if (!userId) throw new Error('User creation failed in Supabase Auth.');

    const { error: profErr } = await adminClient.from('profiles').update({
      created_by: adminUserId,
      first_login: true,
      role,
      committee_id: committeeId || null,
      vertical_id: verticalId || null,
      is_head: ['CORE_HEAD', 'VERTICAL_HEAD'].includes(role)
    }).eq('id', userId);
    if (profErr) console.warn('Could not update profile metadata:', profErr);
  } else {
    const db = getLocalDb();
    const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) throw new Error('User with this email already exists.');

    const userId = `u-${Date.now()}`;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(defaultPassword, salt);

    db.users.push({
      id: userId,
      email: cleanEmail,
      name,
      passwordHash: hash,
      role: role as any,
      status: 'active',
      firstLogin: true,
      createdBy: adminUserId,
      committeeId,
      verticalId,
      isHead: ['CORE_HEAD', 'VERTICAL_HEAD'].includes(role),
      createdAt: new Date().toISOString()
    });

    saveLocalDb(db);
  }
}

export async function dbUpdateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      saveLocalDb(db);
    }
  }
}

export async function dbUpdateUserDetails(userId: string, name: string, role: string, committeeId?: string, verticalId?: string): Promise<void> {
  const isHead = ['CORE_HEAD', 'VERTICAL_HEAD'].includes(role);
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('profiles').update({
      name,
      role,
      committee_id: committeeId || null,
      vertical_id: verticalId || null,
      is_head: isHead
    }).eq('id', userId);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.name = name;
      user.role = role as any;
      user.committeeId = committeeId;
      user.verticalId = verticalId;
      user.isHead = isHead;
      saveLocalDb(db);
    }
  }
}

export async function dbUpdateLastLogin(userId: string): Promise<void> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured() && supabase) {
    await supabase.from('profiles').update({ last_login: now }).eq('id', userId);
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.lastLogin = now;
      saveLocalDb(db);
    }
  }
}

// --- VERTICALS ---
export async function dbGetVerticals(): Promise<Vertical[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('verticals').select('*');
    if (error) throw error;
    return data || [];
  } else {
    return getLocalDb().verticals;
  }
}

export async function dbAddVertical(name: string, description: string, category: 'tech' | 'non-tech'): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('verticals').insert({ name, description, category });
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.verticals.push({
      id: `v-${Date.now()}`,
      name,
      description,
      category,
      icon: 'Brain',
      color: '#CD0000'
    });
    saveLocalDb(db);
  }
}

export async function dbUpdateVertical(id: string, data: any): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('verticals').update(data).eq('id', id);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const idx = db.verticals.findIndex(v => v.id === id);
    if (idx !== -1) {
      db.verticals[idx] = { ...db.verticals[idx], ...data };
      saveLocalDb(db);
    }
  }
}

export async function dbDeleteVertical(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('verticals').delete().eq('id', id);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.verticals = db.verticals.filter(v => v.id !== id);
    db.users.forEach(u => {
      if (u.verticalId === id) {
        u.verticalId = undefined;
        u.isHead = false;
        if (u.role === 'VERTICAL_HEAD') u.role = 'USER';
      }
    });
    saveLocalDb(db);
  }
}

// --- CORE COMMITTEES ---
export async function dbGetCoreCommittees(): Promise<CoreCommittee[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('core_committees').select('*');
    if (error) throw error;
    return data || [];
  } else {
    return getLocalDb().coreCommittees;
  }
}

export async function dbAddCoreCommittee(name: string, description: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('core_committees').insert({ name, description });
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.coreCommittees.push({
      id: `cc-${Date.now()}`,
      name,
      description
    });
    saveLocalDb(db);
  }
}

export async function dbDeleteCoreCommittee(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('core_committees').delete().eq('id', id);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.coreCommittees = db.coreCommittees.filter(c => c.id !== id);
    db.users.forEach(u => {
      if (u.committeeId === id) {
        u.committeeId = undefined;
        u.isHead = false;
        if (u.role === 'CORE_HEAD') u.role = 'USER';
      }
    });
    saveLocalDb(db);
  }
}

// --- ASSIGNMENTS ---
export async function dbGetAssignments(): Promise<any> {
  if (isSupabaseConfigured() && supabase) {
    const { data: profiles, error } = await supabase.from('profiles').select('id, name, email, committee_id, vertical_id, is_head, created_at, core_committees (name), verticals (name)');
    if (error) throw error;
    
    const committeeHeads = (profiles || []).filter(p => p.committee_id && p.is_head);
    const verticalHeads = (profiles || []).filter(p => p.vertical_id && p.is_head);

    return {
      committee: committeeHeads.map((p: any) => ({
        id: p.id,
        userId: p.id,
        committeeId: p.committee_id,
        assignedAt: p.created_at,
        userName: p.name || 'Unknown',
        userEmail: p.email,
        committeeName: p.core_committees?.name || 'Unknown'
      })),
      vertical: verticalHeads.map((p: any) => ({
        id: p.id,
        userId: p.id,
        verticalId: p.vertical_id,
        assignedAt: p.created_at,
        userName: p.name || 'Unknown',
        userEmail: p.email,
        verticalName: p.verticals?.name || 'Unknown'
      }))
    };
  } else {
    const db = getLocalDb();
    const committeeHeads = db.users.filter(u => u.committeeId && u.isHead);
    const verticalHeads = db.users.filter(u => u.verticalId && u.isHead);

    return {
      committee: committeeHeads.map(u => {
        const c = db.coreCommittees.find(com => com.id === u.committeeId);
        return {
          id: u.id,
          userId: u.id,
          committeeId: u.committeeId,
          assignedAt: u.createdAt,
          userName: u.name,
          userEmail: u.email,
          committeeName: c?.name || 'Unknown'
        };
      }),
      vertical: verticalHeads.map(u => {
        const v = db.verticals.find(ver => ver.id === u.verticalId);
        return {
          id: u.id,
          userId: u.id,
          verticalId: u.verticalId,
          assignedAt: u.createdAt,
          userName: u.name,
          userEmail: u.email,
          verticalName: v?.name || 'Unknown'
        };
      })
    };
  }
}

export async function dbAssignCoreHead(email: string, committeeId: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('profiles').update({
      committee_id: committeeId,
      is_head: true,
      role: 'CORE_HEAD',
      status: 'active'
    }).eq('email', cleanEmail);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) throw new Error('User not found. Head must register first.');
    user.committeeId = committeeId;
    user.isHead = true;
    user.role = 'CORE_HEAD';
    user.status = 'active';
    saveLocalDb(db);
  }
}

export async function dbRemoveCoreAssignment(userId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('profiles').update({
      committee_id: null,
      is_head: false,
      role: 'USER'
    }).eq('id', userId);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.committeeId = undefined;
      user.isHead = false;
      user.role = 'USER';
      saveLocalDb(db);
    }
  }
}

export async function dbAssignVerticalHead(email: string, verticalId: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('profiles').update({
      vertical_id: verticalId,
      is_head: true,
      role: 'VERTICAL_HEAD',
      status: 'active'
    }).eq('email', cleanEmail);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) throw new Error('User not found. Head must register first.');
    user.verticalId = verticalId;
    user.isHead = true;
    user.role = 'VERTICAL_HEAD';
    user.status = 'active';
    saveLocalDb(db);
  }
}

export async function dbRemoveVerticalAssignment(userId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('profiles').update({
      vertical_id: null,
      is_head: false,
      role: 'USER'
    }).eq('id', userId);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.verticalId = undefined;
      user.isHead = false;
      user.role = 'USER';
      saveLocalDb(db);
    }
  }
}

// --- EVENTS ---
export async function dbGetEvents(): Promise<Event[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('events').select('*');
    if (error) throw error;
    return (data || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      category: e.category,
      status: e.status,
      featured: e.featured,
      committeeId: e.committee_id,
      verticalId: e.vertical_id,
      createdBy: e.created_by
    }));
  } else {
    return getLocalDb().events;
  }
}

export async function dbAddEvent(data: any, createdBy?: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('events').insert({
      title: data.title,
      description: data.description,
      date: data.date,
      category: data.category,
      status: data.status,
      featured: data.featured,
      committee_id: data.committeeId || null,
      vertical_id: data.verticalId || null,
      created_by: createdBy || null
    });
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.events.push({
      id: `evt-${Date.now()}`,
      ...data,
      createdBy
    });
    saveLocalDb(db);
  }
}

export async function dbUpdateEvent(id: string, data: any): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const mapped: any = {};
    if (data.title !== undefined) mapped.title = data.title;
    if (data.description !== undefined) mapped.description = data.description;
    if (data.date !== undefined) mapped.date = data.date;
    if (data.category !== undefined) mapped.category = data.category;
    if (data.status !== undefined) mapped.status = data.status;
    if (data.featured !== undefined) mapped.featured = data.featured;
    if (data.committeeId !== undefined) mapped.committee_id = data.committeeId || null;
    if (data.verticalId !== undefined) mapped.vertical_id = data.verticalId || null;

    const { error } = await supabase.from('events').update(mapped).eq('id', id);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const idx = db.events.findIndex(e => e.id === id);
    if (idx !== -1) {
      db.events[idx] = { ...db.events[idx], ...data };
      saveLocalDb(db);
    }
  }
}

export async function dbDeleteEvent(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.events = db.events.filter(e => e.id !== id);
    saveLocalDb(db);
  }
}

// --- ANNOUNCEMENTS ---
export async function dbGetAnnouncements(): Promise<Announcement[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('announcements').select(`
      id, title, content, target_type, target_id, timestamp, created_by,
      profiles (name)
    `).order('timestamp', { ascending: false });
    if (error) throw error;
    return (data || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      targetType: a.target_type,
      targetId: a.target_id,
      createdBy: a.profiles?.name || 'Club Admin',
      timestamp: a.timestamp
    }));
  } else {
    return getLocalDb().announcements;
  }
}

export async function dbAddAnnouncement(data: any, createdBy: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('announcements').insert({
      title: data.title,
      content: data.content,
      target_type: data.targetType,
      target_id: data.targetId || null,
      created_by: createdBy
    });
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.announcements.unshift({
      id: `ann-${Date.now()}`,
      title: data.title,
      content: data.content,
      targetType: data.targetType,
      targetId: data.targetId,
      createdBy: 'Club Admin',
      timestamp: new Date().toISOString()
    });
    saveLocalDb(db);
  }
}

export async function dbDeleteAnnouncement(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.announcements = db.announcements.filter(a => a.id !== id);
    saveLocalDb(db);
  }
}

// --- COMMITTEE TASKS ---
export async function dbGetCommitteeTasks(committeeId: string): Promise<CommitteeTask[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('tasks').select('*').eq('committee_id', committeeId).eq('task_type', 'committee');
    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: t.id,
      committeeId: t.committee_id,
      title: t.title,
      description: t.description,
      status: t.status,
      assignedTo: t.assigned_to,
      dueDate: t.due_date,
      taskType: t.task_type
    }));
  } else {
    return getLocalDb().tasks.filter(t => t.committeeId === committeeId && t.taskType === 'committee');
  }
}

export async function dbAddCommitteeTask(committeeId: string, data: any): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('tasks').insert({
      committee_id: committeeId,
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      assigned_to: data.assignedTo,
      due_date: data.dueDate || null,
      task_type: 'committee'
    });
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.tasks.push({
      id: `ct-${Date.now()}`,
      committeeId,
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      assignedTo: data.assignedTo,
      dueDate: data.dueDate,
      taskType: 'committee'
    });
    saveLocalDb(db);
  }
}

export async function dbUpdateCommitteeTask(id: string, data: any): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const mapped: any = {};
    if (data.title !== undefined) mapped.title = data.title;
    if (data.description !== undefined) mapped.description = data.description;
    if (data.status !== undefined) mapped.status = data.status;
    if (data.assignedTo !== undefined) mapped.assigned_to = data.assignedTo;
    if (data.dueDate !== undefined) mapped.due_date = data.dueDate || null;

    const { error } = await supabase.from('tasks').update(mapped).eq('id', id);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.tasks[idx] = { ...db.tasks[idx], ...data };
      saveLocalDb(db);
    }
  }
}

export async function dbDeleteCommitteeTask(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.tasks = db.tasks.filter(t => t.id !== id);
    saveLocalDb(db);
  }
}

// --- COMMITTEE RESOURCES ---
export async function dbGetCommitteeResources(committeeId: string): Promise<CommitteeResource[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('resources').select('*').eq('committee_id', committeeId);
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      committeeId: r.committee_id,
      title: r.title,
      description: r.description,
      url: r.url,
      type: r.type
    }));
  } else {
    return getLocalDb().resources.filter(r => r.committeeId === committeeId);
  }
}

export async function dbAddCommitteeResource(committeeId: string, data: any): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('resources').insert({
      committee_id: committeeId,
      title: data.title,
      description: data.description,
      url: data.url,
      type: data.type
    });
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.resources.push({
      id: `cr-${Date.now()}`,
      committeeId,
      title: data.title,
      description: data.description,
      url: data.url,
      type: data.type
    });
    saveLocalDb(db);
  }
}

export async function dbDeleteCommitteeResource(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.resources = db.resources.filter(r => r.id !== id);
    saveLocalDb(db);
  }
}

// --- VERTICAL PROJECTS ---
export async function dbGetVerticalProjects(verticalId: string): Promise<VerticalProject[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('tasks').select('*').eq('vertical_id', verticalId).eq('task_type', 'project');
    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      verticalId: p.vertical_id,
      title: p.title,
      description: p.description,
      status: p.status,
      url: p.url,
      taskType: p.task_type
    }));
  } else {
    return getLocalDb().tasks.filter(p => p.verticalId === verticalId && p.taskType === 'project');
  }
}

export async function dbAddVerticalProject(verticalId: string, data: any): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('tasks').insert({
      vertical_id: verticalId,
      title: data.title,
      description: data.description,
      status: data.status || 'planning',
      url: data.url,
      task_type: 'project'
    });
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.tasks.push({
      id: `vp-${Date.now()}`,
      verticalId,
      title: data.title,
      description: data.description,
      status: data.status || 'planning',
      url: data.url,
      taskType: 'project'
    });
    saveLocalDb(db);
  }
}

export async function dbUpdateVerticalProject(id: string, data: any): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const mapped: any = {};
    if (data.title !== undefined) mapped.title = data.title;
    if (data.description !== undefined) mapped.description = data.description;
    if (data.status !== undefined) mapped.status = data.status;
    if (data.url !== undefined) mapped.url = data.url;

    const { error } = await supabase.from('tasks').update(mapped).eq('id', id);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const idx = db.tasks.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.tasks[idx] = { ...db.tasks[idx], ...data };
      saveLocalDb(db);
    }
  }
}

export async function dbDeleteVerticalProject(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.tasks = db.tasks.filter(p => p.id !== id);
    saveLocalDb(db);
  }
}

// --- VERTICAL RESOURCES ---
export async function dbGetVerticalResources(verticalId: string): Promise<VerticalResource[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('resources').select('*').eq('vertical_id', verticalId);
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      verticalId: r.vertical_id,
      title: r.title,
      description: r.description,
      url: r.url,
      type: r.type
    }));
  } else {
    return getLocalDb().resources.filter(r => r.verticalId === verticalId);
  }
}

export async function dbAddVerticalResource(verticalId: string, data: any): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('resources').insert({
      vertical_id: verticalId,
      title: data.title,
      description: data.description,
      url: data.url,
      type: data.type
    });
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.resources.push({
      id: `vr-${Date.now()}`,
      verticalId,
      title: data.title,
      description: data.description,
      url: data.url,
      type: data.type
    });
    saveLocalDb(db);
  }
}

export async function dbDeleteVerticalResource(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.resources = db.resources.filter(r => r.id !== id);
    saveLocalDb(db);
  }
}

// --- VERTICAL ATTENDANCE ---
export async function dbGetVerticalAttendance(verticalId: string): Promise<VerticalAttendance[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('vertical_attendance').select('*').eq('vertical_id', verticalId);
    if (error) throw error;
    return (data || []).map((a: any) => ({
      id: a.id,
      verticalId: a.vertical_id,
      date: a.date,
      memberId: a.member_id,
      memberName: a.member_name,
      status: a.status
    }));
  } else {
    return getLocalDb().verticalAttendance.filter(a => a.verticalId === verticalId);
  }
}

export async function dbSaveVerticalAttendance(verticalId: string, date: string, records: any[]): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    // Delete existing on this date
    await supabase.from('vertical_attendance').delete().eq('vertical_id', verticalId).eq('date', date);
    
    // Map records to insert
    const toInsert = records.map(r => ({
      vertical_id: verticalId,
      date,
      member_id: r.memberId,
      member_name: r.memberName,
      status: r.status
    }));

    const { error } = await supabase.from('vertical_attendance').insert(toInsert);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.verticalAttendance = db.verticalAttendance.filter(a => !(a.verticalId === verticalId && a.date === date));
    records.forEach(r => {
      db.verticalAttendance.push({
        id: `at-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        verticalId,
        date,
        memberId: r.memberId,
        memberName: r.memberName,
        status: r.status
      });
    });
    saveLocalDb(db);
  }
}

// --- REGISTRATIONS ---
export async function dbGetJoinRegistrations(): Promise<any[]> {
  if (isSupabaseConfigured() && supabase) {
    // Find profiles with status 'inactive' and role 'USER' (which represents candidates)
    const { data, error } = await supabase.from('profiles').select('*').eq('status', 'inactive').eq('role', 'USER');
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      name: p.name || 'Student Candidate',
      email: p.email,
      phone: 'N/A',
      course: 'Computer Science',
      year: '1',
      preferredVertical: 'General Inquiry',
      timestamp: p.created_at
    }));
  } else {
    const db = getLocalDb();
    return db.users.filter(u => u.status === 'inactive' && u.role === 'USER').map(u => {
      const log = db.activityLogs.find(l => l.userId === u.id && l.action === 'registration_submit');
      const vertical = log ? log.details.split('vertical ')[1] || 'Unspecified' : 'Unspecified';
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: 'N/A',
        course: 'Computer Science',
        year: '1',
        preferredVertical: vertical,
        timestamp: u.createdAt
      };
    });
  }
}

export async function dbApproveRegistration(userId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('profiles').update({ status: 'active' }).eq('id', userId);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const u = db.users.find(usr => usr.id === userId);
    if (u) {
      u.status = 'active';
      saveLocalDb(db);
    }
  }
}

export async function dbRejectRegistration(userId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('profiles').update({ status: 'inactive' }).eq('id', userId);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const u = db.users.find(usr => usr.id === userId);
    if (u) {
      u.status = 'inactive';
      saveLocalDb(db);
    }
  }
}

// --- SYSTEM FORMS / CONFIG ---
export async function dbGetForms(): Promise<any[]> {
  if (isSupabaseConfigured() && supabase) {
    // Standard fetch from file fallback or you can store this in a config table
    return getLocalDb().forms;
  } else {
    return getLocalDb().forms;
  }
}

export async function dbUpdateForms(forms: any[]): Promise<void> {
  const db = getLocalDb();
  db.forms = forms;
  saveLocalDb(db);
}

// =====================================================================
// UTILS
// =====================================================================
function genRandomUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
