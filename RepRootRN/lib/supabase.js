import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vooplktpzywihsffzuus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvb3Bsa3Rwenl3aWhzZmZ6dXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MjA5NDUsImV4cCI6MjA2NjE5Njk0NX0.fzdMM6F7suRiLDBFmKfHwp2cZr-6FjeGZ_-SHxAdQUs'; 
export const supabase = createClient(supabaseUrl, supabaseKey);
