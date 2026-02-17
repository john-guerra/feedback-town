'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getGuestId, getAvatarColor } from '@/lib/auth';

type UserPresence = {
  user_id: string;
  x: number;
  y: number;
  color: string;
  online_at: string;
};

export default function TownCanvas() {
  const [users, setUsers] = useState<UserPresence[]>([]);
  const guestId = getGuestId();
  const [myColor, setMyColor] = useState<string>('bg-blue-500');
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Local state for smooth optimistic updates
  const [myPosition, setMyPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  useEffect(() => {
    if (!guestId) return;

    // Get saved color
    const savedColor = getAvatarColor();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMyColor(savedColor);

    const channel = supabase.channel('town:main');
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const currentPresence = channel.presenceState<UserPresence>();
        const uniqueUsers = new Map<string, UserPresence>();

        for (const id in currentPresence) {
          const presence = currentPresence[id][0];
          if (presence) {
            // Deduplicate by user_id (handle multiple tabs/connections for same user)
            uniqueUsers.set(presence.user_id, presence);
          }
        }
        setUsers(Array.from(uniqueUsers.values()));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: guestId,
            x: 50, // Default start
            y: 50,
            color: savedColor,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guestId]);

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!channelRef.current || !guestId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMyPosition({ x, y });

    // Track new position
    await channelRef.current.track({
      user_id: guestId,
      x,
      y,
      color: myColor,
      online_at: new Date().toISOString(),
    });
  };

  return (
    <div className="w-full h-full flex flex-col items-center gap-4">
      <div className="w-full max-w-4xl flex justify-between px-4">
        <h1 className="text-xl font-bold">Town Square</h1>
        <p className="text-sm">Citizens: {users.length}</p>
      </div>

      <div
        className="relative w-full max-w-4xl h-[600px] bg-emerald-100 rounded-xl shadow-inner border-2 border-emerald-300 overflow-hidden cursor-pointer"
        onClick={handleCanvasClick}
      >
        {/* Grid Pattern Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#065f46 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>

        {users.map((user) => (
          <div
            key={user.user_id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out flex flex-col items-center"
            style={{
              left: `${user.user_id === guestId ? myPosition.x : user.x}%`,
              top: `${user.user_id === guestId ? myPosition.y : user.y}%`,
            }}
          >
            <div
              className={`w-8 h-8 rounded-full shadow-lg border-2 border-white ${user.user_id === guestId ? myColor : user.color || 'bg-gray-400'}`}
            ></div>
            <span className="text-xs bg-white/80 px-1 rounded mt-1 shadow-sm font-mono">
              {user.user_id.slice(0, 4)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">Click anywhere to move your avatar.</p>
    </div>
  );
}
