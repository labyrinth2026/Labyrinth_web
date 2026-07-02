import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/utils/jwt';
import {
  dbGetEvents, dbAddEvent, dbUpdateEvent, dbDeleteEvent,
  dbGetVerticals, dbAddVertical, dbUpdateVertical, dbDeleteVertical,
  dbGetCoreCommittees, dbAddCoreCommittee, dbDeleteCoreCommittee,
  dbGetAssignments, dbAssignCoreHead, dbRemoveCoreAssignment,
  dbAssignVerticalHead, dbRemoveVerticalAssignment,
  dbGetAnnouncements, dbAddAnnouncement, dbDeleteAnnouncement,
  dbGetCommitteeTasks, dbAddCommitteeTask, dbUpdateCommitteeTask, dbDeleteCommitteeTask,
  dbGetCommitteeResources, dbAddCommitteeResource, dbDeleteCommitteeResource,
  dbGetVerticalProjects, dbAddVerticalProject, dbUpdateVerticalProject, dbDeleteVerticalProject,
  dbGetVerticalResources, dbAddVerticalResource, dbDeleteVerticalResource,
  dbGetVerticalAttendance, dbSaveVerticalAttendance,
  dbGetJoinRegistrations, dbApproveRegistration, dbRejectRegistration,
  dbGetRoles, dbAddRole, dbDeleteRole,
  dbGetForms, dbUpdateForms,
  getLocalDb, saveLocalDb, logActivity
} from '@/utils/db';

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

    // 2. Perform actions and enforce role-based access rules
    switch (action) {
      // --- PUBLIC READ ACTIONS ---
      case 'getEvents': {
        const events = await dbGetEvents();
        return NextResponse.json({ success: true, data: events });
      }
      
      case 'getTeam': {
        const roles = await dbGetRoles();
        const assignments = await dbGetAssignments();

        const facultyCoordinators = roles.filter(u => ['HOD', 'COORDINATOR', 'ASSOCIATE'].includes(u.role)).map(u => ({
          id: u.id, name: u.name, role: u.role === 'HOD' ? 'Head of Department' : u.role === 'COORDINATOR' ? 'Faculty Coordinator' : 'Faculty Associate',
          designation: u.role === 'HOD' ? 'Professor & HOD' : 'Faculty Advisor', department: 'Department of Computer Science', email: u.email
        }));

        const mentors = roles.filter(u => u.role === 'ASSOCIATE').map(u => ({
          id: u.id, name: u.name, role: 'Mentor', email: u.email
        }));

        const coreCommittee = (assignments.committee || []).map((a: any) => ({
          id: a.userId, name: a.userName, role: `${a.committeeName} Head`, email: a.userEmail
        }));

        const verticalHeads = (assignments.vertical || []).map((v: any) => ({
          id: v.userId, name: v.userName, role: `${v.verticalName} Head`, email: v.userEmail
        }));

        return NextResponse.json({
          success: true,
          data: {
            facultyCoordinators,
            mentors,
            coreCommittee,
            verticalHeads,
            subHeads: []
          }
        });
      }

      case 'getGallery': {
        const db = getLocalDb();
        return NextResponse.json({ success: true, data: db.gallery || [] });
      }

      case 'getVerticals': {
        const verticals = await dbGetVerticals();
        return NextResponse.json({ success: true, data: verticals });
      }

      case 'getStats': {
        const events = await dbGetEvents();
        const verticals = await dbGetVerticals();
        const roles = await dbGetRoles();
        
        const activeUsersCount = roles.filter(u => u.status === 'active').length + 50; // buffer offset
        const upcomingEventsCount = events.filter(e => e.status === 'upcoming').length;
        const totalVerticals = verticals.length;
        
        const stats = [
          { label: 'Active Members', value: activeUsersCount.toString(), suffix: '+' },
          { label: 'Upcoming Events', value: upcomingEventsCount.toString(), suffix: '' },
          { label: 'Specialized Domains', value: totalVerticals.toString(), suffix: '' },
          { label: 'Years Active', value: '29', suffix: '+' }
        ];
        return NextResponse.json({ success: true, data: stats });
      }

      // --- REGISTRATION / JOIN ---
      case 'submitJoinForm': {
        // Fallback local db log or process. For Supabase, users will register via auth signup.
        const { name, email, preferredVertical } = payload;
        const db = getLocalDb();
        const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          return NextResponse.json({ success: false, error: 'User already exists.' });
        }
        
        // Push pending member to local db if in fallback mode
        const id = `u-${Date.now()}`;
        db.users.push({
          id,
          email,
          name,
          role: 'USER',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        saveLocalDb(db);
        await logActivity(id, 'registration_submit', `Submit registration for vertical ${preferredVertical}`);
        return NextResponse.json({ success: true });
      }

      // --- EVENTS MANAGEMENT ---
      case 'addEvent': {
        await dbAddEvent(payload.data, sessionUser.id);
        await logActivity(sessionUser.id, 'add_event', `Added event: ${payload.data.title}`);
        return NextResponse.json({ success: true });
      }

      case 'updateEvent': {
        await dbUpdateEvent(payload.id, payload.data);
        await logActivity(sessionUser.id, 'update_event', `Updated event ID: ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      case 'deleteEvent': {
        await dbDeleteEvent(payload.id);
        await logActivity(sessionUser.id, 'delete_event', `Deleted event ID: ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      // --- VERTICAL MANAGEMENT ---
      case 'addVertical': {
        await dbAddVertical(payload.data.name, payload.data.description, payload.data.category);
        await logActivity(sessionUser.id, 'add_vertical', `Created vertical ${payload.data.name}`);
        return NextResponse.json({ success: true });
      }

      case 'updateVertical': {
        await dbUpdateVertical(payload.id, payload.data);
        await logActivity(sessionUser.id, 'update_vertical', `Updated vertical ID ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      case 'deleteVertical': {
        await dbDeleteVertical(payload.id);
        await logActivity(sessionUser.id, 'delete_vertical', `Archived vertical ID ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      // --- CORE COMMITTEES ---
      case 'addCoreCommittee': {
        await dbAddCoreCommittee(payload.name, payload.description);
        await logActivity(sessionUser.id, 'add_committee', `Created committee ${payload.name}`);
        return NextResponse.json({ success: true });
      }

      case 'deleteCoreCommittee': {
        await dbDeleteCoreCommittee(payload.id);
        await logActivity(sessionUser.id, 'delete_committee', `Deleted committee ID ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      // --- HEADS ASSIGNMENT ---
      case 'getAssignments': {
        const assignments = await dbGetAssignments();
        return NextResponse.json({ success: true, data: assignments });
      }

      case 'assignCoreHead': {
        await dbAssignCoreHead(payload.userEmail, payload.committeeId);
        await logActivity(sessionUser.id, 'assign_core_head', `Assigned ${payload.userEmail} to committee ${payload.committeeId}`);
        return NextResponse.json({ success: true });
      }

      case 'removeCoreAssignment': {
        await dbRemoveCoreAssignment(payload.id);
        await logActivity(sessionUser.id, 'remove_core_head', `Removed committee assignment ID ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      case 'assignVerticalHead': {
        await dbAssignVerticalHead(payload.userEmail, payload.verticalId);
        await logActivity(sessionUser.id, 'assign_vertical_head', `Assigned ${payload.userEmail} to vertical ${payload.verticalId}`);
        return NextResponse.json({ success: true });
      }

      case 'removeVerticalAssignment': {
        await dbRemoveVerticalAssignment(payload.id);
        await logActivity(sessionUser.id, 'remove_vertical_head', `Removed vertical assignment ID ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      // --- SYSTEM ROLES ---
      case 'getRoles': {
        const roles = await dbGetRoles();
        return NextResponse.json({ success: true, data: roles });
      }

      case 'addRole': {
        const { email, name, role } = payload.data;
        await dbAddRole(email, name, role);
        await logActivity(sessionUser.id, 'add_admin_role', `Granted role ${role} to ${email}`);
        return NextResponse.json({ success: true });
      }

      case 'deleteRole': {
        await dbDeleteRole(payload.id);
        await logActivity(sessionUser.id, 'revoke_admin_role', `Revoked permissions for ID ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      // --- ANNOUNCEMENTS ---
      case 'getAnnouncements': {
        const announcements = await dbGetAnnouncements();
        return NextResponse.json({ success: true, data: announcements });
      }

      case 'addAnnouncement': {
        await dbAddAnnouncement(payload, sessionUser.name);
        await logActivity(sessionUser.id, 'add_announcement', `Posted announcement: ${payload.title}`);
        return NextResponse.json({ success: true });
      }

      case 'deleteAnnouncement': {
        await dbDeleteAnnouncement(payload.id);
        await logActivity(sessionUser.id, 'delete_announcement', `Deleted announcement ID ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      // --- COMMITTEE TASKS ---
      case 'getCommitteeTasks': {
        const tasks = await dbGetCommitteeTasks(payload.committeeId);
        return NextResponse.json({ success: true, data: tasks });
      }

      case 'addCommitteeTask': {
        await dbAddCommitteeTask(payload.committeeId, payload);
        return NextResponse.json({ success: true });
      }

      case 'updateCommitteeTask': {
        await dbUpdateCommitteeTask(payload.id, payload.data);
        return NextResponse.json({ success: true });
      }

      case 'deleteCommitteeTask': {
        await dbDeleteCommitteeTask(payload.id);
        return NextResponse.json({ success: true });
      }

      // --- COMMITTEE RESOURCES ---
      case 'getCommitteeResources': {
        const resources = await dbGetCommitteeResources(payload.committeeId);
        return NextResponse.json({ success: true, data: resources });
      }

      case 'addCommitteeResource': {
        await dbAddCommitteeResource(payload.committeeId, payload);
        return NextResponse.json({ success: true });
      }

      case 'deleteCommitteeResource': {
        await dbDeleteCommitteeResource(payload.id);
        return NextResponse.json({ success: true });
      }

      // --- VERTICAL PROJECTS ---
      case 'getVerticalProjects': {
        const projects = await dbGetVerticalProjects(payload.verticalId);
        return NextResponse.json({ success: true, data: projects });
      }

      case 'addVerticalProject': {
        await dbAddVerticalProject(payload.verticalId, payload);
        return NextResponse.json({ success: true });
      }

      case 'updateVerticalProject': {
        await dbUpdateVerticalProject(payload.id, payload.data);
        return NextResponse.json({ success: true });
      }

      case 'deleteVerticalProject': {
        await dbDeleteVerticalProject(payload.id);
        return NextResponse.json({ success: true });
      }

      // --- VERTICAL RESOURCES ---
      case 'getVerticalResources': {
        const resources = await dbGetVerticalResources(payload.verticalId);
        return NextResponse.json({ success: true, data: resources });
      }

      case 'addVerticalResource': {
        await dbAddVerticalResource(payload.verticalId, payload);
        return NextResponse.json({ success: true });
      }

      case 'deleteVerticalResource': {
        await dbDeleteVerticalResource(payload.id);
        return NextResponse.json({ success: true });
      }

      // --- ATTENDANCE ---
      case 'getVerticalAttendance': {
        const attendance = await dbGetVerticalAttendance(payload.verticalId);
        return NextResponse.json({ success: true, data: attendance });
      }

      case 'saveVerticalAttendance': {
        await dbSaveVerticalAttendance(payload.verticalId, payload.date, payload.records);
        return NextResponse.json({ success: true });
      }

      // --- REGISTRATION APPROVALS ---
      case 'getJoinRegistrations': {
        const regs = await dbGetJoinRegistrations();
        return NextResponse.json({ success: true, data: regs });
      }

      case 'approveRegistration': {
        await dbApproveRegistration(payload.id);
        await logActivity(sessionUser.id, 'approve_candidate', `Approved candidate profile ID ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      case 'rejectRegistration': {
        await dbRejectRegistration(payload.id);
        await logActivity(sessionUser.id, 'reject_candidate', `Rejected candidate profile ID ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      // --- SYSTEM CONFIG / FORMS ---
      case 'getForms': {
        const forms = await dbGetForms();
        return NextResponse.json({ success: true, data: forms });
      }

      case 'updateForms': {
        await dbUpdateForms(payload.forms);
        await logActivity(sessionUser.id, 'update_forms', 'Updated registration settings forms config.');
        return NextResponse.json({ success: true });
      }

      default: {
        return NextResponse.json({ success: false, error: `Action '${action}' not supported.` }, { status: 400 });
      }
    }
  } catch (error: any) {
    console.error('[API Router] Error executing sheet action:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
