// Replace this with your actual Google Apps Script Web App URL after deployment
export const GAS_API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Hydrate data from JSON files into localStorage if they don't exist
const initLocalStorage = async (key: string, dataResolver: () => Promise<any>) => {
  if (typeof window === 'undefined') return null;
  const existing = localStorage.getItem(`labyrinth_${key}`);
  if (!existing) {
    try {
      const data = await dataResolver();
      localStorage.setItem(`labyrinth_${key}`, JSON.stringify(data));
      return data;
    } catch (e) {
      console.error(`Failed to hydrate ${key}`, e);
      return null;
    }
  }
  return JSON.parse(existing);
};

// Universal fetch function to Google Apps Script (or localStorage fallback)
export const fetchFromSheet = async <T>(action: string, payload: any = {}): Promise<T> => {
  if (GAS_API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    return fetchLocalData(action, payload) as Promise<T>;
  }

  try {
    const response = await fetch(`${GAS_API_URL}?action=${action}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) throw new Error(result.error);
    return result.data as T;
  } catch (error) {
    console.error(`Error fetching ${action}:`, error);
    throw error;
  }
};

// Fallback method to act as a local backend using localStorage
const fetchLocalData = async (action: string, payload?: any) => {
  // Helpers for CRUD
  const getStored = async (key: string, jsonModule: () => Promise<any>) => 
    initLocalStorage(key, async () => (await jsonModule()).default);

  const saveStored = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`labyrinth_${key}`, JSON.stringify(data));
    }
  };

  // Data Loading Mapping
  const dataLoaders: Record<string, () => Promise<any>> = {
    events: () => import('../data/events.json'),
    team: () => import('../data/team.json'),
    gallery: () => import('../data/gallery.json'),
    verticals: () => import('../data/verticals.json'),
    stats: () => import('../data/stats.json'),
    forms: () => import('../data/forms.json'),
  };

  switch (action) {
    // --- READ OPERATIONS ---
    case 'getEvents': return getStored('events', dataLoaders.events);
    case 'getTeam': return getStored('team', dataLoaders.team);
    case 'getGallery': return getStored('gallery', dataLoaders.gallery);
    case 'getVerticals': return getStored('verticals', dataLoaders.verticals);
    case 'getStats': return getStored('stats', dataLoaders.stats);
    case 'getForms': return getStored('forms', dataLoaders.forms);
    case 'getRoles': return [];

    // --- FORMS ---
    case 'updateForms': {
      if (payload?.forms) saveStored('forms', payload.forms);
      return { success: true };
    }

    // --- TEAM MEMBERS ---
    case 'addTeamMember':
    case 'updateTeamMember': {
      const data = await getStored('team', dataLoaders.team);
      const cat = payload.data.category; // 'faculty', 'leadership', 'vertical_head'
      const keyMap: any = { faculty: 'facultyCoordinators', leadership: 'studentLeadership', vertical_head: 'verticalHeads', sub_head: 'subHeads' };
      const listKey = keyMap[cat];
      
      if (!data[listKey]) data[listKey] = [];
      const list = data[listKey];

      if (action === 'updateTeamMember') {
        const idx = list.findIndex((m: any) => m.id === payload.id);
        if (idx !== -1) list[idx] = { ...list[idx], ...payload.data };
      } else {
        list.push({ ...payload.data, id: payload.data.id || `m${Date.now()}` });
      }
      saveStored('team', data);
      return { success: true };
    }
    case 'deleteTeamMember': {
      const data = await getStored('team', dataLoaders.team);
      ['facultyCoordinators', 'studentLeadership', 'verticalHeads', 'subHeads', 'coreCommittee', 'mentors'].forEach(key => {
        if (data[key]) data[key] = data[key].filter((m: any) => m.id !== payload.id);
      });
      saveStored('team', data);
      return { success: true };
    }

    // --- EVENTS ---
    case 'addEvent':
    case 'updateEvent': {
      const events = await getStored('events', dataLoaders.events);
      if (action === 'updateEvent') {
        const idx = events.findIndex((e: any) => e.id === payload.id);
        if (idx !== -1) events[idx] = { ...events[idx], ...payload.data };
      } else {
        events.push({ ...payload.data, id: payload.data.id || `evt${Date.now()}` });
      }
      saveStored('events', events);
      return { success: true };
    }
    case 'deleteEvent': {
      let events = await getStored('events', dataLoaders.events);
      events = events.filter((e: any) => e.id !== payload.id);
      saveStored('events', events);
      return { success: true };
    }

    // --- VERTICALS ---
    case 'addVertical':
    case 'updateVertical': {
      const verticals = await getStored('verticals', dataLoaders.verticals);
      if (action === 'updateVertical') {
        const idx = verticals.findIndex((v: any) => v.id === payload.id);
        if (idx !== -1) verticals[idx] = { ...verticals[idx], ...payload.data };
      } else {
        verticals.push({ ...payload.data, id: payload.data.id || `v${Date.now()}` });
      }
      saveStored('verticals', verticals);
      return { success: true };
    }
    case 'deleteVertical': {
      let verticals = await getStored('verticals', dataLoaders.verticals);
      verticals = verticals.filter((v: any) => v.id !== payload.id);
      saveStored('verticals', verticals);
      return { success: true };
    }

    case 'submitJoinForm': return { success: true };
    case 'getJoinRegistrations': return [];

    default:
      console.warn(`[DEV] Unknown action: ${action}`);
      return [];
  }
};
