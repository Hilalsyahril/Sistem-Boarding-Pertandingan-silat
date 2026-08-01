import { createClient } from '@supabase/supabase-js';

// Supabase configuration for frontend and backend usage
const metaEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};

const supabaseUrl = metaEnv.VITE_SUPABASE_URL || procEnv.SUPABASE_URL || 'https://pgqsknkwpoymvbilnnip.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || procEnv.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.s5B_A8f8Gf0G';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

