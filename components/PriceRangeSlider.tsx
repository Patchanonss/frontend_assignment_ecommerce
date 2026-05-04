'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export default function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
}: PriceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<'min' | 'max' | null>(null);
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const localValueRef = useRef<[number, number]>(value);
  // Tracks the draft text while the user is typing — null means "use localValue"
  const [minInput, setMinInput] = useState<string | null>(null);
  const [maxInput, setMaxInput] = useState<string | null>(null);
  // Keep local in sync when external value changes (e.g. URL reset)
  useEffect(() => {
    setLocalValue(value);
    localValueRef.current = value;
  }, [value]);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const posToValue = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return min;
      const { left, width } = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - left) / width));
      return clamp(Math.round(min + ratio * (max - min)));
    },
    // clamp is stable (inline arrow using min/max from closure)
    [min, max] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const toPercent = (v: number) => ((v - min) / (max - min)) * 100;

  const handleMouseDown = useCallback(
    (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = thumb;
    },
    []
  );

  const handleTouchStart = useCallback(
    (thumb: 'min' | 'max') => (e: React.TouchEvent) => {
      e.preventDefault();
      dragging.current = thumb;
    },
    []
  );

  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  const commit = useCallback((next: [number, number]) => {
    setLocalValue(next);
    onChangeRef.current(next);
  }, []);

  useEffect(() => {
    const onMove = (clientX: number) => {
      if (!dragging.current) return;
      const v = posToValue(clientX);
      setLocalValue((prev) => {
        const next: [number, number] =
          dragging.current === 'min'
            ? [Math.min(v, prev[1] - 1), prev[1]]
            : [prev[0], Math.max(v, prev[0] + 1)];
        localValueRef.current = next;
        return next;
      });
    };

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientX);

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = null;
      commit(localValueRef.current);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [posToValue]);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (dragging.current) return;
      const v = posToValue(e.clientX);
      const distToMin = Math.abs(v - localValue[0]);
      const distToMax = Math.abs(v - localValue[1]);
      if (distToMin <= distToMax) {
        commit([Math.min(v, localValue[1] - 1), localValue[1]]);
      } else {
        commit([localValue[0], Math.max(v, localValue[0] + 1)]);
      }
    },
    [posToValue, localValue, commit]
  );

  // --- Number input handlers ---
  // minInput/maxInput hold the raw string while the user is typing.
  // Empty string means "not being edited" — fall back to displaying localValue.

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    setMinInput(e.target.value.replace(/\D/g, ''));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxInput(e.target.value.replace(/\D/g, ''));
  };

  const commitMinInput = () => {
    const parsed = parseInt(minInput ?? '', 10);
    setMinInput(null);
    if (isNaN(parsed)) return;
    commit([clamp(Math.min(parsed, localValue[1] - 1)), localValue[1]]);
  };

  const commitMaxInput = () => {
    const parsed = parseInt(maxInput ?? '', 10);
    setMaxInput(null);
    if (isNaN(parsed)) return;
    commit([localValue[0], clamp(Math.max(parsed, localValue[0] + 1))]);
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    onCommit: () => void
  ) => {
    if (e.key === 'Enter') onCommit();
    if (e.key === 'Escape') {
      setMinInput('');
      setMaxInput('');
    }
  };

  const minPct = toPercent(localValue[0]);
  const maxPct = toPercent(localValue[1]);

  return (
    <div className="px-1 space-y-3">
      {/* Slider track */}
      <div
        ref={trackRef}
        className="relative h-2 rounded-full bg-gray-200 cursor-pointer my-4"
        onClick={handleTrackClick}
      >
        <div
          className="absolute h-full bg-indigo-500 rounded-full"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <button
          type="button"
          aria-label={`Minimum price $${localValue[0]}`}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleTouchStart('min')}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-indigo-500 rounded-full shadow cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 hover:scale-110 transition-transform z-10"
          style={{ left: `${minPct}%` }}
        />
        <button
          type="button"
          aria-label={`Maximum price $${localValue[1]}`}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleTouchStart('max')}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-indigo-500 rounded-full shadow cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 hover:scale-110 transition-transform z-10"
          style={{ left: `${maxPct}%` }}
        />
      </div>

      {/* Number inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Min</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={minInput !== null ? minInput : String(localValue[0])}
              onChange={handleMinChange}
              onBlur={commitMinInput}
              onKeyDown={(e) => handleInputKeyDown(e, commitMinInput)}
              className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>
        </div>

        <span className="text-gray-300 mt-4">—</span>

        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Max</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={maxInput !== null ? maxInput : String(localValue[1])}
              onChange={handleMaxChange}
              onBlur={commitMaxInput}
              onKeyDown={(e) => handleInputKeyDown(e, commitMaxInput)}
              className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
