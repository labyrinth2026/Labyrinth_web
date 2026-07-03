import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// A mutable flag to bypass Supabase queries once a connection attempt fails/times out
let isSupabaseOnline = true;

export const setSupabaseOffline = () => {
  isSupabaseOnline = false;
  if (typeof global !== 'undefined') {
    (global as any).isSupabaseOffline = true;
  }
};

export const getSupabaseStatus = () => {
  if (typeof global !== 'undefined' && (global as any).isSupabaseOffline) {
    return false;
  }
  return isSupabaseOnline;
};

// Check if credentials are valid (non-placeholder) and Supabase is online
export const isSupabaseConfigured = (): boolean => {
  if (
    process.env.FORCE_LOCAL_DB === 'true' || 
    process.env.NEXT_PUBLIC_FORCE_LOCAL_DB === 'true'
  ) {
    return false;
  }

  const online = getSupabaseStatus();
  return (
    online &&
    supabaseUrl.length > 0 &&
    !supabaseUrl.includes('YOUR_') &&
    supabaseAnonKey.length > 0 &&
    !supabaseAnonKey.includes('YOUR_')
  );
};

// Custom fetch wrapper that times out after 2 seconds
const fetchWithTimeout = async (url: string | URL | Request, options?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    setSupabaseOffline();
    console.warn("[Supabase Client] Network error or timeout. Falling back to local db.json.", error);
    throw error;
  }
};

// Client for standard browser or user operations
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: fetchWithTimeout
      }
    })
  : null;

// Admin Client (Service Role) for administrative authentication actions (e.g. invite, change role on user metadata)
export const getSupabaseAdmin = () => {
  if (isSupabaseConfigured() && serviceRoleKey && !serviceRoleKey.includes('YOUR_')) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        fetch: fetchWithTimeout
      }
    });
  }
  return null;
};


