import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeacherDashboard from './TeacherDashboard';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';

// Mock Supabase
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
  send: vi.fn().mockResolvedValue({}),
  presenceState: vi.fn().mockReturnValue({}),
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  },
}));

describe('TeacherDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<TeacherDashboard />);
    expect(screen.getByText("Mayor's Office")).toBeInTheDocument();
    expect(screen.getByText('Citizens Online')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Broadcast' })).toBeInTheDocument();
  });

  it('updates citizen count based on presence', async () => {
    render(<TeacherDashboard />);

    // Simulate presence sync
    const presenceState = {
      id1: [{ user_id: 'user1' }],
      id2: [{ user_id: 'user2' }],
    };
    (mockChannel.presenceState as Mock).mockReturnValue(presenceState);

    // Manually trigger the callback passed to .on
    const onCall = (mockChannel.on as Mock).mock.calls.find((call) => call[1].event === 'sync');
    if (onCall) {
      const callback = onCall[2];
      callback();
    }

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('sends a broadcast message', async () => {
    render(<TeacherDashboard />);

    const input = screen.getByPlaceholderText('Type a message or question...');
    fireEvent.change(input, { target: { value: 'Hello Town' } });

    const button = screen.getByRole('button', { name: 'Broadcast' });
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'mayor_message',
        payload: { message: 'Hello Town' },
      });
    });

    // Input should be cleared
    expect(input).toHaveValue('');
  });
});
