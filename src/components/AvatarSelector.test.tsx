import { render, screen, fireEvent } from '@testing-library/react';
import AvatarSelector from './AvatarSelector';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as auth from '@/lib/auth';

// Mock auth functions
vi.mock('@/lib/auth', () => ({
  getAvatarColor: vi.fn(),
  setAvatarColor: vi.fn(),
}));

describe('AvatarSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth.getAvatarColor as any).mockReturnValue('bg-blue-500');
  });

  it('renders all color options', () => {
    render(<AvatarSelector />);
    const buttons = screen.getAllByRole('button');
    // We have 8 colors defined in the component
    expect(buttons).toHaveLength(8);
  });

  it('highlights the selected color (default blue)', () => {
    render(<AvatarSelector />);
    const blueButton = screen.getByTitle('Blue');
    expect(blueButton).toHaveClass('border-black');
    expect(blueButton).toHaveClass('scale-110');
  });

  it('updates selection and calls setAvatarColor on click', () => {
    render(<AvatarSelector />);
    const redButton = screen.getByTitle('Red');
    
    fireEvent.click(redButton);
    
    expect(auth.setAvatarColor).toHaveBeenCalledWith('bg-red-500');
    expect(redButton).toHaveClass('border-black');
  });

  it('calls onSelect prop when provided', () => {
    const onSelect = vi.fn();
    render(<AvatarSelector onSelect={onSelect} />);
    
    const greenButton = screen.getByTitle('Green');
    fireEvent.click(greenButton);
    
    expect(onSelect).toHaveBeenCalledWith('bg-green-500');
  });
});
