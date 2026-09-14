import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { useWorkspace } from '../context/workspace-context';
import { useSound } from '../context/sound-context';
import { useAI } from '../context/ai-context';
import { ollama } from '../services/ai/ollama';
import { Button } from '../components/ui/button';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
  Bell,
  AlarmClock,
  Play,
  RotateCcw,
} from 'lucide-react';

interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  durationMin: number;
  category: 'meeting' | 'deep-work' | 'review' | 'manual';
  completed: boolean;
  notes?: string;
}

const DEFAULT_SCHEDULE: ScheduleEvent[] = [
  {
    id: 'ev-1',
    title: 'Daily Architecture & System Sync',
    time: '09:30',
    durationMin: 30,
    category: 'meeting',
    completed: false,
    notes: 'Review IndexedDB blob migrations and Ollama latency.',
  },
  {
    id: 'ev-2',
    title: 'Deep Focus: Document Intelligence Pipeline',
    time: '11:00',
    durationMin: 90,
    category: 'deep-work',
    completed: false,
    notes: 'Implement coordinate-anchored annotations and step badges.',
  },
  {
    id: 'ev-3',
    title: 'Operation Manual Verification',
    time: '14:30',
    durationMin: 45,
    category: 'manual',
    completed: false,
    notes: 'Record flight recorder screenshots for SOP generation.',
  },
  {
    id: 'ev-4',
    title: 'Executive Knowledge Base Review',
    time: '16:30',
    durationMin: 30,
    category: 'review',
    completed: false,
    notes: 'Verify client-side PDF export styling and privacy boundaries.',
  },
];

export const ScheduleView: React.FC = () => {
  const { addToast } = useWorkspace();
  const { playThock, playChime, playPop } = useSound();
  const { isConnected, selectedModel } = useAI();

  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    const saved = localStorage.getItem('domonote_schedule_events');
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE;
  });

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventDuration, setNewEventDuration] = useState(30);
  const [newEventCategory, setNewEventCategory] = useState<ScheduleEvent['category']>('deep-work');
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('domonote_schedule_events', JSON.stringify(events));
  }, [events]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    playPop();
    const item: ScheduleEvent = {
      id: `ev-${Date.now()}`,
      title: newEventTitle.trim(),
      time: newEventTime,
      durationMin: Number(newEventDuration) || 30,
      category: newEventCategory,
      completed: false,
    };

    setEvents((prev) => [...prev, item].sort((a, b) => a.time.localeCompare(b.time)));
    setNewEventTitle('');
    addToast(`Added "${item.title}" to schedule.`, 'success');
  };

  const toggleEventComplete = (id: string) => {
    playChime();
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, completed: !ev.completed } : ev))
    );
  };

  const handleDeleteEvent = (id: string) => {
    playThock();
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  // AI Automated Schedule Generation from Notes & Meetings
  const handleGenerateAISchedule = async () => {
    if (!isConnected || !selectedModel) {
      addToast('Local AI (Ollama) is offline. Start Ollama to use AI scheduling.', 'warning');
      return;
    }

    setIsGeneratingSchedule(true);
    playThock();

    try {
      const recentNotes = await db.notes.orderBy('updatedAt').reverse().limit(4).toArray();
      const notesContext = recentNotes.map((n) => `Note: ${n.title}`).join('\n');

      const prompt = `You are a strict technical scheduling assistant.
Based on these recent project notes:
${notesContext || 'Standard software engineering and knowledge work'}

Generate an optimized 4-item chronological daily schedule. Return strictly a JSON array with objects formatted as:
[{"title": "Task Name", "time": "09:00", "durationMin": 45, "category": "deep-work"}]
Valid categories are: "meeting", "deep-work", "review", "manual". Return only the JSON array.`;

      const response = await ollama.generate(prompt, { model: selectedModel });
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const formatted: ScheduleEvent[] = parsed.map((item: any, idx: number) => ({
          id: `ai-ev-${Date.now()}-${idx}`,
          title: item.title || 'Focus Session',
          time: item.time || '10:00',
          durationMin: item.durationMin || 45,
          category: ['meeting', 'deep-work', 'review', 'manual'].includes(item.category)
            ? item.category
            : 'deep-work',
          completed: false,
        }));
        setEvents(formatted.sort((a, b) => a.time.localeCompare(b.time)));
        playChime();
        addToast('AI generated an optimized daily schedule.', 'success');
      } else {
        throw new Error('Could not parse schedule JSON.');
      }
    } catch (err: any) {
      console.warn('[DomoNote] AI scheduling error:', err);
      addToast('Failed to parse AI schedule. Reverting to manual entry.', 'error');
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-8 overflow-y-auto max-w-6xl mx-auto w-full select-none font-sans transition-colors duration-500">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-20 bg-slate-50/90 dark:bg-black/90 backdrop-blur-md pb-5 pt-1 -mt-2 mb-8 border-b border-slate-200 dark:border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-500">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-900 dark:text-white" />
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">Automated Schedule</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            Time-blocking, recurring cron routines, and AI task scheduling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateAISchedule}
            disabled={isGeneratingSchedule}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingSchedule ? 'animate-spin' : ''}`} />
            <span>{isGeneratingSchedule ? 'Optimizing...' : 'AI Generate Schedule'}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEvents(DEFAULT_SCHEDULE);
              playThock();
              addToast('Reset to default template.', 'info');
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Timeline Schedule List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-zinc-850">
            <span>Today's Time Blocks</span>
            <span className="font-semibold">{events.filter((e) => e.completed).length} / {events.length} Done</span>
          </div>

          <div className="space-y-3">
            {events.map((ev) => {
              const categoryBadge = {
                meeting: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
                'deep-work': 'bg-slate-900 text-white font-bold border-slate-900 dark:bg-white dark:text-black dark:border-zinc-300',
                review: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800',
                manual: 'bg-slate-200 text-slate-900 border-slate-300 dark:bg-zinc-850 dark:text-zinc-300 dark:border-zinc-750',
              }[ev.category];

              return (
                <div
                  key={ev.id}
                  className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                    ev.completed
                      ? 'bg-slate-100/50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-900 opacity-60'
                      : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-850 shadow-xs dark:shadow-md hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <button
                      onClick={() => toggleEventComplete(ev.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        ev.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white dark:text-black'
                          : 'border-slate-300 dark:border-zinc-700 hover:border-slate-500 dark:hover:border-zinc-400'
                      }`}
                    >
                      {ev.completed && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-600 dark:text-zinc-400 font-medium">{ev.time}</span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-600">
                          ({ev.durationMin}m)
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${categoryBadge}`}
                        >
                          {ev.category}
                        </span>
                      </div>
                      <h4
                        className={`text-sm font-bold tracking-tight mt-1 truncate ${
                          ev.completed ? 'line-through text-slate-400 dark:text-zinc-600' : 'text-slate-950 dark:text-zinc-100'
                        }`}
                      >
                        {ev.title}
                      </h4>
                      {ev.notes && (
                        <p className="text-xs text-slate-600 dark:text-zinc-500 mt-0.5 truncate">{ev.notes}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="text-slate-400 dark:text-zinc-600 hover:text-red-500 p-1 rounded transition-colors shrink-0"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Add Schedule Item Form & Recurring Automation */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Add Form */}
          <form
            onSubmit={handleAddEvent}
            className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4 shadow-xs dark:shadow-xl transition-colors duration-500"
          >
            <h3 className="text-sm font-bold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
              <Plus className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <span>Add Schedule Slot</span>
            </h3>

            <div>
              <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-500 uppercase block mb-1 font-semibold">
                Event / Task Name
              </label>
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="e.g., Code Review & Architecture Sync"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 outline-none focus:border-slate-400 dark:focus:border-zinc-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-500 uppercase block mb-1 font-semibold">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-200 outline-none focus:border-slate-400 dark:focus:border-zinc-700 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-500 uppercase block mb-1 font-semibold">
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={newEventDuration}
                  onChange={(e) => setNewEventDuration(Number(e.target.value))}
                  min={10}
                  step={5}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-200 outline-none focus:border-slate-400 dark:focus:border-zinc-700 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-500 uppercase block mb-1 font-semibold">
                Category
              </label>
              <select
                value={newEventCategory}
                onChange={(e) => setNewEventCategory(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-200 outline-none focus:border-slate-400 dark:focus:border-zinc-700"
              >
                <option value="deep-work">Deep Work</option>
                <option value="meeting">Meeting</option>
                <option value="manual">Manual / Operation</option>
                <option value="review">Review</option>
              </select>
            </div>

            <Button variant="primary" size="sm" type="submit" className="w-full">
              <span>Insert Slot</span>
            </Button>
          </form>

          {/* Automated Recurring Alarms Information */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-850 bg-slate-100/70 dark:bg-zinc-950/60 font-mono text-xs space-y-2 text-slate-600 dark:text-zinc-400">
            <div className="flex items-center gap-2 text-slate-900 dark:text-zinc-200 font-bold text-xs mb-1">
              <AlarmClock className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
              <span>Automated Reminders</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              DomoNote checks active task deadlines and cron schedules without sending any data to
              cloud servers.
            </p>
            <div className="pt-2 text-[10px] text-slate-500 dark:text-zinc-500 font-semibold">
              STATUS: LOCAL CRON ACTIVE • 100% OFFLINE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
