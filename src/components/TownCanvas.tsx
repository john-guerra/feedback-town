'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getGuestId, getAvatarColor } from '@/lib/auth';
import Avatar from './Avatar';

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
  const [townMode, setTownMode] = useState<string>('IDLE');

  useEffect(() => {
    // Determine user's zone based on position and mode for analytics
    // (This is just visual logic for now, syncing vote logic requires backend or complex presence payload)
  }, [myPosition, townMode]);

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
      .on('broadcast', { event: 'mayor_message' }, (payload) => {
        // payload: { event: 'mayor_message', type: 'broadcast', payload: { message: '...' } }
        // The payload stricture from supabase-js might wrap it.
        // Let's assume payload.payload.message or payload.message depending on how we sent it.
        // The sender sent: { message: question } inside the payload argument of channel.send
        // So here we receive { message: '...' } directly?
        // Actually, let's log it to be safe or use a toast.
        const message = payload.payload?.message || payload.message;
        if (message) {
          alert(`📢 Mayor says: ${message}`);
        }
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

    // Subscribe to DB changes for town_config
    const configChannel = supabase
      .channel('town_config_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'town_config' }, (payload) => {
        // payload.new is the new row
        const newRow = payload.new as { active_mode: string };
        if (newRow && newRow.active_mode) {
          setTownMode(newRow.active_mode);
        }
      })
      .subscribe();

    // Initial fetch to get current state
    supabase
      .from('town_config')
      .select('active_mode')
      .single()
      .then(({ data }) => {
        if (data) setTownMode(data.active_mode);
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
        {/* Grass Background */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundColor: '#e6fffa',
            backgroundImage: `
              radial-gradient(#4d7c0f 2px, transparent 2px),
              radial-gradient(#365314 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px, 10px 10px',
            backgroundPosition: '0 0, 15px 15px',
          }}
        ></div>

        {/* Central Fountain */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none">
          <div className="absolute inset-0 bg-blue-300 rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute inset-2 bg-blue-400 rounded-full border-4 border-stone-300 flex items-center justify-center shadow-lg">
            <div className="w-4 h-4 bg-blue-100 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Decor: Trees (Static for now) */}
        {[
          { top: '10%', left: '10%' },
          { top: '10%', left: '80%' },
          { top: '80%', left: '15%' },
          { top: '75%', left: '85%' },
          { top: '40%', left: '5%' },
          { top: '40%', left: '90%' },
        ].map((pos, i) => (
          <div key={i} className="absolute w-12 h-12 pointer-events-none" style={pos}>
            <div className="absolute bottom-0 w-2 h-4 bg-yellow-900 left-1/2 -translate-x-1/2"></div>
            <div className="absolute bottom-3 w-10 h-10 bg-green-600 rounded-full left-1/2 -translate-x-1/2 shadow-sm"></div>
            <div className="absolute bottom-6 w-8 h-8 bg-green-500 rounded-full left-1/2 -translate-x-1/2 opacity-80"></div>
          </div>
        ))}

        {/* Question Mode Highlighting */}
        {townMode === 'YES_NO' && (
          <div className="absolute inset-0 pointer-events-none flex opacity-20">
            <div className="w-1/2 h-full bg-green-500 flex items-center justify-center">
              <span className="text-9xl font-bold text-green-900 opacity-50">YES</span>
            </div>
            <div className="w-1/2 h-full bg-red-500 flex items-center justify-center">
              <span className="text-9xl font-bold text-red-900 opacity-50">NO</span>
            </div>
          </div>
        )}
        {townMode === 'ABCD' && (
          <div className="absolute inset-0 pointer-events-none flex flex-wrap opacity-20">
            <div className="w-1/2 h-1/2 bg-blue-500 flex items-center justify-center border-r border-b border-white/50">
              <span className="text-6xl font-bold text-blue-900 opacity-50">A</span>
            </div>
            <div className="w-1/2 h-1/2 bg-yellow-500 flex items-center justify-center border-b border-white/50">
              <span className="text-6xl font-bold text-yellow-900 opacity-50">B</span>
            </div>
            <div className="w-1/2 h-1/2 bg-purple-500 flex items-center justify-center border-r border-white/50">
              <span className="text-6xl font-bold text-purple-900 opacity-50">C</span>
            </div>
            <div className="w-1/2 h-1/2 bg-orange-500 flex items-center justify-center">
              <span className="text-6xl font-bold text-orange-900 opacity-50">D</span>
            </div>
          </div>
        )}

        {users.map((user) => (
          <div
            key={user.user_id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out flex flex-col items-center pointer-events-none" // added pointer-events-none to prevent blocking clicks
            style={{
              left: `${user.user_id === guestId ? myPosition.x : user.x}%`,
              top: `${user.user_id === guestId ? myPosition.y : user.y}%`,
              zIndex: Math.floor(user.user_id === guestId ? myPosition.y : user.y), // Simple depth sorting
            }}
          >
            <Avatar
              color={user.user_id === guestId ? myColor : user.color || 'bg-gray-400'}
              isMe={user.user_id === guestId}
            />

            <span className="text-xs bg-white/90 px-2 py-0.5 rounded-full mt-1 shadow-sm font-bold border border-gray-200 text-gray-700">
              {user.user_id.slice(0, 4)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">Click anywhere to move your avatar.</p>
    </div>
  );
}
