"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  RotateCcw, 
  Timer as TimerIcon, 
  Play, 
  Pause, 
  Trash2, 
  Brain, 
  Coffee, 
  Zap, 
  CheckCircle2, 
  Circle 
} from 'lucide-react';
import { format, startOfToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_DEFAULTS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function PomodoroPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_DEFAULTS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bt-pomodoro-tasks');
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bt-pomodoro-tasks', JSON.stringify(tasks));
  }, [tasks]);

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
    if (mode === 'focus') {
      setSessionsToday(prev => prev + 1);
      toast.success('Focus session complete');
    } else {
      toast.success('Break complete');
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => { setIsRunning(false); setTimeLeft(TIMER_DEFAULTS[mode]); };
  const changeMode = (newMode: TimerMode) => { setMode(newMode); setIsRunning(false); setTimeLeft(TIMER_DEFAULTS[newMode]); };

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
  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const displayTasks = activeTab === 'pending' ? pendingTasks : completedTasks;

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden">
      <div className="flex flex-1 flex-col lg:flex-row h-full">
        {/* Timer Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 overflow-y-auto">
          <div className="w-full max-w-xl space-y-12">
            <div className="flex flex-col items-center text-center space-y-8">
                <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/50">
                    {[
                      { id: 'focus' as TimerMode, label: 'Focus', icon: Brain },
                      { id: 'shortBreak' as TimerMode, label: 'Break', icon: Coffee },
                      { id: 'longBreak' as TimerMode, label: 'Long Break', icon: CheckCircle2 }
                    ].map((m) => (
                      <Button
                        key={m.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => changeMode(m.id)}
                        className={cn(
                          "h-10 px-6 rounded-lg text-[10px] font-bold uppercase transition-all",
                          mode === m.id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {m.label}
                      </Button>
                    ))}
                </div>

                <div className="space-y-4">
                  <motion.div
                      key={mode}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[120px] font-mono font-bold tracking-tighter tabular-nums leading-none text-foreground"
                  >
                      {formatTime(timeLeft)}
                  </motion.div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30">
                      {sessionsToday} cycles today
                  </p>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                      onClick={toggleTimer}
                      size="lg"
                      className={cn(
                        "h-16 px-12 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-none transition-all active:scale-95 gap-3",
                        isRunning 
                            ? "bg-zinc-900 text-white hover:bg-zinc-950 border border-white/5" 
                            : "bg-primary text-primary-foreground hover:opacity-90"
                      )}
                    >
                      {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isRunning ? 'Pause' : 'Start'}
                    </Button>
                    <Button
                        onClick={resetTimer}
                        variant="outline"
                        size="icon"
                        className="h-16 w-16 rounded-2xl border-border/50 hover:bg-muted"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="w-full lg:w-[400px] border-l border-border/50 bg-muted/10 flex flex-col shrink-0">
          <div className="p-8 pb-4 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Task Buffer</h3>
                <div className="flex p-0.5 bg-muted/40 rounded-lg border border-border/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('pending')}
                        className={cn("h-7 px-3 rounded-md text-[9px] font-bold uppercase", activeTab === 'pending' ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}
                    >
                        Next
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('completed')}
                        className={cn("h-7 px-3 rounded-md text-[9px] font-bold uppercase", activeTab === 'completed' ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}
                    >
                        Done
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-background border border-border/50 rounded-xl shadow-sm">
                <Input
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Add task..."
                    className="border-none bg-transparent focus-visible:ring-0 h-9 text-xs font-medium placeholder:opacity-30"
                />
                <Button onClick={addTask} size="icon" className="h-9 w-9 bg-primary text-primary-foreground rounded-lg shadow-none">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-2">
             <AnimatePresence mode="popLayout">
                {displayTasks.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center opacity-10 space-y-3">
                    <Zap className="w-8 h-8" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No tasks active</p>
                  </div>
                ) : (
                  displayTasks.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-3 p-3 bg-card/40 border border-border/10 rounded-xl group hover:border-primary/20 transition-all"
                    >
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                            task.completed ? "bg-primary border-primary text-white" : "border-border/50 text-transparent"
                        )}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                      </button>
                      <span className={cn(
                        "text-xs font-medium flex-1",
                        task.completed && "opacity-30 line-through"
                      )}>
                        {task.text}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 rounded-md" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground/40 hover:text-destructive" />
                      </Button>
                    </motion.div>
                  ))
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
