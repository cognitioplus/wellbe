// src/hooks/useSupabase.js
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isresrnchbbmydquqakq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaWJhY2ZodnZ1ZmV2cGt3eW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNTQyMDcsImV4cCI6MjA3MTYzMDIwN30.m_lbwxM3c0CW0-Q0ltsHYQyQLoqy9dsL0rJciJ6uBqA';

export const useSupabase = () => {
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    setSupabase(client);
  }, []);

  return { supabase };
};
