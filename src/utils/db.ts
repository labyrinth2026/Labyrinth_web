import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured, getSupabaseAdmin, getSupabaseOffline, setSupabaseOffline } from './supabase';

const DB_FILE = path.join(process.cwd(), 'src/data/db.json');

// Interface structures
export interface User {
  id: string;
  email: string;
  name: string; // fallback mapping for legacy compatibility
  full_name: string;
  passwordHash?: string; // only used in file-fallback mode
  role: 'ADMIN' | 'MEMBER';
  status: 'active' | 'inactive';
  firstLogin: boolean;
  passwordChangedAt?: string;
  createdBy?: string;
  lastLogin?: string;
  createdAt: string;
  phone?: string;
  profilePhoto?: string;
  department?: string;
  designation?: string;
  committeeId?: string | null;
  verticalId?: string | null;
  committee_id?: string | null;
  vertical_id?: string | null;
  github?: string | null;
  linkedin?: string | null;
  isHead?: boolean;
  is_head?: boolean;
}

export interface CoreCommittee {
  id: string;
  name: string;
  description: string;
  icon?: string;
  head_id?: string;
  verticalId?: string | null;
  vertical_id?: string | null;
  createdAt?: string;
}

export interface Vertical {
  id: string;
  name: string;
  description: string;
  category: 'tech' | 'non-tech';
  icon: string;
  color: string;
  image?: string;
  head_id?: string;
  createdAt?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  bannerUrl?: string;
  committeeId?: string;
  verticalId?: string;
  createdBy?: string;
  status: 'upcoming' | 'past';
  featured?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetType: 'all' | 'committee' | 'vertical'; // mapped from audience_type
  targetId?: string; // mapped from audience_id
  createdBy: string;
  timestamp: string; // mapped from created_at
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  assignedTo?: string; // profile UUID or name
  committeeId?: string;
  verticalId?: string;
  createdAt?: string;
  url?: string; // for backwards compatibility
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  committeeId?: string;
  verticalId?: string;
  uploadedBy?: string;
  createdAt?: string;
}

export type CommitteeTask = Task;
export type CommitteeResource = Resource;
export type VerticalProject = Task;
export type VerticalResource = Resource;

export interface DatabaseSchema {
  users: User[];
  coreCommittees: CoreCommittee[];
  verticals: Vertical[];
  activityLogs: any[];
  events: Event[];
  announcements: Announcement[];
  tasks: Task[];
  resources: Resource[];
  forms: any[];
  formFields: any[];
  formResponses: any[];
  responseAnswers: any[];
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
  forms: [],
  formFields: [],
  formResponses: [],
  responseAnswers: [],
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
  // Read existing db.json or fallback
  const db = { ...initialSchema };
  saveLocalDb(db);
}

// Log actions helper
export async function logActivity(userId: string, action: string, details: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('activity_logs').insert({ user_id: userId, action, details });
      if (error) throw error;
      return;
    } catch (err) {
      console.warn("Supabase logActivity failed, falling back to local logging:", err);
    }
  }

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

// =====================================================================
// HYBRID INTEGRATED OPERATIONS
// =====================================================================

// --- USERS / PROFILES ---
export async function dbGetUserByEmail(email: string): Promise<any | null> {
  const cleanEmail = email.toLowerCase().trim();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('email', cleanEmail).maybeSingle();
      if (error) throw error;
      if (data) {
        return {
          id: data.id,
          email: data.email,
          name: data.full_name || data.email.split('@')[0],
          full_name: data.full_name,
          role: data.role,
          status: data.status,
          firstLogin: data.first_login,
          passwordChangedAt: data.password_changed_at,
          createdBy: data.created_by,
          lastLogin: data.last_login,
          committeeId: data.committee_id,
          verticalId: data.vertical_id,
          phone: data.phone,
          profilePhoto: data.profile_photo,
          designation: data.designation,
          department: data.department
        };
      }
      return null;
    } catch (err) {
      console.warn("Supabase dbGetUserByEmail failed, using local database fallback:", err);
      const db = getLocalDb();
      const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (user) {
        return { ...user, name: user.full_name || user.name };
      }
      return null;
    }
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      return { ...user, name: user.full_name || user.name };
    }
    return null;
  }
}

export async function dbGetRoles(): Promise<any[]> {
  if (isSupabaseConfigured() && !getSupabaseOffline() && supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return (data || []).map((p: any) => ({
        id: p.id,
        email: p.email,
        name: p.full_name || p.name || p.email.split('@')[0],
        full_name: p.full_name || p.name || p.email.split('@')[0],
        role: p.role,
        status: p.status,
        firstLogin: p.first_login,
        passwordChangedAt: p.password_changed_at,
        createdBy: p.created_by,
        lastLogin: p.last_login,
        committeeId: p.committee_id,
        verticalId: p.vertical_id,
        isHead: p.is_head,
        phone: p.phone,
        profilePhoto: p.profile_photo,
        designation: p.designation,
        department: p.department,
        createdAt: p.created_at
      }));
    } catch (err) {
      console.warn('Supabase dbGetRoles failed, falling back to local database. Setting Supabase to offline.', err);
      setSupabaseOffline(true);
      const db = getLocalDb();
      return db.users.map(u => ({ ...u, name: u.full_name || u.name }));
    }
  } else {
    const db = getLocalDb();
    return db.users.map(u => ({ ...u, name: u.full_name || u.name }));
  }
}

export async function dbAddRole(email: string, name: string, role: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  if (isSupabaseConfigured() && supabase) {
    const { data: existing } = await supabase.from('profiles').select('id').eq('email', cleanEmail).maybeSingle();
    if (existing) {
      const { error } = await supabase.from('profiles').update({ role: role as any, status: 'active' }).eq('id', existing.id);
      if (error) throw error;
    } else {
      const uuid = genRandomUuid();
      const { error } = await supabase.from('profiles').insert({
        id: uuid,
        email: cleanEmail,
        full_name: name,
        role: role as any,
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
        full_name: name,
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
      role: 'MEMBER',
      committee_id: null,
      vertical_id: null
    }).eq('id', userId);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.role = 'MEMBER';
      user.committeeId = undefined;
      user.verticalId = undefined;
      saveLocalDb(db);
    }
  }
}

export async function dbDeleteUser(userId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const adminClient = getSupabaseAdmin();
    if (adminClient) {
      // Delete from Supabase Auth (cascades to profiles via RLS/trigger)
      const { error: authErr } = await adminClient.auth.admin.deleteUser(userId);
      if (authErr) throw authErr;
    } else {
      // Fallback: just delete the profile row
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
    }
  } else {
    const db = getLocalDb();
    db.users = db.users.filter((u: any) => u.id !== userId);
    saveLocalDb(db);
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
        full_name: name,
        role,
        created_by: adminUserId,
        first_login: true,
        committee_id: committeeId || null,
        vertical_id: verticalId || null
      }
    });

    if (authError) throw authError;
    const userId = authData.user?.id;
    if (!userId) throw new Error('User creation failed in Supabase Auth.');

    const { error: profErr } = await adminClient.from('profiles').update({
      created_by: adminUserId,
      first_login: true,
      role: role as any,
      committee_id: committeeId || null,
      vertical_id: verticalId || null,
      full_name: name
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
      full_name: name,
      passwordHash: hash,
      role: role as any,
      status: 'active',
      firstLogin: true,
      createdBy: adminUserId,
      committeeId,
      verticalId,
      committee_id: committeeId || null,
      vertical_id: verticalId || null,
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

export async function dbUpdateUserDetails(
  userId: string, name: string, role: string,
  committeeId?: string, verticalId?: string,
  designation?: string, profilePhoto?: string, github?: string, linkedin?: string
): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('profiles').update({
      full_name: name,
      role: role as any,
      committee_id: committeeId || null,
      vertical_id: verticalId || null,
      designation: designation || null,
      profile_photo: profilePhoto || null,
      github: github || null
    }).eq('id', userId);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.name = name;
      user.full_name = name;
      user.role = role as any;
      user.committeeId = committeeId;
      user.verticalId = verticalId;
      user.committee_id = committeeId || null;
      user.vertical_id = verticalId || null;
      if (designation !== undefined) user.designation = designation;
      if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
      if (github !== undefined) user.github = github;
      if (linkedin !== undefined) user.linkedin = linkedin;
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
export async function dbGetVerticals(): Promise<any[]> {
  let verticals: any[] = [];
  let users: any[] = [];

  if (isSupabaseConfigured() && !getSupabaseOffline() && supabase) {
    try {
      const { data: vData, error: vErr } = await supabase.from('verticals').select('*');
      if (vErr) throw vErr;
      verticals = vData || [];

      const { data: uData, error: uErr } = await supabase.from('profiles').select('*');
      if (uErr) throw uErr;
      users = uData || [];
    } catch (err) {
      console.warn('Supabase dbGetVerticals failed, falling back to local database. Setting Supabase to offline.', err);
      setSupabaseOffline(true);
      const db = getLocalDb();
      verticals = db.verticals || [];
      users = db.users || [];
    }
  } else {
    const db = getLocalDb();
    verticals = db.verticals || [];
    users = db.users || [];
  }

  return verticals.map(v => {
    const verticalUsers = users.filter(u => u.verticalId === v.id || u.vertical_id === v.id);
    const heads = verticalUsers.filter(u => u.designation === 'Vertical Head');
    const subHeads = verticalUsers.filter(u => u.designation === 'Vertical Sub-Head');
    const coreCommittee = verticalUsers.filter(u => u.designation === 'Core Committee Member');

    const db = getLocalDb();
    const committees = (db.coreCommittees || []).filter(c => c.verticalId === v.id || c.vertical_id === v.id);

    return {
      ...v,
      // Legacy single-object for backwards compat
      head: heads.length > 0 ? { name: heads.map(h => h.full_name || h.name).join(' & '), email: heads[0]?.email || '' } : null,
      subHead: subHeads.length > 0 ? { name: subHeads.map(s => s.full_name || s.name).join(' & '), email: subHeads[0]?.email || '' } : null,
      // New: full arrays
      heads: heads.map(h => ({ id: h.id, name: h.full_name || h.name, email: h.email })),
      subHeads: subHeads.map(s => ({ id: s.id, name: s.full_name || s.name, email: s.email })),
      coreCommittee: coreCommittee.map(c => ({ id: c.id, name: c.full_name || c.name, email: c.email })),
      committees: committees.map(c => ({ id: c.id, name: c.name, description: c.description }))
    };
  });
}

export async function dbAddVertical(name: string, description: string, category: 'tech' | 'non-tech', extra?: { icon?: string; color?: string; image?: string }): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('verticals').insert({ name, description, category, icon: extra?.icon, color: extra?.color });
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.verticals.push({
      id: `v-${Date.now()}`,
      name,
      description,
      category,
      icon: extra?.icon || 'Brain',
      color: extra?.color || '#CD0000',
      image: extra?.image || ''
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
      }
    });
    saveLocalDb(db);
  }
}

// --- CORE COMMITTEES ---
export async function dbGetCoreCommittees(): Promise<CoreCommittee[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('core_committees').select('*');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn("Supabase dbGetCoreCommittees failed, using local database fallback:", err);
      return getLocalDb().coreCommittees;
    }
  } else {
    return getLocalDb().coreCommittees;
  }
}

export async function dbAddCoreCommittee(name: string, description: string, verticalId?: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('core_committees').insert({ name, description, vertical_id: verticalId });
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.coreCommittees.push({
      id: `cc-${Date.now()}`,
      name,
      description,
      verticalId,
      vertical_id: verticalId || null,
      icon: 'Users'
    });
    saveLocalDb(db);
  }
}

export async function dbUpdateCoreCommittee(id: string, name: string, description?: string, verticalId?: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('core_committees')
      .update({ name, description, vertical_id: verticalId })
      .eq('id', id);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const comm = db.coreCommittees.find(c => c.id === id);
    if (comm) {
      comm.name = name;
      if (description !== undefined) comm.description = description;
      if (verticalId !== undefined) {
        comm.verticalId = verticalId;
        comm.vertical_id = verticalId || null;
      }
      saveLocalDb(db);
    }
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
      }
    });
    saveLocalDb(db);
  }
}

// --- ASSIGNMENTS ---
export async function dbGetAssignments(): Promise<any> {
  if (isSupabaseConfigured() && !getSupabaseOffline() && supabase) {
    try {
      const { data: comms, error: commError } = await supabase
        .from('core_committees')
        .select('id, name, head_id, profiles!core_committees_head_id_fkey(full_name, email)');
      if (commError) throw commError;

      const { data: verts, error: vertError } = await supabase
        .from('verticals')
        .select('id, name, head_id, profiles!verticals_head_id_fkey(full_name, email)');
      if (vertError) throw vertError;

      return {
        committee: (comms || []).filter(c => c.head_id).map((c: any) => ({
          id: c.id,
          userId: c.head_id,
          committeeId: c.id,
          userName: c.profiles?.full_name || 'Unknown',
          userEmail: c.profiles?.email || '',
          committeeName: c.name
        })),
        vertical: (verts || []).filter(v => v.head_id).map((v: any) => ({
          id: v.id,
          userId: v.head_id,
          verticalId: v.id,
          userName: v.profiles?.full_name || 'Unknown',
          userEmail: v.profiles?.email || '',
          verticalName: v.name
        }))
      };
    } catch (err) {
      console.warn('Supabase dbGetAssignments failed, falling back to local database. Setting Supabase to offline.', err);
      setSupabaseOffline(true);
      const db = getLocalDb();
      return getLocalAssignments(db);
    }
  } else {
    const db = getLocalDb();
    return getLocalAssignments(db);
  }
}


function getLocalAssignments(db: DatabaseSchema) {
  const comms = db.coreCommittees || [];
  const verts = db.verticals || [];

  return {
    committee: comms.filter((c: any) => c.head_id).map((c: any) => {
      const head = db.users.find((u: any) => u.id === c.head_id);
      return {
        id: c.id,
        userId: c.head_id,
        committeeId: c.id,
        userName: head?.full_name || head?.name || 'Unknown',
        userEmail: head?.email || '',
        committeeName: c.name
      };
    }),
    vertical: verts.filter((v: any) => v.head_id).map((v: any) => {
      const head = db.users.find((u: any) => u.id === v.head_id);
      return {
        id: v.id,
        userId: v.head_id,
        verticalId: v.id,
        userName: head?.full_name || head?.name || 'Unknown',
        userEmail: head?.email || '',
        verticalName: v.name
      };
    })
  };
}

export async function dbAssignCoreHead(email: string, committeeId: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  if (isSupabaseConfigured() && supabase) {
    const { data: user, error: userErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();
    if (userErr) throw userErr;
    if (!user) throw new Error('User not found. Head must register first.');

    const { error: commErr } = await supabase
      .from('core_committees')
      .update({ head_id: user.id })
      .eq('id', committeeId);
    if (commErr) throw commErr;

    await supabase.from('profiles').update({ committee_id: committeeId }).eq('id', user.id);
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) throw new Error('User not found. Head must register first.');

    const comm = db.coreCommittees.find(c => c.id === committeeId);
    if (comm) comm.head_id = user.id;
    user.committeeId = committeeId;
    saveLocalDb(db);
  }
}

export async function dbRemoveCoreAssignment(userId: string, committeeId?: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    let query = supabase.from('core_committees').update({ head_id: null });
    if (committeeId) {
      query = query.eq('id', committeeId);
    }
    const { error: commErr } = await query.eq('head_id', userId);
    if (commErr) throw commErr;
  } else {
    const db = getLocalDb();
    const comm = committeeId
      ? db.coreCommittees.find(c => c.id === committeeId)
      : db.coreCommittees.find(c => c.head_id === userId);
    if (comm && comm.head_id === userId) {
      comm.head_id = undefined;
      saveLocalDb(db);
    }
  }
}

export async function dbAssignVerticalHead(email: string, verticalId: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  if (isSupabaseConfigured() && supabase) {
    const { data: user, error: userErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();
    if (userErr) throw userErr;
    if (!user) throw new Error('User not found. Head must register first.');

    const { error: vertErr } = await supabase
      .from('verticals')
      .update({ head_id: user.id })
      .eq('id', verticalId);
    if (vertErr) throw vertErr;

    await supabase.from('profiles').update({ vertical_id: verticalId }).eq('id', user.id);
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) throw new Error('User not found. Head must register first.');

    const vert = db.verticals.find(v => v.id === verticalId);
    if (vert) vert.head_id = user.id;
    user.verticalId = verticalId;
    saveLocalDb(db);
  }
}

export async function dbRemoveVerticalAssignment(userId: string, verticalId?: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    let query = supabase.from('verticals').update({ head_id: null });
    if (verticalId) {
      query = query.eq('id', verticalId);
    }
    const { error: vertErr } = await query.eq('head_id', userId);
    if (vertErr) throw vertErr;
  } else {
    const db = getLocalDb();
    const vert = verticalId
      ? db.verticals.find(v => v.id === verticalId)
      : db.verticals.find(v => v.head_id === userId);
    if (vert && vert.head_id === userId) {
      vert.head_id = undefined;
      saveLocalDb(db);
    }
  }
}

// Remove a person from a vertical role (clears their verticalId + designation)
export async function dbRemovePersonFromVertical(userId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('profiles')
      .update({ vertical_id: null, designation: null })
      .eq('id', userId);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.verticalId = undefined;
      (user as any).vertical_id = undefined;
      user.designation = undefined;
      saveLocalDb(db);
    }
  }
}

// Assign a vertical role (head, sub-head, or core committee) to a user
export async function dbAssignVerticalRole(userId: string, verticalId: string, designation: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('profiles')
      .update({ vertical_id: verticalId, designation })
      .eq('id', userId);
    if (error) throw error;
  } else {
    const db = getLocalDb();
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.verticalId = verticalId;
      (user as any).vertical_id = verticalId;
      user.designation = designation;
      saveLocalDb(db);
    }
  }
}


// --- EVENTS ---
export async function dbGetEvents(): Promise<Event[]> {
  let rawEvents: any[] = [];
  if (isSupabaseConfigured() && !getSupabaseOffline() && supabase) {
    try {
      const { data, error } = await supabase.from('events').select('*');
      if (error) throw error;
      rawEvents = data || [];
    } catch (err) {
      console.warn('Supabase dbGetEvents failed, falling back to local database. Setting Supabase to offline.', err);
      setSupabaseOffline(true);
      rawEvents = getLocalDb().events;
    }
  } else {
    rawEvents = getLocalDb().events;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return rawEvents.map((e: any) => {
    const eventDate = new Date(e.date);
    const status = eventDate >= today ? 'upcoming' : 'past';
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      category: e.category,
      time: e.time,
      location: e.location,
      bannerUrl: e.banner_url || e.bannerUrl,
      committeeId: e.committee_id || e.committeeId,
      verticalId: e.vertical_id || e.verticalId,
      createdBy: e.created_by || e.createdBy,
      status,
      featured: e.featured === true
    };
  });
}

export async function dbAddEvent(data: any, createdBy?: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('events').insert({
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time || null,
      location: data.location || null,
      banner_url: data.bannerUrl || null,
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
    if (data.time !== undefined) mapped.time = data.time || null;
    if (data.location !== undefined) mapped.location = data.location || null;
    if (data.bannerUrl !== undefined) mapped.banner_url = data.bannerUrl || null;
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
    try {
      const { data, error } = await supabase.from('announcements').select(`
        id, title, content, audience_type, audience_id, created_at, created_by,
        profiles (full_name)
      `).order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        targetType: a.audience_type,
        targetId: a.audience_id,
        createdBy: a.profiles?.full_name || a.created_by || 'Club Admin',
        timestamp: a.created_at
      }));
    } catch (err) {
      console.warn("Supabase dbGetAnnouncements failed, using local database fallback:", err);
      return getLocalDb().announcements;
    }
  } else {
    return getLocalDb().announcements;
  }
}

export async function dbAddAnnouncement(data: any, createdBy: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('announcements').insert({
      title: data.title,
      content: data.content,
      audience_type: data.targetType,
      audience_id: data.targetId || null,
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
    try {
      const { data, error } = await supabase.from('tasks').select('*').eq('committee_id', committeeId);
      if (error) throw error;
      return (data || []).map((t: any) => ({
        id: t.id,
        committeeId: t.committee_id,
        title: t.title,
        description: t.description,
        status: t.status,
        assignedTo: t.assigned_to,
        dueDate: t.due_date
      }));
    } catch (err) {
      console.warn("Supabase dbGetCommitteeTasks failed, using local database fallback:", err);
      return getLocalDb().tasks.filter(t => t.committeeId === committeeId);
    }
  } else {
    return getLocalDb().tasks.filter(t => t.committeeId === committeeId);
  }
}

export async function dbAddCommitteeTask(committeeId: string, data: any): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('tasks').insert({
      committee_id: committeeId,
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      assigned_to: data.assignedTo || null,
      due_date: data.dueDate || null
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
      dueDate: data.dueDate
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
    if (data.assignedTo !== undefined) mapped.assigned_to = data.assignedTo || null;
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
    try {
      const { data, error } = await supabase.from('resources').select('*').eq('committee_id', committeeId);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id,
        committeeId: r.committee_id,
        title: r.title,
        description: r.description,
        url: r.url
      }));
    } catch (err) {
      console.warn("Supabase dbGetCommitteeResources failed, using local database fallback:", err);
      return getLocalDb().resources.filter(r => r.committeeId === committeeId);
    }
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
      url: data.url
    });
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.resources.push({
      id: `cr-${Date.now()}`,
      committeeId,
      title: data.title,
      description: data.description,
      url: data.url
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
    try {
      const { data, error } = await supabase.from('tasks').select('*').eq('vertical_id', verticalId);
      if (error) throw error;
      return (data || []).map((p: any) => ({
        id: p.id,
        verticalId: p.vertical_id,
        title: p.title,
        description: p.description,
        status: p.status,
        url: p.url
      }));
    } catch (err) {
      console.warn("Supabase dbGetVerticalProjects failed, using local database fallback:", err);
      return getLocalDb().tasks.filter(p => p.verticalId === verticalId);
    }
  } else {
    return getLocalDb().tasks.filter(p => p.verticalId === verticalId);
  }
}

export async function dbAddVerticalProject(verticalId: string, data: any): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('tasks').insert({
      vertical_id: verticalId,
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      url: data.url || null
    });
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.tasks.push({
      id: `vp-${Date.now()}`,
      verticalId,
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      url: data.url
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
    if (data.url !== undefined) mapped.url = data.url || null;

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
    try {
      const { data, error } = await supabase.from('resources').select('*').eq('vertical_id', verticalId);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id,
        verticalId: r.vertical_id,
        title: r.title,
        description: r.description,
        url: r.url
      }));
    } catch (err) {
      console.warn("Supabase dbGetVerticalResources failed, using local database fallback:", err);
      return getLocalDb().resources.filter(r => r.verticalId === verticalId);
    }
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
      url: data.url
    });
    if (error) throw error;
  } else {
    const db = getLocalDb();
    db.resources.push({
      id: `vr-${Date.now()}`,
      verticalId,
      title: data.title,
      description: data.description,
      url: data.url
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

// --- REGISTRATIONS ---
export async function dbGetJoinRegistrations(): Promise<any[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('status', 'inactive').eq('role', 'MEMBER');
      if (error) throw error;
      return (data || []).map(p => ({
        id: p.id,
        name: p.full_name || 'Student Candidate',
        email: p.email,
        phone: p.phone || 'N/A',
        course: 'Computer Science',
        year: '1',
        preferredVertical: 'General Inquiry',
        timestamp: p.created_at
      }));
    } catch (err) {
      console.warn("Supabase dbGetJoinRegistrations failed, using local database fallback:", err);
      const db = getLocalDb();
      return db.users.filter(u => u.status === 'inactive' && u.role === 'MEMBER').map(u => ({
        id: u.id,
        name: u.full_name || u.name,
        email: u.email,
        phone: u.phone || 'N/A',
        course: 'Computer Science',
        year: '1',
        preferredVertical: 'General Inquiry',
        timestamp: u.createdAt
      }));
    }
  } else {
    const db = getLocalDb();
    return db.users.filter(u => u.status === 'inactive' && u.role === 'MEMBER').map(u => ({
      id: u.id,
      name: u.full_name || u.name,
      email: u.email,
      phone: u.phone || 'N/A',
      course: 'Computer Science',
      year: '1',
      preferredVertical: 'General Inquiry',
      timestamp: u.createdAt
    }));
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
export async function dbGetForms(): Promise<any> {
  try {
    const filePath = path.join(process.cwd(), 'src/data/forms.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("dbGetForms failed to read forms.json:", error);
  }
  return {};
}

export async function dbUpdateForms(forms: any[]): Promise<void> {
  const db = getLocalDb();
  db.forms = forms;
  saveLocalDb(db);
}

// =====================================================================
// CUSTOM FORMS ENGINE
// =====================================================================

export interface CustomForm {
  id: string;
  title: string;
  description: string;
  slug: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFormField {
  id: string;
  formId: string;
  fieldType: string;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  options?: any;
  order: number;
  defaultValue?: string;
  validation?: string;
}

export interface CustomFormResponse {
  id: string;
  formId: string;
  applicantName: string;
  applicantEmail: string;
  status: 'pending' | 'shortlisted' | 'selected' | 'rejected' | 'interview_scheduled' | 'completed';
  notes?: string;
  submittedAt: string;
  answers?: Record<string, any>;
}

let customFormsCache: { data: CustomForm[]; timestamp: number } | null = null;

export function invalidateCustomFormsCache() {
  customFormsCache = null;
}

export async function dbGetCustomForms(): Promise<CustomForm[]> {
  const now = Date.now();
  if (customFormsCache && (now - customFormsCache.timestamp < 10000)) {
    return customFormsCache.data;
  }

  if (isSupabaseConfigured()) {
    const adminClient = getSupabaseAdmin();
    if (adminClient) {
      try {
        const { data, error } = await adminClient.from('forms').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        const mapped = (data || []).map((f: any) => ({
          id: f.id,
          title: f.title,
          description: f.description || '',
          slug: f.slug,
          status: f.status,
          coverImage: f.cover_image || undefined,
          startDate: f.start_date || undefined,
          endDate: f.end_date || undefined,
          createdBy: f.created_by || undefined,
          createdAt: f.created_at,
          updatedAt: f.updated_at
        }));
        customFormsCache = { data: mapped, timestamp: now };
        return mapped;
      } catch (err) {
        console.warn("Supabase dbGetCustomForms failed, using local database fallback:", err);
        return (getLocalDb().forms || []) as CustomForm[];
      }
    }
  }
  return (getLocalDb().forms || []) as CustomForm[];
}

export async function dbGetCustomFormBySlug(slug: string): Promise<{ form: CustomForm; fields: CustomFormField[] } | null> {
  if (isSupabaseConfigured()) {
    const adminClient = getSupabaseAdmin();
    if (adminClient) {
      try {
        const { data: form, error: formErr } = await adminClient
          .from('forms')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (formErr) throw formErr;
        if (!form) return null;

        const { data: fields, error: fieldsErr } = await adminClient
          .from('form_fields')
          .select('*')
          .eq('form_id', form.id)
          .order('order_num', { ascending: true });
        if (fieldsErr) throw fieldsErr;

        return {
          form: {
            id: form.id,
            title: form.title,
            description: form.description || '',
            slug: form.slug,
            status: form.status,
            coverImage: form.cover_image || undefined,
            startDate: form.start_date || undefined,
            endDate: form.end_date || undefined,
            createdBy: form.created_by || undefined,
            createdAt: form.created_at,
            updatedAt: form.updated_at
          },
          fields: (fields || []).map((f: any) => ({
            id: f.id,
            formId: f.form_id,
            fieldType: f.field_type,
            label: f.label,
            description: f.description || undefined,
            placeholder: f.placeholder || undefined,
            required: f.required,
            options: f.options || undefined,
            order: f.order_num,
            defaultValue: f.default_value || undefined,
            validation: f.validation || undefined
          }))
        };
      } catch (err) {
        console.warn("Supabase dbGetCustomFormBySlug failed, using local database fallback:", err);
      }
    }
  }

  // Local fallback
  const db = getLocalDb();
  const form = (db.forms || []).find((f: any) => f.slug === slug);
  if (!form) return null;
  const fields = (db.formFields || [])
    .filter((f: any) => f.formId === form.id)
    .sort((a: any, b: any) => a.order - b.order);

  return { form, fields };
}

const isUuid = (str?: string | null): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export async function dbAddCustomForm(data: Partial<CustomForm>, fields: Partial<CustomFormField>[]): Promise<string> {
  invalidateCustomFormsCache();
  const formId = genRandomUuid();
  const timestamp = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const adminClient = getSupabaseAdmin();
    if (adminClient) {
      try {
        const { error: formErr } = await adminClient.from('forms').insert({
          id: formId,
          title: data.title,
          description: data.description || null,
          slug: data.slug,
          status: data.status || 'draft',
          cover_image: data.coverImage || null,
          start_date: data.startDate || null,
          end_date: data.endDate || null,
          created_by: data.createdBy || null,
          created_at: timestamp,
          updated_at: timestamp
        });
        if (formErr) throw formErr;

        if (fields && fields.length > 0) {
          const mappedFields = fields.map((f, i) => {
            const fieldId = (f.id && isUuid(f.id)) ? f.id : genRandomUuid();
            f.id = fieldId; // Sync ID
            return {
              id: fieldId,
              form_id: formId,
              field_type: f.fieldType,
              label: f.label,
              description: f.description || null,
              placeholder: f.placeholder || null,
              required: f.required || false,
              options: f.options ? f.options : null,
              order_num: i,
              default_value: f.defaultValue || null,
              validation: f.validation || null
            };
          });
          const { error: fieldsErr } = await adminClient.from('form_fields').insert(mappedFields);
          if (fieldsErr) throw fieldsErr;
        }
      } catch (err) {
        console.warn("Supabase dbAddCustomForm failed:", err);
        throw err;
      }
    }
  }

  // Local fallback (always sync!)
  const db = getLocalDb();
  if (!db.forms) db.forms = [];
  if (!db.formFields) db.formFields = [];

  const newForm: CustomForm = {
    id: formId,
    title: data.title || 'Untitled Form',
    description: data.description || '',
    slug: data.slug || `form-${Date.now()}`,
    status: data.status || 'draft',
    coverImage: data.coverImage,
    startDate: data.startDate,
    endDate: data.endDate,
    createdBy: data.createdBy,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  db.forms.push(newForm);

  if (fields && fields.length > 0) {
    fields.forEach((f, i) => {
      const fieldId = (f.id && isUuid(f.id)) ? f.id : genRandomUuid();
      db.formFields.push({
        id: fieldId,
        formId: formId,
        fieldType: f.fieldType || 'short_text',
        label: f.label || 'Question',
        description: f.description,
        placeholder: f.placeholder,
        required: f.required || false,
        options: f.options,
        order: i,
        defaultValue: f.defaultValue,
        validation: f.validation
      });
    });
  }

  saveLocalDb(db);
  return formId;
}

export async function dbUpdateCustomForm(id: string, data: Partial<CustomForm>, fields: Partial<CustomFormField>[]): Promise<void> {
  invalidateCustomFormsCache();
  const timestamp = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const adminClient = getSupabaseAdmin();
    if (adminClient) {
      try {
        const updatePayload: any = {
          updated_at: timestamp
        };
        if (data.title !== undefined) updatePayload.title = data.title;
        if (data.description !== undefined) updatePayload.description = data.description || null;
        if (data.slug !== undefined) updatePayload.slug = data.slug;
        if (data.status !== undefined) updatePayload.status = data.status;
        if (data.coverImage !== undefined) updatePayload.cover_image = data.coverImage || null;
        if (data.startDate !== undefined) updatePayload.start_date = data.startDate || null;
        if (data.endDate !== undefined) updatePayload.end_date = data.endDate || null;

        const { error: formErr } = await adminClient.from('forms').update(updatePayload).eq('id', id);
        if (formErr) throw formErr;

        // Replace fields
        const { error: delErr } = await adminClient.from('form_fields').delete().eq('form_id', id);
        if (delErr) throw delErr;

        if (fields && fields.length > 0) {
          const mappedFields = fields.map((f, i) => {
            const fieldId = (f.id && isUuid(f.id)) ? f.id : genRandomUuid();
            f.id = fieldId; // Sync ID
            return {
              id: fieldId,
              form_id: id,
              field_type: f.fieldType,
              label: f.label,
              description: f.description || null,
              placeholder: f.placeholder || null,
              required: f.required || false,
              options: f.options ? f.options : null,
              order_num: i,
              default_value: f.defaultValue || null,
              validation: f.validation || null
            };
          });
          const { error: fieldsErr } = await adminClient.from('form_fields').insert(mappedFields);
          if (fieldsErr) throw fieldsErr;
        }
      } catch (err) {
        console.warn("Supabase dbUpdateCustomForm failed:", err);
        throw err;
      }
    }
  }

  // Local fallback (always sync!)
  const db = getLocalDb();
  const idx = (db.forms || []).findIndex((f: any) => f.id === id);
  if (idx !== -1) {
    db.forms[idx] = {
      ...db.forms[idx],
      ...data,
      updatedAt: timestamp
    };
  }

  // Replace fields locally
  db.formFields = (db.formFields || []).filter((f: any) => f.formId !== id);
  if (fields && fields.length > 0) {
    fields.forEach((f, i) => {
      const fieldId = (f.id && isUuid(f.id)) ? f.id : genRandomUuid();
      db.formFields.push({
        id: fieldId,
        formId: id,
        fieldType: f.fieldType || 'short_text',
        label: f.label || 'Question',
        description: f.description,
        placeholder: f.placeholder,
        required: f.required || false,
        options: f.options,
        order: i,
        defaultValue: f.defaultValue,
        validation: f.validation
      });
    });
  }

  saveLocalDb(db);
}

export async function dbDeleteCustomForm(id: string): Promise<void> {
  invalidateCustomFormsCache();
  if (isSupabaseConfigured()) {
    const adminClient = getSupabaseAdmin();
    if (adminClient) {
      try {
        const { error } = await adminClient.from('forms').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.warn("Supabase dbDeleteCustomForm failed:", err);
        throw err;
      }
    }
  }

  // Local fallback
  const db = getLocalDb();
  db.forms = (db.forms || []).filter((f: any) => f.id !== id);
  db.formFields = (db.formFields || []).filter((f: any) => f.formId !== id);

  const responses = (db.formResponses || []).filter((r: any) => r.formId === id);
  const responseIds = responses.map((r: any) => r.id);

  db.formResponses = (db.formResponses || []).filter((r: any) => r.formId !== id);
  db.responseAnswers = (db.responseAnswers || []).filter((a: any) => !responseIds.includes(a.responseId));

  saveLocalDb(db);
}

export async function dbDuplicateCustomForm(id: string): Promise<string> {
  invalidateCustomFormsCache();
  const timestamp = new Date().toISOString();
  const newFormId = genRandomUuid();

  if (isSupabaseConfigured()) {
    const adminClient = getSupabaseAdmin();
    if (adminClient) {
      try {
        const { data: form, error: formErr } = await adminClient.from('forms').select('*').eq('id', id).single();
        if (formErr) throw formErr;

        const newSlug = `${form.slug}_copy_${Date.now()}`;
        const { error: insErr } = await adminClient.from('forms').insert({
          id: newFormId,
          title: `${form.title} (Copy)`,
          description: form.description,
          slug: newSlug,
          status: 'draft',
          cover_image: form.cover_image,
          start_date: form.start_date,
          end_date: form.end_date,
          created_by: form.created_by,
          created_at: timestamp,
          updated_at: timestamp
        });
        if (insErr) throw insErr;

        const { data: fields, error: fieldsErr } = await adminClient.from('form_fields').select('*').eq('form_id', id).order('order_num', { ascending: true });
        if (fieldsErr) throw fieldsErr;

        if (fields && fields.length > 0) {
          const mappedFields = fields.map((f: any) => ({
            id: genRandomUuid(),
            form_id: newFormId,
            field_type: f.field_type,
            label: f.label,
            description: f.description,
            placeholder: f.placeholder,
            required: f.required,
            options: f.options,
            order_num: f.order_num,
            default_value: f.default_value,
            validation: f.validation
          }));
          const { error: insFieldsErr } = await adminClient.from('form_fields').insert(mappedFields);
          if (insFieldsErr) throw insFieldsErr;
        }
      } catch (err) {
        console.warn("Supabase dbDuplicateCustomForm failed:", err);
        throw err;
      }
    }
  }

  // Local fallback (always sync!)
  const db = getLocalDb();
  const form = (db.forms || []).find((f: any) => f.id === id);
  if (!form) throw new Error("Source form not found.");

  const newSlug = `${form.slug}_copy_${Date.now()}`;
  const newForm: CustomForm = {
    ...form,
    id: newFormId,
    title: `${form.title} (Copy)`,
    slug: newSlug,
    status: 'draft',
    createdAt: timestamp,
    updatedAt: timestamp
  };
  db.forms.push(newForm);

  const fields = (db.formFields || []).filter((f: any) => f.formId === id);
  fields.forEach((f: any) => {
    db.formFields.push({
      ...f,
      id: genRandomUuid(),
      formId: newFormId
    });
  });

  saveLocalDb(db);
  return newFormId;
}

export async function dbSubmitFormResponse(
  formId: string,
  applicantName: string,
  applicantEmail: string,
  answers: Record<string, any>
): Promise<string> {
  const responseId = genRandomUuid();
  const timestamp = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const client = getSupabaseAdmin() || supabase;
    if (client) {
      try {
        const { error: respErr } = await client.from('form_responses').insert({
          id: responseId,
          form_id: formId,
          applicant_name: applicantName,
          applicant_email: applicantEmail,
          status: 'pending',
          submitted_at: timestamp
        });
        if (respErr) throw respErr;

        const answerRecords = Object.keys(answers).map(fieldId => {
          const rawVal = answers[fieldId];
          const valStr = (typeof rawVal === 'object' && rawVal !== null) ? JSON.stringify(rawVal) : String(rawVal ?? '');
          return {
            id: genRandomUuid(),
            response_id: responseId,
            field_id: fieldId,
            value: valStr
          };
        });

        if (answerRecords.length > 0) {
          const { error: ansErr } = await client.from('response_answers').insert(answerRecords);
          if (ansErr) throw ansErr;
        }
      } catch (err) {
        console.warn("Supabase dbSubmitFormResponse failed, using local database fallback:", err);
      }
    }
  }

  // Local fallback (always sync!)
  const db = getLocalDb();
  if (!db.formResponses) db.formResponses = [];
  if (!db.responseAnswers) db.responseAnswers = [];

  db.formResponses.push({
    id: responseId,
    formId,
    applicantName,
    applicantEmail,
    status: 'pending',
    submittedAt: timestamp
  });

  Object.keys(answers).forEach(fieldId => {
    const rawVal = answers[fieldId];
    const valStr = (typeof rawVal === 'object' && rawVal !== null) ? JSON.stringify(rawVal) : String(rawVal ?? '');
    db.responseAnswers.push({
      id: genRandomUuid(),
      responseId,
      fieldId,
      value: valStr
    });
  });

  saveLocalDb(db);
  return responseId;
}

export async function dbGetFormResponses(formId: string): Promise<CustomFormResponse[]> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseAdmin() || supabase;
    if (client) {
      try {
        const { data: responses, error: respErr } = await client
          .from('form_responses')
          .select('*')
          .eq('form_id', formId)
          .order('submitted_at', { ascending: false });
        if (respErr) throw respErr;

        const responseIds = (responses || []).map((r: any) => r.id);
        if (responseIds.length === 0) return [];

        const { data: answers, error: ansErr } = await client
          .from('response_answers')
          .select('*')
          .in('response_id', responseIds);
        if (ansErr) throw ansErr;

        return (responses || []).map((r: any) => {
          const respAnswers: Record<string, any> = {};
          (answers || [])
            .filter((a: any) => a.response_id === r.id)
            .forEach((a: any) => {
              let parsed = a.value;
              if (typeof a.value === 'string' && (a.value.startsWith('{') || a.value.startsWith('['))) {
                try { parsed = JSON.parse(a.value); } catch (_) {}
              }
              respAnswers[a.field_id] = parsed;
            });

          return {
            id: r.id,
            formId: r.form_id,
            applicantName: r.applicant_name,
            applicantEmail: r.applicant_email,
            status: r.status,
            notes: r.notes || undefined,
            submittedAt: r.submitted_at,
            answers: respAnswers
          };
        });
      } catch (err) {
        console.warn("Supabase dbGetFormResponses failed, using local database fallback:", err);
      }
    }
  }

  // Local fallback
  const db = getLocalDb();
  const responses = (db.formResponses || []).filter((r: any) => r.formId === formId);

  return responses.map((r: any) => {
    const respAnswers: Record<string, any> = {};
    (db.responseAnswers || [])
      .filter((a: any) => a.responseId === r.id)
      .forEach((a: any) => {
        let parsed = a.value;
        if (typeof a.value === 'string' && (a.value.startsWith('{') || a.value.startsWith('['))) {
          try { parsed = JSON.parse(a.value); } catch (_) {}
        }
        respAnswers[a.fieldId] = parsed;
      });

    return {
      ...r,
      answers: respAnswers
    };
  }).sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export async function dbUpdateResponseStatus(responseId: string, status: string, notes?: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseAdmin() || supabase;
    if (client) {
      try {
        const { error } = await client
          .from('form_responses')
          .update({ status, notes: notes !== undefined ? notes : null })
          .eq('id', responseId);
        if (error) throw error;
      } catch (err) {
        console.warn("Supabase dbUpdateResponseStatus failed, using local database fallback:", err);
      }
    }
  }

  // Local fallback (always sync!)
  const db = getLocalDb();
  const idx = (db.formResponses || []).findIndex((r: any) => r.id === responseId);
  if (idx !== -1) {
    db.formResponses[idx].status = status as any;
    if (notes !== undefined) {
      db.formResponses[idx].notes = notes;
    }
    saveLocalDb(db);
  }
}

// --- GALLERY ACTIONS ---
export async function dbAddGalleryImage(data: any): Promise<void> {
  const db = getLocalDb();
  if (!db.gallery) db.gallery = [];
  db.gallery.push({
    id: `g-${Date.now()}`,
    title: data.title,
    category: data.category,
    description: data.description,
    image: data.image,
    date: data.date,
    orientation: data.orientation || 'landscape',
    rotation: data.rotation ?? 0
  });
  saveLocalDb(db);
}

export async function dbUpdateGalleryImage(id: string, data: any): Promise<void> {
  const db = getLocalDb();
  if (!db.gallery) db.gallery = [];
  const idx = db.gallery.findIndex(g => g.id === id);
  if (idx !== -1) {
    db.gallery[idx] = {
      ...db.gallery[idx],
      title: data.title !== undefined ? data.title : db.gallery[idx].title,
      category: data.category !== undefined ? data.category : db.gallery[idx].category,
      description: data.description !== undefined ? data.description : db.gallery[idx].description,
      image: data.image !== undefined ? data.image : db.gallery[idx].image,
      date: data.date !== undefined ? data.date : db.gallery[idx].date,
      orientation: data.orientation !== undefined ? data.orientation : db.gallery[idx].orientation,
      rotation: data.rotation !== undefined ? data.rotation : (db.gallery[idx].rotation ?? 0)
    };
    saveLocalDb(db);
  }
}

export async function dbDeleteGalleryImage(id: string): Promise<void> {
  const db = getLocalDb();
  if (!db.gallery) db.gallery = [];
  db.gallery = db.gallery.filter(g => g.id !== id);
  saveLocalDb(db);
}

// =====================================================================
// UTILS
// =====================================================================
function genRandomUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
