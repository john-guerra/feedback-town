import { render, screen, waitFor } from '@testing-library/react';
import TownLobby from './TownLobby';
import { supabase } from '@/lib/supabase';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockSupabase } = vi.hoisted(() => {
  const mockPresenceState = {
    'test-guest-id': [{ user_id: 'test-guest-id', online_at: new Date().toISOString() }],
  };

  const mock = {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockImplementation((event, filter, callback) => {
        // If it's a presence sync event, trigger the callback immediately to simulate data
        if (event === 'presence' && filter.event === 'sync' && callback) {
          callback();
        }
        return mock.channel(); // Return the mock channel object for chaining
      }),
      subscribe: vi.fn().mockImplementation((callback) => {
        if (callback) callback('SUBSCRIBED');
        return {
          unsubscribe: vi.fn(),
        };
      }),
      track: vi.fn().mockResolvedValue({}),
      presenceState: vi.fn().mockReturnValue(mockPresenceState),
      unsubscribe: vi.fn(),
    }),
    removeChannel: vi.fn(),
  };
  return { mockSupabase: mock };
});

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Mock getGuestId to return a stable ID
vi.mock('@/lib/auth', () => ({
  getGuestId: vi.fn().mockReturnValue('test-guest-id'),
}));

describe('TownLobby', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders lobby presence count', () => {
    render(<TownLobby />);
    expect(screen.getByText(/Citizens Present:/i)).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('subscribes to town:main channel', () => {
    render(<TownLobby />);
    expect(supabase.channel).toHaveBeenCalledWith('town:main');
  });

  it('tracks user presence upon subscription', async () => {
    render(<TownLobby />);

    // The mock subscribe calls the callback immediately with 'SUBSCRIBED'
    // So track should be called
    await waitFor(() => {
      // Access the mock channel object returned by the first call
      const mockChannel = supabase.channel('town:main');
      expect(mockChannel.track).toHaveBeenCalledWith({
        user_id: 'test-guest-id',
        online_at: expect.any(String),
      });
    });
  });
});
