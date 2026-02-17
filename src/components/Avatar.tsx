import React from 'react';

type AvatarProps = {
  color: string;
  isMe?: boolean;
};

export default function Avatar({ color, isMe }: AvatarProps) {
  // Map tailwind bg colors to hex for SVG fill if needed,
  // or just use the class for a container and SVG for details.
  // Let's rely on the color prop being a tailwind class like 'bg-red-500'.

  // We can extract the approximate hex or just use currentcolor with the class.
  // For simplicity, let's use the color class on the body path directly if possible,
  // or just wrap it.

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Name/Arrow indicator if it's me */}
      {isMe && (
        <div className="absolute -top-8 animate-bounce">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-yellow-500"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      )}

      {/* Avatar SVG */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        className="drop-shadow-lg transition-transform hover:scale-110"
      >
        {/* Shadow */}
        <ellipse cx="50" cy="95" rx="30" ry="5" fill="rgba(0,0,0,0.2)" />
        {/* Body */}
        <circle cx="50" cy="60" r="30" className={`${color} stroke-black stroke-2`} />
        {/* Head */}
        <circle cx="50" cy="35" r="25" className="fill-stone-100 stroke-black stroke-2" />
        {/* Face */}
        <circle cx="40" cy="30" r="3" fill="black" /> {/* Left Eye */}
        <circle cx="60" cy="30" r="3" fill="black" /> {/* Right Eye */}
        <path d="M 40 45 Q 50 50 60 45" stroke="black" strokeWidth="2" fill="none" /> {/* Smile */}
        {/* Hat (dependant on color? For MVP, just a generic hat or change based on color logic if we had it) */}
        {/* Let's match the hat color to the body but darker? or just standard */}
        <path d="M 20 25 L 80 25 L 50 5 Z" className="fill-slate-700 stroke-black stroke-2" />
      </svg>
    </div>
  );
}
