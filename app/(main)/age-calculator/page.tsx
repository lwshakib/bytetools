"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Activity
} from 'lucide-react';
import { format, differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, startOfToday } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AgeBreakdown {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

export default function AgeCalculatorPage() {
  const [birthDate, setBirthDate] = useState<Date | undefined>(new Date(2000, 0, 1));
  const [currentDate, setCurrentDate] = useState<Date>(startOfToday());
  const [ageBreakdown, setAgeBreakdown] = useState<AgeBreakdown | null>(null);

  useEffect(() => {
    if (birthDate) {
      const now = currentDate;
      const breakdown: AgeBreakdown = {
        years: differenceInYears(now, birthDate),
        months: differenceInMonths(now, birthDate) % 12,
        days: differenceInDays(now, birthDate) % 30,
        hours: differenceInHours(now, birthDate) % 24,
        minutes: differenceInMinutes(now, birthDate) % 60,
        seconds: differenceInSeconds(now, birthDate) % 60,
        totalDays: differenceInDays(now, birthDate),
        totalHours: differenceInHours(now, birthDate),
        totalMinutes: differenceInMinutes(now, birthDate),
        totalSeconds: differenceInSeconds(now, birthDate),
      };
      setAgeBreakdown(breakdown);
    }
  }, [birthDate, currentDate]);

  // Update seconds in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto">
      <div className="flex-1 flex flex-col p-6 md:p-12">
        <div className="max-w-2xl mx-auto w-full flex flex-col items-center">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center space-y-4 mb-20 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-border/50 text-foreground text-[10px] font-bold uppercase tracking-widest"
            >
              <Clock className="w-3.5 h-3.5 text-primary" />
              Temporal Analysis
            </motion.div>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em] opacity-40">Precision Chronological Decomposition</p>
          </div>

          {/* Main Calculator card */}
          <div className="relative mb-24 w-full">
            <div className="absolute -inset-20 bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col p-8 md:p-14 bg-card/40 border border-border/50 rounded-xl shadow-xl backdrop-blur-md w-full overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Birth Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-bold text-sm rounded-lg border-border/50 bg-muted/20",
                            !birthDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
                          {birthDate ? format(birthDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl border-border shadow-2xl" align="start">
                        <Calendar
                          mode="single"
                          selected={birthDate}
                          onSelect={setBirthDate}
                          initialFocus
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Current Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 justify-start text-left font-bold text-sm rounded-lg border-border/50 bg-muted/20"
                        >
                          <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
                          {format(currentDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl border-border shadow-2xl" align="start">
                        <Calendar
                          mode="single"
                          selected={currentDate}
                          onSelect={(date) => date && setCurrentDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {ageBreakdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                  >
                    <div className="text-center space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Lived Duration</span>
                      <div className="flex items-baseline justify-center gap-3">
                        <span className="text-[80px] md:text-[120px] font-bold tracking-tighter tabular-nums text-foreground leading-none">
                          {ageBreakdown.years}
                        </span>
                        <span className="text-2xl font-bold text-primary uppercase tracking-widest">Years</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: 'Months', value: ageBreakdown.months },
                        { label: 'Days', value: ageBreakdown.days },
                        { label: 'Hours', value: ageBreakdown.hours },
                        { label: 'Minutes', value: ageBreakdown.minutes },
                        { label: 'Seconds', value: ageBreakdown.seconds },
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-muted/10 border border-border/50 rounded-lg text-center space-y-1">
                          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block">{item.label}</span>
                          <span className="text-lg font-bold font-mono tabular-nums text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-10 border-t border-border/50">
                      {[
                        { label: 'Total Days', value: ageBreakdown.totalDays.toLocaleString(), icon: CalendarIcon },
                        { label: 'Total Hours', value: ageBreakdown.totalHours.toLocaleString(), icon: Clock },
                        { label: 'Total Minutes', value: ageBreakdown.totalMinutes.toLocaleString(), icon: Activity },
                        { label: 'Total Seconds', value: ageBreakdown.totalSeconds.toLocaleString(), icon: Clock },
                      ].map((stat, i) => (
                        <div key={i} className="p-4 bg-muted/5 border border-border/50 rounded-lg space-y-3">
                          <div className="flex items-center gap-2">
                            <stat.icon className="w-3 h-3 text-primary/40" />
                            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30">{stat.label}</span>
                          </div>
                          <p className="text-sm font-bold font-mono tabular-nums text-foreground">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
