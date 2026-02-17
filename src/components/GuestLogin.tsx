'use client';

import { useEffect, useState } from 'react';
import { getGuestId } from '@/lib/auth';

export default function GuestLogin() {
  const [guestId, setGuestId] = useState<string>('');

  useEffect(() => {
    // We only run this on the client
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuestId(getGuestId());
  }, []);

  if (!guestId) return <div>Loading...</div>;

  return (
    <div className="p-4 border rounded shadow-md">
      <h2 className="text-xl font-medium">Join as Guest</h2>
      <p className="text-gray-600 mb-4">Your Guest ID: {guestId}</p>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => alert(`Joined with ${guestId}`)}
      >
        Enter Town
      </button>
    </div>
  );
}
