import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_FILE = path.join(process.cwd(), 'src/data/db.json');

// Interfaces matching RBAC and domain models
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'HOD' | 'COORDINATOR' | 'ASSOCIATE' | 'CORE_HEAD' | 'VERTICAL_HEAD' | 'USER';
  status: 'pending' | 'active' | 'rejected';
  createdAt: string;
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

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
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
  targetId?: string; // committeeId or verticalId
  createdBy: string;
  timestamp: string;
}

export interface CommitteeTask {
  id: string;
  committeeId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string; // name/email
  dueDate: string;
}

export interface CommitteeResource {
  id: string;
  committeeId: string;
  title: string;
  description: string;
  url: string;
  type: string;
}

export interface VerticalProject {
  id: string;
  verticalId: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed';
  url?: string;
}

export interface VerticalResource {
  id: string;
  verticalId: string;
  title: string;
  description: string;
  url: string;
  type: string;
}

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
  committeeAssignments: CommitteeAssignment[];
  verticalAssignments: VerticalAssignment[];
  activityLogs: ActivityLog[];
  events: Event[];
  announcements: Announcement[];
  committeeTasks: CommitteeTask[];
  committeeResources: CommitteeResource[];
  verticalProjects: VerticalProject[];
  verticalResources: VerticalResource[];
  verticalAttendance: VerticalAttendance[];
  forms: any[];
  gallery: any[];
}

// Initial DB structure
const initialSchema: DatabaseSchema = {
  users: [],
  coreCommittees: [],
  verticals: [],
  committeeAssignments: [],
  verticalAssignments: [],
  activityLogs: [],
  events: [],
  announcements: [],
  committeeTasks: [],
  committeeResources: [],
  verticalProjects: [],
  verticalResources: [],
  verticalAttendance: [],
  forms: [],
  gallery: []
};

// Safe Synchronous Database Operations
export function getDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      initializeDb();
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read db.json, returning empty database', error);
    return initialSchema;
  }
}

export function saveDb(db: DatabaseSchema): void {
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

// Seeds the database with default values and reads existing JSON structures
export function initializeDb(): void {
  const db = { ...initialSchema };
  const salt = bcrypt.genSaltSync(10);
  const defaultHash = bcrypt.hashSync('admin123', salt);

  console.log('[DB] Seeding Database...');

  // 1. Predefined Administrative Users
  db.users = [
    {
      id: 'u-hod',
      email: 'hod@labyrinth.club',
      name: 'Dr. Suresh Kumar',
      passwordHash: defaultHash,
      role: 'HOD',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'u-coord',
      email: 'coordinator@labyrinth.club',
      name: 'Prof. Anjali Menon',
      passwordHash: defaultHash,
      role: 'COORDINATOR',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'u-assoc',
      email: 'associate@labyrinth.club',
      name: 'Dr. Rajesh Rajan',
      passwordHash: defaultHash,
      role: 'ASSOCIATE',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'u-core-head',
      email: 'core@labyrinth.club',
      name: 'Core Member One',
      passwordHash: defaultHash,
      role: 'CORE_HEAD',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'u-vert-head1',
      email: 'rishi@cs.christuniversity.in',
      name: 'Rishi Raj',
      passwordHash: defaultHash,
      role: 'VERTICAL_HEAD',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'u-vert-head2',
      email: 'krupa@cs.christuniversity.in',
      name: 'Krupa',
      passwordHash: defaultHash,
      role: 'VERTICAL_HEAD',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ];

  // 2. Load Verticals from existing JSON
  try {
    const vertsPath = path.join(process.cwd(), 'src/data/verticals.json');
    if (fs.existsSync(vertsPath)) {
      const data = JSON.parse(fs.readFileSync(vertsPath, 'utf8'));
      db.verticals = data;
    }
  } catch (e) {
    console.error('Failed to seed verticals from json', e);
  }

  // 3. Load Events from existing JSON
  try {
    const evtsPath = path.join(process.cwd(), 'src/data/events.json');
    if (fs.existsSync(evtsPath)) {
      const data = JSON.parse(fs.readFileSync(evtsPath, 'utf8'));
      db.events = data;
    }
  } catch (e) {
    console.error('Failed to seed events from json', e);
  }

  // 4. Seed Core Committees
  db.coreCommittees = [
    { id: 'cc-pub', name: 'Publicity Committee', description: 'Handles all external marketing, social media design and outreach.' },
    { id: 'cc-log', name: 'Logistics Committee', description: 'Manages scheduling, venues, tech rider, refreshments, and physical requirements.' },
    { id: 'cc-des', name: 'Design Committee', description: 'Responsible for posters, video editing, UI mockups, and visual themes.' },
    { id: 'cc-spn', name: 'Sponsorship Committee', description: 'Finds and interacts with sponsors, corporate partners, and external funding sources.' }
  ];

  // 5. Seed Core Assignments
  db.committeeAssignments = [
    {
      id: 'ca1',
      userId: 'u-core-head',
      committeeId: 'cc-pub',
      assignedAt: new Date().toISOString()
    }
  ];

  // 6. Seed Vertical Assignments
  db.verticalAssignments = [
    {
      id: 'va1',
      userId: 'u-vert-head1',
      verticalId: 'v1', // AI Creator's Lab
      assignedAt: new Date().toISOString()
    },
    {
      id: 'va2',
      userId: 'u-vert-head2',
      verticalId: 'v1', // AI Creator's Lab
      assignedAt: new Date().toISOString()
    }
  ];

  // 7. Load Forms from existing JSON
  try {
    const formsPath = path.join(process.cwd(), 'src/data/forms.json');
    if (fs.existsSync(formsPath)) {
      const data = JSON.parse(fs.readFileSync(formsPath, 'utf8'));
      db.forms = Array.isArray(data) ? data : Object.values(data);
    }
  } catch (e) {
    console.error('Failed to seed forms from json', e);
  }

  // 8. Load Gallery from existing JSON
  try {
    const galPath = path.join(process.cwd(), 'src/data/gallery.json');
    if (fs.existsSync(galPath)) {
      const data = JSON.parse(fs.readFileSync(galPath, 'utf8'));
      db.gallery = data;
    }
  } catch (e) {
    console.error('Failed to seed gallery from json', e);
  }

  // 9. Prepopulate some dummy Core Committee Tasks & Resources
  db.committeeTasks = [
    { id: 'ct1', committeeId: 'cc-pub', title: 'Design IG teaser', description: 'Create and post the Instagram teaser for the upcoming hackathon.', status: 'pending', assignedTo: 'Core Member One', dueDate: '2026-07-15' },
    { id: 'ct2', committeeId: 'cc-pub', title: 'Email blast to CS department', description: 'Draft and send a mail invitation to all classes.', status: 'in-progress', assignedTo: 'Core Member One', dueDate: '2026-07-18' }
  ];

  db.committeeResources = [
    { id: 'cr1', committeeId: 'cc-pub', title: 'Brand Guidelines PDF', description: 'Labyrinth standard logos, font definitions, and hex color codes.', url: 'https://example.com/labyrinth-brand.pdf', type: 'document' },
    { id: 'cr2', committeeId: 'cc-pub', title: 'Instagram Post Template', description: 'Figma templates for standard IG feed postings.', url: 'https://figma.com/file/example', type: 'link' }
  ];

  // 10. Prepopulate Vertical Projects & Learning Resources
  db.verticalProjects = [
    { id: 'vp1', verticalId: 'v1', title: 'Labyrinth AI Chatbot', description: 'An open-source LLM chatbot that answers queries about Christ University and club events.', status: 'in-progress', url: 'https://github.com/labyrinth/ai-chatbot' }
  ];

  db.verticalResources = [
    { id: 'vr1', verticalId: 'v1', title: 'Intro to PyTorch & Transformers', description: 'Hands-on notebooks showing how to fine-tune DistilBERT.', url: 'https://colab.research.google.com/example', type: 'code' },
    { id: 'vr2', verticalId: 'v1', title: 'Next.js 15 Server Actions Guide', description: 'Standard references to build low-latency interfaces.', url: 'https://nextjs.org/docs', type: 'link' }
  ];

  db.verticalAttendance = [
    { id: 'at1', verticalId: 'v1', date: '2026-07-01', memberId: 'm-1', memberName: 'Alice Johnson', status: 'present' },
    { id: 'at2', verticalId: 'v1', date: '2026-07-01', memberId: 'm-2', memberName: 'Bob Smith', status: 'absent' }
  ];

  // Write to filesystem
  saveDb(db);
  console.log('[DB] Seeding Completed successfully.');
}

// Log actions helper
export function logActivity(userId: string, action: string, details: string): void {
  const db = getDb();
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  db.activityLogs.unshift(newLog);
  // Cap logs at 1000 items
  if (db.activityLogs.length > 1000) {
    db.activityLogs = db.activityLogs.slice(0, 1000);
  }
  saveDb(db);
}
