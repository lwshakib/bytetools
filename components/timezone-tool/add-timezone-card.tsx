"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { CityData } from '@/lib/timezone-data';
import { useTimezoneStore } from '@/hooks/use-timezone-store';
import { cn } from '@/lib/utils';
import { TimezoneSearchInline } from './timezone-search-inline';

export const AddTimezoneCard = () => {
  const [isSearching, setIsSearching] = useState(false);
  const { addTimezone } = useTimezoneStore();
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
        !isSearching && "cursor-pointer hover:bg-accent/50 hover:border-accent border-dashed flex flex-col items-center justify-center text-center"
      )}
      onClick={() => !isSearching && setIsSearching(true)}
    >
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
