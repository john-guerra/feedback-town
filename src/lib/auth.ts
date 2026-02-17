import { v4 as uuidv4 } from 'uuid';

export const GUEST_ID_KEY = 'guest_id';
export const AVATAR_COLOR_KEY = 'avatar_color';

export function getGuestId(): string {
  if (typeof window === 'undefined') return '';

  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

export function getAvatarColor(): string {
  if (typeof window === 'undefined') return 'bg-blue-500'; // Default
  return localStorage.getItem(AVATAR_COLOR_KEY) || 'bg-blue-500';
}

export function setAvatarColor(color: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AVATAR_COLOR_KEY, color);
}
