// DomoNote Content Script — In-Page Meeting HUD
// ─────────────────────────────────────────────
// Fully local, zero external API.
// • Detects Google Meet / Zoom / Teams participant name chips from the DOM
// • Runs Web Speech API for real-time transcription
// • Assigns speaker names from DOM participant tiles
// • On stop: sends to local Ollama (localhost:11434) for full meeting documentation

(function () {
  if (window.__domonote_injected) return;
  window.__domonote_injected = true;

  // ─── Extension connection marker ───────────────────────────────────────────
  const marker = document.createElement('div');
  marker.id = 'domonote-extension-marker';
  marker.style.display = 'none';
  document.documentElement.appendChild(marker);

  // Respond to pings from DomoNote web app
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'DOMONOTE_PING') {
      window.postMessage({ type: 'DOMONOTE_PONG', source: 'domonote-extension', version: '2.0.0' }, '*');
    }
  });

  // ─── Constants ─────────────────────────────────────────────────────────────
  const OLLAMA_URL = 'http://localhost:11434/api/generate';
  const DEFAULT_MODEL = 'llama3.2';
  const HUD_ID = 'domo-meeting-hud';

  // ─── State ──────────────────────────────────────────────────────────────────
  let isRecording = false;
  let isPaused = false;
  let startTime = 0;
  let elapsedTimer = null;
  let transcript = []; // { id, timestampSeconds, speaker, text }
  let segCounter = 0;
  let recognition = null;
  let currentInterim = '';
  let participantRotationIndex = 0;
  let speakerPool = [];         // live participant names from DOM
  let speakerHistory = {};      // Maps phrase fingerprint → speaker guess
  let lastSpeakerIndex = 0;
  let bookmarks = [];           // { timestampSeconds, type, note }
  let quickNotes = [];          // { timestampSeconds, text }
  let isGenerating = false;
  let currentDrawer = null;     // 'transcript' | 'report' | null

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function fmt(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function uid() {
    return `domo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  }

  // ─── Participant name scraping (Google Meet, Zoom, Teams) ──────────────────
  function scrapeParticipantNames() {
    const names = new Set();

    // Google Meet: participant tile data-participant-id or aria-label on [data-self-name]
    document.querySelectorAll('[data-participant-id]').forEach(el => {
      // Name chip below video tile
      const nameEl = el.querySelector('[data-self-name], .zWGUib, .NMhWlb, .nxzRjb, [jsname="A7TdRd"]');
      if (nameEl && nameEl.textContent.trim()) names.add(nameEl.textContent.trim());
    });

    // Google Meet fallback: "You" chips / participant list panel
    document.querySelectorAll('[data-self-name]').forEach(el => {
      if (el.textContent.trim()) names.add(el.textContent.trim());
    });

    // Meet participant sidebar list items
    document.querySelectorAll('[aria-label][data-requested-participant-id]').forEach(el => {
      const label = el.getAttribute('aria-label');
      if (label && label.trim() && !label.includes('•') && label.length < 50) names.add(label.trim());
    });

    // Meet: chip under video tiles (class names vary per version)
    document.querySelectorAll('.KF4T6b, .xBI3Vc, .EjRRve, .NMhWlb, .cS7aqe').forEach(el => {
      const t = el.textContent.trim();
      if (t && t.length > 1 && t.length < 40 && !t.includes('(') && !/^\d+$/.test(t)) {
        names.add(t);
      }
    });

    // Zoom: participant video tile name
    document.querySelectorAll('.video-avatar__avatar-name, .participants-section-container__participant-name').forEach(el => {
      if (el.textContent.trim()) names.add(el.textContent.trim());
    });

    // Teams: participant display name
    document.querySelectorAll('[data-tid="participant-item-name"]').forEach(el => {
      if (el.textContent.trim()) names.add(el.textContent.trim());
    });

    const arr = [...names].filter(n => n.length > 1 && n.length < 50);
    return arr.length > 0 ? arr : ['Speaker 1', 'Speaker 2'];
  }

  // ─── Smart speaker assignment ───────────────────────────────────────────────
  // Uses a round-robin heuristic: each sentence is assigned to the next speaker
  // in rotation (since we cannot do true audio diarization in a content script).
  // Ollama will later refine this during documentation generation.
  function assignSpeaker(text) {
    speakerPool = scrapeParticipantNames();
    if (speakerPool.length === 0) speakerPool = ['Speaker 1', 'Speaker 2'];

    // Crude heuristic: if the text starts with a question word, it's likely
    // the same speaker asking follow-up; otherwise rotate.
    const questionStarters = /^(what|who|when|where|why|how|is|are|can|could|should|would|did|do|does)/i;
    const questionMark = text.trim().endsWith('?');

    // If last segment ended with '?' and this one continues (short reply), keep same speaker
    if (transcript.length > 0) {
      const last = transcript[transcript.length - 1];
      if (last.text.endsWith('?') && text.length < 60) {
        // This is likely a reply — next speaker
        lastSpeakerIndex = (lastSpeakerIndex + 1) % speakerPool.length;
      } else if (questionMark && !questionStarters.test(text) && text.length > 30) {
        // Long sentence ending in question — could be different speaker
        lastSpeakerIndex = (lastSpeakerIndex + 1) % speakerPool.length;
      } else if (text.length > 80) {
        // Long monologue segment — rotate speaker every ~3 segments
        const lastThree = transcript.slice(-3);
        const sameCount = lastThree.filter(s => s.speaker === speakerPool[lastSpeakerIndex]).length;
        if (sameCount >= 3) lastSpeakerIndex = (lastSpeakerIndex + 1) % speakerPool.length;
      }
    }

    return speakerPool[lastSpeakerIndex] || 'Speaker 1';
  }

  // ─── Speech Recognition ────────────────────────────────────────────────────
  function startRecognition(onSegment, onInterim) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      console.warn('[DomoNote] Web Speech API not supported in this browser.');
      return null;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || 'en-US';

    rec.onresult = (event) => {
      let interim = '';
      const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0]?.transcript?.trim();
        if (!text) continue;

        if (res.isFinal) {
          const speaker = assignSpeaker(text);
          onSegment({
            id: uid(),
            timestampSeconds: elapsed,
            speaker,
            text,
          });
        } else {
          interim += (interim ? ' ' : '') + text;
        }
      }
      onInterim(interim);
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') {
        showHUDToast('⚠ Microphone permission denied', true);
      }
    };

    let restarts = 0;
    rec.onend = () => {
      if (isRecording && !isPaused && restarts < 60) {
        restarts++;
        setTimeout(() => { try { rec.start(); } catch {} }, Math.min(200 * restarts, 3000));
      }
    };

    try { rec.start(); } catch {}
    return rec;
  }

  // ─── Ollama AI Documentation Generator ─────────────────────────────────────
  async function generateMeetingDoc(onChunk) {
    const participants = [...new Set(transcript.map(s => s.speaker))];
    const transcriptText = transcript
      .map(s => `[${fmt(s.timestampSeconds)}] ${s.speaker}: ${s.text}`)
      .join('\n');
    const bookmarkText = bookmarks
      .map(b => `[${fmt(b.timestampSeconds)}] [${b.type.toUpperCase()}] ${b.note || ''}`)
      .join('\n');
    const notesText = quickNotes
      .map(n => `[${fmt(n.timestampSeconds)}] ${n.text}`)
      .join('\n');

    const prompt = `You are an expert meeting documentation specialist. Analyze this complete meeting transcript and generate a comprehensive, professional meeting document.

MEETING PARTICIPANTS: ${participants.join(', ')}
DURATION: ${fmt(Math.floor((Date.now() - startTime) / 1000))}
DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

FULL TRANSCRIPT:
${transcriptText || '(no verbal transcript captured)'}

BOOKMARKED MOMENTS:
${bookmarkText || '(none)'}

QUICK NOTES:
${notesText || '(none)'}

Generate a FULL meeting document in clean Markdown with these EXACT sections:

# Meeting Minutes — [Meeting Title inferred from discussion]

**Date:** [today's date]
**Duration:** [total time]
**Participants:** [list each speaker with role if inferable]

---

## Executive Summary
[2-3 sentence overview of what was accomplished]

## Agenda Topics Discussed
[Bullet list of main topics covered, with timestamps]

## Per-Speaker Contributions
[For EACH participant, summarize their key points, positions, and contributions in 3-5 bullet points]

## Key Decisions Made
[Numbered list of all decisions reached, with who decided and rationale]

## Action Items
| # | Task | Assigned To | Due | Priority |
|---|------|------------|-----|----------|
[Fill table with all action items extracted]

## Open Questions & Blockers
[Unresolved items that need follow-up]

## Follow-Up Meeting
[If a next meeting was discussed, include date/time/agenda]

## Full Transcript (Speaker-Tagged)
[Reproduce the full transcript formatted as clean dialogue with speaker labels]

---
*Generated locally by DomoNote AI — 100% private, no data leaves your device.*`;

    try {
      // Try streaming first
      const res = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          prompt,
          stream: true,
          options: { temperature: 0.15, num_predict: 4096 },
        }),
      });

      if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullDoc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.trim());
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              fullDoc += json.response;
              onChunk(json.response, fullDoc);
            }
          } catch {}
        }
      }
      return fullDoc;
    } catch (err) {
      console.error('[DomoNote] Ollama error:', err);
      // Graceful fallback: structured local doc
      const fallback = buildFallbackDoc(participants, transcriptText, bookmarkText, notesText);
      onChunk('', fallback);
      return fallback;
    }
  }

  function buildFallbackDoc(participants, transcriptText, bookmarkText, notesText) {
    const now = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return `# Meeting Minutes

**Date:** ${now}
**Duration:** ${fmt(Math.floor((Date.now() - startTime) / 1000))}
**Participants:** ${participants.join(', ')}

> ⚠ Local Ollama AI unavailable. Showing raw transcript — start Ollama for full AI documentation.

---

## Transcript

${transcriptText || '(No transcript captured)'}

## Bookmarks

${bookmarkText || '(None)'}

## Notes

${notesText || '(None)'}

---
*Generated by DomoNote — 100% private, local-first.*`;
  }

  // ─── HUD Styles ─────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('domo-hud-styles')) return;
    const style = document.createElement('style');
    style.id = 'domo-hud-styles';
    style.textContent = `
      #${HUD_ID} * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      #${HUD_ID} { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 2147483647; user-select: none; display: flex; flex-direction: column; align-items: center; gap: 8px; }
      
      .domo-bar {
        display: flex; align-items: center; gap: 6px; padding: 7px 10px; border-radius: 16px;
        background: rgba(10, 10, 14, 0.92); border: 1px solid rgba(255,255,255,0.18);
        box-shadow: 0 20px 50px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08);
        backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%);
        cursor: grab; white-space: nowrap;
      }
      .domo-bar:active { cursor: grabbing; }
      
      .domo-grip { color: rgba(255,255,255,0.3); padding: 0 4px; font-size: 14px; cursor: grab; }
      
      .domo-status {
        display: flex; align-items: center; gap: 8px; padding: 5px 10px;
        background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
      }
      .domo-dot { width: 9px; height: 9px; border-radius: 50%; background: white; position: relative; flex-shrink: 0; }
      .domo-dot.paused { background: #71717a; }
      .domo-dot.pulse::after {
        content: ''; position: absolute; inset: -4px; border-radius: 50%;
        border: 1px solid rgba(255,255,255,0.5); animation: domo-ping 1.4s infinite;
      }
      @keyframes domo-ping { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.2); opacity: 0; } }
      
      .domo-timer { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; font-weight: 700; color: white; letter-spacing: 0.5px; }
      .domo-status-text { font-size: 9px; color: #71717a; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
      
      .domo-waves { display: flex; align-items: flex-end; gap: 2px; height: 14px; }
      .domo-wave-bar { width: 2px; background: #e4e4e7; border-radius: 1px; transition: height 80ms ease; }
      
      .domo-div { width: 1px; height: 20px; background: rgba(255,255,255,0.12); }
      
      .domo-btn {
        display: flex; align-items: center; gap: 5px; padding: 6px 10px; border-radius: 10px;
        border: 1px solid transparent; background: transparent; color: #d4d4d8; font-size: 11px;
        font-weight: 600; cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
      }
      .domo-btn:hover { background: rgba(255,255,255,0.12); color: white; }
      .domo-btn:active { transform: scale(0.95); }
      .domo-btn.active { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.3); color: white; }
      .domo-btn.primary { background: white; color: black; border-color: white; }
      .domo-btn.primary:hover { background: #e4e4e7; }
      .domo-btn.danger { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); color: #fca5a5; }
      .domo-btn.danger:hover { background: rgba(239,68,68,0.25); color: #fecaca; }
      .domo-btn svg { width: 13px; height: 13px; flex-shrink: 0; }
      .domo-badge { font-size: 9px; font-weight: 700; font-family: monospace; padding: 1px 5px; background: rgba(255,255,255,0.2); border-radius: 4px; color: white; }
      
      /* Drawer */
      .domo-drawer {
        width: 400px; max-width: 95vw; border-radius: 16px; padding: 14px;
        background: rgba(10, 10, 14, 0.95); border: 1px solid rgba(255,255,255,0.18);
        box-shadow: 0 24px 60px -12px rgba(0,0,0,0.9); backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px); overflow: hidden;
        animation: domo-fade-in 0.2s ease;
      }
      @keyframes domo-fade-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      .domo-drawer-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }
      .domo-drawer-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: white; display: flex; align-items: center; gap: 6px; }
      .domo-close-btn { padding: 4px; border-radius: 6px; border: none; background: transparent; color: #71717a; cursor: pointer; display: flex; }
      .domo-close-btn:hover { background: rgba(255,255,255,0.1); color: white; }
      
      .domo-transcript-list { max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
      .domo-transcript-list::-webkit-scrollbar { width: 4px; }
      .domo-transcript-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
      .domo-seg { padding: 8px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; }
      .domo-seg-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
      .domo-speaker { font-size: 10px; font-weight: 700; color: #a1a1aa; }
      .domo-ts { font-family: monospace; font-size: 10px; color: #52525b; }
      .domo-seg-text { font-size: 12px; color: #e4e4e7; line-height: 1.5; }
      .domo-interim { font-size: 11px; color: #52525b; font-style: italic; padding: 4px 0 0 0; }
      
      .domo-report-area { width: 100%; min-height: 200px; max-height: 400px; overflow-y: auto; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11px; color: #d4d4d8; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
      .domo-report-area::-webkit-scrollbar { width: 4px; }
      .domo-report-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
      
      .domo-generating { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #a1a1aa; padding: 8px 0; }
      .domo-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.15); border-top-color: white; border-radius: 50%; animation: domo-spin 0.7s linear infinite; }
      @keyframes domo-spin { to { transform: rotate(360deg); } }
      
      .domo-participants-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
      .domo-participant-chip { padding: 3px 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; font-size: 10px; color: #a1a1aa; font-weight: 600; }
      
      .domo-bookmark-row { display: flex; gap: 6px; margin-bottom: 10px; }
      .domo-bm-btn { flex: 1; padding: 8px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); color: white; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center; transition: all 0.15s; }
      .domo-bm-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-1px); }
      
      .domo-note-form { display: flex; gap: 6px; }
      .domo-note-input { flex: 1; padding: 7px 10px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.07); color: white; font-size: 11px; outline: none; }
      .domo-note-input:focus { border-color: rgba(255,255,255,0.4); }
      .domo-note-input::placeholder { color: #52525b; }
      
      .domo-action-row { display: flex; align-items: center; gap: 6px; margin-top: 10px; }
      .domo-copy-btn { padding: 5px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #a1a1aa; font-size: 10px; font-weight: 600; cursor: pointer; }
      .domo-copy-btn:hover { background: rgba(255,255,255,0.1); color: white; }
      
      .domo-toast {
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        z-index: 2147483647; padding: 8px 16px; border-radius: 20px;
        background: rgba(10,10,14,0.95); border: 1px solid rgba(255,255,255,0.2);
        color: white; font-size: 12px; font-weight: 600; white-space: nowrap;
        animation: domo-fade-in 0.2s ease; pointer-events: none;
      }
      .domo-toast.error { border-color: rgba(239,68,68,0.4); color: #fca5a5; }
      
      .domo-speaker-color-0 { color: #93c5fd; } /* blue */
      .domo-speaker-color-1 { color: #86efac; } /* green */
      .domo-speaker-color-2 { color: #fcd34d; } /* yellow */
      .domo-speaker-color-3 { color: #f9a8d4; } /* pink */
      .domo-speaker-color-4 { color: #c4b5fd; } /* violet */
      .domo-speaker-color-5 { color: #6ee7b7; } /* emerald */
    `;
    document.head.appendChild(style);
  }

  // ─── HUD Build ──────────────────────────────────────────────────────────────
  function buildHUD() {
    injectStyles();
    if (document.getElementById(HUD_ID)) return;

    const hud = document.createElement('div');
    hud.id = HUD_ID;
    hud.innerHTML = `
      <!-- Main bar -->
      <div class="domo-bar" id="domo-main-bar">
        <span class="domo-grip" title="Drag to move">⠿</span>

        <!-- Status & timer -->
        <div class="domo-status" id="domo-status-block">
          <span class="domo-dot" id="domo-dot"></span>
          <div>
            <div class="domo-timer" id="domo-timer">00:00</div>
            <div class="domo-status-text" id="domo-status-text">Ready</div>
          </div>
          <div class="domo-waves" id="domo-waves" style="display:none">
            ${[0.4,0.7,0.5,1,0.6,0.8,0.45].map((h,i) => `<div class="domo-wave-bar" id="domo-wb-${i}" style="height:3px"></div>`).join('')}
          </div>
        </div>

        <div class="domo-div"></div>

        <!-- Record / Stop -->
        <button class="domo-btn primary" id="domo-rec-btn" title="Start recording meeting">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="6" fill="currentColor" stroke="none"/></svg>
          Record
        </button>

        <!-- Pause -->
        <button class="domo-btn" id="domo-pause-btn" style="display:none" title="Pause / Resume">
          <svg id="domo-pause-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        </button>

        <!-- Bookmark -->
        <button class="domo-btn" id="domo-bm-btn" style="display:none" title="Bookmark moment">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>

        <!-- Transcript drawer -->
        <button class="domo-btn" id="domo-tr-btn" style="display:none" title="Live transcript">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span id="domo-tr-count" class="domo-badge" style="display:none">0</span>
        </button>

        <div class="domo-div" id="domo-stop-div" style="display:none"></div>

        <!-- Stop & Generate -->
        <button class="domo-btn danger" id="domo-stop-btn" style="display:none" title="Stop and generate full meeting document">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
          Stop & Generate Doc
        </button>

        <!-- Close HUD -->
        <button class="domo-btn" id="domo-close-btn" title="Close DomoNote HUD" style="padding:6px 7px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Drawer area (injected dynamically) -->
      <div id="domo-drawer-area"></div>
    `;

    document.body.appendChild(hud);
    setupHUDEvents(hud);
  }

  // ─── HUD Events ─────────────────────────────────────────────────────────────
  function setupHUDEvents(hud) {
    // Dragging
    const bar = hud.querySelector('#domo-main-bar');
    let drag = false, ox = 0, oy = 0, sx = 0, sy = 0;

    bar.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      drag = true;
      const rect = hud.getBoundingClientRect();
      ox = e.clientX - rect.left;
      oy = e.clientY - rect.top;
      sx = rect.left;
      sy = rect.top;
      hud.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!drag) return;
      const nx = Math.max(0, Math.min(window.innerWidth - hud.offsetWidth, e.clientX - ox));
      const ny = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - oy));
      hud.style.left = nx + 'px';
      hud.style.top = ny + 'px';
      hud.style.transform = 'none';
    });

    document.addEventListener('mouseup', () => { drag = false; });

    // Record button
    hud.querySelector('#domo-rec-btn').addEventListener('click', startMeeting);

    // Pause button
    hud.querySelector('#domo-pause-btn').addEventListener('click', togglePause);

    // Bookmark button
    hud.querySelector('#domo-bm-btn').addEventListener('click', () => openDrawer('bookmark'));

    // Transcript button
    hud.querySelector('#domo-tr-btn').addEventListener('click', () => {
      if (currentDrawer === 'transcript') closeDrawer();
      else openDrawer('transcript');
    });

    // Stop button
    hud.querySelector('#domo-stop-btn').addEventListener('click', stopAndGenerate);

    // Close button
    hud.querySelector('#domo-close-btn').addEventListener('click', () => {
      if (isRecording) {
        if (!confirm('Stop recording and close DomoNote HUD?')) return;
        stopRecognition();
      }
      hud.remove();
      document.getElementById('domo-hud-styles')?.remove();
      window.__domonote_injected = false;
    });
  }

  // ─── Recording control ──────────────────────────────────────────────────────
  function startMeeting() {
    if (isRecording) return;
    isRecording = true;
    isPaused = false;
    startTime = Date.now();
    transcript = [];
    bookmarks = [];
    quickNotes = [];
    segCounter = 0;
    lastSpeakerIndex = 0;
    speakerPool = scrapeParticipantNames();

    // Timer
    elapsedTimer = setInterval(() => {
      if (!isPaused) {
        const s = Math.floor((Date.now() - startTime) / 1000);
        const el = document.getElementById('domo-timer');
        if (el) el.textContent = fmt(s);
      }
    }, 1000);

    // Start recognition
    recognition = startRecognition(
      (seg) => {
        transcript.push(seg);
        updateTranscriptCount();
        if (currentDrawer === 'transcript') renderTranscriptDrawer();
      },
      (interim) => {
        currentInterim = interim;
        const iEl = document.getElementById('domo-interim-text');
        if (iEl) iEl.textContent = interim ? `…${interim}` : '';
      }
    );

    // Update UI
    setRecordingUI(true);
    animateWaves();
    showHUDToast('🔴 Recording started — speaking names detected from meeting tiles');

    // Re-scan participants every 10s
    setInterval(() => { speakerPool = scrapeParticipantNames(); }, 10000);
  }

  function togglePause() {
    if (!isRecording) return;
    isPaused = !isPaused;
    const btn = document.getElementById('domo-pause-btn');
    const icon = document.getElementById('domo-pause-icon');
    const statusText = document.getElementById('domo-status-text');
    const dot = document.getElementById('domo-dot');

    if (isPaused) {
      recognition?.stop();
      dot?.classList.add('paused');
      dot?.classList.remove('pulse');
      if (statusText) statusText.textContent = 'Paused';
      if (icon) icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/>';
      document.getElementById('domo-waves').style.display = 'none';
    } else {
      recognition = startRecognition(
        (seg) => { transcript.push(seg); updateTranscriptCount(); if (currentDrawer === 'transcript') renderTranscriptDrawer(); },
        (interim) => { currentInterim = interim; const iEl = document.getElementById('domo-interim-text'); if (iEl) iEl.textContent = interim ? `…${interim}` : ''; }
      );
      dot?.classList.remove('paused');
      dot?.classList.add('pulse');
      if (statusText) statusText.textContent = 'Recording';
      if (icon) icon.innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
      document.getElementById('domo-waves').style.display = 'flex';
    }
  }

  function stopRecognition() {
    isRecording = false;
    clearInterval(elapsedTimer);
    recognition?.stop();
    recognition = null;
  }

  async function stopAndGenerate() {
    if (!isRecording) return;
    stopRecognition();
    setRecordingUI(false);
    openDrawer('report');
    isGenerating = true;

    const reportArea = document.getElementById('domo-report-area');
    const genRow = document.getElementById('domo-gen-row');
    if (reportArea) reportArea.textContent = '';
    if (genRow) genRow.style.display = 'flex';

    const doc = await generateMeetingDoc((chunk, full) => {
      if (reportArea) {
        reportArea.textContent = full;
        reportArea.scrollTop = reportArea.scrollHeight;
      }
    });

    isGenerating = false;
    if (genRow) genRow.style.display = 'none';

    // Save to extension storage
    const meetingData = {
      id: `meeting-${Date.now()}`,
      title: `Meeting — ${new Date().toLocaleString()}`,
      date: Date.now(),
      durationSeconds: Math.floor((Date.now() - startTime) / 1000),
      participants: [...new Set(transcript.map(s => s.speaker))],
      transcript,
      bookmarks,
      quickNotes,
      document: doc,
    };

    try {
      chrome.storage.local.get(['domo_meetings'], (res) => {
        const meetings = res.domo_meetings || [];
        meetings.unshift(meetingData);
        chrome.storage.local.set({ domo_meetings: meetings.slice(0, 50) });
      });
    } catch {}

    showHUDToast('✅ Meeting document generated and saved!');
  }

  // ─── UI helpers ─────────────────────────────────────────────────────────────
  function setRecordingUI(active) {
    const recBtn = document.getElementById('domo-rec-btn');
    const pauseBtn = document.getElementById('domo-pause-btn');
    const bmBtn = document.getElementById('domo-bm-btn');
    const trBtn = document.getElementById('domo-tr-btn');
    const stopBtn = document.getElementById('domo-stop-btn');
    const stopDiv = document.getElementById('domo-stop-div');
    const dot = document.getElementById('domo-dot');
    const statusText = document.getElementById('domo-status-text');
    const waves = document.getElementById('domo-waves');

    if (active) {
      recBtn.style.display = 'none';
      [pauseBtn, bmBtn, trBtn, stopBtn, stopDiv].forEach(el => el && (el.style.display = 'flex'));
      dot?.classList.add('pulse');
      if (statusText) statusText.textContent = 'Recording';
      if (waves) waves.style.display = 'flex';
    } else {
      recBtn.style.display = 'flex';
      [pauseBtn, bmBtn, trBtn, stopBtn, stopDiv].forEach(el => el && (el.style.display = 'none'));
      dot?.classList.remove('pulse', 'paused');
      if (statusText) statusText.textContent = 'Ready';
      if (waves) waves.style.display = 'none';
    }
  }

  function updateTranscriptCount() {
    const badge = document.getElementById('domo-tr-count');
    if (badge) {
      badge.textContent = transcript.length.toString();
      badge.style.display = transcript.length > 0 ? 'inline' : 'none';
    }
  }

  let waveAnimFrame = null;
  function animateWaves() {
    const bars = document.querySelectorAll('.domo-wave-bar');
    const scales = [0.4, 0.7, 0.5, 1, 0.6, 0.8, 0.45];
    function step() {
      if (!isRecording || isPaused) return;
      bars.forEach((bar, i) => {
        const h = Math.max(2, Math.random() * 12 * scales[i]);
        bar.style.height = h + 'px';
      });
      waveAnimFrame = setTimeout(step, 90);
    }
    step();
  }

  // ─── Drawers ────────────────────────────────────────────────────────────────
  function openDrawer(type) {
    currentDrawer = type;
    const area = document.getElementById('domo-drawer-area');
    if (!area) return;

    if (type === 'transcript') {
      area.innerHTML = buildTranscriptDrawer();
      renderTranscriptDrawer();
      area.querySelector('#domo-drawer-close')?.addEventListener('click', closeDrawer);
      const noteForm = area.querySelector('#domo-note-form');
      if (noteForm) {
        noteForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const input = area.querySelector('#domo-note-inp');
          if (!input?.value.trim()) return;
          quickNotes.push({ timestampSeconds: Math.floor((Date.now() - startTime) / 1000), text: input.value.trim() });
          input.value = '';
          showHUDToast('📝 Note saved');
        });
      }
      area.querySelector('#domo-copy-transcript')?.addEventListener('click', () => {
        const text = transcript.map(s => `[${fmt(s.timestampSeconds)}] ${s.speaker}: ${s.text}`).join('\n');
        navigator.clipboard.writeText(text).then(() => showHUDToast('Transcript copied!'));
      });
    } else if (type === 'bookmark') {
      area.innerHTML = buildBookmarkDrawer();
      area.querySelector('#domo-drawer-close')?.addEventListener('click', closeDrawer);
      area.querySelectorAll('.domo-bm-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const btype = btn.dataset.type;
          bookmarks.push({ timestampSeconds: Math.floor((Date.now() - startTime) / 1000), type: btype, note: '' });
          showHUDToast(`📌 ${btype.charAt(0).toUpperCase() + btype.slice(1)} bookmarked at ${fmt(Math.floor((Date.now() - startTime) / 1000))}`);
          closeDrawer();
        });
      });
    } else if (type === 'report') {
      area.innerHTML = buildReportDrawer();
      area.querySelector('#domo-drawer-close')?.addEventListener('click', closeDrawer);
      area.querySelector('#domo-copy-report')?.addEventListener('click', () => {
        const text = document.getElementById('domo-report-area')?.textContent || '';
        navigator.clipboard.writeText(text).then(() => showHUDToast('Document copied!'));
      });
    }
  }

  function closeDrawer() {
    currentDrawer = null;
    const area = document.getElementById('domo-drawer-area');
    if (area) area.innerHTML = '';
  }

  function buildTranscriptDrawer() {
    const participants = scrapeParticipantNames();
    return `
      <div class="domo-drawer">
        <div class="domo-drawer-header">
          <div class="domo-drawer-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Live Transcript
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            <button class="domo-copy-btn" id="domo-copy-transcript">Copy</button>
            <button class="domo-close-btn" id="domo-drawer-close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>
        <div class="domo-participants-row" id="domo-participants-row">
          ${participants.map(p => `<span class="domo-participant-chip">${p}</span>`).join('')}
        </div>
        <div class="domo-transcript-list" id="domo-tr-list">
          <div style="font-size:11px;color:#52525b;text-align:center;padding:16px 0">Listening… transcribed speech will appear here.</div>
        </div>
        <div class="domo-interim" id="domo-interim-text"></div>
        <form class="domo-note-form" id="domo-note-form" style="margin-top:10px">
          <input class="domo-note-input" id="domo-note-inp" placeholder="Quick note (Enter to save)…" autocomplete="off" />
          <button type="submit" class="domo-btn primary" style="padding:6px 10px;border-radius:9px">Save</button>
        </form>
      </div>`;
  }

  function renderTranscriptDrawer() {
    const list = document.getElementById('domo-tr-list');
    if (!list) return;
    if (transcript.length === 0) {
      list.innerHTML = '<div style="font-size:11px;color:#52525b;text-align:center;padding:16px 0">Listening… transcribed speech will appear here.</div>';
      return;
    }
    const speakerNames = [...new Set(transcript.map(s => s.speaker))];
    list.innerHTML = transcript.map(seg => {
      const colorIdx = speakerNames.indexOf(seg.speaker) % 6;
      return `
        <div class="domo-seg">
          <div class="domo-seg-header">
            <span class="domo-speaker domo-speaker-color-${colorIdx}">${seg.speaker}</span>
            <span class="domo-ts">${fmt(seg.timestampSeconds)}</span>
          </div>
          <div class="domo-seg-text">${seg.text}</div>
        </div>`;
    }).join('');
    list.scrollTop = list.scrollHeight;
  }

  function buildBookmarkDrawer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return `
      <div class="domo-drawer" style="width:320px">
        <div class="domo-drawer-header">
          <div class="domo-drawer-title">Mark Moment [${fmt(elapsed)}]</div>
          <button class="domo-close-btn" id="domo-drawer-close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="domo-bookmark-row">
          <button class="domo-bm-btn" data-type="decision">
            <div style="font-size:16px;margin-bottom:3px">⚡</div>
            <div>Decision</div>
            <div style="font-size:9px;color:#71717a;margin-top:2px">Agreed point</div>
          </button>
          <button class="domo-bm-btn" data-type="action">
            <div style="font-size:16px;margin-bottom:3px">✅</div>
            <div>Action Item</div>
            <div style="font-size:9px;color:#71717a;margin-top:2px">Todo / task</div>
          </button>
          <button class="domo-bm-btn" data-type="highlight">
            <div style="font-size:16px;margin-bottom:3px">💡</div>
            <div>Highlight</div>
            <div style="font-size:9px;color:#71717a;margin-top:2px">Key insight</div>
          </button>
        </div>
      </div>`;
  }

  function buildReportDrawer() {
    return `
      <div class="domo-drawer" style="width:480px">
        <div class="domo-drawer-header">
          <div class="domo-drawer-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            AI Meeting Document
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            <button class="domo-copy-btn" id="domo-copy-report">Copy</button>
            <button class="domo-close-btn" id="domo-drawer-close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>
        <div class="domo-generating" id="domo-gen-row" style="display:flex">
          <div class="domo-spinner"></div>
          <span>Generating full meeting document with local Ollama AI…</span>
        </div>
        <div class="domo-report-area" id="domo-report-area"></div>
        <div style="margin-top:8px;font-size:10px;color:#52525b">🔒 100% local — no data sent anywhere. Powered by Ollama on your device.</div>
      </div>`;
  }

  // ─── Toast ──────────────────────────────────────────────────────────────────
  let toastTimeout = null;
  function showHUDToast(msg, isError = false) {
    let toast = document.getElementById('domo-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'domo-toast';
      toast.className = 'domo-toast' + (isError ? ' error' : '');
      document.body.appendChild(toast);
    }
    toast.className = 'domo-toast' + (isError ? ' error' : '');
    toast.textContent = msg;
    toast.style.display = 'block';
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { toast.style.display = 'none'; }, 3000);
  }

  // ─── Entry point: inject HUD on Google Meet / Zoom / Teams ─────────────────
  function maybeInjectHUD() {
    const host = window.location.hostname;
    const isMeetingPage =
      host === 'meet.google.com' ||
      host.includes('zoom.us') ||
      host.includes('teams.microsoft.com') ||
      host.includes('meet.jit.si') ||
      window.location.pathname.includes('/meet');

    if (isMeetingPage) {
      setTimeout(buildHUD, 1800); // wait for meeting UI to load
    }
  }

  // On any page: also respond to manual trigger from popup/background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'DOMO_OPEN_MEETING_HUD') buildHUD();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maybeInjectHUD);
  } else {
    maybeInjectHUD();
  }
})();
