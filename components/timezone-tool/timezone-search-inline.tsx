"use client";

import React from 'react';
import { X, Globe } from 'lucide-react';
import { 
  Command, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from '@/components/ui/command';
import { Command as CommandPrimitive } from 'cmdk';
import { cities, CityData } from '@/lib/timezone-data';
import { formatInTimeZone } from 'date-fns-tz';

interface TimezoneSearchInlineProps {
  onSelect: (city: CityData) => void;
  onClose: () => void;
  placeholder?: string;
}

export const TimezoneSearchInline: React.FC<TimezoneSearchInlineProps> = ({ 
  onSelect, 
  onClose,
  placeholder = "Timezone, city, or country"
}) => {
  return (
    <Command className="bg-transparent h-full flex flex-col p-0 m-0">
      <div className="flex items-center px-4 h-11 bg-transparent border-none shrink-0">
        <Globe className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
        <CommandPrimitive.Input 
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50 border-none focus:ring-0 h-full w-full"
          autoFocus
        />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-px bg-border/50 mx-4 shrink-0" />
      <CommandList className="flex-1 overflow-y-auto px-1 pb-2 pt-0 scrollbar-none">
        <CommandEmpty className="py-2 text-center text-muted-foreground text-[11px] italic font-medium">
          No results found.
        </CommandEmpty>
        <CommandGroup className="p-0">
          {cities.map((city, index) => {
            const now = new Date();
            const offset = formatInTimeZone(now, city.timezone, 'xxx');
            return (
              <CommandItem
                key={`${city.city}-${index}`}
                onSelect={() => onSelect(city)}
                className="flex items-center justify-between py-1.5 px-3 aria-selected:bg-accent cursor-pointer rounded-lg mb-0.5 transition-colors group/item"
              >
                <div className="flex flex-col max-w-[150px]">
                  <span className="text-xs font-semibold text-foreground truncate group-selected/item:text-primary">
                    {city.city}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium truncate">
                    {city.country}
                  </span>
                </div>
                <div className="bg-muted group-aria-selected:bg-accent px-1.5 py-0.5 rounded text-[8px] text-muted-foreground group-aria-selected:text-accent-foreground font-mono transition-colors">
                    GMT{offset}
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
