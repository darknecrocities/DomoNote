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
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>How It Works</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.08]">
            From conversation to organized notes.
          </h2>

          <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
            Most meeting conversations are forgotten once the call ends. DomoNote preserves what was
            said, highlights key decisions, and turns them into lasting notes right on your computer.
          </p>

          {/* Interactive Step Selection Cards */}
          <div className="space-y-2.5 pt-2">
            {stages.map((st, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                    isActive
                      ? 'bg-zinc-900 border-zinc-700 text-white shadow-lg'
                      : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:border-zinc-750 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded transition-colors ${
                        isActive
                          ? 'bg-white text-black'
                          : 'bg-zinc-900 text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    >
                      {st.step}
                    </span>
                    <span className="text-xs font-medium">{st.title}</span>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Step Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-850/80 text-xs text-zinc-500 font-mono">
            <span>Step {activeStep + 1} of {stages.length}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : stages.length - 1))}
                className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors"
                title="Previous step"
              >
                ← Prev
              </button>
              <button
                onClick={() => setActiveStep((prev) => (prev < stages.length - 1 ? prev + 1 : 0))}
                className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors"
                title="Next step"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Right Dynamic Interface with Sliding-In Card */}
        <div className="lg:col-span-7 overflow-hidden relative min-h-[440px]">
          <div
            key={activeStep}
            className="animate-slide-in-right rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-white tracking-wide font-mono">
                  STAGE {stages[activeStep].step} • {stages[activeStep].title.toUpperCase()}
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                Live Preview
              </span>
            </div>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              {stages[activeStep].desc}
            </p>

            <div className="p-5 rounded-xl border border-zinc-850 bg-zinc-900/50 min-h-[260px] flex flex-col justify-center">
              {stages[activeStep].content}
            </div>

            {/* Next stage callout button */}
            <div className="mt-6 pt-4 border-t border-zinc-850 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono text-[11px]">
                Click step or Next to preview stage transformation
              </span>
              <button
                onClick={() => setActiveStep((prev) => (prev < stages.length - 1 ? prev + 1 : 0))}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                <span>{activeStep < stages.length - 1 ? 'Next: ' + stages[activeStep + 1].title : 'Restart Flow (01)'}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
