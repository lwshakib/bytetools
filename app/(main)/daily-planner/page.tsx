"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Repeat,
  Inbox,
  ListTodo,
  CalendarCheck,
  Package
} from 'lucide-react';
import { format, addDays, startOfToday, isSameDay, subDays, isBefore, getDay, getDate, differenceInWeeks } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string; // yyyy-MM-dd
  category: 'daily' | 'dump';
  routineId?: string | null;
}

interface Routine {
  id: string;
  text: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  selectedDays: number[]; // 0-6
  selectedDate: number | null; // 1-31
  createdAt?: string; 
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

import { Skeleton } from '@/components/ui/skeleton';

export default function DailyPlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [baseDate, setBaseDate] = useState<Date>(startOfToday());
  const [showCompletedDump, setShowCompletedDump] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session } = useSession();

  // Persistence (Local Storage)
  useEffect(() => {
    const savedTasks = localStorage.getItem('bt-planner-tasks-v3');
    const savedRoutines = localStorage.getItem('bt-planner-routines-v2');
    if (savedTasks) { try { setTasks(JSON.parse(savedTasks)); } catch (e) {} }
    if (savedRoutines) { try { setRoutines(JSON.parse(savedRoutines)); } catch (e) {} }
  }, []);

  // Sync with DB
  useEffect(() => {
    if (session?.user) {
      setIsLoading(true);
      Promise.all([
        fetch('/api/sync/tasks').then(res => res.json()),
        fetch('/api/sync/routines').then(res => res.json())
      ]).then(([taskData, routineData]) => {
          if (taskData?.length) setTasks(taskData);
          if (routineData?.length) setRoutines(routineData);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
    }
  }, [session?.user]);

  // Push to DB on changes
  useEffect(() => {
    localStorage.setItem('bt-planner-tasks-v3', JSON.stringify(tasks));
    if (session?.user) {
        const timeout = setTimeout(() => {
            fetch('/api/sync/tasks', { method: 'POST', body: JSON.stringify(tasks), headers: { 'Content-Type': 'application/json' } });
        }, 1000);
        return () => clearTimeout(timeout);
    }
  }, [tasks, session?.user]);

  useEffect(() => {
    localStorage.setItem('bt-planner-routines-v2', JSON.stringify(routines));
    if (session?.user) {
        const timeout = setTimeout(() => {
            fetch('/api/sync/routines', { method: 'POST', body: JSON.stringify(routines), headers: { 'Content-Type': 'application/json' } });
        }, 1000);
        return () => clearTimeout(timeout);
    }
  }, [routines, session?.user]);

  // Responsive column count
  const [viewportWidth, setViewportWidth] = useState(1200);
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columnCount = useMemo(() => {
    if (viewportWidth >= 1280) return 4;
    if (viewportWidth >= 1024) return 3;
    if (viewportWidth >= 768) return 2;
    return 1;
  }, [viewportWidth]);

  // Column dates
  const currentColumns = useMemo(() => {
    if (columnCount === 4) return [subDays(baseDate, 1), baseDate, addDays(baseDate, 1), addDays(baseDate, 2)];
    if (columnCount === 3) return [subDays(baseDate, 1), baseDate, addDays(baseDate, 1)];
    if (columnCount === 2) return [baseDate, addDays(baseDate, 1)];
    return [baseDate];
  }, [baseDate, columnCount]);

  const addTask = (text: string, dateKey: string, category: Task['category'] = 'daily', routineId: string | null = null) => {
    const newTask: Task = { id: Math.random().toString(36).substring(2, 9), text, completed: false, date: dateKey, category, routineId };
    setTasks(prev => [...prev, newTask]);
    if (!routineId) toast.success('Objective recorded');
  };

  const toggleTask = (id: string, routineData?: { text: string, dateKey: string, routineId: string }) => {
    if (id.startsWith('virtual-') && routineData) {
        // Realize virtual routine task
        const newTask: Task = { 
            id: Math.random().toString(36).substring(2, 9), 
            text: routineData.text, 
            completed: true, 
            date: routineData.dateKey, 
            category: 'daily', 
            routineId: routineData.routineId 
        };
        setTasks(prev => [...prev, newTask]);
        return;
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.info('Objective purged');
  };

  const getPendingTasks = (currentDateKey: string) => {
    return tasks.filter(t => t.category === 'daily' && !t.completed && isBefore(new Date(t.date), new Date(currentDateKey)) && t.date !== currentDateKey);
  };

  const addRoutine = (text: string, frequency: Routine['frequency'], selectedDays: number[], selectedDate: number | null) => {
    const newRoutine: Routine = { 
        id: Math.random().toString(36).substring(2, 9), 
        text, 
        frequency, 
        selectedDays, 
        selectedDate,
        createdAt: new Date().toISOString()
    };
    setRoutines([...routines, newRoutine]);
    toast.success('Routine established');
  };

  const deleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    toast.info('Routine terminated');
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-border/50 bg-background/80 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-6">
              <TabsList className="bg-muted/30 p-1 h-9 gap-1 rounded-lg">
                <TabsTrigger value="daily" className="px-4 rounded-md text-xs font-medium transition-all">
                  Planner
                </TabsTrigger>
                <TabsTrigger value="routine" className="px-4 rounded-md text-xs font-medium transition-all">
                  Routines
                </TabsTrigger>
                <TabsTrigger value="dump" className="px-4 rounded-md text-xs font-medium transition-all">
                  Dump
                </TabsTrigger>
              </TabsList>
          </div>

          {activeTab === 'daily' && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 px-3 text-xs font-medium rounded-md hover:bg-muted" onClick={() => setBaseDate(startOfToday())}>Today</Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-md border-border/50 hover:bg-muted"><CalendarIcon className="w-4 h-4" /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl border-border shadow-xl" align="end">
                  <Calendar mode="single" selected={baseDate} onSelect={(d) => d && setBaseDate(d)} initialFocus />
                </PopoverContent>
              </Popover>
              <div className="flex items-center rounded-md overflow-hidden border border-border/50">
                <Button variant="ghost" size="icon" className="h-8 w-8 border-r border-border/50 rounded-none" onClick={() => setBaseDate(subDays(baseDate, 1))}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => setBaseDate(addDays(baseDate, 1))}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <TabsContent value="daily" className="m-0 h-full">
            <div className="flex h-full p-6 gap-6 overflow-x-auto overflow-y-hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading ? (
                Array.from({ length: columnCount }).map((_, i) => (
                  <div key={i} className="flex flex-col h-full rounded-xl bg-card/40 border border-border/50 overflow-hidden min-w-[300px] md:min-w-0 transition-all shadow-sm">
                    <div className="p-5 pb-3 flex items-center justify-between border-b border-border/5">
                        <div className="flex flex-col gap-1 w-full">
                            <Skeleton className="h-3 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                    <div className="flex-1 p-4 space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full rounded-lg" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                    </div>
                  </div>
                ))
              ) : (
                currentColumns.map((date) => (
                  <DayColumn 
                    key={format(date, 'yyyy-MM-dd')}
                    date={date}
                    tasks={tasks}
                    routines={routines}
                    pendingTasks={getPendingTasks(format(date, 'yyyy-MM-dd'))}
                    onAddTask={(text) => addTask(text, format(date, 'yyyy-MM-dd'), 'daily')}
                    onToggleTask={toggleTask}
                    onDeleteTask={deleteTask}
                    session={session}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="routine" className="m-0 h-full overflow-y-auto">
            <RoutineTab routines={routines} onAddRoutine={addRoutine} onDeleteRoutine={deleteRoutine} />
          </TabsContent>

          <TabsContent value="dump" className="m-0 h-full overflow-y-auto">
            <TaskDumpTab 
              activeTasks={tasks.filter(t => t.category === 'dump' && !t.completed)}
              completedTasks={tasks.filter(t => t.category === 'dump' && t.completed)}
              showCompleted={showCompletedDump}
              setShowCompleted={setShowCompletedDump}
              onAddTask={(text: string) => addTask(text, format(startOfToday(), 'yyyy-MM-dd'), 'dump')}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              session={session}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function DayColumn({ date, tasks, routines, pendingTasks, onAddTask, onToggleTask, onDeleteTask, session }: {
  date: Date; tasks: Task[]; routines: Routine[]; pendingTasks: Task[]; onAddTask: (text: string) => void; onToggleTask: (id: string, routineData?: any) => void; onDeleteTask: (id: string) => void; session: any;
}) {
  const [newTaskText, setNewTaskText] = useState('');
  const [showPending, setShowPending] = useState(true);
  const isToday = isSameDay(date, startOfToday());
  const dateKey = format(date, 'yyyy-MM-dd');

  // Logic to determine if routine falls on this date
  const isRoutineActiveOnDate = (routine: Routine, d: Date) => {
    if (routine.frequency === 'daily') return true;
    if (routine.frequency === 'weekly') return routine.selectedDays.includes(getDay(d));
    if (routine.frequency === 'bi-weekly') {
        const anchor = routine.createdAt ? new Date(routine.createdAt) : new Date(2024, 0, 1);
        const weeksSince = differenceInWeeks(d, anchor);
        return weeksSince % 2 === 0 && routine.selectedDays.includes(getDay(d));
    }
    if (routine.frequency === 'monthly') return routine.selectedDate === getDate(d);
    return false;
  };

  const tasksForThisDay = tasks.filter(t => t.date === dateKey && t.category === 'daily');
  const activeRoutines = routines.filter(r => isRoutineActiveOnDate(r, date));
  
  // Combine real tasks and virtual routines
  const displayTasks = useMemo(() => {
    const list = [...tasksForThisDay];
    activeRoutines.forEach(r => {
        if (!tasksForThisDay.some(t => t.routineId === r.id)) {
            list.push({
                id: `virtual-${r.id}`,
                text: r.text,
                completed: false,
                date: dateKey,
                category: 'daily',
                routineId: r.id
            });
        }
    });
    return list.sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [tasksForThisDay, activeRoutines, dateKey]);

  const activeDisplayTasks = displayTasks.filter(t => !t.completed);
  const completedDisplayTasks = displayTasks.filter(t => t.completed);

  return (
    <div className={cn("flex flex-col h-full rounded-xl bg-card/40 border border-border/50 overflow-hidden min-w-[300px] md:min-w-0 transition-all shadow-sm", isToday && "border-primary/30 bg-primary/[0.02]")}>
      <div className="p-5 pb-3 flex items-center justify-between border-b border-border/5">
        <div className="flex flex-col">
           <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">{format(date, 'EEEE')}</h3>
           <p className="text-sm font-bold text-foreground">{format(date, 'MMM dd, yyyy')}</p>
        </div>
        {isToday && <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Today</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isToday && pendingTasks.length > 0 && (
          <div className="space-y-2">
            <button onClick={() => setShowPending(!showPending)} className="w-full h-8 px-3 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 text-[10px] font-bold uppercase tracking-wide flex items-center justify-between text-amber-600 transition-all">
              <span>Overdue Tasks ({pendingTasks.length})</span>
              {showPending ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
              {showPending && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-1">
                  {pendingTasks.map(t => <TaskItem key={t.id} task={t} onToggle={onToggleTask} onDelete={onDeleteTask} isPending />)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="space-y-1">
           {activeDisplayTasks.map(t => <TaskItem key={t.id} task={t} onToggle={onToggleTask} onDelete={onDeleteTask} />)}
        </div>

        {completedDisplayTasks.length > 0 && (
          <div className="space-y-1 pt-4 border-t border-border/10 opacity-30">
            {completedDisplayTasks.map(t => <TaskItem key={t.id} task={t} onToggle={onToggleTask} onDelete={onDeleteTask} />)}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/5 relative">
        {!session?.user && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/40 backdrop-blur-[1px] cursor-pointer" onClick={() => document.getElementById('signin-trigger')?.click()}>
               <div className="flex items-center gap-2 px-3 py-1 bg-background/80 border border-border/50 rounded-full shadow-sm">
                   <Package className="w-3 h-3 text-muted-foreground/60" />
                   <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Sign in to Plan</span>
               </div>
            </div>
        )}
        <div className="flex items-center gap-2 bg-muted/20 border border-border/50 rounded-xl px-3 h-10">
            <Plus className="w-4 h-4 text-muted-foreground/40" />
            <input 
              value={newTaskText} 
              onChange={(e) => setNewTaskText(e.target.value)} 
              disabled={!session?.user}
              onKeyDown={(e) => e.key === 'Enter' && newTaskText.trim() && (onAddTask(newTaskText), setNewTaskText(''))}
              placeholder="Add task..." 
              className="flex-1 bg-transparent border-none text-xs font-medium outline-none placeholder:text-muted-foreground/40 disabled:text-muted-foreground/50"
            />
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete, isPending = false }: { task: Task; onToggle: (id: string, data?: any) => void; onDelete: (id: string) => void; isPending?: boolean; }) {
  const isVirtual = task.id.toString().startsWith('virtual-');
  return (
    <div className={cn("group flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-all", isPending && "bg-amber-500/5")}>
      <Checkbox 
        checked={task.completed} 
        onCheckedChange={() => onToggle(task.id, isVirtual ? { text: task.text, dateKey: task.date, routineId: task.routineId } : undefined)} 
        className="w-4 h-4 rounded-md" 
      />
      <div className="flex-1 flex flex-col min-w-0">
          <span className={cn("text-xs font-medium leading-tight truncate", task.completed && "line-through opacity-40")}>{task.text}</span>
          {task.routineId && !task.completed && <span className="text-[8px] font-bold uppercase text-primary/40 tracking-wider mt-0.5 flex items-center gap-1"><Repeat className="w-2 h-2" /> Routine</span>}
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0" onClick={() => onDelete(task.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
    </div>
  );
}

function RoutineTab({ routines, onAddRoutine, onDeleteRoutine }: { routines: Routine[]; onAddRoutine: (t: string, f: Routine['frequency'], days: number[], date: number | null) => void; onDeleteRoutine: (id: string) => void; }) {
  const [newText, setNewText] = useState('');
  const [newFreq, setNewFreq] = useState<Routine['frequency']>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<number>(1);

  const toggleDay = (day: number) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleCommit = () => {
    if (!newText.trim()) return;
    onAddRoutine(newText, newFreq, selectedDays, newFreq === 'monthly' ? selectedDate : null);
    setNewText('');
    setSelectedDays([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8 pb-32">
      <div className="space-y-6">
          <div className="space-y-4">
              <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Routine Name</Label>
                  <Input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Routine name..." className="h-10 bg-muted/20 border-border/50 rounded-lg px-3 text-sm font-medium" />
              </div>
              <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Frequency</Label>
                  <div className="flex gap-1">
                    {(['daily', 'weekly', 'bi-weekly', 'monthly'] as const).map(f => (
                      <Button key={f} variant="ghost" size="sm" onClick={() => setNewFreq(f)} className={cn("flex-1 h-9 rounded-md text-[10px] font-bold uppercase transition-all", newFreq === f ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-muted-foreground hover:bg-muted")}>{f}</Button>
                    ))}
                  </div>
              </div>
          </div>

          <AnimatePresence mode="wait">
            {(newFreq === 'weekly' || newFreq === 'bi-weekly') && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Repeat on</Label>
                    <div className="flex flex-wrap gap-1">
                        {WEEKDAYS.map((day, i) => (
                            <Button key={day} onClick={() => toggleDay(i)} variant="ghost" className={cn("h-9 w-9 rounded-md border text-[10px] font-bold uppercase transition-all", selectedDays.includes(i) ? "bg-primary/10 border-primary/20 text-primary" : "border-border/50 text-muted-foreground/60")}>
                                {day.slice(0, 1)}
                            </Button>
                        ))}
                    </div>
                </motion.div>
            )}
            {newFreq === 'monthly' && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Monthly Date</Label>
                    <div className="flex items-center gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-9 px-3 bg-muted/10 border-border/50 rounded-md font-bold text-xs gap-2">
                                    <CalendarIcon className="w-3.5 h-3.5 text-primary/60" />
                                    Day {selectedDate}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-lg border-border shadow-xl" align="start">
                                <Calendar 
                                    mode="single" 
                                    selected={new Date(new Date().getFullYear(), new Date().getMonth(), selectedDate)} 
                                    onSelect={(d) => d && setSelectedDate(getDate(d))} 
                                    initialFocus 
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
 
          <Button onClick={handleCommit} className="h-9 px-4 bg-primary text-primary-foreground hover:opacity-90 rounded-md font-bold uppercase tracking-widest text-[10px] w-full transition-all active:scale-95">Add Routine</Button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {routines.map(r => (
          <div key={r.id} className="flex items-center justify-between p-3 bg-muted/20 border border-border/50 rounded-lg group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3">
                <div className="px-2 py-0.5 bg-primary/5 border border-primary/10 rounded-full">
                    <span className="text-[8px] font-bold uppercase tracking-tight text-primary/60">{r.frequency}</span>
                </div>
                <p className="text-xs font-medium text-foreground">{r.text}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive rounded-md transition-all" onClick={() => onDeleteRoutine(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        ))}
      </div>
      
      {routines.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-5 space-y-6">
              <Repeat className="w-24 h-24" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em]">No routines active</p>
          </div>
      )}
    </div>
  );
}

function TaskDumpTab({ activeTasks, completedTasks, showCompleted, setShowCompleted, onAddTask, onToggleTask, onDeleteTask, session }: {
    activeTasks: Task[];
    completedTasks: Task[];
    showCompleted: boolean;
    setShowCompleted: (v: boolean) => void;
    onAddTask: (text: string) => void;
    onToggleTask: (id: string) => void;
    onDeleteTask: (id: string) => void;
    session: any;
}) {
  const [newText, setNewText] = useState('');
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="flex items-center bg-card/40 border border-border/50 rounded-lg p-1.5 pl-4 shadow-sm relative overflow-hidden">
           {!session?.user && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/40 backdrop-blur-[1px] cursor-pointer" onClick={() => document.getElementById('signin-trigger')?.click()}>
                    <div className="flex items-center gap-2 px-3 py-1 bg-background/80 border border-border/50 rounded-full shadow-sm">
                        <Package className="w-3 h-3 text-muted-foreground/50" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Sign in to Dump</span>
                    </div>
                </div>
           )}
          <Input 
              value={newText} 
              onChange={(e) => setNewText(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && newText.trim() && (onAddTask(newText), setNewText(''))} 
              placeholder="Dump task..." 
              disabled={!session?.user}
              className="border-none bg-transparent focus-visible:ring-0 h-9 text-xs font-medium placeholder:text-muted-foreground/40 disabled:text-muted-foreground/30" 
          />
          <Button 
              onClick={() => { if(newText.trim()) { onAddTask(newText); setNewText(''); } }} 
              disabled={!session?.user}
              size="sm"
              className="bg-primary/10 text-primary hover:bg-primary/15 rounded-md h-9 px-4 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-none"
          >
            Add
          </Button>
      </div>
      <div className="space-y-1">
        {activeTasks.map((t: any) => <TaskItem key={t.id} task={t} onToggle={onToggleTask} onDelete={onDeleteTask} />)}
      </div>
      {completedTasks.length > 0 && (
          <div className="flex flex-col gap-6">
              <Button variant="ghost" onClick={() => setShowCompleted(!showCompleted)} className="self-center h-10 px-6 rounded-lg text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-muted transition-all">
                  {showCompleted ? 'Hide Completed' : `Show ${completedTasks.length} Completed`}
              </Button>
              <AnimatePresence>
                {showCompleted && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-1 opacity-30">
                  {completedTasks.map((t: any) => <TaskItem key={t.id} task={t} onToggle={onToggleTask} onDelete={onDeleteTask} />)}
                </motion.div>}
              </AnimatePresence>
          </div>
      )}
    </div>
  );
}
