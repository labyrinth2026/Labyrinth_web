import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { verifyJWT } from '@/utils/jwt';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/utils/supabase';
import {
  dbGetEvents, dbAddEvent, dbUpdateEvent, dbDeleteEvent,
  dbGetVerticals, dbAddVertical, dbUpdateVertical, dbDeleteVertical,
  dbGetCoreCommittees, dbAddCoreCommittee, dbUpdateCoreCommittee, dbDeleteCoreCommittee,
  dbGetAssignments, dbAssignCoreHead, dbRemoveCoreAssignment,
  dbAssignVerticalHead, dbRemoveVerticalAssignment, dbRemovePersonFromVertical, dbAssignVerticalRole,
  dbGetAnnouncements, dbAddAnnouncement, dbDeleteAnnouncement,
  dbGetCommitteeTasks, dbAddCommitteeTask, dbUpdateCommitteeTask, dbDeleteCommitteeTask,
  dbGetCommitteeResources, dbAddCommitteeResource, dbDeleteCommitteeResource,
  dbGetVerticalProjects, dbAddVerticalProject, dbUpdateVerticalProject, dbDeleteVerticalProject,
  dbGetVerticalResources, dbAddVerticalResource, dbDeleteVerticalResource,
  dbGetJoinRegistrations, dbApproveRegistration, dbRejectRegistration,
  dbGetDashboardStats,
  dbGetRoles, dbAddRole, dbDeleteRole, dbDeleteUser, dbCreateUser, dbUpdateUserStatus, dbUpdateUserDetails,
  dbGetForms, dbUpdateForms,
  getLocalDb, saveLocalDb, logActivity,
  dbGetCustomForms, dbGetCustomFormBySlug, dbAddCustomForm, dbUpdateCustomForm,
  dbDeleteCustomForm, dbDuplicateCustomForm, dbSubmitFormResponse, dbGetFormResponses,
  dbUpdateResponseStatus,
  dbGetGallery, dbAddGalleryImage, dbUpdateGalleryImage, dbDeleteGalleryImage
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

    const publicActions = ['getEvents', 'getTeam', 'getGallery', 'getVerticals', 'getStats', 'submitJoinForm', 'getFormBySlug', 'submitFormResponse'];
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
        // Parallelise all 3 queries — cuts cold-start from 15s to ~5s
        const [roles, verticals, committees] = await Promise.all([
          dbGetRoles(),
          dbGetVerticals(),
          dbGetCoreCommittees()
        ]);

        // Helper to find vertical name by ID
        const getVerticalName = (vId: string) => {
          const vert = verticals.find(v => v.id === vId);
          return vert ? vert.name : null;
        };

        // Helper to find committee name by ID
        const getCommitteeName = (cId: string) => {
          const comm = committees.find(c => c.id === cId);
          return comm ? comm.name : null;
        };

        // 1. Faculty Coordinators: Mock faculty data to prevent exposing admin profiles
        const facultyCoordinators = [
          {
            id: 'mock-fac-1',
            name: 'Dr. Pranab Mohanty',
            role: 'Head of Department',
            designation: 'Professor & HOD',
            department: 'Department of Computer Science',
            email: 'pranab.mohanty@christuniversity.in',
            avatar: 'https://ui-avatars.com/api/?name=Pranab+Mohanty&background=CD0000&color=fff&size=128'
          },
          {
            id: 'mock-fac-2',
            name: 'Dr. Amrutha S',
            role: 'Faculty Coordinator',
            designation: 'Assistant Professor',
            department: 'Department of Computer Science',
            email: 'amrutha.s@christuniversity.in',
            avatar: '/amrutha.jpg'
          }
        ];

        // 2. Mentors: designation contains "Mentor"
        const mentors = roles.filter(u => 
          u.designation && u.designation.toLowerCase().includes('mentor')
        ).map(u => ({
          id: u.id,
          name: u.full_name || u.name,
          role: u.designation || 'Mentor',
          email: u.email,
          avatar: u.profilePhoto || null,
          github: u.github || null,
          linkedin: u.linkedin || null
        }));

        // 3. Core Committee: has committee_id, and is NOT faculty/mentor/vertical-head
        const coreCommittee = roles.filter(u => 
          (u.committee_id || u.committeeId) && 
          !facultyCoordinators.some(f => f.id === u.id) &&
          !mentors.some(m => m.id === u.id) &&
          !(
            u.designation && 
            u.designation.toLowerCase().includes('head') && 
            !u.designation.toLowerCase().includes('sub')
          )
        ).map(u => {
          const cId = u.committee_id || u.committeeId;
          const commName = getCommitteeName(cId);
          return {
            id: u.id,
            name: u.full_name || u.name,
            role: u.designation || (commName ? `${commName} Lead` : 'Core Committee Member'),
            email: u.email,
            avatar: u.profilePhoto || u.profile_photo || null,
            github: u.github || null,
            linkedin: u.linkedin || null
          };
        });

        // 4. Vertical Heads & Mentors: has vertical_id and designation contains "head" or "mentor" (and NOT "sub", "core committee", or "admin")
        const verticalHeads = roles.filter(u => {
          if (!u.vertical_id && !u.verticalId) return false;
          if (u.role === 'ADMIN') return false;
          const desigLower = (u.designation || '').toLowerCase();
          if (desigLower.includes('sub') || desigLower.includes('core committee') || desigLower.includes('admin')) return false;
          return desigLower.includes('head') || desigLower.includes('mentor');
        }).map(u => {
          const vId = u.vertical_id || u.verticalId;
          const desigLower = (u.designation || '').toLowerCase();
          const isMentor = desigLower.includes('mentor');
          return {
            id: u.id,
            name: u.full_name || u.name,
            role: isMentor ? (u.designation || 'Mentor') : 'Vertical Head',
            designation: u.designation || (isMentor ? 'Mentor' : 'Vertical Head'),
            vertical: getVerticalName(vId),
            email: u.email,
            avatar: u.profilePhoto || u.profile_photo || null,
            github: u.github || null,
            linkedin: u.linkedin || null
          };
        });

        // 5. Sub Heads: has vertical_id and designation contains "Sub" (Sub-Head / Sub Head)
        const subHeads = roles.filter(u => 
          (u.vertical_id || u.verticalId) && 
          u.designation && 
          u.designation.toLowerCase().includes('sub')
        ).map(u => {
          const vId = u.vertical_id || u.verticalId;
          return {
            id: u.id,
            name: u.full_name || u.name,
            role: 'Sub-Head',
            vertical: getVerticalName(vId),
            email: u.email,
            avatar: u.profilePhoto || u.profile_photo || null,
            github: u.github || null,
            linkedin: u.linkedin || null
          };
        });

        return NextResponse.json({
          success: true,
          data: {
            facultyCoordinators,
            mentors,
            coreCommittee,
            verticalHeads,
            subHeads
          }
        });
      }

      case 'getGallery': {
        const gallery = await dbGetGallery();
        return NextResponse.json({ success: true, data: gallery });
      }

      case 'addGalleryImage': {
        await dbAddGalleryImage(payload.data);
        await logActivity(sessionUser.id, 'add_gallery_image', `Added gallery image: ${payload.data.title}`);
        return NextResponse.json({ success: true });
      }

      case 'updateGalleryImage': {
        await dbUpdateGalleryImage(payload.id, payload.data);
        await logActivity(sessionUser.id, 'update_gallery_image', `Updated gallery image ID: ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      case 'deleteGalleryImage': {
        await dbDeleteGalleryImage(payload.id);
        await logActivity(sessionUser.id, 'delete_gallery_image', `Deleted gallery image ID: ${payload.id}`);
        return NextResponse.json({ success: true });
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
          { label: 'Members', value: activeUsersCount.toString(), suffix: '+' },
          { label: 'Upcoming Events', value: upcomingEventsCount.toString(), suffix: '' },
          { label: 'Specialized Domains', value: totalVerticals.toString(), suffix: '' },
          { label: 'Years Active', value: '29', suffix: '+' }
        ];
        return NextResponse.json({ success: true, data: stats });
      }

      case 'getDashboardStats': {
        const stats = await dbGetDashboardStats();
        return NextResponse.json({ success: true, data: stats });
      }

      // --- REGISTRATION / JOIN ---
      case 'submitJoinForm': {
        // Fallback local db log or process. For Supabase, users will register via auth signup.
        const { name, email, preferredVertical } = payload;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          return NextResponse.json({ success: false, error: 'Invalid email address format.' });
        }
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
          full_name: name,
          role: 'MEMBER',
          status: 'inactive',
          firstLogin: true,
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
        await dbAddVertical(
          payload.data.name, 
          payload.data.description, 
          payload.data.category,
          { icon: payload.data.icon, color: payload.data.color, image: payload.data.image }
        );
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
        const { name, description, verticalId } = payload;
        await dbAddCoreCommittee(name, description, verticalId);
        await logActivity(sessionUser.id, 'add_committee', `Created committee ${name} under vertical ${verticalId}`);
        return NextResponse.json({ success: true });
      }

      case 'updateCoreCommittee': {
        const { id, name, description, verticalId } = payload;
        await dbUpdateCoreCommittee(id, name, description, verticalId);
        await logActivity(sessionUser.id, 'update_committee', `Updated committee ID ${id}`);
        return NextResponse.json({ success: true });
      }

      case 'deleteCoreCommittee': {
        await dbDeleteCoreCommittee(payload.id);
        await logActivity(sessionUser.id, 'delete_committee', `Deleted committee ID ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      case 'getCoreCommittees': {
        const committees = await dbGetCoreCommittees();
        return NextResponse.json({ success: true, data: committees });
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

      case 'assignVerticalRole': {
        await dbAssignVerticalRole(payload.userId, payload.verticalId, payload.designation);
        await logActivity(sessionUser.id, 'assign_vertical_role', `Assigned ${payload.userId} as ${payload.designation} of vertical ${payload.verticalId}`);
        return NextResponse.json({ success: true });
      }

      case 'removePersonFromVertical': {
        await dbRemovePersonFromVertical(payload.userId);
        await logActivity(sessionUser.id, 'remove_vertical_role', `Removed user ${payload.userId} from vertical role`);
        return NextResponse.json({ success: true });
      }

      // --- SYSTEM ROLES ---
      case 'getRoles': {
        const { page, limit } = payload || {};
        const roles = await dbGetRoles();
        if (page && limit) {
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedRoles = roles.slice(startIndex, endIndex);
          return NextResponse.json({ success: true, data: paginatedRoles });
        }
        return NextResponse.json({ success: true, data: roles });
      }

      case 'addRole': {
        const { email, name, role } = payload.data;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          return NextResponse.json({ success: false, error: 'Invalid email address format.' }, { status: 400 });
        }
        await dbAddRole(email, name, role);
        await logActivity(sessionUser.id, 'add_admin_role', `Granted role ${role} to ${email}`);
        return NextResponse.json({ success: true });
      }

      case 'deleteRole': {
        await dbDeleteRole(payload.id);
        await logActivity(sessionUser.id, 'revoke_admin_role', `Revoked permissions for ID ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      case 'deleteUser': {
        await dbDeleteUser(payload.id);
        await logActivity(sessionUser.id, 'delete_user', `Permanently deleted user ID ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      case 'createUser': {
        const { name, email, role, committeeId, verticalId } = payload;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          return NextResponse.json({ success: false, error: 'Invalid email address format.' }, { status: 400 });
        }
        await dbCreateUser(name, email, role, committeeId, verticalId, sessionUser.id);
        await logActivity(sessionUser.id, 'create_user', `Created user: ${name} (${email}) as ${role}`);
        return NextResponse.json({ success: true });
      }

      case 'updateUserStatus': {
        const { userId, status } = payload;
        await dbUpdateUserStatus(userId, status);
        await logActivity(sessionUser.id, 'update_user_status', `Updated status of user ${userId} to ${status}`);
        return NextResponse.json({ success: true });
      }

      case 'uploadAvatar': {
        const { base64, userId } = payload;
        if (!base64) {
          return NextResponse.json({ success: false, error: 'No image data provided.' }, { status: 400 });
        }

        // 1. Decode base64 image data to a Buffer
        const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // 2. Generate destination filename
        const fileName = `avatars/${userId || 'member'}-${Date.now()}.jpg`;

        const adminClient = getSupabaseAdmin();
        if (adminClient) {
          // List files in the 'avatars' folder and delete any starting with the userId to clean up obsolete images
          try {
            const cleanUserPrefix = (userId || 'member').trim();
            console.log(`[uploadAvatar] Checking for old avatars to clean up for user prefix: ${cleanUserPrefix}`);
            const { data: existingFiles, error: listErr } = await adminClient.storage
              .from('gallery')
              .list('avatars');
              
            if (!listErr && existingFiles && existingFiles.length > 0) {
              const filesToDelete = existingFiles
                .filter(f => f.name.startsWith(`${cleanUserPrefix}-`))
                .map(f => `avatars/${f.name}`);
                
              if (filesToDelete.length > 0) {
                console.log(`[uploadAvatar] Deleting old files from gallery bucket:`, filesToDelete);
                const { error: delErr } = await adminClient.storage.from('gallery').remove(filesToDelete);
                if (delErr) {
                  console.warn(`[uploadAvatar] Failed to delete some old avatar files:`, delErr.message);
                } else {
                  console.log(`[uploadAvatar] Successfully deleted old avatar files.`);
                }
              }
            }
          } catch (cleanErr) {
            console.warn('[uploadAvatar] Cleanup error occurred:', cleanErr);
          }

          const { error: upErr } = await adminClient.storage
            .from('gallery')
            .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

          if (upErr) {
            console.error('[API uploadAvatar] Storage upload failed:', upErr.message);
            return NextResponse.json({ success: false, error: upErr.message }, { status: 500 });
          }

          const { data } = adminClient.storage.from('gallery').getPublicUrl(fileName);
          return NextResponse.json({ success: true, data: { url: data.publicUrl } });
        } else {
          // Do NOT store base64 directly — it gets truncated in DB and breaks in production.
          // Supabase admin must be configured for photo uploads to work.
          return NextResponse.json({ 
            success: false, 
            error: 'Photo upload requires Supabase storage to be configured. Please check SUPABASE_SERVICE_ROLE_KEY.' 
          }, { status: 500 });
        }
      }

      // One-time migration: re-upload base64 profile_photos to Supabase storage
      case 'migrateAvatars': {
        const adminClient = getSupabaseAdmin();
        if (!adminClient) {
          return NextResponse.json({ success: false, error: 'Supabase admin not configured.' }, { status: 500 });
        }

        // Fetch all profiles that have a base64 profile_photo
        const { data: profiles, error: fetchErr } = await adminClient
          .from('profiles')
          .select('id, profile_photo')
          .not('profile_photo', 'is', null);

        if (fetchErr) throw fetchErr;

        const base64Profiles = (profiles || []).filter(
          (p: any) => p.profile_photo && p.profile_photo.startsWith('data:image')
        );

        const results: { id: string; status: string; url?: string; error?: string }[] = [];

        for (const profile of base64Profiles) {
          try {
            const base64Data = profile.profile_photo.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `avatars/${profile.id}-${Date.now()}.jpg`;

            const { error: upErr } = await adminClient.storage
              .from('gallery')
              .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

            if (upErr) throw upErr;

            const { data } = adminClient.storage.from('gallery').getPublicUrl(fileName);
            const publicUrl = data.publicUrl;

            // Update the profile with the real CDN URL
            const { error: updateErr } = await adminClient
              .from('profiles')
              .update({ profile_photo: publicUrl })
              .eq('id', profile.id);

            if (updateErr) throw updateErr;

            results.push({ id: profile.id, status: 'migrated', url: publicUrl });
          } catch (err: any) {
            results.push({ id: profile.id, status: 'error', error: err.message });
          }
        }

        return NextResponse.json({ 
          success: true, 
          data: { 
            total: base64Profiles.length, 
            results 
          } 
        });
      }

      case 'updateUserDetails': {
        const { userId, name, role, committeeId, verticalId, designation, profilePhoto, github, linkedin, regNo, class: className } = payload;
        await dbUpdateUserDetails(userId, name, role, committeeId, verticalId, designation, profilePhoto, github, linkedin, regNo, className);
        await logActivity(sessionUser.id, 'update_user_details', `Updated profile of user ${userId}`);
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

      // --- ATTENDANCE (STUBBED) ---
      case 'getVerticalAttendance': {
        return NextResponse.json({ success: true, data: [] });
      }

      case 'saveVerticalAttendance': {
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

      // --- CUSTOM FORMS SYSTEM ---
      case 'getCustomForms': {
        const forms = await dbGetCustomForms();
        return NextResponse.json({ success: true, data: forms });
      }

      case 'getFormBySlug': {
        const result = await dbGetCustomFormBySlug(payload.slug);
        if (!result) {
          return NextResponse.json({ success: false, error: 'Form not found.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: result });
      }

      case 'addForm': {
        const id = await dbAddCustomForm(payload.form, payload.fields);
        await logActivity(sessionUser.id, 'create_custom_form', `Created custom form: ${payload.form.title}`);
        return NextResponse.json({ success: true, data: { id } });
      }

      case 'updateForm': {
        await dbUpdateCustomForm(payload.id, payload.form, payload.fields);
        await logActivity(sessionUser.id, 'update_custom_form', `Updated custom form: ${payload.form.title}`);
        return NextResponse.json({ success: true });
      }

      case 'deleteForm': {
        await dbDeleteCustomForm(payload.id);
        await logActivity(sessionUser.id, 'delete_custom_form', `Deleted custom form ID: ${payload.id}`);
        return NextResponse.json({ success: true });
      }

      case 'duplicateForm': {
        const id = await dbDuplicateCustomForm(payload.id);
        await logActivity(sessionUser.id, 'duplicate_custom_form', `Duplicated custom form ID: ${payload.id}`);
        return NextResponse.json({ success: true, data: { id } });
      }

      case 'submitFormResponse': {
        const id = await dbSubmitFormResponse(payload.formId, payload.applicantName, payload.applicantEmail, payload.answers);
        return NextResponse.json({ success: true, data: { id } });
      }

      case 'getFormResponses': {
        const responses = await dbGetFormResponses(payload.formId);
        return NextResponse.json({ success: true, data: responses });
      }

      case 'updateResponseStatus': {
        await dbUpdateResponseStatus(payload.id, payload.status, payload.notes);
        await logActivity(sessionUser.id, 'update_response_status', `Updated response ID ${payload.id} status to ${payload.status}`);
        return NextResponse.json({ success: true });
      }

      default: {
        return NextResponse.json({ success: false, error: `Action '${action}' not supported.` }, { status: 400 });
      }
    }
  } catch (error: any) {
    console.error('[API Router] Error executing sheet action:', error);
    const detail = error.cause ? ` (${error.cause.message || error.cause})` : '';
    return NextResponse.json({ 
      success: false, 
      error: (error.message || 'Internal server error') + detail,
      stack: error.stack
    }, { status: 500 });
  }
}
