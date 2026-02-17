import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getGuestId } from './auth';

describe('Guest Auth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('generates a new ID if none exists', () => {
    const id = getGuestId();
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(localStorage.getItem('guest_id')).toBe(id);
  });

  it('returns existing ID if one exists', () => {
    const existingId = 'test-uuid-123';
    localStorage.setItem('guest_id', existingId);

    const id = getGuestId();
    expect(id).toBe(existingId);
  });
});
