/**
 * LABYRINTH - Google Apps Script Backend
 * 
 * INSTRUCTIONS:
 * 1. Create a new Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Copy and paste this entire file into Code.gs.
 * 4. Create the following Tabs/Sheets:
 *    - 'Events', 'Gallery', 'Verticals', 'Registrations'
 *    - 'FacultyCoordinators', 'Mentors', 'CoreCommittee', 'VerticalHeads', 'SubHeads'
 *    - 'JoinRequests' (for Join Community form submissions)
 *    - 'Roles' (columns: email, role, name)
 * 5. Add column headers to each sheet matching the data fields.
 *    JoinRequests headers: timestamp, name, email, phone, course, year, preferredVertical, reason
 * 6. Click Deploy > New Deployment.
 * 7. Select 'Web app'. Execute as: 'Me'. Who has access: 'Anyone'.
 * 8. Copy the Web App URL and paste it into `src/services/api.ts` in your React app.
 */

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doPost(e) {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const action = e.parameter.action;
    const payload = JSON.parse(e.postData.contents);
    let data;

    switch (action) {
      // --- READ OPERATIONS ---
      case 'getEvents':
        data = getSheetData('Events');
        break;
      case 'getTeam':
        // Returns structured object with categorized sub-arrays
        data = {
          facultyCoordinators: getSheetData('FacultyCoordinators'),
          mentors: getSheetData('Mentors'),
          coreCommittee: getSheetData('CoreCommittee'),
          verticalHeads: getSheetData('VerticalHeads'),
          subHeads: getSheetData('SubHeads')
        };
        break;
      case 'getGallery':
        data = getSheetData('Gallery');
        break;
      case 'getVerticals':
        data = getSheetData('Verticals');
        break;
      case 'getRegistrations':
        // Protected route - ensure payload has valid admin email
        if (!isAdmin(payload.userEmail)) throw new Error('Unauthorized');
        data = getSheetData('Registrations');
        break;
      case 'getJoinRegistrations':
        // View join form submissions - requires admin access
        if (!isAdmin(payload.userEmail)) throw new Error('Unauthorized');
        data = getSheetData('JoinRequests');
        break;
      case 'getRoles':
        // Allow tech_admin or faculty to view roles
        if (!isAdmin(payload.userEmail)) throw new Error('Unauthorized');
        data = getSheetData('Roles');
        break;

      // --- WRITE OPERATIONS ---
      case 'submitRegistration':
        data = appendRow('Registrations', payload.data);
        break;
      case 'submitJoinForm':
        // Public: anyone can submit a join community form
        data = appendRow('JoinRequests', payload.data);
        break;
      case 'updateEvent':
        if (!isAdmin(payload.userEmail)) throw new Error('Unauthorized');
        data = updateRow('Events', payload.id, payload.data);
        break;
      case 'addEvent':
        if (!isAdmin(payload.userEmail)) throw new Error('Unauthorized');
        data = appendRow('Events', payload.data);
        break;
      case 'deleteEvent':
        if (!isAdmin(payload.userEmail)) throw new Error('Unauthorized');
        data = deleteRow('Events', payload.id);
        break;

      // --- TEAM MANAGEMENT ---
      case 'addTeamMember': {
        if (!isAdmin(payload.userEmail)) throw new Error('Unauthorized');
        const teamSheet = payload.data.category === 'faculty'
          ? 'FacultyCoordinators'
          : payload.data.category === 'mentor'
          ? 'Mentors'
          : payload.data.category === 'core'
          ? 'CoreCommittee'
          : payload.data.category === 'head'
          ? 'VerticalHeads'
          : 'SubHeads';
        data = appendRow(teamSheet, payload.data);
        break;
      }
      case 'updateTeamMember': {
        if (!isAdmin(payload.userEmail)) throw new Error('Unauthorized');
        const editSheet = payload.data.category === 'faculty'
          ? 'FacultyCoordinators'
          : payload.data.category === 'mentor'
          ? 'Mentors'
          : payload.data.category === 'core'
          ? 'CoreCommittee'
          : payload.data.category === 'head'
          ? 'VerticalHeads'
          : 'SubHeads';
        data = updateRow(editSheet, payload.id, payload.data);
        break;
      }
      case 'deleteTeamMember': {
        if (!isAdmin(payload.userEmail)) throw new Error('Unauthorized');
        // Try all team sheets - member is in one of them
        let deleted = false;
        for (const s of ['FacultyCoordinators', 'Mentors', 'CoreCommittee', 'VerticalHeads', 'SubHeads']) {
          try { deleted = deleteRow(s, payload.id); if (deleted) break; } catch(e) {}
        }
        if (!deleted) throw new Error('Member not found');
        data = true;
        break;
      }

      // --- ROLE MANAGEMENT ---
      case 'addRole':
        if (!isAdmin(payload.userEmail)) throw new Error('Unauthorized');
        data = appendRow('Roles', payload.data);
        break;
      case 'updateRole':
        if (!isAdmin(payload.userEmail)) throw new Error('Unauthorized');
        data = updateRow('Roles', payload.id, payload.data);
        break;
      case 'deleteRole':
        if (!isAdmin(payload.userEmail)) throw new Error('Unauthorized');
        data = deleteRow('Roles', payload.id);
        break;

      default:
        throw new Error('Unknown action: ' + action);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, data: data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle OPTIONS request for CORS preflight
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

// --- HELPER FUNCTIONS ---

function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only headers or empty
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      // Parse boolean and JSON strings
      let val = row[index];
      if (val === 'TRUE') val = true;
      if (val === 'FALSE') val = false;
      try {
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          val = JSON.parse(val);
        }
      } catch(e) {}
      obj[header] = val;
    });
    return obj;
  });
}

function appendRow(sheetName, rowData) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet not found');
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(header => {
    let val = rowData[header];
    if (typeof val === 'object') return JSON.stringify(val);
    return val || '';
  });
  
  // Add timestamp if headers include it
  const tsIndex = headers.indexOf('timestamp');
  if (tsIndex > -1) newRow[tsIndex] = new Date().toISOString();
  
  sheet.appendRow(newRow);
  return true;
}

function updateRow(sheetName, id, rowData) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find row by ID
  const idIndex = headers.indexOf('id');
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === id) {
      rowIndex = i + 1; // +1 because sheet is 1-indexed
      break;
    }
  }
  
  if (rowIndex === -1) throw new Error('Record not found');
  
  const updateArr = headers.map(header => {
    let val = rowData[header];
    if (typeof val === 'object') return JSON.stringify(val);
    return val !== undefined ? val : data[rowIndex-1][headers.indexOf(header)];
  });
  
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updateArr]);
  return true;
}

function deleteRow(sheetName, id) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const idIndex = data[0].indexOf('id');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  throw new Error('Record not found');
}

function isAdmin(email) {
  // Check dynamically against the 'Roles' sheet
  try {
    const roles = getSheetData('Roles');
    const userRole = roles.find(r => r.email === email);
    if (userRole) {
      // For backend data modification endpoints, faculty and tech_admin and core_admin have write access
      // You can add more granular permissions per endpoint if desired.
      return true;
    }
  } catch (e) {
    // If 'Roles' sheet doesn't exist yet, fallback to hardcoded
  }
  const adminEmails = ['faculty@christ.edu', 'labyrinth@cs.christuniversity.in'];
  return adminEmails.includes(email);
}
