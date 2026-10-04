import React from 'react';

interface AirevLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'white-bg';
  size?: 'sm' | 'md' | 'lg';
}

export const AirevLogo: React.FC<AirevLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md'
}) => {
  const heights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14'
  };

  // Replicating the AIREV Emerging Center logo:
  // - Stylized "Ai" symbol in blue & orange
  // - "AI" in royal blue, "REV" in orange
  // - "EMERGING CENTER" in royal blue
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* AIREV Geometric Monogram Icon */}
      <svg
        viewBox="0 0 140 130"
        className={`${heights[size]} w-auto shrink-0 drop-shadow-sm`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pixel block 1 (bottom left) */}
        <path d="M12 76H38V102H12V76Z" fill="#1E6BFF" />
        {/* Pixel block 2 (slanted bottom left foot) */}
        <path d="M26 102H52V128H26V102Z" fill="#1E6BFF" />
        {/* Main "A" arch / left diagonal pillar */}
        <path
          d="M38 76H64V50H38V76Z"
          fill="#1E6BFF"
        />
        {/* Upper chevron of A */}
        <path
          d="M64 12L42 50H70L88 12H64Z"
          fill="#2563EB"
        />
        {/* Diagonal main body of A */}
        <path
          d="M48 50L78 128H104L70 50H48Z"
          fill="url(#blueGradient)"
        />
        {/* Orange right leg / stem of 'i' */}
        <path
          d="M84 48L98 128H120L102 48H84Z"
          fill="url(#orangeGradient)"
        />
        {/* Orange Circular Dot for 'i' */}
        <circle cx="102" cy="18" r="16" fill="#FF7A00" />

        <defs>
          <linearGradient id="blueGradient" x1="48" y1="50" x2="104" y2="128" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="orangeGradient" x1="84" y1="48" x2="120" y2="128" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFA100" />
            <stop offset="1" stopColor="#EA580C" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark (if full variant) */}
      {variant !== 'icon' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center text-xl sm:text-2xl font-black tracking-tight leading-none">
            <span className="text-[#2563EB]">AI</span>
            <span className="text-[#FF7A00]">REV</span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-extrabold tracking-[0.18em] text-[#2563EB] uppercase leading-tight mt-0.5">
            EMERGING CENTER
          </span>
        </div>
      )}
    </div>
  );
};
