import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Check, ArrowRight, MessageSquare } from 'lucide-react';

export const HeroLiveWorkspace: React.FC = () => {
  // Stages:
  // 0: Document idle
  // 1: Text highlighted + toolbar appears
  // 2: "Explain" clicked, side panel slide-in
  // 3: AI response generated
  // 4: Saved to note with annotation badge
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % 5);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl overflow-hidden font-sans text-left">
      {/* Top Window Chrome */}
      <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-6">
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-zinc-600" />
          <span>WORKSPACE // SYSTEM ARCHITECTURE SPEC.PDF</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <span>PAGE 04 / 18</span>
          <span>•</span>
          <span className="text-zinc-300">LOCAL AI READY</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[300px]">
        {/* Left: Document Reading Page */}
        <div className="md:col-span-7 bg-white text-zinc-900 rounded-xl p-6 paper-desk-shadow relative flex flex-col justify-between select-none">
          <div className="space-y-3">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              Section 2.4 — Data Sovereignty Protocol
            </div>
            <h4 className="text-base font-bold text-black tracking-tight">
              Local Verification and Boundary Isolation
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              All extracted document tokens, acoustic feature vectors, and screen captures are
              retained strictly inside client-side IndexedDB storage.
            </p>

            {/* Simulated Highlighted Paragraph with left-to-right wipe */}
            <div className="relative p-2 rounded text-xs text-black font-medium">
              <div
                className={`absolute inset-0 bg-yellow-300/40 rounded transition-all duration-700 ${
                  stage >= 1 ? 'w-full' : 'w-0'
                }`}
              />
              <span className="relative z-10">
                "No communication with remote commercial language services is permitted unless the
                user explicitly overrides the local endpoint configuration."
              </span>

              {/* Numbered Badge */}
              {stage >= 4 && (
                <span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center shadow animate-fade-in">
                  01
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Cryptographic integrity checks verify that zero persistent network sockets remain open
              after document parsing completes.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-200 text-[10px] font-mono text-zinc-400 flex justify-between">
            <span>SOURCE: DOMONOTE-CORE-V1</span>
            <span>PARAGRAPH 03</span>
          </div>

          {/* Contextual Floating Toolbar */}
          {stage === 1 && (
            <div className="absolute top-28 left-12 z-20 flex items-center gap-1 bg-zinc-950 border border-zinc-700 text-white rounded-lg p-1 shadow-2xl text-[11px] animate-fade-in font-sans">
              <span className="px-2 py-1 bg-zinc-800 text-white rounded font-medium">
                Explain
              </span>
              <span className="px-2 py-1 text-zinc-400 hover:text-white">Summarize</span>
              <span className="px-2 py-1 text-zinc-400 hover:text-white">Highlight</span>
            </div>
          )}
        </div>

        {/* Right: Sliding AI Context & Note Panel */}
        <div className="md:col-span-5 flex flex-col justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-xs text-zinc-300">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-semibold text-xs text-white">Local AI Synthesis</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">OLLAMA / LLAMA3.2</span>
            </div>

            {stage >= 2 ? (
              <div className="space-y-3 animate-fade-in">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">
                  Selected Excerpt (p.4)
                </div>
                <div className="p-3 rounded bg-zinc-950/80 border border-zinc-850 text-[11px] text-zinc-400 italic">
                  "No communication with remote commercial language services is permitted..."
                </div>

                <div className="text-[10px] font-mono text-zinc-500 uppercase">Analysis</div>
                <p className="text-zinc-200 leading-relaxed text-xs">
                  This guarantees absolute privacy. DomoNote acts as an air-gapped system by default,
                  routing all synthesis solely to your local computer's processor.
                </p>

                {stage >= 4 && (
                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between text-[11px] text-emerald-400 animate-fade-in">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Check className="w-3.5 h-3.5" />
                      <span>Note Created from Analysis</span>
                    </span>
                    <span className="text-zinc-500 font-mono text-[9px]">ID: #NOTE-04</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center text-zinc-500 text-xs font-mono">
                <span>HIGHLIGHT EXCERPT TO TRIGGER AI TOOLS</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>PIPELINE STAGE: 0{stage + 1}/05</span>
            <span className="text-zinc-400">AUTOMATIC TRANSFORMATION</span>
          </div>
        </div>
      </div>
    </div>
  );
};
