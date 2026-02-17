'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TeacherDashboard() {
  const [citizenCount, setCitizenCount] = useState(0);
  const [question, setQuestion] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    const channel = supabase.channel('town:main');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Count unique users based on user_id if possible, or just total presence entries
        // For now, let's count total presence entries as a proxy for connected clients
        // or filter by unique user_id if we want strict user counts.
        const uniqueUsers = new Set();
        for (const id in state) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const presence = state[id][0] as any;
          if (presence?.user_id) uniqueUsers.add(presence.user_id);
        }
        setCitizenCount(uniqueUsers.size);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 className="text-lg font-semibold text-blue-900">Town Status</h2>
        <p className="text-3xl font-bold text-blue-600">
          {citizenCount}{' '}
          <span className="text-base font-normal text-gray-600">Citizens Online</span>
        </p>
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
