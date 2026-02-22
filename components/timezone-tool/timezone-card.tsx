/**
 * Component representing a single timezone card in the world clock grid.
 * Displays current time, date, and provides a synchronous slider to adjust time across all cards.
 */
'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Settings2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock as ClockIcon,
} from 'lucide-react';
import { useTimezoneStore } from '@/hooks/use-timezone-store';
import { cn } from '@/lib/utils';
import { TimezoneSearchInline } from './timezone-search-inline';
import { CityData } from '@/lib/timezone-data';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Clock from '@/components/clock';

interface TimezoneCardProps {
  id: string;
  city: string;
  country: string;
  timezone: string;
}

/**
 * Memoized ruler background for the timezone slider.
 * Renders ticks representing 15-minute and 1-hour intervals.
 */
const TimezoneRuler = React.memo(
  ({ minutesInDay }: { minutesInDay: number }) => {
    const ticks = useMemo(() => {
      return Array.from({ length: 97 }, (_, i) => {
        const tickMinute = i * 15;
        const dist = Math.abs(tickMinute - minutesInDay);
        // Highlights ticks that are close to the current slider handle.
        const isNearHandle = dist <= 60;

        let heightClass = 'h-2';
        let colorClass = 'bg-zinc-800/40';

        if (i % 24 === 0) {
          // Major ticks for primary hours (0, 6, 12, 18, 24).
          heightClass = 'h-5';
          colorClass = 'bg-zinc-600';
        } else if (i % 4 === 0) {
          // Intermediate ticks for every hour.
          heightClass = 'h-3';
          colorClass = 'bg-zinc-700';
        }

        if (isNearHandle) {
          colorClass = 'bg-zinc-300';
        }

        return <div key={i} className={cn('w-px', heightClass, colorClass)} />;
      });
    }, [minutesInDay]);

    return <>{ticks}</>;
  }
);

TimezoneRuler.displayName = 'TimezoneRuler';

export const TimezoneCard: React.FC<TimezoneCardProps> = ({
  id,
  city,
  country,
  timezone,
}) => {
  const {
    baseTime,
    setTimeOffset,
    resetTime,
    removeTimezone,
    updateTimezone,
    selectedTimezones,
    selectedId,
    setSelectedId,
    timeOffset,
    setBaseTime,
  } = useTimezoneStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isClockOpen, setIsClockOpen] = useState(false);
  const [liveNow, setLiveNow] = useState(new Date());

  const cardRef = useRef<HTMLDivElement>(null);

  // Update the live clock every second when the full-screen modal is open.
  useEffect(() => {
    if (isClockOpen) {
      const timer = setInterval(() => setLiveNow(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [isClockOpen]);

  // Convert current system time to the specific timezone for the live clock display.
  const zonedLiveDate = useMemo(() => {
    return toZonedTime(liveNow, timezone);
  }, [liveNow, timezone]);

  const canDelete = selectedTimezones.length > 1 && id !== 'local';
  const isSelected = selectedId === id;

  // Close search mode if clicking outside.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };
    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  /**
   * displayDate is calculated based on the global baseTime (which changes as you slide).
   * This ensures all cards stay perfectly synchronized during time-scrubbing.
   */
  const displayDate = useMemo(() => {
    return toZonedTime(new Date(baseTime), timezone);
  }, [baseTime, timezone]);

  const timeStr = format(displayDate, 'hh:mm');
  const amPm = format(displayDate, 'a').toUpperCase();
  const offset = format(displayDate, 'xxx');
  const dateStr = format(displayDate, 'MMM dd');

  const minutesInDay = displayDate.getHours() * 60 + displayDate.getMinutes();

  /**
   * Synchronizes ALL cards by updating the global store's offset and baseTime.
   * This is the core logic that enables cross-timezone time scrubbing.
   */
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = parseInt(e.target.value, 10);
    const deltaMinutes = newMinutes - minutesInDay;

    if (deltaMinutes !== 0) {
      const newFullOffset = timeOffset + deltaMinutes * 60000;
      setTimeOffset(newFullOffset);
      setBaseTime(Date.now() + newFullOffset);
    }
  };

  const handleSelect = (newCity: CityData) => {
    updateTimezone(id, {
      city: newCity.city,
      country: newCity.country,
      timezone: newCity.timezone,
    });
    setIsEditing(false);
  };

  const handlePosition = (minutesInDay / 1440) * 100;

  return (
    <>
      <Card
        ref={cardRef}
        onClick={() => setSelectedId(id)}
        className={cn(
          'relative bg-card border-border text-card-foreground w-full h-[220px] group overflow-hidden shadow-xl p-0 m-0 flex flex-col cursor-default transition-colors',
          isSelected && !isEditing
            ? 'ring-2 ring-primary/50 border-primary/20'
            : 'border-border',
          !isEditing && 'hover:border-accent'
        )}
      >
        {isEditing ? (
          <TimezoneSearchInline
            onSelect={handleSelect}
            onClose={() => setIsEditing(false)}
            placeholder={`Search to replace ${city}...`}
          />
        ) : (
          <div className="flex-1 flex flex-col justify-between px-6 py-4">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-border to-transparent opacity-50 group-hover:opacity-100" />

            <div className="flex justify-between items-start z-10">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest truncate">
                    {city}
                  </h3>
                  {country && (
                    <span className="text-muted-foreground/30 text-[10px]">
                      •
                    </span>
                  )}
                  <span className="text-muted-foreground/70 text-[10px] uppercase font-medium truncate">
                    {country}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-light tracking-tighter text-foreground tabular-nums">
                    {timeStr}
                  </span>
                  <span className="text-xl font-medium text-muted-foreground tracking-tight">
                    {amPm}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="bg-accent/50 px-2 py-0.5 rounded text-[9px] text-accent-foreground font-mono tracking-wider border border-border/50">
                    GMT{offset}
                  </div>
                  <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                    {dateStr}
                  </div>
                </div>
              </div>

              {/* Tool Action Buttons (Reset, Clock, Settings, Delete) */}
              <div className="flex gap-0.5 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetTime();
                    setBaseTime(Date.now());
                  }}
                  title="Reset to current time"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsClockOpen(true);
                  }}
                  title="View Clock"
                >
                  <ClockIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Settings2 className="h-3.5 w-3.5" />
                </Button>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTimezone(id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Slider scrubbing area */}
            <div className="relative h-14 mt-auto select-none">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border" />

              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center h-6">
                <TimezoneRuler minutesInDay={minutesInDay} />
              </div>

              <div className="absolute bottom-0 inset-x-0 flex justify-between text-[10px] text-primary font-medium">
                <span>00</span>
                <span>06</span>
                <span>12</span>
                <span>18</span>
                <span>24</span>
              </div>

              {/* Range input layer to capture interaction */}
              <input
                type="range"
                min="0"
                max="1439"
                step="1"
                value={minutesInDay}
                onChange={handleSliderChange}
                className="absolute inset-x-0 top-0 bottom-6 w-full opacity-0 cursor-ew-resize z-20"
              />

              {/* Visual scrubbing handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 pointer-events-none z-10"
                style={{ left: `${handlePosition}%` }}
              >
                <div className="w-full h-full bg-[#d4d4d4] rounded-full flex items-center justify-center shadow-md">
                  <ChevronLeft
                    className="h-4 w-4 text-zinc-700 -mr-1"
                    strokeWidth={2.5}
                  />
                  <ChevronRight
                    className="h-4 w-4 text-zinc-700 -ml-1"
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Full-screen analog/digital clock modal */}
      <Dialog open={isClockOpen} onOpenChange={setIsClockOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[450px] border-border bg-background/95 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden ring-1 ring-white/5"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col pt-12">
            <div className="flex flex-col items-center text-center space-y-1 mb-10 px-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60 mb-1">
                {country}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {city}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 text-[9px] font-bold text-primary tracking-widest uppercase">
                  GMT{offset}
                </span>
              </div>
              <p className="text-[11px] font-medium text-muted-foreground/50 tracking-tight mt-2">
                {timezone}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-8 pt-12 pb-28 bg-gradient-to-b from-primary/[0.04] to-transparent">
              <Clock
                time={zonedLiveDate}
                size="lg"
                clockType="both"
                theme="default"
                international={false}
              />
            </div>

            <div className="p-8 pt-0 flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all px-6 mb-4"
                onClick={() => setIsClockOpen(false)}
              >
                Close Monitor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
