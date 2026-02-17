'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TownLobby from '@/components/TownLobby';
import { getGuestId } from '@/lib/auth';

export default function TownPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = getGuestId();
    if (!id) {
      router.push('/');
    } else {
      setMounted(true);
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <TownLobby />
    </main>
  );
}
