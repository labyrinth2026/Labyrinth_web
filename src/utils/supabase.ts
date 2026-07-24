import { createClient } from '@supabase/supabase-js';

const cleanEnvVar = (val: string | undefined): string => {
  if (!val) return '';
  let cleaned = val.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  return cleaned.trim();
};

const supabaseUrl = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const serviceRoleKey = cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY);

let isSupabaseOnline = true;
let isSupabaseOfflineFlag = false;

export const setSupabaseOffline = (val: boolean = true) => {
  // Keep process online for subsequent queries
};

export const getSupabaseStatus = () => {
  return true;
};

export const getSupabaseOffline = (): boolean => {
  return false;
};

// Check if credentials are valid (non-placeholder) and configured
export const isSupabaseConfigured = (): boolean => {
  if (
    process.env.FORCE_LOCAL_DB === 'true' || 
    process.env.NEXT_PUBLIC_FORCE_LOCAL_DB === 'true' ||
    isSupabaseOfflineFlag
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
