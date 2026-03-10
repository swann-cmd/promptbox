import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 环境变量验证
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

if (!supabaseUrl.startsWith('https://')) {
  throw new Error(
    'Invalid Supabase URL format. URL must start with https://'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
