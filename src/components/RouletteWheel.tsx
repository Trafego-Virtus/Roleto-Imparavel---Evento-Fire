import React, { useRef, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Product } from '../types';
import { playTickSound, playWinSound } from '../utils/audio';

interface RouletteWheelProps {
  products: Product[];
  onSpinEnd: (product: Product) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

// Convert polar to cartesian coordinates (0° is 12 o'clock, clockwise)
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Create SVG path for a circular sector (pie slice)
function describeSlice(
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(x, y, outerRadius, startAngle);
  const outerEnd = polarToCartesian(x, y, outerRadius, endAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, startAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${innerStart.x} ${innerStart.y}`,
    `L ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

// Quartic ease-out for realistic wheel deceleration
function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  products,
  onSpinEnd,
  isSpinning,
  setIsSpinning,
}) => {
  const totalSlices = products.length;
  const sliceAngle = 360 / totalSlices;

  const [rotation, setRotation] = useState<number>(0);
  const [needleAngle, setNeedleAngle] = useState<number>(0);

  const rotationRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastSliceRef = useRef<number>(-1);

  const centerX = 260;
  const centerY = 260;
  const outerRadius = 230;
  const innerRadius = 46;

  // Split name for optimal radial display
  const formatProductName = (name: string): string[] => {
    if (name === 'Checklist do Produto Digital') {
      return ['Checklist do', 'Produto Digital'];
    }
    if (name === 'Protocolo do botão impulsionar') {
      return ['Protocolo do', 'botão impulsionar'];
    }
    if (name === 'Ciclo da Maestria') {
      return ['Ciclo da', 'Maestria'];
    }
    if (name === 'Método Cronos') {
      return ['Método', 'Cronos'];
    }
    return [name];
  };

  const triggerConfetti = () => {
    try {
      // Golden celebratory burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EAB308', '#F59E0B', '#3B82F6', '#10B981', '#EC4899'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#EAB308', '#F59E0B', '#F97316'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3B82F6', '#10B981', '#8B5CF6'],
        });
      }, 250);
    } catch {
      // Ignore if canvas context unavailable
    }
  };

  const spin = useCallback(() => {
    // Prevent spinning if currently spinning
    if (isSpinning) return;

    setIsSpinning(true);

    // Randomly select winning product
    const winningIndex = Math.floor(Math.random() * totalSlices);
    const selectedProduct = products[winningIndex];

    // Mathematical angle calculation:
    // Pointer is at 12 o'clock (0°).
    // Center of winning slice is (winningIndex + 0.5) * sliceAngle.
    // To land this center at 0° after clockwise rotation R:
    const targetNormalizedAngle = (360 - (winningIndex + 0.5) * sliceAngle) % 360;

    const currentRotation = rotationRef.current;
    const currentModulo = ((currentRotation % 360) + 360) % 360;

    let delta = (targetNormalizedAngle - currentModulo) % 360;
    if (delta < 0) delta += 360;

    // Minimum spins: 6 full 360° revolutions + slight natural jitter within ±20% of slice half-width
    const minSpins = 6;
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.3);
    const totalDelta = minSpins * 360 + delta + jitter;

    const duration = 4800; // 4.8 seconds for optimal anticipation
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeOutQuart(progress);

      const currentAngle = currentRotation + totalDelta * easedProgress;
      rotationRef.current = currentAngle;
      setRotation(currentAngle);

      // Needle tick detection
      const angleUnderPointer = ((360 - (currentAngle % 360)) % 360 + 360) % 360;
      const currentSlice = Math.floor(angleUnderPointer / sliceAngle);

      if (currentSlice !== lastSliceRef.current) {
        lastSliceRef.current = currentSlice;
        const speedRatio = 1 - progress;
        playTickSound(speedRatio);

        // Needle deflection flick
        setNeedleAngle(-14 * Math.max(0.2, speedRatio));
        setTimeout(() => setNeedleAngle(0), 40);
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin complete
        setNeedleAngle(0);
        setIsSpinning(false);
        playWinSound();
        triggerConfetti();
        onSpinEnd(selectedProduct);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isSpinning, totalSlices, products, sliceAngle, setIsSpinning, onSpinEnd]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Outer decorative LED lights around perimeter (28 lights)
  const bulbCount = 28;
  const bulbs = Array.from({ length: bulbCount }).map((_, i) => {
    const angle = (i * 360) / bulbCount;
    const pos = polarToCartesian(centerX, centerY, outerRadius + 14, angle);
    const isActive = (i + Math.floor(rotation / 15)) % 2 === 0;
    return { ...pos, id: i, isActive };
  });

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Glow aura behind wheel */}
      <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-amber-600/20 blur-2xl pointer-events-none" />

      {/* Wheel Container */}
      <div className="relative w-full max-w-[310px] xs:max-w-[360px] sm:max-w-[440px] md:max-w-[480px] aspect-square p-1 sm:p-2">
        {/* Needle / Ticker Pointer at 12 o'clock */}
        <div
          id="roulette-pointer"
          className="absolute left-1/2 top-0 z-30 -translate-x-1/2 drop-shadow-xl w-7 xs:w-8 sm:w-10 md:w-11"
          style={{
            transform: `translateX(-50%) rotate(${needleAngle}deg)`,
            transformOrigin: '50% 18%',
            transition: 'transform 0.05s ease-out',
          }}
        >
          <svg viewBox="0 0 44 60" fill="none" className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="pointerGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
              <filter id="pointerShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
              </filter>
            </defs>
            {/* Top Pivot Peg */}
            <circle cx="22" cy="14" r="10" fill="url(#pointerGold)" stroke="#FFFBEB" strokeWidth="1.5" />
            <circle cx="22" cy="14" r="4" fill="#451A03" />
            {/* Triangular Arrow Pointer */}
            <polygon
              points="14,16 30,16 22,54"
              fill="url(#pointerGold)"
              stroke="#FFFBEB"
              strokeWidth="1.5"
              filter="url(#pointerShadow)"
            />
          </svg>
        </div>

        {/* The SVG Wheel */}
        <svg
          id="roulette-wheel-svg"
          viewBox="0 0 520 520"
          className="w-full h-full drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Outer Rim Gold Gradient */}
            <radialGradient id="goldRimGradient" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="#27272A" />
              <stop offset="90%" stopColor="#CA8A04" />
              <stop offset="94%" stopColor="#FEF08A" />
              <stop offset="98%" stopColor="#854D0E" />
              <stop offset="100%" stopColor="#18181B" />
            </radialGradient>

            {/* Hub Gradient */}
            <linearGradient id="hubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="40%" stopColor="#EAB308" />
              <stop offset="70%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#713F12" />
            </linearGradient>

            <filter id="wheelDropShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* Outer Bezel */}
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius + 22}
            fill="#121215"
            stroke="url(#goldRimGradient)"
            strokeWidth="12"
            filter="url(#wheelDropShadow)"
          />

          {/* Perimeter LED / Stud Bulbs */}
          {bulbs.map((b) => (
            <g key={b.id}>
              <circle
                cx={b.x}
                cy={b.y}
                r="4.5"
                fill={b.isActive ? '#FDE047' : '#52525B'}
                stroke={b.isActive ? '#FEF08A' : '#27272A'}
                strokeWidth="1"
                className="transition-colors duration-150"
              />
              {b.isActive && (
                <circle cx={b.x} cy={b.y} r="8" fill="#FDE047" opacity="0.3" />
              )}
            </g>
          ))}

          {/* Inner Golden Rim Line */}
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius + 3}
            fill="none"
            stroke="#EAB308"
            strokeWidth="2.5"
            strokeDasharray="4, 4"
            opacity="0.8"
          />

          {/* ROTATING WHEEL GROUP */}
          <g transform={`rotate(${rotation} ${centerX} ${centerY})`}>
            {products.map((product, i) => {
              const startAngle = i * sliceAngle;
              const endAngle = (i + 1) * sliceAngle;
              const midAngle = (i + 0.5) * sliceAngle;
              const pathData = describeSlice(
                centerX,
                centerY,
                innerRadius,
                outerRadius,
                startAngle,
                endAngle
              );
              const nameLines = formatProductName(product.name);

              return (
                <g key={product.id} className="roulette-slice-group">
                  {/* Slice Sector */}
                  <path
                    d={pathData}
                    fill={product.color}
                    stroke="#18181B"
                    strokeWidth="2.5"
                  />

                  {/* Slice Radial Text Label */}
                  <g transform={`rotate(${midAngle} ${centerX} ${centerY})`}>
                    {/* Outer accent gem / dot */}
                    <circle
                      cx={centerX}
                      cy={centerY - outerRadius + 14}
                      r="3.5"
                      fill="#FFFFFF"
                      opacity="0.9"
                    />

                    {/* Text Label positioned radially */}
                    <text
                      x={centerX}
                      y={centerY - outerRadius + 44}
                      textAnchor="middle"
                      fill={product.textColor}
                      style={{
                        fontSize: nameLines.length > 1 ? '13px' : '14px',
                        fontWeight: '800',
                        letterSpacing: '-0.02em',
                        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        textShadow: product.textColor === '#FFFFFF' ? '0 1px 3px rgba(0,0,0,0.7)' : 'none',
                      }}
                    >
                      {nameLines.map((line, lineIdx) => (
                        <tspan
                          key={lineIdx}
                          x={centerX}
                          dy={lineIdx === 0 ? 0 : '15'}
                        >
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* CENTER HUB (STATIONARY / CLICKABLE) */}
          <g
            id="center-hub-button"
            className={`transition-transform duration-200 ${
              isSpinning
                ? 'opacity-90 cursor-default'
                : 'cursor-pointer hover:scale-105 active:scale-95'
            }`}
            onClick={isSpinning ? undefined : spin}
          >
            {/* Outer Hub Ring */}
            <circle
              cx={centerX}
              cy={centerY}
              r={innerRadius + 4}
              fill="#18181B"
              stroke="#CA8A04"
              strokeWidth="2.5"
            />
            {/* Golden Hub Dome */}
            <circle
              cx={centerX}
              cy={centerY}
              r={innerRadius}
              fill="url(#hubGradient)"
              stroke="#FFFBEB"
              strokeWidth="1.5"
            />
            {/* Inner Ring */}
            <circle
              cx={centerX}
              cy={centerY}
              r={innerRadius - 8}
              fill="#18181B"
              stroke="#EAB308"
              strokeWidth="1"
            />
            {/* Center Text */}
            <text
              x={centerX}
              y={centerY - 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#FDE047"
              style={{
                fontSize: '11px',
                fontWeight: '900',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {isSpinning ? 'GIRANDO' : 'GIRAR'}
            </text>
          </g>
        </svg>
      </div>

      {/* Main Action Button Below Wheel */}
      <div className="mt-3 sm:mt-4 w-full max-w-xs sm:max-w-sm px-2 sm:px-4">
        <button
          id="btn-spin-wheel"
          type="button"
          disabled={isSpinning}
          onClick={spin}
          className={`w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl font-extrabold text-sm sm:text-base md:text-lg tracking-wider uppercase transition-all duration-300 shadow-xl cursor-pointer ${
            isSpinning
              ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed scale-[0.98]'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] border border-amber-300'
          }`}
        >
          {isSpinning ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-zinc-500 border-t-amber-400 animate-spin" />
              Sorteando Produto...
            </span>
          ) : (
            'Girar a Roleta'
          )}
        </button>
      </div>
    </div>
  );
};
