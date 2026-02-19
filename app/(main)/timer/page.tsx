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
  Trash2,
  Timer as TimerIcon,
  ShieldCheck,
  Zap,
  Activity,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Preset {
  id: string;
  name: string;
  duration: number; // in seconds
}

const DEFAULT_PRESETS: Preset[] = [
  { id: '1', name: '5m', duration: 5 * 60 },
  { id: '2', name: '10m', duration: 10 * 60 },
  { id: '3', name: '15m', duration: 15 * 60 },
  { id: '4', name: '20m', duration: 20 * 60 },
  { id: '5', name: '30m', duration: 30 * 60 },
  { id: '6', name: '1h', duration: 60 * 60 },
  { id: '7', name: '2h', duration: 2 * 60 * 60 },
  { id: '8', name: '3h', duration: 3 * 60 * 60 },
];

export default function TimerPage() {
  const { data: session } = useSession();

  /* Individual time units for input (Hours, Minutes, Seconds) */
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('10');
  const [seconds, setSeconds] = useState('00');
  
  /* The total remaining time in seconds */
  const [timeLeft, setTimeLeft] = useState(600);
  
  /* Operational state of the countdown */
  const [isRunning, setIsRunning] = useState(false);
  
  /* UI mode: true for inputting time, false for viewing countdown */
  const [isEditing, setIsEditing] = useState(true);
  
  /* User-defined and cloud-synced timer configurations */
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  
  /* Dialog state for creating new presets */
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetH, setNewPresetH] = useState('00');
  const [newPresetM, setNewPresetM] = useState('10');
  const [newPresetS, setNewPresetS] = useState('00');
  const [activePresetId, setActivePresetId] = useState<string | null>('2');
  
  /* Local reference for the countdown interval timer */
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bt-timer-presets');
    if (saved) { try { setCustomPresets(JSON.parse(saved)); } catch (e) {} }
  }, []);

  // Cloud Sync
  useEffect(() => {
    if (session?.user) {
        fetch('/api/sync/timer-presets')
            .then(res => res.json())
            .then(data => {
                if (data?.length) setCustomPresets(data);
            })
            .catch(err => console.error(err));
    }
  }, [session?.user]);

  useEffect(() => {
    localStorage.setItem('bt-timer-presets', JSON.stringify(customPresets));
    if (session?.user) {
        const timeout = setTimeout(() => {
            fetch('/api/sync/timer-presets', { 
                method: 'POST', 
                body: JSON.stringify(customPresets), 
                headers: { 'Content-Type': 'application/json' } 
            });
        }, 1000);
        return () => clearTimeout(timeout);
    }
  }, [customPresets, session?.user]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { handleTimerComplete(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

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
    try { new Audio('/notification.mp3').play().catch(() => {}); } catch (e) {}
    toast.success('Temporal count completed.');
  };

  const [lastDuration, setLastDuration] = useState({ h: '00', m: '10', s: '00', total: 600 });

  const handleStart = () => {
    const total = (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
    if (total === 0) { toast.error('Set duration first.'); return; }
    setLastDuration({ h: hours, m: minutes, s: seconds, total });
    setTimeLeft(total); setIsRunning(true); setIsEditing(false);
  };

  const handlePause = () => setIsRunning(false);
  const handleResume = () => setIsRunning(true);
  const handleReset = () => { 
    setIsRunning(false); 
    setIsEditing(true); 
    setHours(lastDuration.h); 
    setMinutes(lastDuration.m); 
    setSeconds(lastDuration.s); 
    setTimeLeft(lastDuration.total);
    setActivePresetId(null); // Clear active preset to show it's reset
  };

  const handlePresetClick = (preset: Preset) => {
    const h = Math.floor(preset.duration / 3600).toString().padStart(2, '0');
    const m = Math.floor((preset.duration % 3600) / 60).toString().padStart(2, '0');
    const s = (preset.duration % 60).toString().padStart(2, '0');
    setHours(h);
    setMinutes(m);
    setSeconds(s);
    setTimeLeft(preset.duration); 
    setLastDuration({ h, m, s, total: preset.duration });
    setActivePresetId(preset.id);
    setIsEditing(true); setIsRunning(false);
  };

  const addPreset = () => {
    if (!newPresetName.trim()) { toast.error('Name required'); return; }
    const total = (parseInt(newPresetH) || 0) * 3600 + (parseInt(newPresetM) || 0) * 60 + (parseInt(newPresetS) || 0);
    if (total === 0) { toast.error('Set time first'); return; }
    
    const newPreset: Preset = {
        id: Math.random().toString(36).substring(2, 9),
        name: newPresetName.trim(),
        duration: total
    };
    
    setCustomPresets(prev => [newPreset, ...prev]);
    setNewPresetName('');
    setIsCreatingPreset(false);
    toast.success('Preset archived');
  };

  const deletePreset = (id: string) => setCustomPresets(customPresets.filter(p => p.id !== id));

  const handleInputChange = (value: string, setter: (v: string) => void, max: number, isMain: boolean = false) => {
    const digits = value.replace(/\D/g, '');
    if (digits === '') {
        setter('00');
        if (isMain) setActivePresetId(null);
        return;
    }
    
    let num = digits;
    if (num.length > 2) {
        num = num.slice(-2);
    } else {
        num = num.padStart(2, '0');
    }

    const parsed = parseInt(num) || 0;
    if (parsed <= max) {
        setter(num);
        if (isMain) setActivePresetId(null);
    }
  };

  return (
    <>
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden lg:flex-row">
      <div className="flex-1 flex flex-col p-4 md:p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full flex flex-col items-center">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center space-y-4 mb-12 sm:mb-20">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-border/50 text-foreground text-[10px] font-bold uppercase tracking-widest"
                >
                    <TimerIcon className="w-3.5 h-3.5 text-primary" />
                    Timer Precision
                </motion.div>
                <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em] opacity-40">Precision Countdown Synchronization</p>
            </div>

            {/* Time Display */}
            <div className="relative mb-16 sm:mb-24 w-full">
                <div className="absolute -inset-20 bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
                <motion.div 
                    layoutId="main-timer"
                    className="relative flex flex-col items-center justify-center p-6 sm:p-8 md:p-14 bg-card/40 border border-border/50 rounded-3xl shadow-xl backdrop-blur-md"
                >
                    <div className="flex justify-center items-center gap-2 md:gap-4 w-full">
                        {/* Hours Unit */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex bg-muted/20 border border-border/50 rounded-xl w-24 h-24 md:w-44 md:h-44 items-center justify-center relative">
                                {isEditing ? (
                                    <input
                                        value={hours}
                                        onChange={(e) => handleInputChange(e.target.value, setHours, 99, true)}
                                        className="w-full text-center text-5xl md:text-8xl font-bold bg-transparent outline-none tabular-nums tracking-tighter text-foreground"
                                    />
                                ) : (
                                    <span className="text-5xl md:text-8xl font-bold tabular-nums tracking-tighter text-foreground">{hours}</span>
                                )}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Hours</span>
                        </div>

                        <span className="text-2xl md:text-5xl font-thin text-muted-foreground/20 self-center pb-8">:</span>

                        {/* Minutes Unit */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex bg-muted/20 border border-border/50 rounded-xl w-24 h-24 md:w-44 md:h-44 items-center justify-center relative">
                                {isEditing ? (
                                    <input
                                        value={minutes}
                                        onChange={(e) => handleInputChange(e.target.value, setMinutes, 59, true)}
                                        className="w-full text-center text-5xl md:text-8xl font-bold bg-transparent outline-none tabular-nums tracking-tighter text-foreground"
                                    />
                                ) : (
                                    <span className="text-5xl md:text-8xl font-bold tabular-nums tracking-tighter text-foreground">{minutes}</span>
                                )}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Minutes</span>
                        </div>

                        <span className="text-2xl md:text-5xl font-thin text-muted-foreground/20 self-center pb-8">:</span>

                        {/* Seconds Unit */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex bg-primary/5 border border-primary/20 rounded-xl w-24 h-24 md:w-44 md:h-44 items-center justify-center relative">
                                {isEditing ? (
                                    <input
                                        value={seconds}
                                        onChange={(e) => handleInputChange(e.target.value, setSeconds, 59, true)}
                                        className="w-full text-center text-5xl md:text-8xl font-bold bg-transparent outline-none tabular-nums tracking-tighter text-primary"
                                    />
                                ) : (
                                    <span className="text-5xl md:text-8xl font-bold tabular-nums tracking-tighter text-primary">{seconds}</span>
                                )}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/30">Seconds</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-16">
                        {isEditing ? (
                            <Button
                            onClick={handleStart}
                            className="h-14 px-12 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 gap-3"
                            >
                            <Play className="w-4 h-4" />
                            Start
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={isRunning ? handlePause : handleResume}
                                    className={cn(
                                        "h-14 px-10 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 gap-3",
                                        isRunning ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    )}
                                >
                                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    {isRunning ? 'Pause' : 'Resume'}
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    className="h-14 w-14 rounded-xl border-border/50 hover:bg-muted text-foreground transition-all active:scale-95"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
      </div>

      {/* Right Side: Presets */}
      <div className="w-full lg:w-[300px] border-l border-border/50 bg-muted/5 flex flex-col shrink-0">
        <div className="p-8 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <Package className="w-3.5 h-3.5" />
                Presets
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCreatingPreset(true)}
              className="h-8 w-8 text-muted-foreground/30 hover:text-foreground rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
            <div className="space-y-4">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/20 px-1">Custom</span>
                <AnimatePresence mode="popLayout">
                    {customPresets.length === 0 ? (
                        <div 
                          className="flex flex-col items-center justify-center py-10 opacity-10 space-y-3 font-bold uppercase tracking-widest cursor-pointer hover:opacity-30 transition-opacity"
                          onClick={() => setIsCreatingPreset(true)}
                        >
                            <Plus className="w-6 h-6" />
                            <p className="text-[8px]">Empty</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {customPresets.map(preset => (
                                <motion.div
                                    key={preset.id}
                                    layout
                                    className={cn(
                                        "group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                                        activePresetId === preset.id
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background border-border/50 hover:bg-accent hover:text-accent-foreground"
                                    )}
                                    onClick={() => handlePresetClick(preset)}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{preset.name}</span>
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-6 w-6 transition-opacity rounded-md",
                                            activePresetId === preset.id ? "text-primary-foreground/40 hover:text-primary-foreground" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                        )}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="space-y-4 pt-8 border-t border-border/50">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/20 px-1">Standard</span>
                <div className="grid grid-cols-2 gap-2">
                    {DEFAULT_PRESETS.map(preset => (
                        <Button
                        key={preset.id}
                        onClick={() => handlePresetClick(preset)}
                        variant="ghost"
                        className={cn(
                            "h-10 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95",
                            activePresetId === preset.id 
                                ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                                : "border-border/50 bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                        )}
                        >
                        {preset.name}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>

    <Dialog open={isCreatingPreset} onOpenChange={setIsCreatingPreset}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="text-xs font-bold uppercase tracking-widest">Archive Configuration</DialogTitle>
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Save the current temporal cycle as a preset profile.</p>
            </DialogHeader>
            <div className="py-6 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-[9px] font-bold uppercase tracking-widest px-1">Profile Name</Label>
                    <Input
                        id="name"
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        placeholder="E.G. DEEP FOCUS"
                        className="h-12 bg-muted/20 border-border/50 text-xs font-bold tracking-widest uppercase px-4"
                        autoFocus
                    />
                </div>
                
                <div className="space-y-4">
                    <Label className="text-[9px] font-bold uppercase tracking-widest px-1 text-muted-foreground/50">Duration Configuration</Label>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Input
                                value={newPresetH}
                                onChange={(e) => handleInputChange(e.target.value, setNewPresetH, 99)}
                                className="h-14 text-center text-2xl font-bold bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all tabular-nums rounded-xl"
                            />
                            <p className="text-center text-[9px] uppercase font-bold text-muted-foreground/30 tracking-tight">Hours</p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={newPresetM}
                                onChange={(e) => handleInputChange(e.target.value, setNewPresetM, 59)}
                                className="h-14 text-center text-2xl font-bold bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all tabular-nums rounded-xl"
                            />
                            <p className="text-center text-[9px] uppercase font-bold text-muted-foreground/30 tracking-tight">Minutes</p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={newPresetS}
                                onChange={(e) => handleInputChange(e.target.value, setNewPresetS, 59)}
                                className="h-14 text-center text-2xl font-bold bg-primary/5 border-primary/20 text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all tabular-nums rounded-xl shadow-[0_0_15px_-5px_rgba(var(--primary),0.1)]"
                            />
                            <p className="text-center text-[9px] uppercase font-bold text-primary/40 tracking-tight">Seconds</p>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button 
                    onClick={addPreset}
                    className="w-full h-12 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] rounded-lg"
                >
                    Archive Profile
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
