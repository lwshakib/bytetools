"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { CityData } from '@/lib/timezone-data';
import { useTimezoneStore } from '@/hooks/use-timezone-store';
import { cn } from '@/lib/utils';
import { TimezoneSearchInline } from './timezone-search-inline';
import { useSession } from '@/lib/auth-client';
import { Globe } from 'lucide-react';

export const AddTimezoneCard = () => {
  const [isSearching, setIsSearching] = useState(false);
  const { addTimezone } = useTimezoneStore();
  const { data: session } = useSession();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    };
    if (isSearching) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearching]);

  const handleSelect = (city: CityData) => {
    addTimezone({
      id: `${city.city.toLowerCase()}-${Date.now()}`,
      city: city.city,
      country: city.country,
      timezone: city.timezone,
    });
    setIsSearching(false);
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "relative bg-card border-border text-foreground w-full h-[220px] overflow-hidden transition-all duration-300 p-0 m-0",
        !isSearching && session?.user && "cursor-pointer hover:bg-accent/50 hover:border-accent border-dashed flex flex-col items-center justify-center text-center",
        !isSearching && !session?.user && "border-dashed flex flex-col items-center justify-center text-center"
      )}
      onClick={() => !isSearching && session?.user && setIsSearching(true)}
    >
      {!session?.user && (
        <div 
          className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[2px] cursor-pointer group/auth"
          onClick={() => document.getElementById('signin-trigger')?.click()}
        >
          <div className="flex flex-col items-center gap-4 px-6 text-center transition-transform group-hover/auth:scale-105">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg">
                <Globe className="w-6 h-6 text-blue-500" />
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Auth Required</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Sign in to add custom timezones to your global grid.</p>
            </div>
          </div>
        </div>
      )}
      {!isSearching ? (
        <>
          <div className="bg-accent p-4 rounded-full mb-2 transform transition-transform group-hover:scale-110">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Add Timezone</span>
        </>
      ) : (
        <TimezoneSearchInline 
          onSelect={handleSelect} 
          onClose={() => setIsSearching(false)} 
        />
      )}
    </Card>
  );
};
