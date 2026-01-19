"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Settings2, ChevronLeft, ChevronRight, RotateCcw, Clock as ClockIcon } from 'lucide-react';
import { useTimezoneStore } from '@/hooks/use-timezone-store';
import { cn } from '@/lib/utils';
import { TimezoneSearchInline } from './timezone-search-inline';
import { CityData } from '@/lib/timezone-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Clock from '@/components/clock';

interface TimezoneCardProps {
  id: string;
  city: string;
  country: string;
  timezone: string;
}

export const TimezoneCard: React.FC<TimezoneCardProps> = ({ id, city, country, timezone }) => {
  const { baseTime, setTimeOffset, resetTime, removeTimezone, updateTimezone, selectedTimezones, selectedId, setSelectedId } = useTimezoneStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isClockOpen, setIsClockOpen] = useState(false);
  const [liveNow, setLiveNow] = useState(new Date());
  const cardRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isClockOpen) {
      const timer = setInterval(() => setLiveNow(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [isClockOpen]);

  const zonedLiveDate = useMemo(() => {
    return toZonedTime(liveNow, timezone);
  }, [liveNow, timezone]);
  
  const canDelete = selectedTimezones.length > 1 && id !== 'local';
  const isSelected = selectedId === id;
  
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

  // Calculate zoned time
  const zonedDate = useMemo(() => {
    return toZonedTime(new Date(baseTime), timezone);
  }, [baseTime, timezone]);

  const timeStr = format(zonedDate, 'hh:mm:ss');
  const amPm = format(zonedDate, 'a').toUpperCase();
  const offset = format(zonedDate, 'xxx');
  const dateStr = format(zonedDate, 'MMM dd');

  const minutesInDay = (zonedDate.getHours() * 60) + zonedDate.getMinutes();

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = parseInt(e.target.value, 10);
    const deltaMinutes = newMinutes - minutesInDay;
    if (deltaMinutes !== 0) {
      const newBaseTime = baseTime + deltaMinutes * 60000;
      setTimeOffset(newBaseTime - Date.now());
    }
  }, [baseTime, minutesInDay, setTimeOffset]);

  const handleSelect = (newCity: CityData) => {
    updateTimezone(id, {
      city: newCity.city,
      country: newCity.country,
      timezone: newCity.timezone
    });
    setIsEditing(false);
  };

  // Memoize ticks to prevent re-render on every tick
  const ticks = useMemo(() => {
    return Array.from({ length: 97 }, (_, i) => {
      const tickMinute = i * 15;
      const dist = Math.abs(tickMinute - minutesInDay);
      const isNearHandle = dist <= 60;
      
      let heightClass = "h-2";
      let colorClass = "bg-zinc-800/40";
      
      if (i % 24 === 0) {
        heightClass = "h-5";
        colorClass = "bg-zinc-600";
      } else if (i % 4 === 0) {
        heightClass = "h-3";
        colorClass = "bg-zinc-700";
      }
      
      if (isNearHandle) {
        colorClass = "bg-zinc-300";
      }
      
      return (
        <div 
          key={i} 
          className={cn("w-px", heightClass, colorClass)} 
        />
      );
    });
  }, [minutesInDay]);

  const handlePosition = (minutesInDay / 1440) * 100;

  return (
    <>
    <Card 
      ref={cardRef}
      onClick={() => setSelectedId(id)}
      className={cn(
        "relative bg-card border-border text-card-foreground w-full h-[220px] group overflow-hidden shadow-xl p-0 m-0 flex flex-col cursor-default transition-colors",
        isSelected && !isEditing ? "ring-2 ring-primary/50 border-primary/20" : "border-border",
        !isEditing && "hover:border-accent"
    )}>
      {isEditing ? (
        <TimezoneSearchInline 
          onSelect={handleSelect} 
          onClose={() => setIsEditing(false)}
          placeholder={`Search to replace ${city}...`}
        />
      ) : (
        <div className="flex-1 flex flex-col justify-between px-6 py-4">
          {/* Accent Gradient */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-border to-transparent opacity-50 group-hover:opacity-100" />

          <div className="flex justify-between items-start z-10">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest truncate">
                  {city}
                </h3>
                {id === 'local' && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-500 uppercase tracking-widest">
                        Home
                    </span>
                )}
                {country && (
                    <span className="text-muted-foreground/30 text-[10px]">•</span>
                )}
                <span className="text-muted-foreground/70 text-[10px] uppercase font-medium truncate">
                    {country}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-light tracking-tighter text-foreground tabular-nums">{timeStr}</span>
                <span className="text-xl font-medium text-muted-foreground tracking-tight">{amPm}</span>
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
            <div className="flex gap-0.5 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  resetTime();
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

          {/* Slider Area */}
          <div className="relative h-14 mt-auto select-none">
            {/* Ruler Line */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border" />
            
            {/* Ticks Container */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center h-6">
              {ticks}
            </div>

            {/* Labels */}
            <div className="absolute bottom-0 inset-x-0 flex justify-between text-[10px] text-primary font-medium">
              <span>00</span>
              <span>06</span>
              <span>12</span>
              <span>18</span>
              <span>24</span>
            </div>

            {/* Hidden Range Input */}
            <input
              ref={sliderRef}
              type="range"
              min="0"
              max="1439"
              step="1"
              value={minutesInDay}
              onChange={handleSliderChange}
              className="absolute inset-x-0 top-0 bottom-6 w-full opacity-0 cursor-ew-resize z-20"
            />
            
            {/* Visual Handle */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 pointer-events-none z-10"
              style={{ left: `${handlePosition}%` }}
            >
              <div className="w-full h-full bg-[#d4d4d4] rounded-full flex items-center justify-center shadow-md">
                <ChevronLeft className="h-4 w-4 text-zinc-700 -mr-1" strokeWidth={2.5} />
                <ChevronRight className="h-4 w-4 text-zinc-700 -ml-1" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>

      <Dialog open={isClockOpen} onOpenChange={setIsClockOpen}>
        <DialogContent className="sm:max-w-[500px] border-border bg-background backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-primary" />
              {city} Time
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 py-12 bg-gradient-to-b from-primary/5 to-transparent">
            <Clock 
               time={zonedLiveDate} 
               size="lg" 
               clockType="both" 
               theme="default"
               international={false}
            />
          </div>
          <div className="bg-muted/30 p-6 flex justify-between items-center border-t border-border">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{country}</span>
              <span className="text-xs font-bold text-foreground">{timezone}</span>
            </div>
            <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">GMT{offset}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
