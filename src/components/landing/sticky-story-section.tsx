import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';

export const StickyStorySection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const stages = [
    {
      step: '01',
      title: '1. Voice Recording',
      desc: 'Speech recorded locally via your browser. Spoken words appear in real time with clickable timestamps.',
      content: (
        <div className="space-y-3 font-mono text-xs text-zinc-400">
          <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-850 pb-2">
            <span>Audio Recording</span>
            <span>00:14:32</span>
          </div>
          <p>00:02 speaker: Let us finalize the architecture for the local knowledge base.</p>
          <p>00:15 speaker: We agreed that IndexedDB will store all documents.</p>
          <p>00:28 speaker: Arron will complete the document parser by tomorrow.</p>
          <p>00:44 speaker: We should keep the local Ollama connection on port 11434.</p>
        </div>
      ),
    },
    {
      step: '02',
      title: '2. Key Decisions & Highlights',
      desc: 'Meaningful statements, decisions, and action commitments are identified without transmitting data outside.',
      content: (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-850 pb-2">
            <span>Extracted Points</span>
            <span className="text-emerald-400">3 Key Items Found</span>
          </div>
          <div className="p-2.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-200">
            <span className="text-xs text-zinc-400 block mb-1 font-semibold">Decision</span>
            "IndexedDB will store all documents locally without remote cloud dependencies."
          </div>
          <div className="p-2.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-200">
            <span className="text-xs text-zinc-400 block mb-1 font-semibold">Action Item</span>
            "Arron will complete the document parser by tomorrow."
          </div>
        </div>
      ),
    },
    {
      step: '03',
      title: '3. Action Items',
      desc: 'Extracting task descriptions, assignees, and deadlines into an organized checklist.',
      content: (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 border-b border-zinc-850 pb-2">
            <span>Deliverables</span>
            <span>2 Items Assigned</span>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
            <CheckSquare className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-white">Implement universal document parser</div>
              <div className="text-xs text-zinc-400 mt-0.5">Assigned to: @Arron</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
            <CheckSquare className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-white">Verify Ollama localhost connection</div>
              <div className="text-xs text-zinc-400 mt-0.5">Assigned to: @Engineering</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      step: '04',
      title: '4. Clean Notes',
      desc: 'Conversation becomes clean, durable knowledge saved to your workspace.',
      content: (
        <div className="space-y-3 font-sans text-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-850 pb-2">
            <span>Summary Note</span>
            <span className="text-zinc-400">Stored Privately</span>
          </div>
          <h4 className="text-sm font-bold text-white tracking-tight">
            Meeting Minutes: Local Knowledge Engine
          </h4>
          <p className="text-zinc-300 leading-relaxed text-xs">
            The team committed to client-side database persistence using IndexedDB and native Ollama
            processing. All actionable deliverables have been dispatched to your task index.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              #architecture
            </span>
            <span className="text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              #meeting
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-24 border-t border-zinc-850 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Content */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>How It Works</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.08]">
            From conversation to organized notes.
          </h2>

          <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
            Most meeting conversations are forgotten once the call ends. DomoNote preserves what was
            said, highlights key decisions, and turns them into lasting notes right on your computer.
          </p>

          {/* Step Selector Buttons */}
          <div className="flex items-center gap-2 pt-4">
            {stages.map((st, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeStep === idx
                    ? 'bg-white text-black font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {st.step}
              </button>
            ))}
          </div>
        </div>

        {/* Right Dynamic Interface */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-6">
              <span className="text-xs font-semibold text-white tracking-wide">
                {stages[activeStep].title}
              </span>
              <span className="text-xs text-zinc-500">Preview</span>
            </div>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              {stages[activeStep].desc}
            </p>

            <div className="p-5 rounded-xl border border-zinc-850 bg-zinc-900/50 min-h-[260px] flex flex-col justify-center">
              {stages[activeStep].content}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
