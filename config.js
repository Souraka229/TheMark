// Configuration Supabase
export const SUPABASE_CONFIG = {
    url: 'https://ziarglfpffidjxzkakqu.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYXJnbGZwZmZpZGp4emtha3F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MzY4OTAsImV4cCI6MjA3NDExMjg5MH0.oZJs-zIxIm2mqv7RFr1K7XcvJBSwQpxFytXZ1PQCOeQ'
};

export const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url, 
    SUPABASE_CONFIG.anonKey
);