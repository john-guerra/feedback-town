'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function TeacherDashboard() {
  const [citizenCount, setCitizenCount] = useState(0);
  const [question, setQuestion] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const [townMode, setTownMode] = useState<string>('IDLE');
  const townModeRef = useRef('IDLE');
  const [stats, setStats] = useState<Record<string, number>>({});

  // Sync ref
  useEffect(() => {
    townModeRef.current = townMode;
  }, [townMode]);

  useEffect(() => {
    const channel = supabase.channel('town:main');
    const configChannel = supabase.channel('town_config_dashboard');

    // Subscribe to Presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const uniqueUsers = new Map();

        for (const id in state) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const presence = state[id][0] as any;
          if (presence?.user_id) {
            uniqueUsers.set(presence.user_id, presence);
          }
        }
        setCitizenCount(uniqueUsers.size);

        // Calculate Stats
        const currentMode = townModeRef.current;
        const newStats: Record<string, number> = {};

        if (currentMode === 'YES_NO') {
          newStats['YES'] = 0;
          newStats['NO'] = 0;
          uniqueUsers.forEach((u) => {
            if (u.x < 50) newStats['YES']++;
            else newStats['NO']++;
          });
        } else if (currentMode === 'ABCD') {
          newStats['A'] = 0;
          newStats['B'] = 0;
          newStats['C'] = 0;
          newStats['D'] = 0;
          uniqueUsers.forEach((u) => {
            if (u.x < 50 && u.y < 50) newStats['A']++;
            else if (u.x >= 50 && u.y < 50) newStats['B']++;
            else if (u.x < 50 && u.y >= 50) newStats['C']++;
            else newStats['D']++;
          });
        }
        setStats(newStats);
      })
      .subscribe();

    // Subscribe to Config
    configChannel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'town_config' }, (payload) => {
        const newRow = payload.new as { active_mode: string };
        if (newRow && newRow.active_mode) {
          setTownMode(newRow.active_mode);
        }
      })
      .subscribe();

    // Initial Config Fetch
    supabase
      .from('town_config')
      .select('active_mode')
      .single()
      .then(({ data }) => {
        if (data) setTownMode(data.active_mode);
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(configChannel);
    };
  }, []);

  const updateTownMode = async (mode: string) => {
    const { error } = await supabase.from('town_config').update({ active_mode: mode }).eq('id', 1); // Singleton row

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update mode:', error);
      alert('Failed to update town mode');
    }
  };

  const handleBroadcast = async () => {
    if (!question.trim()) return;
    setBroadcasting(true);

    try {
      // Send a broadcast message to the town channel
      await supabase.channel('town:main').send({
        type: 'broadcast',
        event: 'mayor_message',
        payload: { message: question },
      });
      setQuestion('');
      alert('Message broadcasted to the town!');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Broadcast failed:', error);
      alert('Failed to broadcast message');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Mayor&apos;s Office</h1>

      <div className="mb-6 p-4 bg-white border border-gray-200 rounded-md">
        <h2 className="text-lg font-semibold mb-4">📢 Town Controls</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => updateTownMode('IDLE')}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            ⏹️ Reset Town
          </button>
          <button
            onClick={() => updateTownMode('YES_NO')}
            className="px-4 py-2 rounded bg-green-100 border border-green-300 hover:bg-green-200 text-green-800"
          >
            ✅ Start Yes/No
          </button>
          <button
            onClick={() => updateTownMode('ABCD')}
            className="px-4 py-2 rounded bg-purple-100 border border-purple-300 hover:bg-purple-200 text-purple-800"
          >
            🔠 Start A/B/C/D
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 className="text-lg font-semibold text-blue-900">Town Status</h2>
        <div className="flex items-end gap-6">
          <div>
            <p className="text-3xl font-bold text-blue-600">
              {citizenCount}{' '}
              <span className="text-base font-normal text-gray-600">Citizens Online</span>
            </p>
          </div>
          {Object.keys(stats).length > 0 && (
            <div className="flex gap-4 border-l pl-6 border-blue-200">
              {Object.entries(stats).map(([key, val]) => (
                <div key={key} className="text-center">
                  <span className="block text-xl font-bold text-gray-800">{val}</span>
                  <span className="text-xs text-gray-500 font-bold">{key}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Broadcast Announcement</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type a message or question..."
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleBroadcast}
            disabled={broadcasting || !question.trim()}
            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {broadcasting ? 'Sending...' : 'Broadcast'}
          </button>
        </div>
        <p className="text-sm text-gray-500">
          This message will appear to all citizens currently in the town.
        </p>
      </div>
    </div>
  );
}
