import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useWorkspace } from '../../context/workspace-context';
import { useAI } from '../../context/ai-context';
import { Button } from '../ui/button';
import { TiltCard } from '../ui/tilt-card';
import {
  Activity,
  Mic,
  FileText,
  FileUp,
  Video,
  ShieldCheck,
  Cpu,
  Sparkles,
  TrendingUp,
  Clock,
  Feather,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

export const WorkspaceAnalyticsCard: React.FC = () => {
  const { setActiveView, setActiveNoteId } = useWorkspace();
  const { isConnected, selectedModel } = useAI();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Live queries for all entities across workspace
  const allNotes = useLiveQuery(() => db.notes.toArray(), []) || [];
  const allMeetings = useLiveQuery(() => db.meetings.toArray(), []) || [];
  const allDocuments = useLiveQuery(() => db.documents.toArray(), []) || [];
  const allManuals = useLiveQuery(() => db.manuals.toArray(), []) || [];

  // Aggregated totals
  const totalMeetings = allMeetings.length;
  const totalNotes = allNotes.length;
  const totalDocuments = allDocuments.length;
  const totalManuals = allManuals.length;
  const totalItems = totalNotes + totalMeetings + totalDocuments + totalManuals;

  const totalTranscriptSegments = useMemo(() => {
    return allMeetings.reduce((sum, m) => sum + (m.transcript?.length || 0), 0);
  }, [allMeetings]);

  const totalPages = useMemo(() => {
    return allDocuments.reduce((sum, d) => sum + (d.pageCount || 1), 0);
  }, [allDocuments]);

  // Compute 7-day activity metrics
  const daysData = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const dayName = i === 0 ? 'Today' : start.toLocaleDateString(undefined, { weekday: 'short' });
      const fullDate = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      const dayMeetings = allMeetings.filter((m) => {
        const t = m.startTime || m.createdAt || 0;
        return t >= start.getTime() && t < end.getTime();
      });
      const dayNotes = allNotes.filter((n) => {
        const t = n.createdAt || n.updatedAt || 0;
        return t >= start.getTime() && t < end.getTime();
      });
      const dayDocs = allDocuments.filter((doc) => {
        const t = doc.createdAt || 0;
        return t >= start.getTime() && t < end.getTime();
      });
      const dayManuals = allManuals.filter((man) => {
        const t = man.createdAt || man.updatedAt || 0;
        return t >= start.getTime() && t < end.getTime();
      });

      const total = dayMeetings.length + dayNotes.length + dayDocs.length + dayManuals.length;

      list.push({
        dayName,
        fullDate,
        meetings: dayMeetings.length,
        notes: dayNotes.length,
        documents: dayDocs.length,
        manuals: dayManuals.length,
        total,
      });
    }
    return list;
  }, [allMeetings, allNotes, allDocuments, allManuals]);

  // Graph coordinate calculation
  const maxTotal = useMemo(() => {
    const peak = Math.max(...daysData.map((d) => d.total));
    return Math.max(peak, 3); // Minimum scale for nice visuals
  }, [daysData]);

  const chartPoints = useMemo(() => {
    const width = 640;
    const height = 130;
    const paddingX = 45;
    const availableW = width - paddingX * 2;

    return daysData.map((d, i) => {
      const x = paddingX + i * (availableW / 6);
      const normalized = d.total / maxTotal;
      // y ranges from 20 (peak) to 105 (base)
      const y = 105 - normalized * 80;
      return { ...d, x, y, barHeight: Math.max(normalized * 75, 4) };
    });
  }, [daysData, maxTotal]);

  const lineSvgPath = useMemo(() => {
    return chartPoints.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  }, [chartPoints]);

  const areaSvgPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const last = chartPoints[chartPoints.length - 1];
    const first = chartPoints[0];
    return `${lineSvgPath} L ${last.x} 115 L ${first.x} 115 Z`;
  }, [lineSvgPath, chartPoints]);

  const activeDay = hoveredIndex !== null ? chartPoints[hoveredIndex] : chartPoints[chartPoints.length - 1];

  const handleCreateNewNote = async () => {
    const id = `note-${Date.now()}`;
    await db.notes.put({
      id,
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      versions: [],
    });
    setActiveNoteId(id);
    setActiveView('notes');
  };

  return (
    <TiltCard maxTilt={1.5} scale={1.003} className="mb-6 sm:mb-8 rounded-2xl">
      <div className="relative p-5 sm:p-6 lg:p-7 rounded-2xl border border-slate-300 dark:border-white/15 bg-gradient-to-br from-white via-slate-50/95 to-slate-100/95 dark:from-zinc-950 dark:via-[#0b0b0e] dark:to-zinc-900/95 backdrop-blur-2xl shadow-sm dark:shadow-2xl transition-all">
        {/* Ambient Glows */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/[0.08] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-64 h-64 bg-indigo-500/[0.05] dark:bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

        {/* Card Header: Title, Telemetry Badges & Action Cluster */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10 mb-6">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shrink-0 shadow-2xs">
              <Activity className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white tracking-tight">
                  Workspace Intelligence & Analytics
                </h3>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-900 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-500/15 border border-emerald-400 dark:border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-pulse" />
                  REAL-TIME TELEMETRY
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-950 dark:text-zinc-200 bg-slate-200/90 dark:bg-white/10 border border-slate-300 dark:border-white/20 px-2.5 py-0.5 rounded-full font-bold">
                  100% PRIVATE VAULT
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-300 mt-0.5 font-medium">
                Live activity metrics, meeting speech volume, and local knowledge synthesis stored in browser memory.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveView('zen')}
              className="font-mono text-xs px-3 py-1.5"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Zen Focus</span>
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setActiveView('meetings')}
              className="font-mono text-xs px-3.5 py-1.5"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Record Meeting</span>
            </Button>
          </div>
        </div>

        {/* 4 Key Metric Tiles */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Tile 1: Meetings & Speech */}
          <div className="p-4 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 shadow-2xs hover:border-slate-400 dark:hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-950 dark:text-zinc-300 uppercase tracking-wider">
                Meetings & Audio
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <Mic className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                {totalMeetings}
              </span>
              <span className="text-xs text-slate-700 dark:text-zinc-400 font-semibold">
                sessions
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-slate-800 dark:text-zinc-300 font-medium">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">{totalTranscriptSegments}</span>
              <span>speech segments</span>
            </div>
          </div>

          {/* Tile 2: Notes & Syntheses */}
          <div className="p-4 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 shadow-2xs hover:border-slate-400 dark:hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-950 dark:text-zinc-300 uppercase tracking-wider">
                Knowledge Notes
              </span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                {totalNotes}
              </span>
              <span className="text-xs text-slate-700 dark:text-zinc-400 font-semibold">
                documents
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-slate-800 dark:text-zinc-300 font-medium">
              <span className="text-indigo-700 dark:text-indigo-400 font-bold">{totalManuals}</span>
              <span>procedural SOPs</span>
            </div>
          </div>

          {/* Tile 3: Documents & OCR */}
          <div className="p-4 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 shadow-2xs hover:border-slate-400 dark:hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-950 dark:text-zinc-300 uppercase tracking-wider">
                Document Vault
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <FileUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                {totalDocuments}
              </span>
              <span className="text-xs text-slate-700 dark:text-zinc-400 font-semibold">
                files
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-slate-800 dark:text-zinc-300 font-medium">
              <span className="text-amber-700 dark:text-amber-400 font-bold">{totalPages}</span>
              <span>pages indexed</span>
            </div>
          </div>

          {/* Tile 4: Local AI & Offline Guarantee */}
          <div className="p-4 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 shadow-2xs hover:border-slate-400 dark:hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-950 dark:text-zinc-300 uppercase tracking-wider">
                Offline Security
              </span>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                100%
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                Private
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-slate-800 dark:text-zinc-300 font-medium truncate">
              <Cpu className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span className="truncate">{isConnected ? selectedModel || 'Ollama Active' : 'Zero Cloud Telemetry'}</span>
            </div>
          </div>
        </div>

        {/* 7-Day Activity Rhythm Interactive Graph */}
        <div className="relative z-10 p-4 sm:p-5 rounded-xl bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">
                7-Day Activity Rhythm
              </h4>
              <span className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 hidden sm:inline">
                (Interactive productivity wave)
              </span>
            </div>

            {/* Dynamic Hover Tooltip Banner */}
            <div className="text-xs font-mono bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 px-2.5 py-1 rounded-md text-slate-900 dark:text-zinc-100 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                {activeDay.dayName} ({activeDay.fullDate}):{' '}
                <strong className="text-emerald-700 dark:text-emerald-400">{activeDay.total} action{activeDay.total !== 1 ? 's' : ''}</strong>{' '}
                ({activeDay.meetings} meetings, {activeDay.notes} notes, {activeDay.documents + activeDay.manuals} docs)
              </span>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 640 145"
              className="w-full h-32 sm:h-36 overflow-visible select-none"
            >
              <defs>
                <linearGradient id="emeraldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                  <stop offset="60%" stopColor="#10b981" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glowGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Horizontal Guidelines */}
              <line x1="40" y1="25" x2="600" y2="25" stroke="currentColor" className="text-slate-200 dark:text-zinc-800" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="40" y1="65" x2="600" y2="65" stroke="currentColor" className="text-slate-200 dark:text-zinc-800" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="40" y1="105" x2="600" y2="105" stroke="currentColor" className="text-slate-200 dark:text-zinc-800" strokeWidth="1" />

              {/* Background Column Highlights & Bars for each day */}
              {chartPoints.map((pt, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <g
                    key={`bar-col-${idx}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Hover Hit Target Area */}
                    <rect
                      x={pt.x - 30}
                      y="15"
                      width="60"
                      height="115"
                      fill={isHovered ? 'currentColor' : 'transparent'}
                      className={isHovered ? 'text-emerald-500/10' : ''}
                      rx="8"
                    />

                    {/* Subtle Bar Column */}
                    <rect
                      x={pt.x - 8}
                      y={105 - pt.barHeight}
                      width="16"
                      height={pt.barHeight}
                      rx="3"
                      className={`transition-all duration-200 ${
                        isHovered
                          ? 'fill-emerald-500 opacity-60'
                          : 'fill-slate-300 dark:fill-zinc-800 opacity-70'
                      }`}
                    />
                  </g>
                );
              })}

              {/* Smooth Area Wave Fill */}
              {areaSvgPath && (
                <path
                  d={areaSvgPath}
                  fill="url(#emeraldAreaGradient)"
                  className="pointer-events-none transition-all duration-300"
                />
              )}

              {/* High-Contrast Dynamic Curve Line */}
              {lineSvgPath && (
                <path
                  d={lineSvgPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glowGlow)"
                  className="pointer-events-none transition-all duration-300"
                />
              )}

              {/* Nodes and Labels */}
              {chartPoints.map((pt, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <g
                    key={`node-${idx}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Glowing active node ring */}
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="8"
                        className="fill-emerald-500/30 animate-ping"
                      />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? '5' : '3.5'}
                      className={`transition-all duration-150 ${
                        isHovered
                          ? 'fill-emerald-400 stroke-2 stroke-white dark:stroke-black'
                          : 'fill-white dark:fill-zinc-950 stroke-2 stroke-emerald-600 dark:stroke-emerald-400'
                      }`}
                    />

                    {/* Day Name Label */}
                    <text
                      x={pt.x}
                      y="126"
                      textAnchor="middle"
                      className={`text-[10px] font-mono font-semibold transition-colors ${
                        isHovered
                          ? 'fill-emerald-700 dark:fill-emerald-400 font-bold'
                          : 'fill-slate-700 dark:fill-zinc-400'
                      }`}
                    >
                      {pt.dayName}
                    </text>

                    {/* Date Sub-Label */}
                    <text
                      x={pt.x}
                      y="138"
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-slate-500 dark:fill-zinc-500"
                    >
                      {pt.fullDate}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Footer Footnote */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-white/10 mt-2 text-[11px] font-mono text-slate-700 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Real-time local activity aggregation across 4 database stores</span>
            </div>
            <div className="flex items-center gap-3 font-semibold text-slate-900 dark:text-zinc-200">
              <span>{totalItems} total stored records</span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400">0 bytes cloud telemetry</span>
            </div>
          </div>
        </div>
      </div>
    </TiltCard>
  );
};
