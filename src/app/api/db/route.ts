import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, saveDb, logActivity, User } from '@/utils/db';
import { verifyJWT } from '@/utils/jwt';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user from session cookie
    const cookie = req.cookies.get('labyrinth_session');
    let sessionUser: any = null;

    if (cookie) {
      sessionUser = await verifyJWT(cookie.value);
    }

    const { action, payload } = await req.json();

    // Map public read operations that do not require login
    const publicActions = ['getEvents', 'getTeam', 'getGallery', 'getVerticals', 'getStats', 'submitJoinForm'];
    if (!publicActions.includes(action) && !sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const db = getDb();

    // 2. Perform actions and enforce role-based access rules
    switch (action) {
      // --- PUBLIC READ ACTIONS ---
      case 'getEvents': {
        return NextResponse.json({ success: true, data: db.events });
      }
      case 'getTeam': {
        // Construct the legacy team.json format for compatibility with existing components
        const facultyCoordinators = db.users.filter(u => u.role === 'COORDINATOR' || u.role === 'ASSOCIATE' || u.role === 'HOD').map(u => ({
          id: u.id, name: u.name, role: u.role === 'HOD' ? 'Head of Department' : u.role === 'COORDINATOR' ? 'Faculty Coordinator' : 'Faculty Associate',
          designation: u.role === 'HOD' ? 'Professor & HOD' : 'Faculty Advisor', department: 'Department of Computer Science', email: u.email
        }));

        const mentors = db.users.filter(u => u.role === 'ASSOCIATE').map(u => ({
          id: u.id, name: u.name, role: 'Mentor', email: u.email
        }));

        const coreCommittee = db.users.filter(u => u.role === 'CORE_HEAD').map(u => {
          const assign = db.committeeAssignments.find(a => a.userId === u.id);
          const comm = assign ? db.coreCommittees.find(c => c.id === assign.committeeId) : null;
          return {
            id: u.id, name: u.name, role: comm ? `${comm.name} Head` : 'Core Committee Head', email: u.email
          };
        });

        const verticalHeads = db.users.filter(u => u.role === 'VERTICAL_HEAD').map(u => {
          const assign = db.verticalAssignments.find(a => a.userId === u.id);
          const vert = assign ? db.verticals.find(v => v.id === assign.verticalId) : null;
          return {
            id: u.id, name: u.name, role: 'Vertical Head', vertical: vert ? vert.name : 'Unassigned', email: u.email
          };
        });

        return NextResponse.json({
          success: true,
          data: {
            facultyCoordinators,
            mentors,
            coreCommittee,
            verticalHeads,
            subHeads: [] // Mock subheads as we moved to assignment system
          }
        });
      }
      case 'getGallery': {
        return NextResponse.json({ success: true, data: db.gallery });
      }
      case 'getVerticals': {
        return NextResponse.json({ success: true, data: db.verticals });
      }
      case 'getStats': {
        // Return computed/real stats
        const activeUsersCount = db.users.filter(u => u.status === 'active').length;
        const upcomingEventsCount = db.events.filter(e => e.status === 'upcoming').length;
        const totalVerticals = db.verticals.length;
        
        const stats = [
          { label: 'Active Members', value: activeUsersCount.toString(), suffix: '+' },
          { label: 'Upcoming Events', value: upcomingEventsCount.toString(), suffix: '' },
          { label: 'Specialized Domains', value: totalVerticals.toString(), suffix: '' },
          { label: 'Years Active', value: '29', suffix: '+' }
        ];
        return NextResponse.json({ success: true, data: stats });
      }

      // --- REGISTRATION / JOIN COMMUNITY ---
      case 'submitJoinForm': {
        // Store join request as a user in "pending" status
        const { name, email, phone, course, year, preferredVertical, reason } = payload;
        
        const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
          return NextResponse.json({ success: false, error: 'User with this email already exists.' });
        }

        const salt = bcrypt.genSaltSync(10);
        const defaultHash = bcrypt.hashSync('member123', salt); // Default password for new members

        const newUser: User = {
          id: `u-${Date.now()}`,
          email,
          name,
          passwordHash: defaultHash,
          role: 'USER',
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        db.users.push(newUser);
        saveDb(db);

        // Also add to registration log details
        logActivity(newUser.id, 'registration_submit', `${name} submitted a registration form for vertical ${preferredVertical}`);
        
        return NextResponse.json({ success: true });
      }

      // --- ADMIN ONLY - GENERAL TEAM MANAGEMENT ---
      case 'addTeamMember':
      case 'updateTeamMember':
      case 'deleteTeamMember': {
        const allowedAdmin = ['HOD', 'COORDINATOR', 'ASSOCIATE'];
        if (!allowedAdmin.includes(sessionUser.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }

        if (action === 'deleteTeamMember') {
          db.users = db.users.filter(u => u.id !== payload.id);
          db.committeeAssignments = db.committeeAssignments.filter(a => a.userId !== payload.id);
          db.verticalAssignments = db.verticalAssignments.filter(a => a.userId !== payload.id);
          saveDb(db);
          logActivity(sessionUser.id, 'delete_member', `Deleted member ${payload.id}`);
          return NextResponse.json({ success: true });
        }

        const { name, role, email, category } = payload.data;
        let roleMapped: User['role'] = 'USER';
        if (category === 'faculty') roleMapped = 'COORDINATOR';
        else if (category === 'mentors') roleMapped = 'ASSOCIATE';
        else if (category === 'core') roleMapped = 'CORE_HEAD';
        else if (category === 'vertical_head') roleMapped = 'VERTICAL_HEAD';

        if (action === 'updateTeamMember') {
          const userIdx = db.users.findIndex(u => u.id === payload.id);
          if (userIdx !== -1) {
            db.users[userIdx].name = name;
            db.users[userIdx].email = email;
            db.users[userIdx].role = roleMapped;
          }
          logActivity(sessionUser.id, 'update_member', `Updated member ${payload.id}`);
        } else {
          const salt = bcrypt.genSaltSync(10);
          const defaultHash = bcrypt.hashSync('admin123', salt);
          const newUser: User = {
            id: `u-${Date.now()}`,
            email,
            name,
            passwordHash: defaultHash,
            role: roleMapped,
            status: 'active',
            createdAt: new Date().toISOString()
          };
          db.users.push(newUser);
          logActivity(sessionUser.id, 'add_member', `Added new member ${email}`);
        }
        saveDb(db);
        return NextResponse.json({ success: true });
      }

      // --- EVENT MANAGEMENT (ADMINS, COMMITTEE/VERTICAL HEADS) ---
      case 'addEvent':
      case 'updateEvent':
      case 'deleteEvent': {
        const allowedAdmin = ['HOD', 'COORDINATOR'];
        let hasAccess = allowedAdmin.includes(sessionUser.role);
        
        if (!hasAccess) {
          if (action === 'addEvent') {
            hasAccess = (sessionUser.role === 'CORE_HEAD' && payload.data.committeeId === sessionUser.committeeId) ||
                        (sessionUser.role === 'VERTICAL_HEAD' && payload.data.verticalId === sessionUser.verticalId);
          } else {
            const targetEvent = db.events.find(e => e.id === payload.id);
            if (targetEvent) {
              hasAccess = (sessionUser.role === 'CORE_HEAD' && targetEvent.committeeId === sessionUser.committeeId) ||
                          (sessionUser.role === 'VERTICAL_HEAD' && targetEvent.verticalId === sessionUser.verticalId);
            }
          }
        }
        
        if (!hasAccess) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }

        if (action === 'deleteEvent') {
          db.events = db.events.filter(e => e.id !== payload.id);
          logActivity(sessionUser.id, 'delete_event', `Deleted event ${payload.id}`);
        } else if (action === 'updateEvent') {
          const idx = db.events.findIndex(e => e.id === payload.id);
          if (idx !== -1) {
            db.events[idx] = { ...db.events[idx], ...payload.data };
          }
          logActivity(sessionUser.id, 'update_event', `Updated event ${payload.id}`);
        } else {
          const newEvent = {
            id: `evt-${Date.now()}`,
            ...payload.data,
            createdBy: sessionUser.id
          };
          db.events.push(newEvent);
          logActivity(sessionUser.id, 'add_event', `Added event ${newEvent.title}`);
        }
        saveDb(db);
        return NextResponse.json({ success: true });
      }

      // --- ADMIN ONLY - VERTICAL MANAGEMENT ---
      case 'addVertical':
      case 'updateVertical':
      case 'deleteVertical': {
        const allowedAdmin = ['HOD', 'COORDINATOR'];
        if (!allowedAdmin.includes(sessionUser.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }

        if (action === 'deleteVertical') {
          db.verticals = db.verticals.filter(v => v.id !== payload.id);
          db.verticalAssignments = db.verticalAssignments.filter(a => a.verticalId !== payload.id);
          logActivity(sessionUser.id, 'delete_vertical', `Deleted vertical ${payload.id}`);
        } else if (action === 'updateVertical') {
          const idx = db.verticals.findIndex(v => v.id === payload.id);
          if (idx !== -1) {
            db.verticals[idx] = { ...db.verticals[idx], ...payload.data };
          }
          logActivity(sessionUser.id, 'update_vertical', `Updated vertical ${payload.id}`);
        } else {
          const newVert = {
            id: `vert-${Date.now()}`,
            ...payload.data
          };
          db.verticals.push(newVert);
          logActivity(sessionUser.id, 'add_vertical', `Added vertical ${newVert.name}`);
        }
        saveDb(db);
        return NextResponse.json({ success: true });
      }

      // --- FORMS MANAGEMENT ---
      case 'getForms': {
        return NextResponse.json({ success: true, data: db.forms });
      }
      case 'updateForms': {
        const allowedAdmin = ['HOD', 'COORDINATOR'];
        if (!allowedAdmin.includes(sessionUser.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        db.forms = payload.forms;
        saveDb(db);
        logActivity(sessionUser.id, 'update_forms', 'Updated forms configuration');
        return NextResponse.json({ success: true });
      }

      // --- REGISTRATION APPROVALS ---
      case 'getJoinRegistrations': {
        const allowedAdmin = ['HOD', 'COORDINATOR', 'ASSOCIATE'];
        if (!allowedAdmin.includes(sessionUser.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        // Return pending users
        const pendingUsers = db.users.filter(u => u.status === 'pending').map(u => {
          // Resolve original form values or dummy for compatibility
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
        return NextResponse.json({ success: true, data: pendingUsers });
      }
      case 'approveRegistration': {
        const allowedAdmin = ['HOD', 'COORDINATOR', 'ASSOCIATE'];
        if (!allowedAdmin.includes(sessionUser.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        const user = db.users.find(u => u.id === payload.id);
        if (user) {
          user.status = 'active';
          saveDb(db);
          logActivity(sessionUser.id, 'approve_user', `Approved registration of ${user.email}`);
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false, error: 'User not found.' });
      }
      case 'rejectRegistration': {
        const allowedAdmin = ['HOD', 'COORDINATOR', 'ASSOCIATE'];
        if (!allowedAdmin.includes(sessionUser.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        const user = db.users.find(u => u.id === payload.id);
        if (user) {
          user.status = 'rejected';
          saveDb(db);
          logActivity(sessionUser.id, 'reject_user', `Rejected registration of ${user.email}`);
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false, error: 'User not found.' });
      }

      // --- ADMIN SYSTEM CONFIG - ROLES AND PORTALS ---
      case 'getRoles': {
        const allowedAdmin = ['HOD', 'COORDINATOR', 'ASSOCIATE'];
        if (!allowedAdmin.includes(sessionUser.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        // Return users who have administrative or head roles
        const managedUsers = db.users.filter(u => u.role !== 'USER').map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role
        }));
        return NextResponse.json({ success: true, data: managedUsers });
      }
      case 'addRole': {
        // Only HOD can grant admin roles
        if (sessionUser.role !== 'HOD') {
          return NextResponse.json({ success: false, error: 'Unauthorized. Only HOD can grant system administrator roles.' }, { status: 403 });
        }
        const { email, name, role } = payload.data;
        const cleanEmail = email.toLowerCase().trim();

        let targetUser = db.users.find(u => u.email.toLowerCase() === cleanEmail);
        if (!targetUser) {
          const salt = bcrypt.genSaltSync(10);
          targetUser = {
            id: `u-${Date.now()}`,
            email: cleanEmail,
            name,
            passwordHash: bcrypt.hashSync('admin123', salt),
            role: role as any,
            status: 'active',
            createdAt: new Date().toISOString()
          };
          db.users.push(targetUser);
        } else {
          targetUser.role = role as any;
          targetUser.status = 'active';
        }
        saveDb(db);
        logActivity(sessionUser.id, 'add_role', `Granted role ${role} to ${cleanEmail}`);
        return NextResponse.json({ success: true });
      }
      case 'deleteRole': {
        if (sessionUser.role !== 'HOD') {
          return NextResponse.json({ success: false, error: 'Unauthorized. Only HOD can revoke administrative roles.' }, { status: 403 });
        }
        const user = db.users.find(u => u.id === payload.id);
        if (user) {
          if (user.role === 'HOD') {
            return NextResponse.json({ success: false, error: 'Cannot revoke HOD role.' });
          }
          user.role = 'USER';
          // Clean up assignments
          db.committeeAssignments = db.committeeAssignments.filter(a => a.userId !== user.id);
          db.verticalAssignments = db.verticalAssignments.filter(a => a.userId !== user.id);
          saveDb(db);
          logActivity(sessionUser.id, 'revoke_role', `Revoked administrative access from ${user.email}`);
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false, error: 'User not found.' });
      }

      // --- ASSIGNMENT MANAGEMENT (COMMITTEES & VERTICALS) ---
      case 'getCoreCommittees': {
        return NextResponse.json({ success: true, data: db.coreCommittees });
      }
      case 'addCoreCommittee': {
        if (sessionUser.role !== 'HOD') {
          return NextResponse.json({ success: false, error: 'Unauthorized. Only HOD can create committees.' }, { status: 403 });
        }
        const newComm = {
          id: `cc-${Date.now()}`,
          name: payload.name,
          description: payload.description || ''
        };
        db.coreCommittees.push(newComm);
        saveDb(db);
        logActivity(sessionUser.id, 'add_committee', `Created committee ${payload.name}`);
        return NextResponse.json({ success: true });
      }
      case 'deleteCoreCommittee': {
        if (sessionUser.role !== 'HOD') {
          return NextResponse.json({ success: false, error: 'Unauthorized. Only HOD can delete committees.' }, { status: 403 });
        }
        db.coreCommittees = db.coreCommittees.filter(c => c.id !== payload.id);
        db.committeeAssignments = db.committeeAssignments.filter(a => a.committeeId !== payload.id);
        saveDb(db);
        logActivity(sessionUser.id, 'delete_committee', `Deleted committee ${payload.id}`);
        return NextResponse.json({ success: true });
      }
      case 'getAssignments': {
        return NextResponse.json({
          success: true,
          data: {
            committee: db.committeeAssignments.map(a => {
              const u = db.users.find(usr => usr.id === a.userId);
              const c = db.coreCommittees.find(com => com.id === a.committeeId);
              return { ...a, userName: u?.name || 'Unknown', userEmail: u?.email || 'N/A', committeeName: c?.name || 'Unknown' };
            }),
            vertical: db.verticalAssignments.map(a => {
              const u = db.users.find(usr => usr.id === a.userId);
              const v = db.verticals.find(ver => ver.id === a.verticalId);
              return { ...a, userName: u?.name || 'Unknown', userEmail: u?.email || 'N/A', verticalName: v?.name || 'Unknown' };
            })
          }
        });
      }
      case 'assignCoreHead': {
        const allowedAdmin = ['HOD', 'COORDINATOR'];
        if (!allowedAdmin.includes(sessionUser.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        const { userEmail, committeeId } = payload;
        
        let targetUser = db.users.find(u => u.email.toLowerCase() === userEmail.toLowerCase().trim());
        if (!targetUser) {
          return NextResponse.json({ success: false, error: 'User not found. Head must register first.' });
        }

        // Auto transition role to CORE_HEAD
        targetUser.role = 'CORE_HEAD';
        targetUser.status = 'active';

        // Remove duplicate active assignments for this committee/user if any
        db.committeeAssignments = db.committeeAssignments.filter(a => a.userId !== targetUser.id);

        const newAssign = {
          id: `ca-${Date.now()}`,
          userId: targetUser.id,
          committeeId,
          assignedAt: new Date().toISOString()
        };
        db.committeeAssignments.push(newAssign);
        saveDb(db);
        logActivity(sessionUser.id, 'assign_core_head', `Assigned ${targetUser.email} to committee ${committeeId}`);
        return NextResponse.json({ success: true });
      }
      case 'removeCoreAssignment': {
        const allowedAdmin = ['HOD', 'COORDINATOR'];
        if (!allowedAdmin.includes(sessionUser.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        const assign = db.committeeAssignments.find(a => a.id === payload.id);
        if (assign) {
          // Revert user role if no other assignments remain
          db.committeeAssignments = db.committeeAssignments.filter(a => a.id !== payload.id);
          const hasAssignments = db.committeeAssignments.some(a => a.userId === assign.userId);
          if (!hasAssignments) {
            const u = db.users.find(usr => usr.id === assign.userId);
            if (u && u.role === 'CORE_HEAD') {
              u.role = 'USER';
            }
          }
          saveDb(db);
          logActivity(sessionUser.id, 'remove_core_assignment', `Removed assignment ${payload.id}`);
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false, error: 'Assignment not found.' });
      }
      case 'assignVerticalHead': {
        const allowedAdmin = ['HOD', 'COORDINATOR'];
        if (!allowedAdmin.includes(sessionUser.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        const { userEmail, verticalId } = payload;
        
        let targetUser = db.users.find(u => u.email.toLowerCase() === userEmail.toLowerCase().trim());
        if (!targetUser) {
          return NextResponse.json({ success: false, error: 'User not found. Head must register first.' });
        }

        // Auto transition role to VERTICAL_HEAD
        targetUser.role = 'VERTICAL_HEAD';
        targetUser.status = 'active';

        // Remove duplicate active assignments for this user if any
        db.verticalAssignments = db.verticalAssignments.filter(a => a.userId !== targetUser.id);

        const newAssign = {
          id: `va-${Date.now()}`,
          userId: targetUser.id,
          verticalId,
          assignedAt: new Date().toISOString()
        };
        db.verticalAssignments.push(newAssign);
        saveDb(db);
        logActivity(sessionUser.id, 'assign_vertical_head', `Assigned ${targetUser.email} to vertical ${verticalId}`);
        return NextResponse.json({ success: true });
      }
      case 'removeVerticalAssignment': {
        const allowedAdmin = ['HOD', 'COORDINATOR'];
        if (!allowedAdmin.includes(sessionUser.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        const assign = db.verticalAssignments.find(a => a.id === payload.id);
        if (assign) {
          // Revert user role if no other assignments remain
          db.verticalAssignments = db.verticalAssignments.filter(a => a.id !== payload.id);
          const hasAssignments = db.verticalAssignments.some(a => a.userId === assign.userId);
          if (!hasAssignments) {
            const u = db.users.find(usr => usr.id === assign.userId);
            if (u && u.role === 'VERTICAL_HEAD') {
              u.role = 'USER';
            }
          }
          saveDb(db);
          logActivity(sessionUser.id, 'remove_vertical_assignment', `Removed assignment ${payload.id}`);
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false, error: 'Assignment not found.' });
      }

      // --- ANNOUNCEMENT MANAGEMENT ---
      case 'getAnnouncements': {
        return NextResponse.json({ success: true, data: db.announcements });
      }
      case 'addAnnouncement': {
        const newAnn = {
          id: `ann-${Date.now()}`,
          title: payload.title,
          content: payload.content,
          targetType: payload.targetType || 'all',
          targetId: payload.targetId,
          createdBy: sessionUser.name,
          timestamp: new Date().toISOString()
        };
        db.announcements.unshift(newAnn);
        saveDb(db);
        logActivity(sessionUser.id, 'add_announcement', `Created announcement: ${payload.title}`);
        return NextResponse.json({ success: true });
      }
      case 'deleteAnnouncement': {
        db.announcements = db.announcements.filter(a => a.id !== payload.id);
        saveDb(db);
        logActivity(sessionUser.id, 'delete_announcement', `Deleted announcement ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      // --- CORE COMMITTEE HEAD DASHBOARD ACTIONS ---
      case 'getCommitteeTasks': {
        const tasks = db.committeeTasks.filter(t => t.committeeId === payload.committeeId);
        return NextResponse.json({ success: true, data: tasks });
      }
      case 'addCommitteeTask': {
        if (sessionUser.role !== 'CORE_HEAD' || sessionUser.committeeId !== payload.committeeId) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        const newTask = {
          id: `ct-${Date.now()}`,
          committeeId: payload.committeeId,
          title: payload.title,
          description: payload.description || '',
          status: payload.status || 'pending',
          assignedTo: payload.assignedTo || 'Unassigned',
          dueDate: payload.dueDate || ''
        };
        db.committeeTasks.push(newTask);
        saveDb(db);
        logActivity(sessionUser.id, 'add_task', `Created task: ${payload.title}`);
        return NextResponse.json({ success: true });
      }
      case 'updateCommitteeTask': {
        const taskIdx = db.committeeTasks.findIndex(t => t.id === payload.id);
        if (taskIdx === -1) return NextResponse.json({ success: false, error: 'Task not found.' });
        const task = db.committeeTasks[taskIdx];
        if (sessionUser.role !== 'CORE_HEAD' || sessionUser.committeeId !== task.committeeId) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        db.committeeTasks[taskIdx] = { ...task, ...payload.data };
        saveDb(db);
        return NextResponse.json({ success: true });
      }
      case 'deleteCommitteeTask': {
        const task = db.committeeTasks.find(t => t.id === payload.id);
        if (!task) return NextResponse.json({ success: false, error: 'Task not found.' });
        if (sessionUser.role !== 'CORE_HEAD' || sessionUser.committeeId !== task.committeeId) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        db.committeeTasks = db.committeeTasks.filter(t => t.id !== payload.id);
        saveDb(db);
        return NextResponse.json({ success: true });
      }
      case 'getCommitteeResources': {
        const res = db.committeeResources.filter(r => r.committeeId === payload.committeeId);
        return NextResponse.json({ success: true, data: res });
      }
      case 'addCommitteeResource': {
        if (sessionUser.role !== 'CORE_HEAD' || sessionUser.committeeId !== payload.committeeId) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        const newResource = {
          id: `cr-${Date.now()}`,
          committeeId: payload.committeeId,
          title: payload.title,
          description: payload.description || '',
          url: payload.url,
          type: payload.type || 'link'
        };
        db.committeeResources.push(newResource);
        saveDb(db);
        return NextResponse.json({ success: true });
      }
      case 'deleteCommitteeResource': {
        const res = db.committeeResources.find(r => r.id === payload.id);
        if (!res) return NextResponse.json({ success: false, error: 'Resource not found.' });
        if (sessionUser.role !== 'CORE_HEAD' || sessionUser.committeeId !== res.committeeId) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        db.committeeResources = db.committeeResources.filter(r => r.id !== payload.id);
        saveDb(db);
        return NextResponse.json({ success: true });
      }

      // --- VERTICAL HEAD DASHBOARD ACTIONS ---
      case 'getVerticalProjects': {
        const projs = db.verticalProjects.filter(p => p.verticalId === payload.verticalId);
        return NextResponse.json({ success: true, data: projs });
      }
      case 'addVerticalProject': {
        if (sessionUser.role !== 'VERTICAL_HEAD' || sessionUser.verticalId !== payload.verticalId) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        const newProj = {
          id: `vp-${Date.now()}`,
          verticalId: payload.verticalId,
          title: payload.title,
          description: payload.description || '',
          status: payload.status || 'planning',
          url: payload.url
        };
        db.verticalProjects.push(newProj);
        saveDb(db);
        return NextResponse.json({ success: true });
      }
      case 'updateVerticalProject': {
        const projIdx = db.verticalProjects.findIndex(p => p.id === payload.id);
        if (projIdx === -1) return NextResponse.json({ success: false, error: 'Project not found.' });
        const proj = db.verticalProjects[projIdx];
        if (sessionUser.role !== 'VERTICAL_HEAD' || sessionUser.verticalId !== proj.verticalId) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        db.verticalProjects[projIdx] = { ...proj, ...payload.data };
        saveDb(db);
        return NextResponse.json({ success: true });
      }
      case 'deleteVerticalProject': {
        const proj = db.verticalProjects.find(p => p.id === payload.id);
        if (!proj) return NextResponse.json({ success: false, error: 'Project not found.' });
        if (sessionUser.role !== 'VERTICAL_HEAD' || sessionUser.verticalId !== proj.verticalId) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        db.verticalProjects = db.verticalProjects.filter(p => p.id !== payload.id);
        saveDb(db);
        return NextResponse.json({ success: true });
      }
      case 'getVerticalResources': {
        const res = db.verticalResources.filter(r => r.verticalId === payload.verticalId);
        return NextResponse.json({ success: true, data: res });
      }
      case 'addVerticalResource': {
        if (sessionUser.role !== 'VERTICAL_HEAD' || sessionUser.verticalId !== payload.verticalId) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        const newRes = {
          id: `vr-${Date.now()}`,
          verticalId: payload.verticalId,
          title: payload.title,
          description: payload.description || '',
          url: payload.url,
          type: payload.type || 'link'
        };
        db.verticalResources.push(newRes);
        saveDb(db);
        return NextResponse.json({ success: true });
      }
      case 'deleteVerticalResource': {
        const res = db.verticalResources.find(r => r.id === payload.id);
        if (!res) return NextResponse.json({ success: false, error: 'Resource not found.' });
        if (sessionUser.role !== 'VERTICAL_HEAD' || sessionUser.verticalId !== res.verticalId) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        db.verticalResources = db.verticalResources.filter(r => r.id !== payload.id);
        saveDb(db);
        return NextResponse.json({ success: true });
      }
      case 'getVerticalAttendance': {
        const att = db.verticalAttendance.filter(a => a.verticalId === payload.verticalId);
        return NextResponse.json({ success: true, data: att });
      }
      case 'saveVerticalAttendance': {
        if (sessionUser.role !== 'VERTICAL_HEAD' || sessionUser.verticalId !== payload.verticalId) {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        const { date, records } = payload; // records: Array of { memberId, memberName, status }
        
        // Remove existing for this date
        db.verticalAttendance = db.verticalAttendance.filter(a => !(a.verticalId === payload.verticalId && a.date === date));

        records.forEach((rec: any) => {
          db.verticalAttendance.push({
            id: `at-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            verticalId: payload.verticalId,
            date,
            memberId: rec.memberId,
            memberName: rec.memberName,
            status: rec.status
          });
        });

        saveDb(db);
        logActivity(sessionUser.id, 'attendance_save', `Saved attendance for vertical ${payload.verticalId} on date ${date}`);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ success: false, error: `Action ${action} not supported.` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[API] Database actions handler error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
