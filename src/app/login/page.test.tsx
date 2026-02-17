import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { supabase } from '@/lib/supabase';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock is already set up in tests/mocks/supabase.ts but we need to spy on it here
// implicitly handled by vitest.setup.ts mock

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /teacher login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/prof@university.edu/i)).toBeInTheDocument();
  });

  it('calls supabase signInWithPassword on submit', async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/prof@university.edu/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securepassword' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'securepassword',
      });
    });
  });
});
