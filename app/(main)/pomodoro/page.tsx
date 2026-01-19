"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Maximize2,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Timer as TimerIcon,
  ShieldCheck,
  Zap,
  Coffee,
  Brain
} from 'lucide-react';
import { format, addDays, startOfToday, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  isRoutine?: boolean;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_DEFAULTS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function PomodoroPage() {
  // Task state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [showPending, setShowPending] = useState(true);

  // Timer state
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_DEFAULTS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Persistence (Local Storage)
  useEffect(() => {
    const saved = localStorage.getItem('bt-pomodoro-tasks');
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bt-pomodoro-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Timer Logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (!isMuted) {
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    }
    
    if (mode === 'focus') {
      setSessionsToday(prev => prev + 1);
      toast.success('Focus session completed! Breakthrough achieved.');
    } else {
      toast.success('Neural recharge complete. Ready to focus?');
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => { setIsRunning(false); setTimeLeft(TIMER_DEFAULTS[mode]); };
  const changeMode = (newMode: TimerMode) => { setMode(newMode); setIsRunning(false); setTimeLeft(TIMER_DEFAULTS[newMode]); };
  const addTime = (minutes: number) => setTimeLeft(prev => prev + minutes * 60);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Math.random().toString(36).substring(2, 9), text: newTaskText.trim(), completed: false }]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const displayTasks = activeTab === 'pending' ? pendingTasks : completedTasks;

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden">
      <div className="flex flex-1 flex-col lg:flex-row h-full">
        {/* Left Side: Neural Tasks */}
        <div className="w-full lg:w-[400px] border-r border-border/50 bg-card/20 flex flex-col shrink-0">
          <div className="p-8 border-b border-border/50 bg-muted/30">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-6 flex items-center gap-2">
              <Brain className="w-4 h-4 text-amber-500" />
              Cognitive Backlog
            </h2>
            <div className="flex items-center gap-2 p-1.5 bg-background/50 rounded-xl border border-border/50">
              <Button
                variant={activeTab === 'pending' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('pending')}
                className="flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest"
              >
                In Queue
              </Button>
              <Button
                variant={activeTab === 'completed' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('completed')}
                className="flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest"
              >
                Terminated
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
             <AnimatePresence mode="popLayout">
                {displayTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-10 space-y-4">
                    <Zap className="w-12 h-12" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting brain dump</p>
                  </div>
                ) : (
                  displayTasks.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-amber-500/30 transition-all group shadow-sm"
                    >
                      <Checkbox 
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="rounded-lg w-5 h-5 border-border/50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-none shadow-md"
                      />
                      <span className={cn(
                        "text-sm font-bold tracking-tight flex-1",
                        task.completed && "line-through text-muted-foreground/50 font-medium"
                      )}>
                        {task.text}
                      </span>
                    </motion.div>
                  ))
                )}
             </AnimatePresence>
          </div>

          <div className="p-8 border-t border-border/50 bg-muted/30">
             <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 blur opacity-75 rounded-2xl" />
                <div className="relative flex items-center gap-3 bg-background border border-border/50 rounded-2xl p-2 pl-4">
                  <Plus className="w-4 h-4 text-muted-foreground/30" />
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Buffer new objective..."
                    className="flex-1 bg-transparent text-xs font-bold placeholder:font-medium placeholder:opacity-30 outline-none"
                  />
                  <Button onClick={addTask} size="icon" className="h-10 w-10 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Temporal Core */}
        <div className="flex-1 flex flex-col bg-background p-6 md:p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
                >
                    <TimerIcon className="w-3.5 h-3.5" />
                    Neural Focus Hub Active
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase">FOCUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">ARCHITECT</span></h1>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.3em] opacity-40">Precision Temporal Partitioning</p>
            </div>

            {/* Main Timer Display */}
            <div className="relative mb-16">
                <div className="absolute -inset-20 bg-amber-500/5 blur-[120px] rounded-full opacity-50" />
                <div className="relative flex flex-col items-center justify-center p-16 md:p-24 bg-card/40 border border-border/50 rounded-[4rem] shadow-2xl backdrop-blur-xl">
                    {/* Mode Navigation */}
                    <div className="flex items-center gap-6 mb-12 bg-muted/30 p-2 rounded-[2rem] border border-border/50">
                        {[
                          { id: 'focus' as TimerMode, label: 'Focus', icon: Brain },
                          { id: 'shortBreak' as TimerMode, label: 'Recharge', icon: Coffee },
                          { id: 'longBreak' as TimerMode, label: 'Deep Break', icon: Zap }
                        ].map((m) => (
                          <Button
                            key={m.id}
                            variant="ghost"
                            onClick={() => changeMode(m.id)}
                            className={cn(
                              "h-12 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest gap-2 transition-all",
                              mode === m.id ? "bg-background text-amber-500 shadow-xl" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <m.icon className="w-4 h-4" />
                            {m.label}
                          </Button>
                        ))}
                    </div>

                    <motion.div
                        key={mode}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-[120px] md:text-[180px] font-black tracking-tighter tabular-nums leading-none text-foreground select-none"
                    >
                        {formatTime(timeLeft)}
                    </motion.div>

                    <div className="flex items-center gap-4 mt-12">
                        <Button
                          onClick={toggleTimer}
                          className={cn(
                            "h-16 px-12 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 gap-3",
                            isRunning ? "bg-zinc-800 text-white" : "bg-amber-500 text-black shadow-amber-500/20"
                          )}
                        >
                          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                          {isRunning ? 'Interrupt' : 'Initiate'}
                        </Button>
                        <Button
                            onClick={resetTimer}
                            variant="outline"
                            className="h-16 w-16 rounded-[2rem] border-border/50 hover:bg-muted text-foreground transition-all active:scale-95"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Time Adjusters */}
            <div className="grid grid-cols-4 gap-4 w-full max-w-md pb-12">
                {[1, 5, 10, 25].map((m) => (
                    <Button
                        key={m}
                        variant="ghost"
                        onClick={() => addTime(m)}
                        className="h-16 rounded-2xl border border-border/50 bg-card/50 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/10 hover:text-amber-500 transition-all active:scale-90"
                    >
                        + {m}m
                    </Button>
                ))}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-border/10 pt-12">
                {[
                    { icon: ShieldCheck, title: "Neural Guard", desc: "Digital sensory isolation for absolute concentration peaks.", color: "text-amber-500", bg: "bg-amber-500/10" },
                    { icon: BarChart3, title: "Temporal Analytics", desc: "Data-driven flow cycle tracking and optimization.", color: "text-blue-500", bg: "bg-blue-500/10" },
                    { icon: Settings, title: "Core Parity", desc: "Synchronized focus logic across your local ecosystem.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
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

            <div className="mt-12 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                    {sessionsToday === 0 
                      ? 'System awaiting first session cycle' 
                      : `${sessionsToday} Successive Cycles Completed Today`
                    }
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
