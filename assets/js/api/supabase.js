// Supabase Configuration
// Keys are loaded from config.js (which is gitignored)
const SUPABASE_URL = window.ENV?.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase keys are missing! Make sure assets/js/config.js exists.');
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Globally accessible
window.supabaseClient = supabaseClient;
