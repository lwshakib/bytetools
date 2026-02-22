'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, Activity } from 'lucide-react';
import {
  differenceInYears,
  differenceInMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

import { DateTimePicker } from '@/components/ui/datetime-picker';

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
  /* State to track the birth date and time selected by the user */
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    new Date(2000, 0, 1, 0, 0)
  );

  /* State to track the comparison date (defaults to current time) */
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  /**
   * Recalculate the age breakdown whenever birth date or current date changes.
   */
  const ageBreakdown = React.useMemo(() => {
    if (!birthDate) return null;

    const now = currentDate;
    return {
      /* Calculate years between dates */
      years: differenceInYears(now, birthDate),
      /* Calculate remaining months after years */
      months: differenceInMonths(now, birthDate) % 12,
      /* Calculate remaining days after months */
      days: differenceInDays(now, birthDate) % 30,
      /* Calculate remaining hours after days */
      hours: differenceInHours(now, birthDate) % 24,
      /* Calculate remaining minutes after hours */
      minutes: differenceInMinutes(now, birthDate) % 60,
      /* Calculate remaining seconds after minutes */
      seconds: differenceInSeconds(now, birthDate) % 60,

      /* Total calculations in single units */
      totalDays: differenceInDays(now, birthDate),
      totalHours: differenceInHours(now, birthDate),
      totalMinutes: differenceInMinutes(now, birthDate),
      totalSeconds: differenceInSeconds(now, birthDate),
    } as AgeBreakdown;
  }, [birthDate, currentDate]);

  // Update current date every second to keep the "Live" feel if desired,
  // though typically users want to set a specific current date.
  // Let's keep a "Now" button or just let it be static unless they click "Now".

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto">
      <div className="flex-1 flex flex-col p-4 md:p-12">
        <div className="max-w-5xl mx-auto w-full flex flex-col items-center">
          {/* 
              Header Section: Branding and title for the Chronological 
              Decomposition (Age Calculator) tool.
          */}
          <div className="flex flex-col items-center text-center space-y-4 mb-12 md:mb-20 w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-border/50 text-foreground text-[10px] font-bold uppercase tracking-widest"
            >
              <Clock className="w-3.5 h-3.5 text-primary" />
              Temporal Analysis
            </motion.div>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em] opacity-40">
              Precision Chronological Decomposition
            </p>
          </div>

          {/* Main Calculator card */}
          {/* 
              Main Calculator card: Container for input controls and results. 
              Features a blurred background glow for premium aesthetic.
          */}
          <div className="relative mb-24 w-full">
            <div className="absolute -inset-20 bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col p-6 sm:p-8 md:p-14 bg-card/40 border border-border/50 rounded-xl shadow-xl backdrop-blur-md w-full overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-8 md:gap-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">
                      Birth Date & Time
                    </Label>
                    <DateTimePicker
                      date={birthDate}
                      setDate={(d) => setBirthDate(d)}
                      label="Select Birth Date"
                    />
                  </div>

                  <div className="space-y-6">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">
                      Current Date & Time
                    </Label>
                    <div className="flex flex-col gap-2">
                      <DateTimePicker
                        date={currentDate}
                        setDate={(d) => setCurrentDate(d)}
                        label="Select Current Date"
                      />
                      <Button
                        variant="ghost"
                        className="self-end text-[10px] font-bold uppercase tracking-widest h-8 text-primary/60 hover:text-primary"
                        onClick={() => setCurrentDate(new Date())}
                      >
                        Snap to Now
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 
                    Results Display: Shown once a birth date is selected.
                */}
                {ageBreakdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                  >
                    {/* Primary Age Result (Years) */}
                    <div className="text-center space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
                        Lived Duration
                      </span>
                      <div className="flex items-baseline justify-center gap-2 md:gap-3">
                        <span className="text-[60px] sm:text-[80px] md:text-[120px] font-bold tracking-tighter tabular-nums text-foreground leading-none">
                          {ageBreakdown.years}
                        </span>
                        <span className="text-xl md:text-2xl font-bold text-primary uppercase tracking-widest">
                          Years
                        </span>
                      </div>
                    </div>

                    {/* Secondary Units breakdown (Months, Days, etc.) */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: 'Months', value: ageBreakdown.months },
                        { label: 'Days', value: ageBreakdown.days },
                        { label: 'Hours', value: ageBreakdown.hours },
                        { label: 'Minutes', value: ageBreakdown.minutes },
                        { label: 'Seconds', value: ageBreakdown.seconds },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="p-4 bg-muted/10 border border-border/50 rounded-lg text-center space-y-1"
                        >
                          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block">
                            {item.label}
                          </span>
                          <span className="text-lg font-bold font-mono tabular-nums text-foreground">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Global Statistics: Cumulative counts for days, hours, etc. */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-10 border-t border-border/50">
                      {[
                        {
                          label: 'Total Days',
                          value: ageBreakdown.totalDays.toLocaleString(),
                          icon: CalendarIcon,
                        },
                        {
                          label: 'Total Hours',
                          value: ageBreakdown.totalHours.toLocaleString(),
                          icon: Clock,
                        },
                        {
                          label: 'Total Minutes',
                          value: ageBreakdown.totalMinutes.toLocaleString(),
                          icon: Activity,
                        },
                        {
                          label: 'Total Seconds',
                          value: ageBreakdown.totalSeconds.toLocaleString(),
                          icon: Clock,
                        },
                      ].map((stat, i) => (
                        <div
                          key={i}
                          className="p-4 bg-muted/5 border border-border/50 rounded-lg space-y-3"
                        >
                          <div className="flex items-center gap-2">
                            <stat.icon className="w-3 h-3 text-primary/40" />
                            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30">
                              {stat.label}
                            </span>
                          </div>
                          <p className="text-sm font-bold font-mono tabular-nums text-foreground">
                            {stat.value}
                          </p>
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
