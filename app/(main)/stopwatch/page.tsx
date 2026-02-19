"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flag, 
  Timer, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StopwatchPage() {
  /* Total elapsed time in milliseconds */
  const [time, setTime] = useState(0);
  
  /* Running state of the timer */
  const [isRunning, setIsRunning] = useState(false);
  
  /* List of captured lap durations */
  const [laps, setLaps] = useState<number[]>([]);
  
  /* Fullscreen focus mode toggle */
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  /* References for precise frame-based timing */
  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number | undefined>(undefined);

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp - time;
    const current = timestamp - startTimeRef.current;
    setTime(current);
    requestRef.current = requestAnimationFrame(animate);
  }, [time]);

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startTimeRef.current = 0;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, animate]);

  const toggleStopwatch = () => setIsRunning(!isRunning);
  const resetStopwatch = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const addLap = () => {
    const lastLapTime = laps.reduce((acc, curr) => acc + curr, 0);
    const lapDuration = time - lastLapTime;
    setLaps([lapDuration, ...laps]);
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    return {
      h: hours.toString().padStart(2, '0'),
      m: minutes.toString().padStart(2, '0'),
      s: seconds.toString().padStart(2, '0'),
      ms: milliseconds.toString().padStart(2, '0'),
    };
  };

  const t = formatTime(time);
  const bestLapIndex = laps.length > 0 ? laps.indexOf(Math.min(...laps)) : -1;
  const worstLapIndex = laps.length > 0 ? laps.indexOf(Math.max(...laps)) : -1;
  const averageLap = laps.length > 0 ? laps.reduce((a, b) => a + b, 0) / laps.length : 0;

  return (
    <div className={cn(
        "flex flex-1 flex-col h-full bg-background overflow-hidden transition-all duration-500",
        isFullscreen ? "fixed inset-0 z-50" : "p-4 md:p-12"
    )}>
      <div className="w-full h-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Header Section */}
        {!isFullscreen && (
            <div className="flex flex-col items-center text-center space-y-4 mb-12 sm:mb-16">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-border/50 text-foreground text-[10px] font-bold uppercase tracking-widest"
                >
                    <Timer className="w-3.5 h-3.5 text-primary" />
                    Temporal Tracking
                </motion.div>
                <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em] opacity-40">Precision Millisecond Synchronization</p>
            </div>
        )}

        {/* Time Display */}
        <div className={cn(
            "relative flex-1 flex flex-col items-center justify-center w-full",
            isFullscreen ? "mb-0" : "mb-12 sm:mb-20"
        )}>
            <div className="absolute -inset-40 bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-40" />
            
            <motion.div 
                layoutId="stopwatch-display"
                className={cn(
                    "relative flex flex-col items-center justify-center select-none",
                    isFullscreen ? "scale-150" : ""
                )}
            >
                <div className="flex items-baseline gap-1">
                    <span className="text-[72px] sm:text-[100px] md:text-[140px] font-bold tracking-tighter tabular-nums leading-none">
                        {t.m}<span className="text-muted-foreground/10 mx-1">:</span>{t.s}
                    </span>
                    <span className="text-[24px] sm:text-[32px] md:text-[48px] font-bold text-primary tabular-nums tracking-tight opacity-60">
                        {t.ms}
                    </span>
                </div>
            </motion.div>

            <div className="flex items-center justify-center gap-2 sm:gap-4 mt-8 sm:mt-16 pb-1 flex-wrap">
                <Button
                    onClick={toggleStopwatch}
                    size="lg"
                    className={cn(
                        "h-12 sm:h-14 px-6 sm:px-10 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 gap-3",
                        isRunning ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                >
                    {isRunning ? <Pause className="w-3.5 h-3.5 sm:w-4 h-4 fill-current" /> : <Play className="w-3.5 h-3.5 sm:w-4 h-4 fill-current" />}
                    {isRunning ? 'Pause' : 'Start'}
                </Button>
                
                <div className="flex items-center gap-2">
                    <Button
                        onClick={addLap}
                        disabled={!isRunning}
                        variant="outline"
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-border/50 hover:bg-muted transition-all active:scale-95"
                    >
                        <Flag className="w-4 h-4" />
                    </Button>

                    <Button
                        onClick={resetStopwatch}
                        variant="outline"
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-border/50 hover:bg-muted transition-all active:scale-95"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>

                    <Button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border border-border/50 bg-muted/10 text-muted-foreground hover:text-foreground transition-all active:scale-95"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                </div>
            </div>
        </div>

        {/* Stats & Laps Section */}
        <AnimatePresence>
            {laps.length > 0 && !isFullscreen && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 shrink-0 pb-12"
                >
                    {/* Insights */}
                    <div className="lg:col-span-4 space-y-3">
                        <div className="px-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Temporal Insights</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { label: 'Delta Average', val: formatTime(averageLap), icon: Activity, color: 'text-primary' },
                                { label: 'Fastest Mark', val: formatTime(laps[bestLapIndex] || 0), icon: TrendingUp, color: 'text-emerald-500' },
                                { label: 'Slowest Mark', val: formatTime(laps[worstLapIndex] || 0), icon: TrendingDown, color: 'text-amber-500' }
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-1.5 rounded-lg bg-background/50", stat.color)}>
                                            <stat.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">{stat.label}</span>
                                    </div>
                                    <span className="text-xs font-bold tabular-nums tracking-tight">{stat.val.m}:{stat.val.s}<span className="opacity-30 text-[10px]">.{stat.val.ms}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Registry */}
                    <div className="lg:col-span-8 flex flex-col space-y-3">
                        <div className="flex items-center justify-between px-1">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Lap Registry</span>
                             <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/20 italic">Last Updated: {t.m}:{t.s}</span>
                        </div>
                        <div className="grid gap-2 overflow-y-auto max-h-[220px] pr-2 thin-scrollbar">
                            {laps.map((lap, i) => {
                                const lt = formatTime(lap);
                                const idx = laps.length - i;
                                return (
                                    <motion.div
                                        key={idx}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl transition-all border",
                                            i === bestLapIndex ? "bg-emerald-500/5 border-emerald-500/10" : 
                                            i === worstLapIndex ? "bg-amber-500/5 border-amber-500/10" : 
                                            "bg-card/40 border-border/50 shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-6">
                                            <span className="text-[9px] font-bold text-muted-foreground/20 tabular-nums">#{idx.toString().padStart(2, '0')}</span>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-none mb-1.5">Mark Capture</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-sm font-bold tabular-nums tracking-tight">{lt.m}:{lt.s}</span>
                                                    <span className="text-[10px] font-bold opacity-30">.{lt.ms}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {i === bestLapIndex && <TrendingUp className="w-3.5 h-3.5 text-emerald-500/50" />}
                                            {i === worstLapIndex && <TrendingDown className="w-4 h-4 text-amber-500/50" />}
                                            <div className="h-8 w-[1px] bg-border/50 mx-2" />
                                            <ChevronRight className="w-3 h-3 text-muted-foreground/20" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
