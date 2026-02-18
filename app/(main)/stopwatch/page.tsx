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
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
        "flex flex-1 flex-col h-full bg-background transition-all duration-500",
        isFullscreen ? "fixed inset-0 z-50 p-20" : "p-8 md:p-12"
    )}>
      <div className="w-full h-full max-w-5xl mx-auto flex flex-col space-y-12">
        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            <div className="relative group">
                <div className="absolute -inset-20 bg-primary/5 blur-3xl rounded-full opacity-30 animate-pulse" />
                <div className="relative flex flex-col items-center select-none cursor-default">
                    <div className="flex items-baseline">
                        <span className="text-[120px] md:text-[180px] font-mono font-bold tracking-tighter tabular-nums leading-none">
                            {t.m}<span className="text-muted-foreground/20">:</span>{t.s}
                        </span>
                        <span className="text-[40px] md:text-[60px] font-mono font-bold text-primary tabular-nums ml-4 opacity-80">
                            {t.ms}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    onClick={toggleStopwatch}
                    size="lg"
                    className={cn(
                        "h-16 px-12 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-none transition-all active:scale-95 gap-3",
                        isRunning ? "bg-zinc-800 text-white" : "bg-primary text-primary-foreground"
                    )}
                >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isRunning ? 'Hold' : 'Launch'}
                </Button>
                
                <Button
                    onClick={addLap}
                    disabled={!isRunning}
                    variant="outline"
                    className="h-16 w-16 rounded-2xl border-border/50 hover:bg-muted"
                >
                    <Flag className="w-4 h-4" />
                </Button>

                <Button
                    onClick={resetStopwatch}
                    variant="outline"
                    className="h-16 w-16 rounded-2xl border-border/50 hover:bg-muted"
                >
                    <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    variant="ghost"
                    className="h-16 w-16 rounded-2xl hover:bg-muted opacity-20 hover:opacity-100 transition-all"
                >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
            </div>
        </div>

        <AnimatePresence>
            {laps.length > 0 && !isFullscreen && (
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-8 shrink-0"
                >
                    <div className="md:col-span-4 space-y-1">
                        {[
                            { label: 'Delta Avg', val: formatTime(averageLap), icon: Activity },
                            { label: 'Optimum', val: formatTime(laps[bestLapIndex] || 0), icon: TrendingUp, color: 'text-emerald-500' },
                            { label: 'Standard', val: formatTime(laps[worstLapIndex] || 0), icon: TrendingDown, color: 'text-red-500' }
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-card/40 border border-border/10 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-1.5 rounded-lg bg-muted/20", stat.color)}>
                                        <stat.icon className="w-3 h-3" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{stat.label}</span>
                                </div>
                                <span className="text-xs font-mono font-bold">{stat.val.m}:{stat.val.s}</span>
                            </div>
                        ))}
                    </div>

                    <div className="md:col-span-8 overflow-y-auto max-h-[255px] space-y-1 pr-2 thin-scrollbar">
                        <div className="flex items-center justify-between px-4 pb-2">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Registry</span>
                             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Delta</span>
                        </div>
                        {laps.map((lap, i) => {
                            const lt = formatTime(lap);
                            const idx = laps.length - i;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl transition-all border",
                                        i === bestLapIndex ? "bg-emerald-500/5 border-emerald-500/20" : 
                                        i === worstLapIndex ? "bg-red-500/5 border-red-500/20" : 
                                        "bg-muted/10 border-border/5"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-mono font-bold opacity-30">{idx.toString().padStart(2, '0')}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Mark</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm font-mono font-bold">{lt.m}:{lt.s}</span>
                                        <span className="text-[10px] font-mono opacity-40">.{lt.ms}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
