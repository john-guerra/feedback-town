'use client';

import { useState, useEffect } from 'react';
import { setAvatarColor, getAvatarColor } from '@/lib/auth';

const COLORS = [
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Amber', value: 'bg-amber-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Violet', value: 'bg-violet-500' },
  { name: 'Pink', value: 'bg-pink-500' },
];

export default function AvatarSelector({ onSelect }: { onSelect?: (color: string) => void }) {
  const [selected, setSelected] = useState<string>('bg-blue-500');

  useEffect(() => {
    const saved = getAvatarColor();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(saved);
  }, []);

  const handleSelect = (colorValue: string) => {
    setSelected(colorValue);
    setAvatarColor(colorValue);
    if (onSelect) {
      onSelect(colorValue);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-semibold">Choose your look</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {COLORS.map((color) => (
          <button
            key={color.name}
            onClick={() => handleSelect(color.value)}
            className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${color.value} ${
              selected === color.value
                ? 'border-black scale-110 shadow-lg'
                : 'border-transparent opacity-80'
            }`}
            aria-label={`Select ${color.name}`}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
}
