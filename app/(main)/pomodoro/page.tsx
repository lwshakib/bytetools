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
  VolumeX
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bt-pomodoro-tasks');
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('bt-pomodoro-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Timer logic
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
      // Play notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    }
    
    if (mode === 'focus') {
      setSessionsToday(prev => prev + 1);
      toast.success('Focus session completed! Time for a break.');
    } else {
      toast.success('Break time over! Ready to focus?');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_DEFAULTS[mode]);
  };

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(TIMER_DEFAULTS[newMode]);
  };

  const addTime = (minutes: number) => {
    setTimeLeft(prev => prev + minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Task functions
  const addTask = () => {
    if (!newTaskText.trim()) return;
    const task: Task = {
      id: Math.random().toString(36).substring(2, 9),
      text: newTaskText.trim(),
      completed: false,
    };
    setTasks([...tasks, task]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const displayTasks = activeTab === 'pending' ? pendingTasks : completedTasks;

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Left Panel - Task List */}
      <div className="w-80 lg:w-96 border-r border-border bg-background flex flex-col shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-1">
            <Button
              variant={activeTab === 'pending' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('pending')}
              className="h-7 px-3 text-[10px] font-bold uppercase tracking-widest rounded-lg"
            >
              <Checkbox className="w-3 h-3 mr-1.5 rounded-sm" checked={false} />
              Pending
            </Button>
            <Button
              variant={activeTab === 'completed' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('completed')}
              className="h-7 px-3 text-[10px] font-bold uppercase tracking-widest rounded-lg"
            >
              <Checkbox className="w-3 h-3 mr-1.5 rounded-sm" checked />
              Completed
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-bold">
              <span className="flex items-center gap-1">
                📅 {format(selectedDate, 'd MMM')}
              </span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Previous Pending Tasks */}
        <div className="p-3 border-b border-border">
          <button
            onClick={() => setShowPending(!showPending)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              Previous Pending Tasks
              <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                {pendingTasks.length}
              </span>
            </span>
            {showPending ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <AnimatePresence>
            {showPending && displayTasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group"
              >
                <Checkbox 
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="rounded-full"
                />
                <div className="flex-1 flex items-center gap-2">
                  {task.isRoutine && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">
                      🔄 ROUTINE
                    </span>
                  )}
                  <span className={cn(
                    "text-sm",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.text}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Task Input */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed border-border/50 hover:border-muted-foreground/30 transition-colors bg-muted/10">
            <Plus className="w-4 h-4 text-muted-foreground/50" />
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add new task"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/40 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Timer */}
      <div className="flex-1 flex flex-col bg-muted/5 relative">
        {/* Top Right Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:text-foreground">
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:text-foreground">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:text-foreground">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Timer Content */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          {/* Mode Tabs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => changeMode('focus')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                mode === 'focus' 
                  ? "bg-muted border border-border text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Focus
            </button>
            <button
              onClick={() => changeMode('shortBreak')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                mode === 'shortBreak' 
                  ? "bg-muted border border-border text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Short Break
            </button>
            <button
              onClick={() => changeMode('longBreak')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                mode === 'longBreak' 
                  ? "bg-muted border border-border text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Long Break
            </button>
          </div>

          {/* Timer Display */}
          <div className="relative">
            <motion.div
              key={mode}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[140px] md:text-[180px] font-extralight tracking-tighter tabular-nums leading-none"
            >
              {formatTime(timeLeft)}
            </motion.div>
          </div>

          {/* Time Adjustment */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <button 
              onClick={() => addTime(25)}
              className="hover:text-foreground transition-colors"
            >
              + 25 min
            </button>
            <button 
              onClick={() => addTime(10)}
              className="hover:text-foreground transition-colors"
            >
              + 10 min
            </button>
            <button 
              onClick={() => addTime(5)}
              className="hover:text-foreground transition-colors"
            >
              + 5 min
            </button>
            <button 
              onClick={() => addTime(1)}
              className="hover:text-foreground transition-colors"
            >
              + 1 min
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleTimer}
              variant="outline"
              className="h-10 px-8 rounded-lg border-border text-sm font-medium"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                'Start'
              )}
            </Button>
            {isRunning && (
              <Button
                onClick={resetTimer}
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg text-muted-foreground"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground/50">
            {sessionsToday === 0 
              ? 'No sessions today' 
              : `${sessionsToday} session${sessionsToday > 1 ? 's' : ''} today`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
