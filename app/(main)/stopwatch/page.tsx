"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play,
  Pause,
  RotateCcw,
  Flag,
  Maximize2,
  Minimize2
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
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    lastLapTimeRef.current = 0;
  };

  const handleLap = () => {
    if (!isRunning) return;
    
    const lapTime = time - lastLapTimeRef.current;
    const newLap: Lap = {
      lap: laps.length + 1,
      lapTime: lapTime,
      overallTime: time,
    };
    setLaps([newLap, ...laps]);
    lastLapTimeRef.current = time;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000));
    return {
      seconds: seconds.toString().padStart(2, '0'),
      milliseconds: milliseconds.toString().padStart(3, '0'),
    };
  };

  const formatLapTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000));
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
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

  const { seconds, milliseconds } = formatTime(time);

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Left Panel - Timer Display */}
      <div className="flex-1 flex flex-col bg-background relative">
        {/* Fullscreen Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 h-8 w-8 text-muted-foreground/30 hover:text-foreground"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>

        {/* Timer Content */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          {/* Time Display */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-baseline gap-1"
          >
            <span className="text-[100px] md:text-[140px] font-light tracking-tighter tabular-nums leading-none">
              {seconds}
            </span>
            <span className="text-2xl md:text-3xl font-light text-muted-foreground/50 mb-4">
              s
            </span>
            <span className="text-[100px] md:text-[140px] font-light tracking-tighter tabular-nums leading-none">
              {milliseconds}
            </span>
            <span className="text-2xl md:text-3xl font-light text-muted-foreground/50 mb-4">
              ms
            </span>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {time > 0 && !isRunning && (
              <Button
                onClick={handleReset}
                variant="ghost"
                className="h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
            
            <Button
              onClick={handleStartStop}
              variant="outline"
              className="h-10 px-6 rounded-lg border-border text-sm font-medium"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Timer
                </>
              )}
            </Button>

            {isRunning && (
              <Button
                onClick={handleLap}
                variant="ghost"
                className="h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <Flag className="w-4 h-4 mr-2" />
                Lap
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Laps */}
      <div className="w-80 lg:w-96 border-l border-border bg-card flex flex-col shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          <span className="w-16">LAP</span>
          <span className="flex-1 text-center">LAP TIME</span>
          <span className="w-32 text-right">OVERALL TIME</span>
        </div>

        {/* Laps List */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {laps.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground/30">No laps yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {laps.map((lap, index) => {
                  // Find best and worst laps (only if more than 1 lap)
                  const isBest = laps.length > 1 && lap.lapTime === Math.min(...laps.map(l => l.lapTime));
                  const isWorst = laps.length > 1 && lap.lapTime === Math.max(...laps.map(l => l.lapTime));

                  return (
                    <motion.div
                      key={lap.lap}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-center justify-between p-4 text-sm",
                        isBest && "text-green-500",
                        isWorst && "text-red-500"
                      )}
                    >
                      <span className="w-16 font-mono">{lap.lap.toString().padStart(2, '0')}</span>
                      <span className="flex-1 text-center font-mono">{formatLapTime(lap.lapTime)}</span>
                      <span className="w-32 text-right font-mono text-muted-foreground">{formatLapTime(lap.overallTime)}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats Footer */}
        {laps.length > 0 && (
          <div className="p-4 border-t border-border space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Total Laps</span>
              <span className="font-mono">{laps.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Best Lap</span>
              <span className="font-mono text-green-500">
                {formatLapTime(Math.min(...laps.map(l => l.lapTime)))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Worst Lap</span>
              <span className="font-mono text-red-500">
                {formatLapTime(Math.max(...laps.map(l => l.lapTime)))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average</span>
              <span className="font-mono">
                {formatLapTime(laps.reduce((sum, l) => sum + l.lapTime, 0) / laps.length)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
