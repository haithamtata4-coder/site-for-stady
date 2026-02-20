import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Note: In a production environment, these should be in a .env file
const SUPABASE_URL = 'https://qkolkhbelsuxcerhheio.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6_8hio_iT28Z4VlPzyCx3g_LflY-YQ2';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);