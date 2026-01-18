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
  Edit2,
  Repeat,
  Inbox,
  Flag
} from 'lucide-react';
import { format, addDays, startOfToday, isSameDay, subDays, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string; // yyyy-MM-dd
  category: 'daily' | 'dump';
}

interface Routine {
  id: string;
  text: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
}

export default function DailyPlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [baseDate, setBaseDate] = useState<Date>(startOfToday());
  const [showCompletedDump, setShowCompletedDump] = useState(false);

  // Persistence
  useEffect(() => {
    const savedTasks = localStorage.getItem('bt-planner-tasks-v2');
    const savedRoutines = localStorage.getItem('bt-planner-routines');
    if (savedTasks) {
      try { setTasks(JSON.parse(savedTasks)); } catch (e) { console.error(e); }
    }
    if (savedRoutines) {
      try { setRoutines(JSON.parse(savedRoutines)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bt-planner-tasks-v2', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('bt-planner-routines', JSON.stringify(routines));
  }, [routines]);

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
    if (columnCount === 4) {
      return [subDays(baseDate, 1), baseDate, addDays(baseDate, 1), addDays(baseDate, 2)];
    }
    if (columnCount === 3) {
      return [subDays(baseDate, 1), baseDate, addDays(baseDate, 1)];
    }
    if (columnCount === 2) {
      return [baseDate, addDays(baseDate, 1)];
    }
    return [baseDate];
  }, [baseDate, columnCount]);

  const addTask = (text: string, dateKey: string, category: 'daily' | 'dump' = 'daily') => {
    if (!text.trim()) return;
    const task: Task = {
      id: Math.random().toString(36).substring(2, 9),
      text: text.trim(),
      completed: false,
      date: dateKey,
      category,
    };
    setTasks([...tasks, task]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Pending tasks (overdue from past days)
  const getPendingTasks = (currentDateKey: string) => {
    return tasks.filter(t => 
      t.category === 'daily' && 
      !t.completed && 
      isBefore(new Date(t.date), new Date(currentDateKey)) &&
      t.date !== currentDateKey
    );
  };

  // Routines
  const addRoutine = (text: string, frequency: Routine['frequency']) => {
    if (!text.trim()) return;
    const routine: Routine = {
      id: Math.random().toString(36).substring(2, 9),
      text: text.trim(),
      frequency,
    };
    setRoutines([...routines, routine]);
    toast.success("Routine created");
  };

  const deleteRoutine = (id: string) => {
    setRoutines(routines.filter(r => r.id !== id));
  };

  // Task Dump
  const dumpTasks = tasks.filter(t => t.category === 'dump');
  const activeDumpTasks = dumpTasks.filter(t => !t.completed);
  const completedDumpTasks = dumpTasks.filter(t => t.completed);

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-3 px-4 border-b border-border/50 bg-background shrink-0">
          <TabsList className="bg-transparent p-0 h-auto gap-2">
            <TabsTrigger 
              value="daily" 
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all",
                activeTab === 'daily' 
                  ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20" 
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5 mr-2" />
              Daily Planner
            </TabsTrigger>
            <TabsTrigger 
              value="routine" 
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all",
                activeTab === 'routine' 
                  ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20" 
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
              )}
            >
              <Repeat className="w-3.5 h-3.5 mr-2" />
              Routine
            </TabsTrigger>
            <TabsTrigger 
              value="dump" 
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all",
                activeTab === 'dump' 
                  ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20" 
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
              )}
            >
              <Inbox className="w-3.5 h-3.5 mr-2" />
              Task Dump
            </TabsTrigger>
          </TabsList>

          {activeTab === 'daily' && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs font-bold uppercase tracking-widest rounded-lg border-border bg-muted/50 hover:bg-muted"
                onClick={() => setBaseDate(startOfToday())}
              >
                Today
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border bg-muted/50 hover:bg-muted">
                    <CalendarIcon className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl border-border shadow-2xl" align="end">
                  <Calendar mode="single" selected={baseDate} onSelect={(d) => d && setBaseDate(d)} initialFocus />
                </PopoverContent>
              </Popover>
              <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/50">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-none hover:bg-muted border-r border-border"
                  onClick={() => setBaseDate(subDays(baseDate, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 rounded-none hover:bg-muted"
                  onClick={() => setBaseDate(addDays(baseDate, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Daily Planner Tab */}
          <TabsContent value="daily" className="m-0 h-full p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
              {currentColumns.map((date) => (
                <DayColumn 
                  key={format(date, 'yyyy-MM-dd')}
                  date={date}
                  tasks={tasks.filter(t => t.date === format(date, 'yyyy-MM-dd') && t.category === 'daily')}
                  pendingTasks={getPendingTasks(format(date, 'yyyy-MM-dd'))}
                  onAddTask={(text) => addTask(text, format(date, 'yyyy-MM-dd'), 'daily')}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                />
              ))}
            </div>
          </TabsContent>

          {/* Routine Tab */}
          <TabsContent value="routine" className="m-0 h-full">
            <RoutineTab 
              routines={routines}
              onAddRoutine={addRoutine}
              onDeleteRoutine={deleteRoutine}
            />
          </TabsContent>

          {/* Task Dump Tab */}
          <TabsContent value="dump" className="m-0 h-full">
            <TaskDumpTab 
              activeTasks={activeDumpTasks}
              completedTasks={completedDumpTasks}
              showCompleted={showCompletedDump}
              setShowCompleted={setShowCompletedDump}
              onAddTask={(text) => addTask(text, format(startOfToday(), 'yyyy-MM-dd'), 'dump')}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Day Column Component
function DayColumn({ 
  date, 
  tasks, 
  pendingTasks,
  onAddTask, 
  onToggleTask, 
  onDeleteTask 
}: {
  date: Date;
  tasks: Task[];
  pendingTasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}) {
  const [newTaskText, setNewTaskText] = useState('');
  const [showPending, setShowPending] = useState(true);
  const isToday = isSameDay(date, startOfToday());
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText);
      setNewTaskText('');
    }
  };

  return (
    <div className={cn(
      "flex flex-col rounded-xl border bg-card overflow-hidden h-full min-h-[500px]",
      isToday ? "border-amber-500/50 ring-1 ring-amber-500/20" : "border-border"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {format(date, 'EEEE')}, {format(date, 'd MMMM').toUpperCase()}
          </h3>
        </div>
        {isToday && (
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
            TODAY
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-3 pb-3 overflow-y-auto space-y-2">
        {/* Pending Tasks Collapsible */}
        {isToday && pendingTasks.length > 0 && (
          <div className="mb-2">
            <button
              onClick={() => setShowPending(!showPending)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                Previous Pending Tasks
                <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[10px]">
                  {pendingTasks.length}
                </span>
              </span>
              {showPending ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {showPending && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 space-y-1.5">
                    {pendingTasks.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onToggle={onToggleTask} 
                        onDelete={onDeleteTask}
                        isPending
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Active Tasks */}
        <div className="space-y-1.5">
          {activeTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggle={onToggleTask} 
              onDelete={onDeleteTask}
            />
          ))}
        </div>

        {/* Add Task Input */}
        <div className="mt-auto pt-2">
          <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed border-border/50 hover:border-muted-foreground/30 transition-colors bg-background/50">
            <Plus className="w-4 h-4 text-muted-foreground/50" />
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add new task"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/40 outline-none"
            />
          </div>
        </div>

        {/* Empty State */}
        {activeTasks.length === 0 && pendingTasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-12 space-y-3">
            <CheckSquare className="w-12 h-12" />
            <p className="text-xs font-bold uppercase tracking-widest text-center">No tasks for this day</p>
            <button 
              onClick={() => document.querySelector<HTMLInputElement>(`input[placeholder="Add new task"]`)?.focus()}
              className="text-amber-500 text-xs font-bold uppercase tracking-widest hover:underline"
            >
              Add a new task
            </button>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="pt-4 border-t border-border/30 mt-4 space-y-1.5 opacity-50">
            {completedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={onToggleTask} 
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Task Item Component
function TaskItem({ 
  task, 
  onToggle, 
  onDelete,
  isPending = false
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isPending?: boolean;
}) {
  return (
    <div className={cn(
      "group flex items-center gap-3 p-2 rounded-lg transition-colors",
      isPending && "bg-amber-500/10"
    )}>
      <Checkbox 
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="rounded-full border-muted-foreground/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
      />
      <span className={cn(
        "flex-1 text-sm",
        task.completed && "line-through text-muted-foreground"
      )}>
        {task.text}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(task.id)}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// Routine Tab Component
function RoutineTab({ 
  routines, 
  onAddRoutine, 
  onDeleteRoutine 
}: {
  routines: Routine[];
  onAddRoutine: (text: string, frequency: Routine['frequency']) => void;
  onDeleteRoutine: (id: string) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newText, setNewText] = useState('');
  const [newFreq, setNewFreq] = useState<Routine['frequency']>('daily');

  const handleCreate = () => {
    if (newText.trim()) {
      onAddRoutine(newText, newFreq);
      setNewText('');
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-amber-500">
          Routines are automatically added to your daily planner.
        </p>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-transparent border border-amber-500 text-amber-500 hover:bg-amber-500/10 rounded-lg h-9 px-4 text-xs font-bold uppercase tracking-widest gap-2"
        >
          <Repeat className="w-3.5 h-3.5" />
          Create new routine
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-xl p-4 space-y-4"
          >
            <Input
              autoFocus
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Routine name..."
              className="bg-background border-border"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Frequency:</span>
              {(['daily', 'weekly', 'bi-weekly', 'monthly'] as const).map(f => (
                <Button
                  key={f}
                  variant={newFreq === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewFreq(f)}
                  className={cn(
                    "text-xs capitalize",
                    newFreq === f && "bg-amber-500 hover:bg-amber-600 text-black"
                  )}
                >
                  {f}
                </Button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-amber-500 hover:bg-amber-600 text-black">Create</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Routines List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routines.map(routine => (
          <div
            key={routine.id}
            className="group bg-card border border-border rounded-xl p-4 flex flex-col gap-2"
          >
            <h4 className="font-bold text-foreground">{routine.text}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Repeat className="w-3.5 h-3.5" />
              <span className="capitalize">{routine.frequency}</span>
            </div>
            <div className="flex items-center gap-2 pt-2 mt-auto border-t border-border/50">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground gap-1.5">
                <Edit2 className="w-3 h-3" />
                EDIT
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
                onClick={() => onDeleteRoutine(routine.id)}
              >
                <Trash2 className="w-3 h-3" />
                DELETE
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {routines.length === 0 && !isCreating && (
        <div className="flex flex-col items-center justify-center py-24 opacity-20 space-y-4">
          <Repeat className="w-16 h-16" />
          <p className="text-sm font-bold uppercase tracking-widest">No routines yet</p>
        </div>
      )}
    </div>
  );
}

// Task Dump Tab Component
function TaskDumpTab({ 
  activeTasks, 
  completedTasks, 
  showCompleted, 
  setShowCompleted,
  onAddTask, 
  onToggleTask, 
  onDeleteTask 
}: {
  activeTasks: Task[];
  completedTasks: Task[];
  showCompleted: boolean;
  setShowCompleted: (v: boolean) => void;
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}) {
  const [newTaskText, setNewTaskText] = useState('');

  const handleAdd = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText);
      setNewTaskText('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Input */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2">
        <Input
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Enter a task and press enter"
          className="border-none bg-transparent focus-visible:ring-0"
        />
        <Button 
          onClick={handleAdd}
          className="bg-transparent border border-muted-foreground/30 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg h-8 px-4 text-xs font-bold uppercase tracking-widest"
        >
          ↵ SAVE
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-1">
        {activeTasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onToggle={onToggleTask} 
            onDelete={onDeleteTask}
          />
        ))}
      </div>

      {/* Completed Toggle */}
      {completedTasks.length > 0 && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            {showCompleted ? 'Hide' : 'Show'} {completedTasks.length} completed task{completedTasks.length > 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Completed Tasks */}
      <AnimatePresence>
        {showCompleted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1 overflow-hidden"
          >
            {completedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={onToggleTask} 
                onDelete={onDeleteTask}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {activeTasks.length === 0 && completedTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 opacity-20 space-y-4">
          <Inbox className="w-16 h-16" />
          <p className="text-sm font-bold uppercase tracking-widest">Task dump is empty</p>
        </div>
      )}
    </div>
  );
}
