import '@testing-library/jest-dom';
import './tests/mocks/supabase';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://mock-supabase.com';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
