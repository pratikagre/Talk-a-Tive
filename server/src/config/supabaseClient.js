const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
    // process.exit(1); // Don't crash immediately, let it fail gracefully if config is missing
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
