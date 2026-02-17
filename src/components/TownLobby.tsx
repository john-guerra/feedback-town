'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getGuestId } from '@/lib/auth';

type UserPresence = {
  user_id: string;
  online_at: string;
};

export default function TownLobby() {
  const [users, setUsers] = useState<UserPresence[]>([]);
  const guestId = getGuestId();

  useEffect(() => {
    if (!guestId) return;

    const channel = supabase.channel('town:main');

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState<UserPresence>();
        const allUsers: UserPresence[] = [];
        for (const id in newState) {
          allUsers.push(newState[id][0]); // Just take the first presence for each ID
        }
        setUsers(allUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: guestId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guestId]);

  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center">Feedback Town Square</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Citizens Present: {users.length}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {users.map((user) => (
            <div
              key={user.user_id}
              className={`p-3 rounded border text-center ${user.user_id === guestId ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="text-sm truncate font-mono">
                {user.user_id === guestId ? 'You' : user.user_id.slice(0, 8)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded text-center text-sm text-gray-500">
        Waiting for Mayor to start the session...
      </div>
    </div>
  );
}
