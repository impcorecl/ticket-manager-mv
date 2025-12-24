import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qqwkyxmugqscxdyjxroh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxd2t5eG11Z3FzY3hkeWp4cm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Mjk1MjgsImV4cCI6MjA4MjEwNTUyOH0.OZAktLKhpl8Uwpgn1QwJyRGPap4BOT-vQfrrMskARLM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
