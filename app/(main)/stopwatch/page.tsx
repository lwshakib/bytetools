"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play,
  Pause,
  RotateCcw,
  Flag,
  Maximize2,
  Minimize2,
  Timer,
  Zap,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Lap {
  lap: number;
  lapTime: number;
  overallTime: number;
}

export default function StopwatchPage() {
  const [time, setTime] = useState(0); // in milliseconds
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastLapTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time]);

  const handleStartStop = () => setIsRunning(!isRunning);
  const handleReset = () => { setIsRunning(false); setTime(0); setLaps([]); lastLapTimeRef.current = 0; };
  const handleLap = () => {
    if (!isRunning) return;
    const lapTime = time - lastLapTimeRef.current;
    const newLap: Lap = { lap: laps.length + 1, lapTime: lapTime, overallTime: time };
    setLaps([newLap, ...laps]);
    lastLapTimeRef.current = time;
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000));
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      milliseconds: milliseconds.toString().padStart(3, '0'),
    };
  };

  const formatLapTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000));
    if (minutes > 0) return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const { minutes, seconds, milliseconds } = formatTime(time);

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden lg:flex-row">
      <div className="flex-1 flex flex-col p-6 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center space-y-4 mb-20">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
                >
                    <Activity className="w-3.5 h-3.5" />
                    Temporal Extraction Active
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase">CHRONO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">STASIS</span></h1>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.3em] opacity-40">High-Precision Micro-temporal Logging</p>
            </div>

            {/* Time Display */}
            <div className="relative mb-20 group">
                <div className="absolute -inset-20 bg-blue-500/5 blur-[120px] rounded-full opacity-50 transition-all group-hover:bg-blue-500/10" />
                <motion.div 
                    layoutId="main-clock"
                    className="relative flex flex-col items-center justify-center p-16 md:p-24 bg-card/40 border border-border/50 rounded-[4rem] shadow-2xl backdrop-blur-xl border-b-8 border-blue-500/20"
                >
                    <div className="flex items-baseline gap-4">
                        <div className="flex flex-col items-center">
                            <span className="text-[100px] md:text-[180px] font-black tracking-tighter tabular-nums leading-none text-foreground">{minutes}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mt-4">Minutes</span>
                        </div>
                        <span className="text-6xl font-light text-muted-foreground/20 animate-pulse">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-[100px] md:text-[180px] font-black tracking-tighter tabular-nums leading-none text-foreground">{seconds}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mt-4">Seconds</span>
                        </div>
                        <div className="flex flex-col items-start ml-4 pb-12">
                            <span className="text-3xl md:text-5xl font-black tabular-nums text-blue-500">{milliseconds}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-500/40">MS</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-16">
                        <Button
                          onClick={handleStartStop}
                          className={cn(
                            "h-16 px-12 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 gap-3",
                            isRunning ? "bg-zinc-800 text-white" : "bg-blue-500 text-white shadow-blue-500/20"
                          )}
                        >
                          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                          {isRunning ? 'Deactivate' : 'Initialize'}
                        </Button>
                        <Button
                            onClick={handleLap}
                            disabled={!isRunning}
                            variant="ghost"
                            className="h-16 w-16 rounded-[2rem] border border-border/50 bg-muted/20 text-foreground transition-all active:scale-95 disabled:opacity-20"
                        >
                            <Flag className="w-5 h-5" />
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="h-16 w-16 rounded-[2rem] border-border/50 hover:bg-muted text-foreground transition-all active:scale-95"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Tech Specs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-border/10 pt-12 max-w-5xl">
                {[
                    { icon: ShieldCheck, title: "Precision Lock", desc: "Native 10ms polling interval for sub-second precision tracking.", color: "text-blue-500", bg: "bg-blue-500/10" },
                    { icon: Zap, title: "Zero Latency", desc: "Edge-computed temporal logic for instantaneous feedback loops.", color: "text-amber-500", bg: "bg-amber-500/10" },
                    { icon: Activity, title: "Parity Sync", desc: "Synchronized logic across local temporal partitions.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
                ].map((item, i) => (
                    <div key={i} className="p-8 rounded-[2rem] bg-card/40 border border-border/50 relative overflow-hidden group">
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

      {/* Right Side: Lap Ledger */}
      <div className="w-full lg:w-[450px] border-l border-border/50 bg-card/20 flex flex-col shrink-0">
        <div className="p-10 border-b border-border/50 bg-muted/30 flex items-center justify-between">
            <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                    <Flag className="w-4 h-4 text-blue-500" />
                    Temporal Ledger
                </h3>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Segmented Record Store</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-10 w-10 text-muted-foreground/30 hover:text-foreground rounded-xl"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="popLayout">
                {laps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-10 space-y-6">
                        <Timer className="w-16 h-16" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting temporal splits</p>
                    </div>
                ) : (
                    <div className="p-6 space-y-3">
                        {laps.map((lap, index) => {
                            const isBest = laps.length > 1 && lap.lapTime === Math.min(...laps.map(l => l.lapTime));
                            const isWorst = laps.length > 1 && lap.lapTime === Math.max(...laps.map(l => l.lapTime));

                            return (
                                <motion.div
                                    key={lap.lap}
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                        "flex items-center justify-between p-5 rounded-[1.5rem] bg-card border border-border/50 shadow-sm transition-all",
                                        isBest && "border-emerald-500/20 bg-emerald-500/5",
                                        isWorst && "border-red-500/20 bg-red-500/5"
                                    )}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-20">Cycle {lap.lap.toString().padStart(2, '0')}</span>
                                        <span className={cn("text-lg font-black font-mono tabular-nums leading-none tracking-tighter", isBest ? "text-emerald-500" : isWorst ? "text-red-500" : "text-foreground")}>
                                            {formatLapTime(lap.lapTime)}
                                        </span>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 text-right">Aggregate</span>
                                        <span className="text-xs font-bold font-mono text-muted-foreground/60 tabular-nums">{formatLapTime(lap.overallTime)}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>
        </div>

        {/* Aggregate Stats */}
        {laps.length > 0 && (
            <div className="p-10 border-t border-border/50 bg-muted/30 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/60">Fastest Interval</span>
                        <p className="font-mono text-sm font-black text-emerald-600 tabular-nums">
                            {formatLapTime(Math.min(...laps.map(l => l.lapTime)))}
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-500/60">Mean Duration</span>
                        <p className="font-mono text-sm font-black text-blue-600 tabular-nums">
                            {formatLapTime(laps.reduce((sum, l) => sum + l.lapTime, 0) / laps.length)}
                        </p>
                    </div>
                </div>
                <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Termination Cycles</span>
                    <span className="text-sm font-black text-foreground">{laps.length}</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
