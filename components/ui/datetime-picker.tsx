'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date) => void;
  label?: string;
}

export function DateTimePicker({ date, setDate, label }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date
  );
  const [use12Hour, setUse12Hour] = React.useState(true);

  const hours24 = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    const current = date || new Date();
    const updated = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
      current.getHours(),
      current.getMinutes(),
      current.getSeconds()
    );
    setSelectedDate(updated);
    setDate(updated);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', value: number) => {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    if (type === 'hours') newDate.setHours(value);
    else newDate.setMinutes(value);
    setSelectedDate(newDate);
    setDate(newDate);
  };

  const toggleAmPm = () => {
    if (!selectedDate) return;
    const currentHours = selectedDate.getHours();
    const newDate = new Date(selectedDate);
    if (currentHours >= 12) newDate.setHours(currentHours - 12);
    else newDate.setHours(currentHours + 12);
    setSelectedDate(newDate);
    setDate(newDate);
  };

  const displayHours = use12Hour
    ? Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i))
    : hours24;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-bold h-12 rounded-lg border-border/50 bg-muted/20 px-4 group hover:border-primary/30 transition-all',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
          {date ? (
            format(date, 'PPP ' + (use12Hour ? 'p' : 'HH:mm'))
          ) : (
            <span>{label || 'Pick date & time'}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 flex flex-col md:flex-row rounded-xl border-border shadow-2xl bg-card/95 backdrop-blur-xl shrink-0"
        align="start"
      >
        <div className="flex flex-col md:flex-row">
          <div className="p-3 border-r border-border/50">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              captionLayout="dropdown"
              fromYear={1900}
              toYear={new Date().getFullYear()}
            />
          </div>
          <div className="flex flex-col border-t md:border-t-0 md:w-36 bg-muted/5">
            <div className="p-3 border-b border-border/50 bg-muted/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  Configuration
                </span>
                <button
                  onClick={() => setUse12Hour(!use12Hour)}
                  className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[8px] font-bold uppercase hover:bg-primary/20 transition-colors"
                >
                  {use12Hour ? '12H' : '24H'}
                </button>
              </div>

              {use12Hour && selectedDate && (
                <div className="flex rounded-md border border-border/50 overflow-hidden">
                  <button
                    onClick={toggleAmPm}
                    disabled={selectedDate.getHours() < 12}
                    className={cn(
                      'flex-1 py-1 text-[9px] font-bold transition-all',
                      selectedDate.getHours() < 12
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground/50 hover:text-foreground'
                    )}
                  >
                    AM
                  </button>
                  <button
                    onClick={toggleAmPm}
                    disabled={selectedDate.getHours() >= 12}
                    className={cn(
                      'flex-1 py-1 text-[9px] font-bold transition-all',
                      selectedDate.getHours() >= 12
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground/50 hover:text-foreground'
                    )}
                  >
                    PM
                  </button>
                </div>
              )}
            </div>

            <div className="flex h-[160px]">
              <ScrollArea className="flex-1 border-r border-border/10">
                <div className="flex flex-col p-1.5 gap-1">
                  {displayHours.map((h) => {
                    let hourValue = h;
                    if (use12Hour) {
                      const isPm = selectedDate
                        ? selectedDate.getHours() >= 12
                        : false;
                      if (h === 12) hourValue = isPm ? 12 : 0;
                      else hourValue = isPm ? h + 12 : h;
                    }
                    return (
                      <Button
                        key={h}
                        variant="ghost"
                        className={cn(
                          'h-8 w-full text-[11px] font-bold px-0 justify-center rounded-md transition-all',
                          selectedDate?.getHours() === hourValue
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-muted/50 text-muted-foreground/40 hover:text-foreground'
                        )}
                        onClick={() => handleTimeChange('hours', hourValue)}
                      >
                        {h.toString().padStart(2, '0')}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
              <ScrollArea className="flex-1">
                <div className="flex flex-col p-1.5 gap-1">
                  {minutes.map((m) => (
                    <Button
                      key={m}
                      variant="ghost"
                      className={cn(
                        'h-8 w-full text-[11px] font-bold px-0 justify-center rounded-md transition-all',
                        selectedDate?.getMinutes() === m
                          ? 'bg-primary/20 text-primary border border-primary/10'
                          : 'hover:bg-muted/50 text-muted-foreground/40 hover:text-foreground'
                      )}
                      onClick={() => handleTimeChange('minutes', m)}
                    >
                      {m.toString().padStart(2, '0')}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
