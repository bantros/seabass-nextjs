import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-only Supabase client that uses the service role key.
 * Bypasses RLS — only use in server-side API routes, never in client components.
 */
export const createServiceClient = () =>
  createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
