"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ShieldCheck, 
  Zap,
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
    <div className="flex flex-1 flex-col h-full bg-background overflow-y-auto p-6 md:p-8 lg:p-12">
      <div className="w-full max-w-5xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
          >
            <Clock className="w-3.5 h-3.5" />
            Temporal Analysis Active
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase">
            AGE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">ARCHITECT</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.3em] opacity-40">
            Precision Chronological Decomposition
          </p>
        </div>

        {/* Main Calculator Card */}
        <Card className="bg-card/50 border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
          <CardContent className="p-10 space-y-10">
            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                  Birth Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-16 justify-start text-left font-bold text-lg rounded-2xl border-border/50 bg-muted/20",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-4 h-5 w-5 text-purple-500" />
                      {birthDate ? format(birthDate, "PPP") : "Select birth date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border-border shadow-2xl" align="start">
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

              <div className="space-y-6">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                  Current Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-16 justify-start text-left font-bold text-lg rounded-2xl border-border/50 bg-muted/20"
                      )}
                    >
                      <CalendarIcon className="mr-4 h-5 w-5 text-purple-500" />
                      {format(currentDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border-border shadow-2xl" align="start">
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

            {/* Age Display */}
            {ageBreakdown && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Main Age Display */}
                <div className="relative group">
                  <div className="absolute -inset-10 bg-purple-500/5 blur-[100px] rounded-full opacity-50" />
                  <div className="relative p-12 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-[3rem] shadow-2xl">
                    <div className="text-center space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500/60">
                        Chronological Age
                      </span>
                      <div className="flex items-baseline justify-center gap-4">
                        <span className="text-[120px] md:text-[180px] font-black tracking-tighter tabular-nums text-foreground leading-none">
                          {ageBreakdown.years}
                        </span>
                        <span className="text-4xl font-black text-purple-500 uppercase tracking-widest">
                          Years
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Months', value: ageBreakdown.months, color: 'text-purple-500' },
                    { label: 'Days', value: ageBreakdown.days, color: 'text-pink-500' },
                    { label: 'Hours', value: ageBreakdown.hours, color: 'text-purple-500' },
                    { label: 'Minutes', value: ageBreakdown.minutes, color: 'text-pink-500' },
                    { label: 'Seconds', value: ageBreakdown.seconds, color: 'text-purple-500' },
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-muted/20 border border-border/50 rounded-2xl text-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 block mb-2">
                        {item.label}
                      </span>
                      <span className={cn("text-3xl font-black font-mono tabular-nums", item.color)}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8 border-t border-border/50">
                  {[
                    { label: 'Total Days', value: ageBreakdown.totalDays.toLocaleString(), icon: CalendarIcon },
                    { label: 'Total Hours', value: ageBreakdown.totalHours.toLocaleString(), icon: Clock },
                    { label: 'Total Minutes', value: ageBreakdown.totalMinutes.toLocaleString(), icon: Activity },
                    { label: 'Total Seconds', value: ageBreakdown.totalSeconds.toLocaleString(), icon: Clock },
                  ].map((stat, i) => (
                    <div key={i} className="p-6 bg-card border border-border/50 rounded-2xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <stat.icon className="w-5 h-5 text-purple-500" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                          {stat.label}
                        </span>
                      </div>
                      <p className="text-2xl font-black font-mono tabular-nums text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Real-time Updates", desc: "Live second-by-second age calculation with millisecond precision.", color: "text-purple-500", bg: "bg-purple-500/10" },
            { icon: Zap, title: "Multi-format Output", desc: "Comprehensive breakdown across years, months, days, hours, minutes, and seconds.", color: "text-amber-500", bg: "bg-amber-500/10" },
            { icon: Activity, title: "Total Statistics", desc: "Aggregate calculations showing total days, hours, minutes, and seconds lived.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-card border border-border/50 relative overflow-hidden group">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110", item.bg)}>
                <item.icon className={cn("w-6 h-6", item.color)} />
              </div>
              <h4 className="text-[10px] font-black text-foreground mb-3 uppercase tracking-widest">{item.title}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tighter opacity-40">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
