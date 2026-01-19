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

export default function DailyPlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [baseDate, setBaseDate] = useState<Date>(startOfToday());
  const [showCompletedDump, setShowCompletedDump] = useState(false);

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
      fetch('/api/sync/tasks').then(res => res.json()).then(data => { if (data?.length) setTasks(data); });
      fetch('/api/sync/routines').then(res => res.json()).then(data => { if (data?.length) setRoutines(data); });
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
        <div className="flex items-center justify-between p-3 px-6 border-b border-border/50 bg-background/80 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 mr-4">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <CalendarCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h1 className="text-sm font-black uppercase tracking-widest hidden md:block">Tactical Planner</h1>
              </div>
              <TabsList className="bg-muted/30 p-1 h-10 gap-1 rounded-xl">
                <TabsTrigger value="daily" className="px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                  Planner
                </TabsTrigger>
                <TabsTrigger value="routine" className="px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                  Routines
                </TabsTrigger>
                <TabsTrigger value="dump" className="px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                  Dump
                </TabsTrigger>
              </TabsList>
          </div>

          {activeTab === 'daily' && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-muted" onClick={() => setBaseDate(startOfToday())}>Today</Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-border/50 hover:bg-muted"><CalendarIcon className="w-4 h-4" /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-border shadow-2xl" align="end">
                  <Calendar mode="single" selected={baseDate} onSelect={(d) => d && setBaseDate(d)} initialFocus />
                </PopoverContent>
              </Popover>
              <div className="flex items-center bg-muted/30 rounded-xl overflow-hidden border border-border/50">
                <Button variant="ghost" size="icon" className="h-9 w-9 border-r border-border/50 rounded-none" onClick={() => setBaseDate(subDays(baseDate, 1))}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={() => setBaseDate(addDays(baseDate, 1))}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <TabsContent value="daily" className="m-0 h-full">
            <div className="flex h-full p-6 gap-6 overflow-x-auto overflow-y-hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentColumns.map((date) => (
                <DayColumn 
                  key={format(date, 'yyyy-MM-dd')}
                  date={date}
                  tasks={tasks}
                  routines={routines}
                  pendingTasks={getPendingTasks(format(date, 'yyyy-MM-dd'))}
                  onAddTask={(text) => addTask(text, format(date, 'yyyy-MM-dd'), 'daily')}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                />
              ))}
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
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function DayColumn({ date, tasks, routines, pendingTasks, onAddTask, onToggleTask, onDeleteTask }: {
  date: Date; tasks: Task[]; routines: Routine[]; pendingTasks: Task[]; onAddTask: (text: string) => void; onToggleTask: (id: string, routineData?: any) => void; onDeleteTask: (id: string) => void;
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
    <div className={cn("flex flex-col h-full rounded-[2.5rem] bg-card/40 border border-border/50 overflow-hidden min-w-[280px] md:min-w-0 transition-all", isToday && "ring-2 ring-emerald-500/20")}>
      <div className="p-6 pb-4 flex items-center justify-between border-b border-border/10">
        <div className="flex flex-col">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{format(date, 'EEEE')}</h3>
           <p className="text-sm font-black uppercase tracking-tighter">{format(date, 'MMM dd, yyyy')}</p>
        </div>
        {isToday && <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Today</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isToday && pendingTasks.length > 0 && (
          <div className="space-y-2">
            <button onClick={() => setShowPending(!showPending)} className="w-full h-10 px-4 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 text-[9px] font-black uppercase tracking-widest flex items-center justify-between text-amber-500 transition-all">
              <span>Overdue Analytics ({pendingTasks.length})</span>
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

      <div className="p-4 border-t border-border/10">
        <div className="flex items-center gap-2 bg-muted/20 border border-border/50 rounded-2xl px-4 h-12">
            <Plus className="w-4 h-4 text-muted-foreground/30" />
            <input 
              value={newTaskText} 
              onChange={(e) => setNewTaskText(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && newTaskText.trim() && (onAddTask(newTaskText), setNewTaskText(''))}
              placeholder="Record objective..." 
              className="flex-1 bg-transparent border-none text-[11px] font-bold outline-none placeholder:opacity-30"
            />
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete, isPending = false }: { task: Task; onToggle: (id: string, data?: any) => void; onDelete: (id: string) => void; isPending?: boolean; }) {
  const isVirtual = task.id.toString().startsWith('virtual-');
  return (
    <div className={cn("group flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/30 transition-all", isPending && "bg-amber-500/5")}>
      <Checkbox 
        checked={task.completed} 
        onCheckedChange={() => onToggle(task.id, isVirtual ? { text: task.text, dateKey: task.date, routineId: task.routineId } : undefined)} 
        className="w-5 h-5 rounded-lg border-2" 
      />
      <div className="flex-1 flex flex-col min-w-0">
          <span className={cn("text-xs font-bold leading-tight truncate", task.completed && "line-through opacity-30")}>{task.text}</span>
          {task.routineId && !task.completed && <span className="text-[7px] font-black uppercase text-emerald-500/40 tracking-widest mt-0.5 flex items-center gap-1"><Repeat className="w-2 h-2" /> Routine Instance</span>}
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0" onClick={() => onDelete(task.id)}><Trash2 className="w-4 h-4" /></Button>
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
    <div className="max-w-4xl mx-auto p-12 space-y-12 pb-32">
      <div className="bg-card/40 border border-border/50 rounded-[2.5rem] p-10 space-y-10 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none"><Repeat className="w-48 h-48" /></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-30">Sequence Protocol Name</Label>
                  <Input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Identify recurring sequence..." className="h-14 bg-muted/10 border-border/50 rounded-2xl px-6 font-black text-xl" />
              </div>
              <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-30">Temporal Frequency</Label>
                  <div className="flex gap-2">
                    {(['daily', 'weekly', 'bi-weekly', 'monthly'] as const).map(f => (
                      <Button key={f} variant="ghost" onClick={() => setNewFreq(f)} className={cn("flex-1 h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all", newFreq === f ? "bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-border/50 opacity-40 hover:opacity-100")}>{f}</Button>
                    ))}
                  </div>
              </div>
          </div>

          <AnimatePresence mode="wait">
            {(newFreq === 'weekly' || newFreq === 'bi-weekly') && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-30">Active Day Selection</Label>
                    <div className="flex flex-wrap gap-3">
                        {WEEKDAYS.map((day, i) => (
                            <Button key={day} onClick={() => toggleDay(i)} variant="ghost" className={cn("h-14 w-14 rounded-2xl border transition-all text-[10px] font-black uppercase", selectedDays.includes(i) ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-inner" : "border-border/50 opacity-30")}>
                                {day.slice(0, 3)}
                            </Button>
                        ))}
                    </div>
                </motion.div>
            )}
            {newFreq === 'monthly' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-30">Monthly Reference Date</Label>
                    <div className="flex items-center gap-6">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="h-14 px-6 bg-muted/10 border-border/50 rounded-2xl font-black text-lg gap-4 shadow-inner">
                                    <CalendarIcon className="w-5 h-5 text-emerald-500" />
                                    Day {selectedDate}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl border-border shadow-2xl" align="start">
                                <Calendar 
                                    mode="single" 
                                    selected={new Date(new Date().getFullYear(), new Date().getMonth(), selectedDate)} 
                                    onSelect={(d) => d && setSelectedDate(getDate(d))} 
                                    initialFocus 
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Cycle will resolve on the {selectedDate}{selectedDate === 1 ? 'st' : selectedDate === 2 ? 'nd' : selectedDate === 3 ? 'rd' : 'th'} of every month.</span>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          <Button onClick={handleCommit} className="h-16 px-12 bg-white text-black hover:bg-zinc-100 rounded-[2rem] font-black uppercase tracking-widest text-[12px] self-end shadow-2xl transition-all active:scale-95">Commit Sequence</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routines.map(r => (
          <div key={r.id} className="p-8 bg-card border border-border/50 rounded-[2.5rem] space-y-6 group hover:border-emerald-500/30 transition-all shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500">{r.frequency}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive rounded-xl transition-all" onClick={() => onDeleteRoutine(r.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
            <p className="text-sm font-black uppercase tracking-tight leading-relaxed">{r.text}</p>
            {(r.frequency === 'weekly' || r.frequency === 'bi-weekly') && (
                <div className="flex gap-1.5 pt-2 border-t border-border/10">
                    {r.selectedDays.map(d => (
                        <span key={d} className="text-[7px] font-black uppercase tracking-widest opacity-30">{WEEKDAYS[d]}</span>
                    ))}
                </div>
            )}
            {r.frequency === 'monthly' && (
                <div className="pt-2 border-t border-border/10">
                     <span className="text-[7px] font-black uppercase tracking-widest opacity-30">Cycle: Day {r.selectedDate}</span>
                </div>
            )}
          </div>
        ))}
      </div>
      
      {routines.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-5 space-y-6">
              <Repeat className="w-24 h-24" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">No sequences active</p>
          </div>
      )}
    </div>
  );
}

function TaskDumpTab({ activeTasks, completedTasks, showCompleted, setShowCompleted, onAddTask, onToggleTask, onDeleteTask }: {
    activeTasks: Task[];
    completedTasks: Task[];
    showCompleted: boolean;
    setShowCompleted: (v: boolean) => void;
    onAddTask: (text: string) => void;
    onToggleTask: (id: string) => void;
    onDeleteTask: (id: string) => void;
}) {
  const [newText, setNewText] = useState('');
  return (
    <div className="max-w-2xl mx-auto p-12 space-y-12">
      <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur opacity-75 group-hover:opacity-100 transition duration-1000 rounded-[2.5rem]" />
          <div className="relative flex items-center bg-card border border-border rounded-[2.5rem] p-3 pl-10 shadow-2xl">
              <Input value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && newText.trim() && (onAddTask(newText), setNewText(''))} placeholder="Identify tactical dump objective..." className="border-none bg-transparent focus-visible:ring-0 h-14 text-sm font-bold placeholder:opacity-20" />
              <Button onClick={() => { if(newText.trim()) { onAddTask(newText); setNewText(''); } }} className="bg-emerald-500 text-black rounded-2xl h-14 px-10 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95">Record</Button>
          </div>
      </div>
      <div className="space-y-1">
        {activeTasks.map((t: any) => <TaskItem key={t.id} task={t} onToggle={onToggleTask} onDelete={onDeleteTask} />)}
      </div>
      {completedTasks.length > 0 && (
          <div className="flex flex-col gap-6">
              <Button variant="ghost" onClick={() => setShowCompleted(!showCompleted)} className="self-center h-12 px-8 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 hover:bg-muted transition-all">
                  {showCompleted ? 'Terminal Hide' : `Inspect ${completedTasks.length} Terminated Objectives`}
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
