import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://cvchwjconynpzhktnuxn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2h3amNvbnlucHpoa3RudXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDc0MTQsImV4cCI6MjA3NjIyMzQxNH0.Z2MdW37Itu5ZpHex3kHf6s5-KsXTUezuBZngP666ykA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});