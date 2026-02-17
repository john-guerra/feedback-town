'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import TeacherDashboard from '@/components/TeacherDashboard';

export default function TeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  if (loading) {
    return <div className="p-8 text-center">Loading Teacher Dashboard...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <TeacherDashboard />
    </main>
  );
}
