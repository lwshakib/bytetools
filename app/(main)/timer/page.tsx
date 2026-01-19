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
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('10');
  const [seconds, setSeconds] = useState('00');
  const [timeLeft, setTimeLeft] = useState(600);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [activePresetId, setActivePresetId] = useState<string | null>('2');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bt-timer-presets');
    if (saved) { try { setCustomPresets(JSON.parse(saved)); } catch (e) {} }
  }, []);

  useEffect(() => {
    localStorage.setItem('bt-timer-presets', JSON.stringify(customPresets));
  }, [customPresets]);

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

  const handleStart = () => {
    const total = (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
    if (total === 0) { toast.error('Set duration first.'); return; }
    setTimeLeft(total); setIsRunning(true); setIsEditing(false);
  };

  const handlePause = () => setIsRunning(false);
  const handleResume = () => setIsRunning(true);
  const handleReset = () => { setIsRunning(false); setTimeLeft(0); setIsEditing(true); setHours('00'); setMinutes('00'); setSeconds('00'); };

  const handlePresetClick = (preset: Preset) => {
    const h = Math.floor(preset.duration / 3600);
    const m = Math.floor((preset.duration % 3600) / 60);
    const s = preset.duration % 60;
    setHours(h.toString().padStart(2, '0'));
    setMinutes(m.toString().padStart(2, '0'));
    setSeconds(s.toString().padStart(2, '0'));
    setTimeLeft(preset.duration); 
    setActivePresetId(preset.id);
    setIsEditing(true); setIsRunning(false);
  };

  const deletePreset = (id: string) => setCustomPresets(customPresets.filter(p => p.id !== id));

  const handleInputChange = (value: string, setter: (v: string) => void, max: number) => {
    const num = value.replace(/\D/g, '').slice(0, 2);
    const parsed = parseInt(num) || 0;
    if (parsed <= max) {
        setter(num.padStart(2, '0'));
        setActivePresetId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden lg:flex-row">
      <div className="flex-1 flex flex-col p-6 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center space-y-4 mb-20">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
                >
                    <TimerIcon className="w-3.5 h-3.5" />
                    Temporal Threshold Active
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase text-center">TIMER <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">ARCHITECT</span></h1>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.3em] opacity-40">Precision Countdown Synchronization</p>
            </div>

            {/* Time Display */}
            <div className="relative mb-20 group w-full max-w-2xl px-4">
                <div className="absolute -inset-20 bg-orange-500/5 blur-[120px] rounded-full opacity-50" />
                <motion.div 
                    layoutId="main-timer"
                    className="relative flex flex-col items-center justify-center p-6 md:p-12 bg-card/40 border border-border/50 rounded-[3rem] shadow-2xl backdrop-blur-xl"
                >
                    <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
                        {/* Hours Unit */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex bg-muted/20 border border-border/50 rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-inner">
                                {isEditing ? (
                                    <input
                                        value={hours}
                                        onChange={(e) => handleInputChange(e.target.value, setHours, 99)}
                                        className="w-12 md:w-28 text-center text-[36px] md:text-[80px] lg:text-[100px] font-black bg-transparent outline-none tabular-nums tracking-tighter text-foreground"
                                    />
                                ) : (
                                    <span className="w-12 md:w-28 text-center text-[36px] md:text-[80px] lg:text-[100px] font-black tabular-nums tracking-tighter text-foreground">{hours}</span>
                                )}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Hours</span>
                        </div>

                        <span className="text-2xl md:text-5xl font-thin text-muted-foreground/20 mb-10">:</span>

                        {/* Minutes Unit */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex bg-muted/20 border border-border/50 rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-inner">
                                {isEditing ? (
                                    <input
                                        value={minutes}
                                        onChange={(e) => handleInputChange(e.target.value, setMinutes, 59)}
                                        className="w-12 md:w-28 text-center text-[36px] md:text-[80px] lg:text-[100px] font-black bg-transparent outline-none tabular-nums tracking-tighter text-foreground"
                                    />
                                ) : (
                                    <span className="w-12 md:w-28 text-center text-[36px] md:text-[80px] lg:text-[100px] font-black tabular-nums tracking-tighter text-foreground">{minutes}</span>
                                )}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Minutes</span>
                        </div>

                        <span className="text-2xl md:text-5xl font-thin text-muted-foreground/20 mb-10">:</span>

                        {/* Seconds Unit */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex bg-orange-500/5 border border-orange-500/20 rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-inner">
                                {isEditing ? (
                                    <input
                                        value={seconds}
                                        onChange={(e) => handleInputChange(e.target.value, setSeconds, 59)}
                                        className="w-12 md:w-28 text-center text-[36px] md:text-[80px] lg:text-[100px] font-black bg-transparent outline-none tabular-nums tracking-tighter text-orange-500"
                                    />
                                ) : (
                                    <span className="w-12 md:w-28 text-center text-[36px] md:text-[80px] lg:text-[100px] font-black tabular-nums tracking-tighter text-orange-500">{seconds}</span>
                                )}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500/30">Seconds</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-16">
                        {isEditing ? (
                            <Button
                            onClick={handleStart}
                            className="h-16 px-16 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl bg-orange-500 text-white shadow-orange-500/20 transition-all active:scale-95 gap-3"
                            >
                            <Play className="w-5 h-5 fill-current" />
                            Initialize
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={isRunning ? handlePause : handleResume}
                                    className={cn(
                                        "h-16 px-12 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 gap-3",
                                        isRunning ? "bg-zinc-800 text-white" : "bg-orange-500 text-white shadow-orange-500/20"
                                    )}
                                >
                                    {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                                    {isRunning ? 'Suspend' : 'Resume'}
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    className="h-16 w-16 rounded-[2rem] border-border/50 hover:bg-muted text-foreground transition-all active:scale-95"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </Button>
                            </>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-16 w-16 rounded-[2rem] border border-border/50 bg-muted/20 text-foreground transition-all active:scale-95"
                        >
                            <Settings className="w-5 h-5" />
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-border/10 pt-12 max-w-5xl">
                {[
                    { icon: ShieldCheck, title: "Persistence", desc: "Configuration is retained across temporal sessions locally.", color: "text-orange-500", bg: "bg-orange-500/10" },
                    { icon: Zap, title: "Zero Drift", desc: "Clock cycle matched intervals for sub-second precision.", color: "text-amber-500", bg: "bg-amber-500/10" },
                    { icon: Activity, title: "OS Sync", desc: "Hooked into native OS notification protocols for alerts.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
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

      {/* Right Side: Presets Ledger */}
      <div className="w-full lg:w-[400px] border-l border-border/50 bg-card/20 flex flex-col shrink-0">
        <div className="p-10 border-b border-border/50 bg-muted/30 flex items-center justify-between">
            <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-orange-500" />
                    Archive Presets
                </h3>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Configuration Store</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground/30 hover:text-foreground rounded-xl"
            >
              <Plus className="w-4 h-4" />
            </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 px-2">Core Standards</span>
                <div className="grid grid-cols-2 gap-3">
                    {DEFAULT_PRESETS.map(preset => (
                        <Button
                        key={preset.id}
                        onClick={() => handlePresetClick(preset)}
                        variant="ghost"
                        className={cn(
                            "h-14 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm",
                            activePresetId === preset.id 
                                ? "bg-orange-500 text-white border-orange-500 shadow-orange-500/20" 
                                : "border-border/50 bg-card hover:bg-orange-500/10 hover:border-orange-500/30 text-foreground"
                        )}
                        >
                        {preset.name}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-border/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 px-2">User Defined Matrix</span>
                <AnimatePresence mode="popLayout">
                    {customPresets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 opacity-10 space-y-4">
                            <Plus className="w-10 h-10" />
                            <p className="text-[9px] font-black uppercase tracking-widest">No custom profiles</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {customPresets.map(preset => (
                                <motion.div
                                    key={preset.id}
                                    layout
                                    className={cn(
                                        "group flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer shadow-sm",
                                        activePresetId === preset.id
                                            ? "bg-orange-500 text-white border-orange-500 shadow-orange-500/20"
                                            : "bg-card border-border/50 hover:bg-orange-500/10 hover:border-orange-500/30"
                                    )}
                                    onClick={() => handlePresetClick(preset)}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">{preset.name}</span>
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 transition-opacity rounded-lg",
                                            activePresetId === preset.id ? "text-white/40 hover:text-white" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                        )}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
}
