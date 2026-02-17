'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TownCanvas from '@/components/TownCanvas';
import { getGuestId } from '@/lib/auth';

export default function TownPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = getGuestId();
    if (!id) {
      router.push('/');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-stone-50 text-black">
      <TownCanvas />
    </main>
  );
}
