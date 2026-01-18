"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Play,
  Pause,
  RotateCcw,
  Settings,
  Plus,
  X,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Preset {
  id: string;
  name: string;
  duration: number; // in seconds
}

const DEFAULT_PRESETS: Preset[] = [
  { id: '1', name: '5 min', duration: 5 * 60 },
  { id: '2', name: '10 min', duration: 10 * 60 },
  { id: '3', name: '15 min', duration: 15 * 60 },
  { id: '4', name: '20 min', duration: 20 * 60 },
  { id: '5', name: '30 min', duration: 30 * 60 },
  { id: '6', name: '1 hour', duration: 60 * 60 },
  { id: '7', name: '2 hour', duration: 2 * 60 * 60 },
  { id: '8', name: '3 hour', duration: 3 * 60 * 60 },
];

export default function TimerPage() {
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [presets, setPresets] = useState<Preset[]>(DEFAULT_PRESETS);
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load custom presets
  useEffect(() => {
    const saved = localStorage.getItem('bt-timer-presets');
    if (saved) {
      try { setCustomPresets(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Save custom presets
  useEffect(() => {
    localStorage.setItem('bt-timer-presets', JSON.stringify(customPresets));
  }, [customPresets]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Update display when timeLeft changes
  useEffect(() => {
    if (!isEditing) {
      const h = Math.floor(timeLeft / 3600);
      const m = Math.floor((timeLeft % 3600) / 60);
      const s = timeLeft % 60;
      setHours(h.toString().padStart(2, '0'));
      setMinutes(m.toString().padStart(2, '0'));
      setSeconds(s.toString().padStart(2, '0'));
    }
  }, [timeLeft, isEditing]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    setIsEditing(true);
    // Play notification sound
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch (e) {}
    toast.success('Timer completed!');
  };

  const handleStart = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    const totalSeconds = h * 3600 + m * 60 + s;

    if (totalSeconds === 0) {
      toast.error('Please set a timer duration');
      return;
    }

    setTimeLeft(totalSeconds);
    setIsRunning(true);
    setIsEditing(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsEditing(true);
    setHours('00');
    setMinutes('00');
    setSeconds('00');
  };

  const handlePresetClick = (preset: Preset) => {
    const h = Math.floor(preset.duration / 3600);
    const m = Math.floor((preset.duration % 3600) / 60);
    const s = preset.duration % 60;
    setHours(h.toString().padStart(2, '0'));
    setMinutes(m.toString().padStart(2, '0'));
    setSeconds(s.toString().padStart(2, '0'));
    setTimeLeft(preset.duration);
    setIsEditing(true);
    setIsRunning(false);
  };

  const handleCreatePreset = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    const totalSeconds = h * 3600 + m * 60 + s;

    if (totalSeconds === 0) {
      toast.error('Set a duration first');
      return;
    }

    const name = newPresetName.trim() || formatDuration(totalSeconds);
    const preset: Preset = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      duration: totalSeconds,
    };
    setCustomPresets([...customPresets, preset]);
    setIsCreatingPreset(false);
    setNewPresetName('');
    toast.success('Preset created');
  };

  const deletePreset = (id: string) => {
    setCustomPresets(customPresets.filter(p => p.id !== id));
  };

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h} hour${h > 1 ? 's' : ''}`;
    return `${m} min`;
  };

  const handleInputChange = (value: string, setter: (v: string) => void, max: number) => {
    const num = value.replace(/\D/g, '').slice(0, 2);
    const parsed = parseInt(num) || 0;
    if (parsed <= max) {
      setter(num.padStart(2, '0'));
    }
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Left Panel - Timer */}
      <div className="flex-1 flex flex-col bg-background relative items-center justify-center">
        {/* Hint Text */}
        <p className="text-sm text-amber-500/80 mb-8">
          Enter timer Duration below
        </p>

        {/* Time Display/Input */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            {isEditing ? (
              <input
                type="text"
                value={hours}
                onChange={(e) => handleInputChange(e.target.value, setHours, 99)}
                className="w-32 text-center text-[80px] md:text-[100px] font-bold bg-transparent outline-none tabular-nums tracking-tight"
                maxLength={2}
              />
            ) : (
              <span className="text-[80px] md:text-[100px] font-bold tabular-nums tracking-tight">
                {hours}
              </span>
            )}
            <span className="text-sm text-muted-foreground/50 mt-2">hour</span>
          </div>

          <span className="text-[80px] md:text-[100px] font-bold text-muted-foreground/30 -mt-8">:</span>

          <div className="flex flex-col items-center">
            {isEditing ? (
              <input
                type="text"
                value={minutes}
                onChange={(e) => handleInputChange(e.target.value, setMinutes, 59)}
                className="w-32 text-center text-[80px] md:text-[100px] font-bold bg-transparent outline-none tabular-nums tracking-tight"
                maxLength={2}
              />
            ) : (
              <span className="text-[80px] md:text-[100px] font-bold tabular-nums tracking-tight">
                {minutes}
              </span>
            )}
            <span className="text-sm text-muted-foreground/50 mt-2">min</span>
          </div>

          <span className="text-[80px] md:text-[100px] font-bold text-muted-foreground/30 -mt-8">:</span>

          <div className="flex flex-col items-center">
            {isEditing ? (
              <input
                type="text"
                value={seconds}
                onChange={(e) => handleInputChange(e.target.value, setSeconds, 59)}
                className="w-32 text-center text-[80px] md:text-[100px] font-bold bg-transparent outline-none tabular-nums tracking-tight"
                maxLength={2}
              />
            ) : (
              <span className="text-[80px] md:text-[100px] font-bold tabular-nums tracking-tight">
                {seconds}
              </span>
            )}
            <span className="text-sm text-muted-foreground/50 mt-2">sec</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-12">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg border border-border text-muted-foreground"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {isEditing ? (
            <Button
              onClick={handleStart}
              variant="outline"
              className="h-10 px-6 rounded-lg border-border text-sm font-medium"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Timer
            </Button>
          ) : isRunning ? (
            <Button
              onClick={handlePause}
              variant="outline"
              className="h-10 px-6 rounded-lg border-border text-sm font-medium"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          ) : (
            <>
              <Button
                onClick={handleResume}
                variant="outline"
                className="h-10 px-6 rounded-lg border-border text-sm font-medium"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
              <Button
                onClick={handleReset}
                variant="ghost"
                className="h-10 px-4 rounded-lg text-muted-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Presets */}
      <div className="w-80 lg:w-96 border-l border-border bg-card flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <Button
            onClick={() => setIsCreatingPreset(true)}
            variant="ghost"
            className="w-full justify-start h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-3.5 h-3.5 mr-2" />
            CREATE NEW PRESET
          </Button>
        </div>

        {/* Create Preset Form */}
        <AnimatePresence>
          {isCreatingPreset && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-border"
            >
              <div className="p-4 space-y-3">
                <Input
                  autoFocus
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Preset name (optional)"
                  className="h-9 text-sm bg-background border-border"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsCreatingPreset(false)}
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePreset}
                    size="sm"
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    Create
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Default Presets */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {presets.map(preset => (
            <Button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              variant="outline"
              size="sm"
              className="h-9 text-xs font-medium border-border hover:border-muted-foreground/50"
            >
              {preset.name}
            </Button>
          ))}
        </div>

        {/* Custom Presets */}
        <div className="flex-1 overflow-y-auto p-4 pt-0">
          {customPresets.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground/30">No presets yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">
                Your Presets
              </p>
              {customPresets.map(preset => (
                <div
                  key={preset.id}
                  className="group flex items-center justify-between p-3 rounded-lg border border-border hover:border-muted-foreground/30 transition-colors"
                >
                  <button
                    onClick={() => handlePresetClick(preset)}
                    className="flex-1 text-left text-sm font-medium"
                  >
                    {preset.name}
                  </button>
                  <Button
                    onClick={() => deletePreset(preset.id)}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
