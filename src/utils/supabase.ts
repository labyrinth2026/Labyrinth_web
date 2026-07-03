import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// A mutable flag to bypass Supabase queries once a connection attempt fails/times out
let isSupabaseOnline = true;
let isSupabaseOfflineFlag = false;

export const setSupabaseOffline = (val: boolean = true) => {
  isSupabaseOfflineFlag = val;
  if (val) {
    isSupabaseOnline = false;
  } else {
    isSupabaseOnline = true;
  }
};

export const getSupabaseStatus = () => {
  return isSupabaseOnline;
};

export const getSupabaseOffline = (): boolean => {
  return isSupabaseOfflineFlag || !isSupabaseOnline;
};

// Check if credentials are valid (non-placeholder) and Supabase is online
export const isSupabaseConfigured = (): boolean => {
  return (
    isSupabaseOnline &&
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
    isSupabaseOnline = false;
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

