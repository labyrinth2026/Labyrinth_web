import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

let isSupabaseOnline = true;
let isSupabaseOfflineFlag = false;

export const setSupabaseOffline = (val: boolean = true) => {
  isSupabaseOfflineFlag = val;
  isSupabaseOnline = !val;
};

export const getSupabaseStatus = () => {
  return isSupabaseOnline && !isSupabaseOfflineFlag;
};

export const getSupabaseOffline = (): boolean => {
  return !getSupabaseStatus();
};

// Check if credentials are valid (non-placeholder) and configured
export const isSupabaseConfigured = (): boolean => {
  if (
    process.env.FORCE_LOCAL_DB === 'true' || 
    process.env.NEXT_PUBLIC_FORCE_LOCAL_DB === 'true'
  ) {
    return false;
  }

  return (
    supabaseUrl.length > 0 &&
    !supabaseUrl.includes('YOUR_') &&
    supabaseAnonKey.length > 0 &&
    !supabaseAnonKey.includes('YOUR_')
  );
};

// Client for standard browser or user operations
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin Client (Service Role) for administrative database & auth operations
export const getSupabaseAdmin = () => {
  if (isSupabaseConfigured() && serviceRoleKey && !serviceRoleKey.includes('YOUR_')) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return null;
};
