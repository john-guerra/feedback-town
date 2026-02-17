import { vi } from 'vitest';

export const supabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  auth: {
    signInWithPassword: vi
      .fn()
      .mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
    signOut: vi.fn(),
  },
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => supabase),
}));
