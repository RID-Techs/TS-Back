import {createClient} from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseClient = supabase;
export default supabaseClient;